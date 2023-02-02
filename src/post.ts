import { getInput, info, setFailed } from '@actions/core';
import { formatAndNotify, getWorkflowRunStatus } from './utils';

try {
  // setTimeout to give time for Github API to show up the final conclusion
  setTimeout(async () => {
    const showCardOnExit = getInput(`show-on-exit`).toLowerCase() === `true`;
    const showCardOnFailure = getInput(`show-on-failure`).toLowerCase() === `true`;
    const ignoreCancel = getInput(`ignore-cancel`).toLowerCase() === `true`;

    const workflowRunStatus = await getWorkflowRunStatus();
    if (workflowRunStatus.conclusion === `cancelled` && ignoreCancel) {
      info(`Configured to not show card upon job cancel.`);
    } else if (
      showCardOnExit && !showCardOnFailure ||
      showCardOnFailure && workflowRunStatus.conclusion !== `success`
    ) {
      await formatAndNotify(
        `exit`,
        workflowRunStatus.conclusion,
        workflowRunStatus.elapsedSeconds,
      );
    } else {
      info(`Configured to not show card upon job exit.`);
    }
  }, 2000);
} catch (error) {
  setFailed((error as Error).message);
}

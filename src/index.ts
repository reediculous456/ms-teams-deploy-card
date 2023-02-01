import { getInput, info, setFailed } from '@actions/core';
import { formatAndNotify } from './utils';

try {
  // eslint-disable-next-line eqeqeq
  const showCardOnStart = getInput(`show-on-start`).toLowerCase() == `true`;
  if (showCardOnStart) {
    void formatAndNotify(`start`);
  } else {
    info(`Configured to not show card upon job start.`);
  }
} catch (error) {
  setFailed((error as Error).message);
}

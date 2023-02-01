import { getInput, info, setFailed } from '@actions/core';
import { formatAndNotify } from './utils';

try {
  const showCardOnStart = JSON.parse(getInput(`show-on-start`).toLowerCase()) === true;
  if (showCardOnStart) {
    void formatAndNotify(`start`);
  } else {
    info(`Configured to not show card upon job start.`);
  }
} catch (error) {
  setFailed((error as Error).message);
}

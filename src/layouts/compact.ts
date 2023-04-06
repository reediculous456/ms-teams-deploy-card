import { components } from '@octokit/openapi-types';
import { getInput } from '@actions/core';
import { getRunInformation } from 'utils';
import { WebhookBody } from '../models';
import { CONCLUSION_THEMES } from '../constants';

export const formatCompactLayout = (
  commit: components['schemas']['commit'],
  conclusion: string,
  elapsedSeconds?: number,
) => {
  const { author } = commit;
  const { branch, branchUrl, repoUrl, runLink, shortSha } = getRunInformation();
  const webhookBody = new WebhookBody();

  // Set status and elapsedSeconds
  let labels = `\`${conclusion.toUpperCase()}\``;
  if (elapsedSeconds) {
    labels = `\`${conclusion.toUpperCase()} [${elapsedSeconds}s]\``;
  }

  // Set environment name
  const environment = getInput(`environment`);
  if (environment !== ``) {
    labels += ` \`ENV:${environment.toUpperCase()}\``;
  }

  // Set themeColor
  webhookBody.themeColor = CONCLUSION_THEMES[conclusion] || `957DAD`;

  webhookBody.text =
    `${labels} &nbsp; ${process.env.GITHUB_WORKFLOW} [#${process.env.GITHUB_RUN_NUMBER}](${runLink}) ` +
    `(commit [${shortSha}](${commit.html_url}) to branch [${branch}](${branchUrl})) ` +
    `on [${process.env.GITHUB_REPOSITORY}](${repoUrl}) ` +
    `by [@${author?.login}](${author?.html_url})`;

  return webhookBody;
};

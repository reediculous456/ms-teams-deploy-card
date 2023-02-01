import { components } from '@octokit/openapi-types';
import moment from 'moment-timezone';
import { getInput } from '@actions/core';
import { WebhookBody } from '../models';
import { CONCLUSION_THEMES } from '../constants';
import { renderActions } from '../utils';

export const OCTOCAT_LOGO_URL =
  `https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png`;

export const formatCozyLayout = (
  commit: components["schemas"]["commit"],
  conclusion: string,
  elapsedSeconds?: number,
) => {
  const timezone = getInput(`timezone`) || `UTC`;
  const nowFmt = moment()
    .tz(timezone)
    .format(`dddd, MMMM Do YYYY, h:mm:ss a z`);
  const webhookBody = new WebhookBody();
  const repoUrl = `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}`;
  const shortSha = process.env.GITHUB_SHA?.substr(0, 7);

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

  // Get potential actions
  const actions = renderActions(
    `${repoUrl}/actions/runs/${process.env.GITHUB_RUN_ID}`,
    commit.html_url,
  );
  const actionsConcat = actions
    .map((action) => ` &nbsp; &nbsp; [${action.name}](${action.target.toString()})`)
    .join(``);

  const { author } = commit;
  // Set sections
  webhookBody.sections = [
    {
      activityImage: author?.avatar_url || OCTOCAT_LOGO_URL,
      activitySubtitle: author ?
        `by [@${author.login}](${author.html_url}) on ${nowFmt}` :
        nowFmt,
      activityText: `${labels}${actionsConcat}`,
      // eslint-disable-next-line max-len
      activityTitle: `**CI #${process.env.GITHUB_RUN_NUMBER} (commit ${shortSha})** on [${process.env.GITHUB_REPOSITORY}](${repoUrl})`,
    },
  ];

  return webhookBody;
};

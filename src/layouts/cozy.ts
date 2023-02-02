import { components } from '@octokit/openapi-types';
import moment from 'moment-timezone';
import { getInput } from '@actions/core';
import { WebhookBody } from '../models';
import { CONCLUSION_THEMES } from '../constants';
import { getRunInformation, renderActions } from '../utils';

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
  const { branch, branchUrl, repoUrl, shortSha } = getRunInformation();

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
        `by [@<at>${author.login}</at>](${author.html_url}) on ${nowFmt}` :
        nowFmt,
      activityText: `${labels}${actionsConcat}`,
      // eslint-disable-next-line max-len
      activityTitle: `**${process.env.GITHUB_WORKFLOW} #${process.env.GITHUB_RUN_NUMBER} (commit [${shortSha}](${commit.html_url}) to branch [${branch}](${branchUrl}))** on [${process.env.GITHUB_REPOSITORY}](${repoUrl})`,
      msteams: {
        entities: [
          {
            mentioned: {
              id: author.email,
              name: author.name,
            },
            text: `<at>${author.login}</at>`,
            type: `mention`,
          },
        ],
      },
    },
  ];

  return webhookBody;
};

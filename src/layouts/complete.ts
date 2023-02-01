import { components } from '@octokit/openapi-types';
import { getInput, info, warning } from '@actions/core';
import yaml from 'yaml';
import { CustomFact } from 'types';
import { escapeMarkdownTokens, renderActions } from '../utils';
import { Fact } from '../models';
import { formatCozyLayout } from './cozy';

export const formatFilesToDisplay = (
  files: components["schemas"]["commit"]["files"],
  allowedLength: number,
  htmlUrl: string,
) => {
  const filesChanged = files
    .slice(0, allowedLength)
    .map((file) =>
      `[${escapeMarkdownTokens(file.filename)}](${file.blob_url}) (${
        file.changes
      } changes)`);

  let filesToDisplay = ``;
  if (files.length === 0) {
    filesToDisplay = `*No files changed.*`;
  } else {
    filesToDisplay = `* ${filesChanged.join(`\n\n* `)}`;
    if (files.length > 7) {
      const moreLen = files.length - 7;
      filesToDisplay += `\n\n* and [${moreLen} more files](${htmlUrl}) changed`;
    }
  }

  return filesToDisplay;
};

export const formatCompleteLayout = (
  commit: components["schemas"]["commit"],
  conclusion: string,
  elapsedSeconds?: number,
) => {
  const repoUrl = `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}`;
  const branchUrl = `${repoUrl}/tree/${process.env.GITHUB_REF}`;
  const webhookBody = formatCozyLayout(commit, conclusion, elapsedSeconds);
  const [ section ] = webhookBody.sections;

  // for complete layout, just replace activityText with potentialAction
  section.activityText = undefined;
  section.potentialAction = renderActions(
    `${repoUrl}/actions/runs/${process.env.GITHUB_RUN_ID}`,
    commit.html_url,
  );

  // Set status and elapsedSeconds
  let labels = `\`${conclusion.toUpperCase()}\``;
  if (elapsedSeconds) {
    labels = `\`${conclusion.toUpperCase()} [${elapsedSeconds}s]\``;
  }

  // Set section facts
  section.facts = [
    new Fact(
      `Event type:`,
      `\`${process.env.GITHUB_EVENT_NAME?.toUpperCase()}\``,
    ),
    new Fact(`Status:`, labels),
    new Fact(
      `Commit message:`,
      escapeMarkdownTokens(commit.commit.message),
    ),
    new Fact(`Repository & branch:`, `[${branchUrl}](${branchUrl})`),
  ];

  // Set custom facts
  const customFacts = getInput(`custom-facts`);
  if (customFacts && customFacts.toLowerCase() !== `null`) {
    try {
      let customFactsCounter = 0;
      const customFactsList = yaml.parse(customFacts) as CustomFact[];
      if (Array.isArray(customFactsList)) {
        customFactsList.forEach((fact) => {
          if (fact.name !== undefined && fact.value !== undefined) {
            section.facts?.push(new Fact(`${fact.name}:`, fact.value));
            customFactsCounter += 1;
          }
        });
      }
      info(`Added ${customFactsCounter} custom facts.`);
    } catch {
      warning(`Invalid custom-facts value.`);
    }
  }

  // Set environment name
  const environment = getInput(`environment`);
  if (environment !== ``) {
    section.facts.splice(
      1,
      0,
      new Fact(`Environment:`, `\`${environment.toUpperCase()}\``),
    );
  }

  // Set list of files
  if (getInput(`include-files`).toLowerCase() === `true`) {
    const allowedFileLen = getInput(`allowed-file-len`).toLowerCase();
    const allowedFileLenParsed = parseInt(
      allowedFileLen === `` ? `7` : allowedFileLen,
    );
    const filesToDisplay = formatFilesToDisplay(
      commit.files,
      allowedFileLenParsed,
      commit.html_url,
    );
    section.facts?.push({
      name: `Files changed:`,
      value: filesToDisplay,
    });
  }

  return webhookBody;
};

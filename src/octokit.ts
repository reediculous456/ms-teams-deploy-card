import { getInput } from '@actions/core';
import { Octokit } from '@octokit/rest';

const githubToken = getInput(`github-token`, { required: true });
const githubApiUrl = getInput(`github-api-url`, { required: false, trimWhitespace: true });
export const octokit = new Octokit({
  auth: `token ${githubToken}`,
  baseUrl: githubApiUrl,
});

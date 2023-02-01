import { getInput } from '@actions/core';
import { Octokit } from '@octokit/rest';

const githubToken = getInput(`github-token`, { required: true });
export const octokit = new Octokit({
  auth: `token ${githubToken}`,
  baseUrl: process.env.GITHUB_API_URL,
});

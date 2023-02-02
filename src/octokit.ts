import { getInput } from '@actions/core';
import { getOctokit } from '@actions/github';

const githubToken = getInput(`github-token`, { required: true });

export const octokit = getOctokit(githubToken);

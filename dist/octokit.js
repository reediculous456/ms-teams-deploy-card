"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.octokit = void 0;
const core_1 = require("@actions/core");
const rest_1 = require("@octokit/rest");
const githubToken = (0, core_1.getInput)(`github-token`, { required: true });
const githubApiUrl = (0, core_1.getInput)(`github-api-url`, { required: false, trimWhitespace: true });
exports.octokit = new rest_1.Octokit({
    auth: `token ${githubToken}`,
    baseUrl: githubApiUrl,
});
//# sourceMappingURL=octokit.js.map
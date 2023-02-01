"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatCompactLayout = void 0;
const core_1 = require("@actions/core");
const models_1 = require("../models");
const constants_1 = require("../constants");
const formatCompactLayout = (commit, conclusion, elapsedSeconds) => {
    var _a;
    const { author } = commit;
    const repoUrl = `https://github.com/${process.env.GITHUB_REPOSITORY}`;
    const shortSha = (_a = process.env.GITHUB_SHA) === null || _a === void 0 ? void 0 : _a.substr(0, 7);
    const runLink = `${repoUrl}/actions/runs/${process.env.GITHUB_RUN_ID}`;
    const webhookBody = new models_1.WebhookBody();
    let labels = `\`${conclusion.toUpperCase()}\``;
    if (elapsedSeconds) {
        labels = `\`${conclusion.toUpperCase()} [${elapsedSeconds}s]\``;
    }
    const environment = (0, core_1.getInput)(`environment`);
    if (environment !== ``) {
        labels += ` \`ENV:${environment.toUpperCase()}\``;
    }
    webhookBody.themeColor = constants_1.CONCLUSION_THEMES[conclusion] || `957DAD`;
    webhookBody.text =
        `${labels} &nbsp; CI [#${process.env.GITHUB_RUN_NUMBER}](${runLink}) ` +
            `(commit [${shortSha}](${commit.html_url})) on [${process.env.GITHUB_REPOSITORY}](${repoUrl}) ` +
            `by [@${author.login}](${author.html_url})`;
    return webhookBody;
};
exports.formatCompactLayout = formatCompactLayout;
//# sourceMappingURL=compact.js.map
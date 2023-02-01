"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatCozyLayout = exports.OCTOCAT_LOGO_URL = void 0;
const tslib_1 = require("tslib");
const moment_timezone_1 = tslib_1.__importDefault(require("moment-timezone"));
const core_1 = require("@actions/core");
const models_1 = require("../models");
const constants_1 = require("../constants");
const utils_1 = require("../utils");
exports.OCTOCAT_LOGO_URL = `https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png`;
const formatCozyLayout = (commit, conclusion, elapsedSeconds) => {
    var _a;
    const timezone = (0, core_1.getInput)(`timezone`) || `UTC`;
    const nowFmt = (0, moment_timezone_1.default)()
        .tz(timezone)
        .format(`dddd, MMMM Do YYYY, h:mm:ss a z`);
    const webhookBody = new models_1.WebhookBody();
    const repoUrl = `https://github.com/${process.env.GITHUB_REPOSITORY}`;
    const shortSha = (_a = process.env.GITHUB_SHA) === null || _a === void 0 ? void 0 : _a.substr(0, 7);
    let labels = `\`${conclusion.toUpperCase()}\``;
    if (elapsedSeconds) {
        labels = `\`${conclusion.toUpperCase()} [${elapsedSeconds}s]\``;
    }
    const environment = (0, core_1.getInput)(`environment`);
    if (environment !== ``) {
        labels += ` \`ENV:${environment.toUpperCase()}\``;
    }
    webhookBody.themeColor = constants_1.CONCLUSION_THEMES[conclusion] || `957DAD`;
    const actions = (0, utils_1.renderActions)(`${repoUrl}/actions/runs/${process.env.GITHUB_RUN_ID}`, commit.html_url);
    const actionsConcat = actions
        .map((action) => ` &nbsp; &nbsp; [${action.name}](${action.target.toString()})`)
        .join(``);
    const { author } = commit;
    webhookBody.sections = [
        {
            activityImage: (author === null || author === void 0 ? void 0 : author.avatar_url) || exports.OCTOCAT_LOGO_URL,
            activitySubtitle: author ?
                `by [@${author.login}](${author.html_url}) on ${nowFmt}` :
                nowFmt,
            activityText: `${labels}${actionsConcat}`,
            activityTitle: `**CI #${process.env.GITHUB_RUN_NUMBER} (commit ${shortSha})** on [${process.env.GITHUB_REPOSITORY}](${repoUrl})`,
        },
    ];
    return webhookBody;
};
exports.formatCozyLayout = formatCozyLayout;
//# sourceMappingURL=cozy.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatCompleteLayout = exports.formatFilesToDisplay = void 0;
const tslib_1 = require("tslib");
const core_1 = require("@actions/core");
const yaml_1 = tslib_1.__importDefault(require("yaml"));
const utils_1 = require("../utils");
const models_1 = require("../models");
const cozy_1 = require("./cozy");
const formatFilesToDisplay = (files, allowedLength, htmlUrl) => {
    const filesChanged = files
        .slice(0, allowedLength)
        .map((file) => `[${(0, utils_1.escapeMarkdownTokens)(file.filename)}](${file.blob_url}) (${file.changes} changes)`);
    let filesToDisplay = ``;
    if (files.length === 0) {
        filesToDisplay = `*No files changed.*`;
    }
    else {
        filesToDisplay = `* ${filesChanged.join(`\n\n* `)}`;
        if (files.length > 7) {
            const moreLen = files.length - 7;
            filesToDisplay += `\n\n* and [${moreLen} more files](${htmlUrl}) changed`;
        }
    }
    return filesToDisplay;
};
exports.formatFilesToDisplay = formatFilesToDisplay;
const formatCompleteLayout = (commit, conclusion, elapsedSeconds) => {
    var _a, _b;
    const repoUrl = `https://github.com/${process.env.GITHUB_REPOSITORY}`;
    const branchUrl = `${repoUrl}/tree/${process.env.GITHUB_REF}`;
    const webhookBody = (0, cozy_1.formatCozyLayout)(commit, conclusion, elapsedSeconds);
    const [section] = webhookBody.sections;
    section.activityText = undefined;
    section.potentialAction = (0, utils_1.renderActions)(`${repoUrl}/actions/runs/${process.env.GITHUB_RUN_ID}`, commit.html_url);
    let labels = `\`${conclusion.toUpperCase()}\``;
    if (elapsedSeconds) {
        labels = `\`${conclusion.toUpperCase()} [${elapsedSeconds}s]\``;
    }
    section.facts = [
        new models_1.Fact(`Event type:`, `\`${(_a = process.env.GITHUB_EVENT_NAME) === null || _a === void 0 ? void 0 : _a.toUpperCase()}\``),
        new models_1.Fact(`Status:`, labels),
        new models_1.Fact(`Commit message:`, (0, utils_1.escapeMarkdownTokens)(commit.commit.message)),
        new models_1.Fact(`Repository & branch:`, `[${branchUrl}](${branchUrl})`),
    ];
    const customFacts = (0, core_1.getInput)(`custom-facts`);
    if (customFacts && customFacts.toLowerCase() !== `null`) {
        try {
            let customFactsCounter = 0;
            const customFactsList = yaml_1.default.parse(customFacts);
            if (Array.isArray(customFactsList)) {
                customFactsList.forEach((fact) => {
                    var _a;
                    if (fact.name !== undefined && fact.value !== undefined) {
                        (_a = section.facts) === null || _a === void 0 ? void 0 : _a.push(new models_1.Fact(`${fact.name}:`, fact.value));
                        customFactsCounter += 1;
                    }
                });
            }
            (0, core_1.info)(`Added ${customFactsCounter} custom facts.`);
        }
        catch (_c) {
            (0, core_1.warning)(`Invalid custom-facts value.`);
        }
    }
    const environment = (0, core_1.getInput)(`environment`);
    if (environment !== ``) {
        section.facts.splice(1, 0, new models_1.Fact(`Environment:`, `\`${environment.toUpperCase()}\``));
    }
    if ((0, core_1.getInput)(`include-files`).toLowerCase() === `true`) {
        const allowedFileLen = (0, core_1.getInput)(`allowed-file-len`).toLowerCase();
        const allowedFileLenParsed = parseInt(allowedFileLen === `` ? `7` : allowedFileLen);
        const filesToDisplay = (0, exports.formatFilesToDisplay)(commit.files, allowedFileLenParsed, commit.html_url);
        (_b = section.facts) === null || _b === void 0 ? void 0 : _b.push({
            name: `Files changed:`,
            value: filesToDisplay,
        });
    }
    return webhookBody;
};
exports.formatCompleteLayout = formatCompleteLayout;
//# sourceMappingURL=complete.js.map
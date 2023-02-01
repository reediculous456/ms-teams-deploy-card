"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderActions = exports.getWorkflowRunStatus = exports.formatAndNotify = exports.submitNotification = exports.getOctokitCommit = exports.getRunInformation = exports.escapeMarkdownTokens = void 0;
const tslib_1 = require("tslib");
const core_1 = require("@actions/core");
const node_fetch_1 = tslib_1.__importDefault(require("node-fetch"));
const moment_1 = tslib_1.__importDefault(require("moment"));
const yaml_1 = tslib_1.__importDefault(require("yaml"));
const octokit_1 = require("octokit");
const models_1 = require("./models");
const compact_1 = require("./layouts/compact");
const cozy_1 = require("./layouts/cozy");
const complete_1 = require("./layouts/complete");
const escapeMarkdownTokens = (text) => text
    .replace(/\n {1,}/g, `\n `)
    .replace(/_/g, `\\_`)
    .replace(/\*/g, `\\*`)
    .replace(/\|/g, `\\|`)
    .replace(/#/g, `\\#`)
    .replace(/-/g, `\\-`)
    .replace(/>/g, `\\>`);
exports.escapeMarkdownTokens = escapeMarkdownTokens;
const getRunInformation = () => {
    const [owner, repo] = (process.env.GITHUB_REPOSITORY || ``).split(`/`);
    return {
        branchUrl: `https://github.com/${process.env.GITHUB_REPOSITORY}/tree/${process.env.GITHUB_REF}`,
        owner,
        ref: process.env.GITHUB_SHA || undefined,
        repo,
        runId: process.env.GITHUB_RUN_ID || undefined,
        runNum: process.env.GITHUB_RUN_NUMBER || undefined,
    };
};
exports.getRunInformation = getRunInformation;
const getOctokitCommit = () => {
    const runInfo = (0, exports.getRunInformation)();
    (0, core_1.info)(`Workflow run information: ${JSON.stringify(runInfo, undefined, 2)}`);
    return octokit_1.octokit.repos.getCommit({
        owner: runInfo.owner,
        ref: runInfo.ref || ``,
        repo: runInfo.repo,
    });
};
exports.getOctokitCommit = getOctokitCommit;
const submitNotification = (webhookBody) => {
    const webhookUri = (0, core_1.getInput)(`webhook-uri`, { required: true });
    const webhookBodyJson = JSON.stringify(webhookBody, undefined, 2);
    return (0, node_fetch_1.default)(webhookUri, {
        body: webhookBodyJson,
        headers: {
            "Content-Type": `application/json`,
        },
        method: `POST`,
    })
        .then((response) => {
        (0, core_1.setOutput)(`webhook-body`, webhookBodyJson);
        (0, core_1.info)(webhookBodyJson);
        return response;
    })
        .catch(core_1.error);
};
exports.submitNotification = submitNotification;
const formatAndNotify = async (state, conclusion = `in_progress`, elapsedSeconds) => {
    let webhookBody;
    const { commit } = await (0, exports.getOctokitCommit)();
    const cardLayoutStart = (0, core_1.getInput)(`card-layout-${state}`);
    if (cardLayoutStart === `compact`) {
        webhookBody = (0, compact_1.formatCompactLayout)(commit, conclusion, elapsedSeconds);
    }
    else if (cardLayoutStart === `cozy`) {
        webhookBody = (0, cozy_1.formatCozyLayout)(commit, conclusion, elapsedSeconds);
    }
    else {
        webhookBody = (0, complete_1.formatCompleteLayout)(commit, conclusion, elapsedSeconds);
    }
    await (0, exports.submitNotification)(webhookBody);
};
exports.formatAndNotify = formatAndNotify;
const getWorkflowRunStatus = async () => {
    const runInfo = (0, exports.getRunInformation)();
    const workflowJobs = await octokit_1.octokit.actions.listJobsForWorkflowRun({
        owner: runInfo.owner,
        repo: runInfo.repo,
        run_id: parseInt(runInfo.runId || `1`),
    });
    const job = workflowJobs.data.jobs.find((j) => j.name === process.env.GITHUB_JOB);
    let lastStep;
    const stoppedStep = job === null || job === void 0 ? void 0 : job.steps.find((step) => step.conclusion === `failure` ||
        step.conclusion === `timed_out` ||
        step.conclusion === `cancelled` ||
        step.conclusion === `action_required`);
    if (stoppedStep) {
        lastStep = stoppedStep;
    }
    else {
        lastStep = job === null || job === void 0 ? void 0 : job.steps.reverse().find((step) => step.status === `completed`);
    }
    const startTime = (0, moment_1.default)(job === null || job === void 0 ? void 0 : job.started_at, moment_1.default.ISO_8601);
    const endTime = (0, moment_1.default)(lastStep === null || lastStep === void 0 ? void 0 : lastStep.completed_at, moment_1.default.ISO_8601);
    return {
        conclusion: lastStep === null || lastStep === void 0 ? void 0 : lastStep.conclusion,
        elapsedSeconds: endTime.diff(startTime, `seconds`),
    };
};
exports.getWorkflowRunStatus = getWorkflowRunStatus;
const renderActions = (statusUrl, diffUrl) => {
    const actions = [];
    if ((0, core_1.getInput)(`enable-view-status-action`).toLowerCase() === `true`) {
        actions.push(new models_1.PotentialAction((0, core_1.getInput)(`view-status-action-text`), [statusUrl]));
    }
    if ((0, core_1.getInput)(`enable-review-diffs-action`).toLowerCase() === `true`) {
        actions.push(new models_1.PotentialAction((0, core_1.getInput)(`review-diffs-action-text`), [diffUrl]));
    }
    const customActions = (0, core_1.getInput)(`custom-actions`);
    if (customActions && customActions.toLowerCase() !== `null`) {
        try {
            let customActionsCounter = 0;
            const customActionsList = yaml_1.default.parse(customActions);
            if (Array.isArray(customActionsList)) {
                customActionsList.forEach((action) => {
                    if (action.text !== undefined &&
                        action.url !== undefined &&
                        action.url.match(/https?:\/\/\S+/g)) {
                        actions.push(new models_1.PotentialAction(action.text, [action.url]));
                        customActionsCounter += 1;
                    }
                });
            }
            (0, core_1.info)(`Added ${customActionsCounter} custom facts.`);
        }
        catch (_a) {
            (0, core_1.warning)(`Invalid custom-actions value.`);
        }
    }
    return actions;
};
exports.renderActions = renderActions;
//# sourceMappingURL=utils.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@actions/core");
const utils_1 = require("../src/utils");
try {
    setTimeout(async () => {
        const showCardOnExit = (0, core_1.getInput)(`show-on-exit`).toLowerCase() === `true`;
        const showCardOnFailure = (0, core_1.getInput)(`show-on-failure`).toLowerCase() === `true`;
        const workflowRunStatus = await (0, utils_1.getWorkflowRunStatus)();
        if (showCardOnExit && !showCardOnFailure ||
            showCardOnFailure && workflowRunStatus.conclusion !== `success`) {
            await (0, utils_1.formatAndNotify)(`exit`, workflowRunStatus.conclusion, workflowRunStatus.elapsedSeconds);
        }
        else {
            (0, core_1.info)(`Configured to not show card upon job exit.`);
        }
    }, 2000);
}
catch (error) {
    (0, core_1.setFailed)(error.message);
}
//# sourceMappingURL=post.js.map
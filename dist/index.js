"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@actions/core");
const utils_1 = require("./utils");
try {
    const showCardOnStart = JSON.parse((0, core_1.getInput)(`show-on-start`).toLowerCase()) === true;
    if (showCardOnStart) {
        void (0, utils_1.formatAndNotify)(`start`);
    }
    else {
        (0, core_1.info)(`Configured to not show card upon job start.`);
    }
}
catch (error) {
    (0, core_1.setFailed)(error.message);
}
//# sourceMappingURL=index.js.map
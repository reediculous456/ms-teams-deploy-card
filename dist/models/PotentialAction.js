"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PotentialAction = void 0;
class PotentialAction {
    constructor(name, target) {
        this["@context"] = `http://schema.org`;
        this["@type"] = `ViewAction`;
        this.name = ``;
        this.target = [];
        this.name = name;
        this.target = target;
    }
}
exports.PotentialAction = PotentialAction;
//# sourceMappingURL=PotentialAction.js.map
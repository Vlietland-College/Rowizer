import ChangedRecordHolder from "./lib/changedRecordHolder.js";

class Changes {
    constructor(branchesOfSchools) {
        this.branchesOfSchools = branchesOfSchools;

        this.changedRecordHolderInstance = new ChangedRecordHolder()

    }
}


export { Changes }

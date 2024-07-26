import ChangedRecord from "./changedRecord.js";

export default class ChangedRecordHolder {
    constructor() {
        this._changedRecords = []
    }

    getRecords(year, period) {
        return this._changedRecords
    }

    find(group, period) {
        return this._changedRecords.find(obj => obj.period == period && obj.group == group)
    }

    add(item) {
        item.groupsInDepartments.forEach((group, index) => {

            let rec_obj = this.find(group, item.startTimeSlot)
            if (!rec_obj) {
                rec_obj = new ChangedRecord(group, item.groups[index], item.startTimeSlot)
                this._changedRecords.push(rec_obj)
            }

            if (item.valid) {
                rec_obj.newest = item
            } else {
                rec_obj.old = item
            }

        })
    }
}

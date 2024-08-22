import ChangedRecord from "./changedRecord.js";

export default class ChangedRecordHolder {
    constructor() {
        this._changedRecords = []
        this._rawData = []
    }

    getRecords(year, period) {
        return this._changedRecords
    }

    find(group, period) {
        return this._changedRecords.find(obj => obj.period == period && obj.group == group)
    }


    add(item) {
        // deze moet eruit
        item.groupsInDepartments.forEach((group, index) => {

            let rec_obj = this.find(group, item.startTimeSlot)
            if (!rec_obj) {
                rec_obj = new ChangedRecord(group, item.groups[index], item.startTimeSlot)
                this._changedRecords.push(rec_obj)
            }

            if (item.valid) {
                if(rec_obj.newest !== null){
                    //er is bvb een les gecanceld op dit moment en een andere les overheen gepland
                    if(item.cancelled){
                        //dan is dit de gecancelde les: valid en gecanceld
                        rec_obj.old = item
                    }
                    else{
                        //dit is de nieuwe les, de oude zit op newest
                        if(rec_obj.newest.cancelled){
                            rec_obj.old = rec_obj.newest
                            rec_obj.newest = item
                        }
                        else{
                            console.warn("newest is already set")
                            console.log(rec_obj)
                            console.log(rec_obj.newest, item)
                        }
                    }

                }else {
                    rec_obj.newest = item
                }
            } else {
                if(rec_obj.old !== null){
                    if(rec_obj.old.id !== item.id){
                        //er is een les vervallen en een nieuwe les neergezet op dit moment.
                        if(rec_obj.old.valid){
                            //de rec_obj.old is valid, de nieuwe niet want item.valid is eerder al geif't. Deze kunnen we dus droppen.
                        }
                        else {
                            console.warn("other old item is set than this")
                            console.log(rec_obj)
                            console.log(rec_obj.old, item)
                        }

                    }else{
                        console.warn("old is already taken by same appointment (double loading)")
                    }
                }
                else {
                    rec_obj.old = item
                }
            }

        })
    }
}

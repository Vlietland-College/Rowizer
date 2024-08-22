import {ChangesUIRecord} from "./changesUIRecord.js";

export default class ChangesUIRecordClass extends ChangesUIRecord {
    constructor(group, department, period, period_end, appointment) {
        super(group, department, period, period_end, appointment);
    }

    getInnerText() {
        let str = ""
        if (this.entity.isMainGroup) {
            str += this.entity.name + " "
        } else {
            str += this.entity.extendedName + " "
        }


        if (!this.appointment.cancelled && this.appointment.valid) {
            //dit gaat door
            if (this.entity.isMainGroup) {
                str += this.appointment.subjects[0].substring(0, 6)
                if (this.appointment.subjects.length > 1) {
                    str += "+" + (this.appointment.subjects.length - 1).toString()
                }
                str += " "

            }
            str += this.appointment.teachers.slice(0, 2).join(",")
            if (this.appointment.teachers.length > 2) {
                str += "+" + (this.appointment.teachers.length - 1).toString()
            }
            str += " "

            if (this.appointment.locations.length) {
                str += this.appointment.locations[0]
            }

        } else {
            if (this.appointment.type === 'activity') {
                str += "act vervalt"
            }
            if (this.appointment.type === 'lesson') {
                str += "vervalt"
            }
        }
        return str
    }
}

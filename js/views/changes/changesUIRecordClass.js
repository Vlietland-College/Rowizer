import {ChangesUIRecord} from "./changesUIRecord.js";

export default class ChangesUIRecordClass extends ChangesUIRecord {
    constructor(group, department, period, period_end, appointment) {
        super(group, department, period, period_end, appointment);
    }

    getInnerText() {
        let str = ""
        const subjects = Array.isArray(this.appointment.subjects) ? this.appointment.subjects : []
        const firstSubject = typeof subjects[0] === "string" ? subjects[0] : ""

        if (this.entity.isMainGroup) {
            str += this.entity.name + " "
        } else {
            str += this.entity.extendedName + " "
        }


        if (!this.appointment.cancelled && this.appointment.valid) {
            //dit gaat door
            if(this.appointment.type === "activity"){
                if (firstSubject) {
                    str += firstSubject.replace("_", " ") + " "
                }

            } else {
                if (this.entity.isMainGroup && firstSubject) {
                    str += firstSubject.substring(0, 6)
                    if (subjects.length > 1) {
                        str += "+" + (subjects.length - 1).toString()
                    }
                    str += " "
                }

            }

            str += this.appointment.teachers.slice(0, 2).join(",")
            if (this.appointment.teachers.length > 2) {
                str += "+" + (this.appointment.teachers.length - 1).toString()
            }
            str += " "

            if (this.appointment.locations.length) {
                str += this.appointment.locations.sort((a,b)=>a.length-b.length)[0]
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

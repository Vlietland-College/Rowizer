import OutOfOfficeEntity from "./outOfOfficeEntity.js";
import {arraysEqual, mergeAppointments} from "../../zermelo/utils/mergeAppointments.js";

export default class OutOfOffice {
    #lastModified;
    #outOfOffices;
    #location;


    constructor(connector, options={}) {
        this.connector = connector
        this.#outOfOffices = {}

        this.#lastModified = 0;

    }
    get absences(){
        return null
    }
    reset(){
        this.#lastModified = 0;
        this.#outOfOffices = {};
    }

    async setExternalLocationName(name){
        let location = await this.connector.api.locationofbranches.get({
            branchOfSchool: this.connector.branch.id,
            name: name
        })

        if(Object.keys(location).length !== 1){
            //TODO: error?
            throw new Error("No location can be set")
        }
        this.#location = Object.keys(location)[0]
        return this.#location
    }

    async loadAll(){
        if(!this.connector.date.isWeekDay()){
            return []
        }

        let appointments = await  this.connector.api.appointments.get({
            branchOfSchool: this.connector.branch.id,
            locationsOfBranch: this.#location,
            fields: ["id","appointmentInstance", "start", "end", "startTimeSlot", "endTimeSlot", "type", "groups", "groupsInDepartments", "locations", "cancelled", "cancelledReason", "modified", "teacherChanged", "groupChanged", "locationChanged", "timeChanged", "moved", "hidden", "changeDescription", "schedulerRemark", "lastModified", "base", "courses", "appointmentLastModified", "remark", "subjects", "teachers","valid", "students"],
            start: this.connector.date.getStartOfDayTime()/1000,
            end:this.connector.date.getEndOfDayTime()/1000,
            modifiedSince: this.#lastModified
        })
        appointments = mergeAppointments(appointments, (a,b) => arraysEqual(a.courses, b.courses) && arraysEqual(a.subjects, b.subjects)  && arraysEqual(a.teachers, b.teachers) && a.appointmentLastModified === b.appointmentLastModified && a.valid === b.valid && a.cancelled === b.cancelled)
        //make sets for partial attendance
        let appointment_sets = {}
        appointments.forEach(appointment =>{
            if(!appointment_sets[appointment.subjects]){
                appointment_sets[appointment.subjects] = []
            }
            appointment_sets[appointment.subjects].push(appointment)

        })
        console.log(appointment_sets)

    }

}

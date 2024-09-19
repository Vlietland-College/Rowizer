import OutOfOfficeEntity from "./outOfOfficeEntity.js";
import {arraysEqual, mergeAppointments, mergeSubsequentAppointments} from "../../zermelo/utils/mergeAppointments.js";

export default class OutOfOffice {
    #lastModified;
    #outOfOffices;
    #location;


    constructor(connector, options={}) {
        this.connector = connector
        this.#outOfOffices = {}

        this.#lastModified = 0;

    }
    get outOfOffices(){
        return this.#outOfOffices
    }
    reset(){
        this.#lastModified = 0;
        this.#outOfOffices = [];
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
            valid: true,
            cancelled: false,
            fields: ["id","appointmentInstance", "start", "end", "startTimeSlot", "endTimeSlot", "type", "groups", "groupsInDepartments", "locations", "cancelled", "cancelledReason", "modified", "teacherChanged", "groupChanged", "locationChanged", "timeChanged", "moved", "hidden", "changeDescription", "schedulerRemark", "lastModified", "base", "courses", "appointmentLastModified", "remark", "subjects", "teachers","valid", "students"],
            start: this.connector.date.getStartOfDayTime()/1000,
            end:this.connector.date.getEndOfDayTime()/1000,
            modifiedSince: this.#lastModified
        })
        appointments = mergeSubsequentAppointments(appointments)
        appointments = mergeAppointments(appointments, (a,b)=> a.start === b.start && a.end === b.end, (a,b) =>  a.teachers = a.teachers.concat(b.teachers))

        let appointment_sets_same_hours = []


        //make sets for partial attendance
        let appointment_sets = {}
        appointments.forEach(appointment =>{
            if(!appointment_sets[appointment.subjects]){
                appointment_sets[appointment.subjects] = []
            }
            appointment_sets[appointment.subjects].push(appointment)

        })
        this.#outOfOffices = Object.values(appointment_sets).map(set=> new OutOfOfficeEntity(set))
        return this.#outOfOffices

    }

}

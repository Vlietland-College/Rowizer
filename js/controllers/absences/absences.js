import AbsenceEntity from "./absenceEntity.js";

export default class Absences {
    #lastModified;
    #absences;

    constructor(connector, options={}) {
        this.connector = connector
        this.#absences = {}
        Object.assign(options, {
            //default options
        })
        this.#lastModified = 0;

    }
    get absences(){
        return this.#absences
    }


    async loadAll(){
        let weekyear = this.connector.date.getFullYear().toString()+this.connector.date.getWeekNumber()
        let headers = new Headers();
        headers.append("If-Modified-Since", new Date(this.#lastModified*1000).toUTCString())
        let absences = await this.connector.api.employeeAbsences.get({
            branchOfSchool: this.connector.branch.id,
            startWeek: weekyear,
            endWeek: weekyear,
            fields: ["id","start","end","absenceType","employee","absenceTypeCode","lastModified"]
        },{
            headers: headers
        })

        let start = this.connector.date.getStartOfDayTime()/1000
        let end = this.connector.date.getEndOfDayTime()/1000

        //FIXME: the first filter can be removed if If-Modified-Since header works..

        let valid_absences= Object.values(absences).filter(abs=>abs.lastModified>this.#lastModified).filter(abs=> abs.start < end && abs.end > start)

        Object.values(absences).forEach(absence =>{
            if(absence.lastModified > this.#lastModified){
                this.#lastModified = absence.lastModified
            }
        })

        let timeslots = this.connector.getTodayTimeSlots()

        valid_absences.forEach(abs=>{
            this.#absences[abs.id] = new AbsenceEntity(abs)
            if(abs.start > timeslots[0].startDt.getTime()/1000){
               abs.startSlot = timeslots.find(slot=> abs.start <= slot.startDt.getTime()/1000)
                //console.log("starts after first hour", abs.startSlot, new Date(abs.start*1000))
            }
            if(abs.end < timeslots.at(-1).endDt.getTime()/1000){
                let endSlot = timeslots.find((slot, index, slots)=> {
                    let to_return = abs.end <= slot.endDt.getTime()/1000
                    if(!to_return){
                        to_return = slots[index+1] ? slots[index+1].startDt.getTime()/1000 >= abs.end : false
                    }
                    return to_return
                })

                abs.endSlot = endSlot
                //console.log("ends before last hour", abs.endSlot, new Date(abs.end*1000))
            }
            /*let when_text = ""
            if(abs.endSlot && abs.startSlot){
                when_text = "("+abs.startSlot.timeSlotName.rank+"-"+abs.endSlot.timeSlotName.rank+")"
            }
            else if(abs.endSlot) {
                when_text = "(t/m "+abs.endSlot.timeSlotName.rank+")"
            }
            else if(abs.startSlot){
                when_text = "(va "+abs.startSlot.timeSlotName.rank+")"
            }
            console.log(abs.employee + (when_text ? when_text : "" + when_text), abs)*/
            valid_absences.forEach(abs=>this.#absences[abs.id] = abs)
        })
        return valid_absences
    }

}

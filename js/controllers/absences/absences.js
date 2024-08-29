import AbsenceEntity from "./absenceEntity.js";

export default class Absences {
    #lastModified;
    #absences;
    #lastValidAbsences;

    constructor(connector, options={}) {
        this.connector = connector
        this.#absences = {}
        this.#lastValidAbsences = ""

        this.#lastModified = 0;

    }
    get absences(){
        return this.#absences
    }
    reset(){
        this.#lastModified = 0;
        this.#absences = {};
    }

    async loadAll(){
        if(!this.connector.date.isWeekDay()){
            return []
        }
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

        //FIXME: if-modified-since doenst work. Bear in mind: removed absences should also be noticed

        let valid_absences= Object.values(absences).filter(abs=> abs.start < end && abs.end > start)
        let absencesToCheck = JSON.stringify(valid_absences.sort((a,b)=> a.id < b.id))
        if(this.#lastValidAbsences === absencesToCheck){
            return []
        }
        else{
            this.#lastValidAbsences = absencesToCheck
        }

        //let modified_absences = valid_absences.filter(abs=>abs.lastModified>this.#lastModified)

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
                if(endSlot !== timeslots.at(-1)){
                    //if absence ends during the last timeslot assume until end of day
                    abs.endSlot = endSlot
                }

            }

            valid_absences.forEach(abs=>this.#absences[abs.id] = abs)
        })
        return valid_absences
    }

}

export default class Absences {
    #lastModified;

    constructor(connector, options={}) {
        this.connector = connector

        Object.assign(options, {
            //default options
        })
        this.#lastModified = 0;

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
        Object.values(absences).forEach(absence =>{
            if(absence.lastModified > this.#lastModified){
                this.#lastModified = absence.lastModified
            }
        })
        //FIXME: the first filter can be removed if If-Modified-Since header works..
        let valid_absences = Object.values(absences).filter(abs=>abs.lastModified>this.#lastModified).filter(abs=> abs.start < end && abs.end > start)

        Object.values(absences).forEach(absence =>{
            if(absence.lastModified > this.#lastModified){
                this.#lastModified = absence.lastModified
            }
        })

        valid_absences.forEach(abs=>{console.log(new Date(abs.start*1000).toString() + " - " + new Date(abs.end*1000).toString())})
    }

}

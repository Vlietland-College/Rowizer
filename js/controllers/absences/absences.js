export default class Absences {

    constructor(connector, options={}) {
        this.connector = connector

        Object.assign(options, {
            //default options
        })

    }


    async loadAll(){
        let weekyear = this.connector.date.getFullYear().toString()+this.connector.date.getWeekNumber()
        let absences = await this.connector.api.employeeAbsences.get({
            branchOfSchool: this.connector.branch.id,
            startWeek: weekyear,
            endWeek: weekyear
        })

        let start = this.connector.date.getStartOfDayTime()/1000
        let end = this.connector.date.getEndOfDayTime()/1000

        let valid_absences = Object.values(absences).filter(abs=> abs.start < end && abs.end > start)

        valid_absences.forEach(abs=>{console.log(new Date(abs.start*1000).toString() + " - " + new Date(abs.end*1000).toString())})
    }

}

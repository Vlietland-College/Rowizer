export default class Absences {
    #branchOfSchools;
    #date;
    constructor(options={}) {
        this.connector = null

        Object.assign(options, {
            //default options
        })
        if (Object.keys(options).includes("zermelo")) {
            this.connector = options.zermelo
        }
    }

    setBranch(branch){
        this.#branchOfSchools = branch
    }

    setDate(date){
        this.#date = date
    }

    async loadAll(){
        let weekyear = this.#date.getFullYear().toString()+this.#date.getWeekNumber()
        let absences = await this.connector.employeeAbsences.get({
            branchOfSchool: this.#branchOfSchools.id,
            startWeek: weekyear,
            endWeek: weekyear
        })

        let start = this.#date.getStartOfDayTime()/1000
        let end = this.#date.getEndOfDayTime()/1000

        let valid_absences = Object.values(absences).filter(abs=> abs.start < end && abs.end > start)
        valid_absences.forEach(abs=>{console.log(new Date(abs.start*1000).toString() + " - " + new Date(abs.end*1000).toString())})
    }

}

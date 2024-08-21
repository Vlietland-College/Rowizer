export class ChangesUIRecord {
    constructor(entity, department, period_start, period_end, appointment) {
        this.entity = entity;
        this.period_start = period_start;
        this.period_end = period_end
        this.departmentOfBranch = department

        this.appointment = appointment;

        this.element = null;
    }

    getElement() {
        if (this.element) {
            return this.element
        }
        return this.#createElement()

    }

    #createElement() {
        let el = document.createElement("div");
        el.classList.add("appointment", this.appointment.type)
        let this_morning = new Date(this.appointment.start * 1000)
        this_morning.setHours(7, 0, 0)

        if (this_morning.getTime() < (this.appointment.lastModified * 1000)) {

            console.log("new")
            el.classList.add("new")
        }


        //for activities use real times
        el.style.setProperty('--start-hour', this.period_start);
        el.style.setProperty('--end-hour', this.period_end);
        el.innerText = this.getInnerText()

        this.element = el
        return this.element
    }

    getInnerText() {

    }


}

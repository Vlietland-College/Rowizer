export default class OutOfOfficeUiRecord {

    constructor(ooo) {
        this.outOfOffice = ooo
        this.element = null;
    }

    getElement(){
        if(!this.element){
            this.#createElement();
        }
        return this.element
    }
    #createElement(){
        let el = document.createElement("div");
        el.classList.add("outofoffice")
        let when_text = this.outOfOffice.subject+": ";
        el.innerText = when_text
        this.outOfOffice.appointments.sort((a,b)=>a.start-b.start).sort((a,b)=>(a.end-a.start)-(b.end-b.start))
        this.outOfOffice.appointments.forEach(appointment=>{
            let inner_el = document.createElement("div");
            inner_el.innerText = "("+appointment.startTimeSlot +"-"+ appointment.endTimeSlot+") " + appointment.teachers.map(t=>t.toUpperCase()).join(" - ")
            el.appendChild(inner_el)
        })


        this.element = el
    }
}


export default class OutOfOfficeUiRecord {
    static connector;
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
        let when_text = " "
        when_text += this.outOfOffice.subject.replace("_", " ");
        el.innerText = when_text
        this.outOfOffice.appointments.sort((a,b)=>a.start-b.start).sort((a,b)=>(a.end-a.start)-(b.end-b.start))
        let timeslots = OutOfOfficeUiRecord.connector.getTodayTimeSlots()


        this.outOfOffice.appointments.forEach(appointment=>{
            let inner_el = document.createElement("div");
            let text = ""
            if(appointment.startTimeSlot === timeslots[0].timeSlotName.rank && appointment.endTimeSlot === timeslots.at(-1).timeSlotName.rank){
               //starts and ends at start/end of day
            } else if (appointment.startTimeSlot === timeslots[0].timeSlotName.rank){
                text += "t/m "+appointment.endTimeSlot +"e: "
            } else if (appointment.endTimeSlot === timeslots.at(-1).timeSlotName.rank){
                text += "va "+appointment.startTimeSlot +"e: "
            } else {
                text += ""+appointment.startTimeSlot + "-" + appointment.endTimeSlot+": "
            }

            inner_el.innerText = text + appointment.teachers.sort().map(t=>t.toUpperCase()).join(" - ")
            el.appendChild(inner_el)
        })


        this.element = el
    }
}


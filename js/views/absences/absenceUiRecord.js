export default class AbsenceUiRecord {

    constructor(abs) {
        this.absence = abs
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
        el.classList.add("absence")
        let when_text = ""
        if(this.absence.endSlot && this.absence.startSlot){
           when_text = "("+this.absence.startSlot.timeSlotName.rank+"-"+this.absence.endSlot.timeSlotName.rank+")"
        }
        else if(this.absence.endSlot) {
           when_text = "(t/m "+this.absence.endSlot.timeSlotName.rank+")"
        }
        else if(this.absence.startSlot){
           when_text = "(va "+this.absence.startSlot.timeSlotName.rank+")"
        }

        el.innerText = this.absence.employee.toUpperCase() + (when_text ? " "+when_text : "" + when_text)
        this.element = el
    }
}


import OutOfOfficeUiRecord from "./outOfOfficeUiRecord.js";

export class OutOfOfficeUiManager {

    constructor(element, connector, manager) {
        this.element = element
        this.outOfOfficeManager = manager;
        this.connector = connector
    }

    render() {
        let outOfOffices = this.outOfOfficeManager.outOfOffices;

        let absences_ui_items = outOfOffices.map(abs => new OutOfOfficeUiRecord(abs))
        absences_ui_items.forEach(abui => this.element.append(abui.getElement()))
    }

    merge(){

    }


    async refresh() {
        //TODO: this is quick n dirty way to show the new changes
        let changes = await this.outOfOfficeManager.loadAll()
        if (Object.keys(changes).length) {
            this.element.innerHTML = ""
            this.render()
        }
    }

}

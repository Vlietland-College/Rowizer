import AbsenceUiRecord from "./absenceUiRecord.js";

export class AbsencesUiManager {

    constructor(element, connector, manager) {
        this.element = element
        //changesmanager does the change models and so.
        this.absencesManager = manager;
        this.connector = connector
    }

    render(){
        let absences = Object.values(this.absencesManager.absences);
        absences.sort((a,b) => a.employee.localeCompare(b.employee))
        let absences_ui_items = absences.map(abs=> new AbsenceUiRecord(abs))
        absences_ui_items.forEach(abui=> this.element.append(abui.getElement()))
    }


    async refresh() {
        //TODO: this is quick n dirty way to show the new changes
        let changes = await this.absencesManager.loadAll()
        if (Object.keys(changes).length) {
            this.element.innerHTML = ""
            this.render()
        }
    }

}

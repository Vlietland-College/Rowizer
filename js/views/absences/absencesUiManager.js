import AbsenceUiRecord from "./absenceUiRecord.js";

export class AbsencesUiManager {

    constructor(element, connector, manager) {
        this.element = element
        //changesmanager does the change models and so.
        this.absencesManager = manager;
        this.connector = connector
    }

    render() {
        let absences = Object.values(this.absencesManager.absences);
        absences.sort((a, b) => a.employee.localeCompare(b.employee))
        let unique_employees = [...new Set(absences.map(abs=>abs.employee).filter((e, i, a) => a.indexOf(e) !== i))]
        if(unique_employees.length){
            //there are duplicates in the absences
            //console.log(unique_employees)
        }

        let absences_ui_items = absences.map(abs => new AbsenceUiRecord(abs))
        absences_ui_items.forEach(abui => this.element.append(abui.getElement()))
    }

    merge(){

    }


    async refresh() {
        //TODO: this is quick n dirty way to show the new changes
        try{
            var changes = await this.absencesManager.loadAll()
        } catch(e){
            console.error(e)
            return;
        }
        if (Object.keys(changes).length) {
            this.element.innerHTML = ""
            this.render()
        }
    }

}

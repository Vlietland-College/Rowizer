import ChangesUIRecordClass from "./changesUIRecordClass.js";

export class ChangesUiManager {

    constructor(element, connector, manager) {
        this.element = element
        //changesmanager does the change models and so.
        this.changesManager = manager;
        this.connector = connector
        this.setDate(connector.date)

    }

    setDate(date) {
        this.date = date
    }

    makeTable() {
        let yearsOfEducation = Object.keys(this.connector.yearsOfEducation).sort()
        let timeslots = this.connector.timeslots.sort((a, b) => a.rank - b.rank)

        let container = document.createElement('div')
        container.classList.add("schedule-container", "schedule-flex")
        container.style.setProperty('--years-of-education', yearsOfEducation.at(-1));
        container.style.setProperty('--timeslots', timeslots.at(-1).rank);
        //set css variables
        let year_row = document.createElement('div')
        year_row.classList.add("year-row", "schedule-flex", "header")
        let node = document.createElement('div');
        node.classList.add("schedule-flex", "year-header")
        year_row.append(node)
        container.append(year_row)

        let timeslots_box = document.createElement('div')
        timeslots_box.classList.add("schedule-content-container")
        timeslots_box.classList.add("timeslot-container")
        timeslots_box.classList.add("schedule-flex")
        year_row.append(timeslots_box)
        timeslots.forEach(slot => {
            let el = document.createElement('div')
            el.classList.add("timeslot-header")
            el.innerHTML = slot.name
            el.setAttribute('data-timeslot', slot.rank)
            timeslots_box.append(el)
        })

        yearsOfEducation.forEach(year => {
            let el = document.createElement('div')
            el.classList.add("year-row", "schedule-flex")
            let year_cell = document.createElement('div')
            year_cell.classList.add("schedule-flex", "header", "year-header")
            year_cell.innerHTML = year
            el.append(year_cell)

            let content_cell = document.createElement('div')
            content_cell.classList.add("schedule-content", "schedule-flex")
            el.append(content_cell)
            let content_container = document.createElement('div')
            content_container.classList.add("schedule-content-container")
            content_container.id = "schedule-content-year-" + year
            content_cell.append(content_container)
            container.append(el)
        })
        this.element.append(container)
    }

    fillTable() {
        let changes = []
        let app_filtered = Object.values(this.changesManager.appointments).filter(app => app.groupsInDepartments.length)


        app_filtered.filter(app => app.type === 'activity' && app.valid).forEach(appointment => {
            appointment.groupsInDepartments.forEach(group_id => {
                let group = this.connector.getGroupInDepartment(group_id)
                let branch = this.connector.getDepartmentOfBranch(group.departmentOfBranch)

                changes.push(new ChangesUIRecordClass(group, branch, appointment.startTimeSlot, appointment.endTimeSlot, appointment))
            })
        })

        let do_app = function (apps, cm) {
            apps.forEach(appointment => {
                appointment.groupsInDepartments.forEach(group_id => {
                    let group = cm.connector.getGroupInDepartment(group_id)
                    let branch = cm.connector.getDepartmentOfBranch(group.departmentOfBranch)
                    let i = appointment.startTimeSlot
                    while (i <= appointment.endTimeSlot) {
                        //filteren van dingen die tegelijk met activiteiten uitvallen
                        if (changes.find(c => c.entity.id === group.id && c.period_start <= i && c.period_end >= i)) {
                            return;
                        }

                        changes.push(new ChangesUIRecordClass(group, branch, i, i, appointment))
                        i++;
                    }
                })
            })

        }
        do_app(app_filtered.filter(app => app.type === 'lesson' && app.valid && !app.cancelled), this)
        do_app(app_filtered.filter(app => app.type === 'lesson' && app.valid && app.cancelled), this)
        do_app(app_filtered.filter(app => !app.valid), this)

        changes.sort((a, b) => {
            if (a.appointment.type !== b.appointment.type) {
                if (a.appointment.type === 'lesson') {
                    //activities voor lessen
                    return 1
                } else {
                    return -1
                }
            } else if (a.entity !== b.entity) {
                if (a.entity.extendedName > b.entity.extendedName) {
                    return 1
                } else {
                    return -1
                }
            }
            return 0
        }).forEach(change => {
            let container = document.querySelector("#schedule-content-year-" + change.departmentOfBranch.yearOfEducation)
            container.append(change.getElement())

        })
    }

    async refreshTable() {
        //TODO: this is quick n dirty way to show the new changes
        let changes = await this.changesManager.loadData()
        if (Object.keys(changes).length) {
            this.element.innerHTML = ""
            this.makeTable()
            this.fillTable()
        }

    }


}

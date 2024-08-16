import { ZermeloApi } from "./zermelo/zermelo.js";
import { Changes } from "./changes/changes.js";
import groupInDepartments from "./zermelo/lib/groupInDepartments/groupInDepartmentsInterface.js";
let params = new URLSearchParams(window.location.search)

var zapi = new ZermeloApi({
    portal: params.get("portal"),
    token: params.get("token"),
    branch: params.get("branch")
});


class ChangesUIRecord{
    constructor(entity, department, period_start, period_end,appointment){
        this.entity = entity;
        this.period_start = period_start;
        this.period_end = period_end
        this.departmentOfBranch = department

        this.appointment = appointment;

        this.element = null;
    }

    getElement(){
        if(this.element){
            return this.element
        }
        return this.#createElement()

    }
    getYear(){

    }

    #createElement(){
        let el = document.createElement("div");
        el.classList.add("appointment", this.appointment.type)
        let this_morning = new Date(this.appointment.start*1000)
        this_morning.setHours(7,0,0)

        if(this_morning.getTime() < (this.appointment.lastModified*1000)){

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
    getInnerText(){

    }


}

class ChangesUIRecordClass extends ChangesUIRecord{
    constructor(group, department, period, period_end,appointment) {
        super(group, department, period, period_end,appointment);
    }

    getInnerText(){
        let str = ""
        if (this.entity.isMainGroup) {
            str += this.entity.name + " "
        } else {
            str += this.entity.extendedName + " "
        }


        if(!this.appointment.cancelled && this.appointment.valid){
            //dit gaat door
            if(this.entity.isMainGroup) {
                str += this.appointment.subjects[0] + " "
            }
            str += this.appointment.teachers[0] + " "

            if(this.appointment.locations.length){
                str += this.appointment.locations[0]
            }

        }
        else{
            if(this.appointment.type === 'activity') {
                str += "act vervalt"
            }
            if(this.appointment.type === 'lesson') {
                str += "vervalt"
            }
        }
        return str

        if(this.appointment.type === 'lesson') {
            if (!this.appointment.cancelled && this.appointment.valid) {
                str += this.entity.readableName() + " "
            } else {
                return this.entity.readableName()  + " vervalt"
            }
        }
        else if(this.appointment.type === "activity"){
            if (!this.appointment.cancelled && this.appointment.valid) {
                return this.entity.readableName() + " act " + this.appointment.subjects[0] + " " + this.appointment.teachers[0] + this.appointment.locations[0]
            } else {
                return  this.entity.readableName()  + " act vervalt"
            }
        }
    }
}

class ChangesUiManager{
    #start_time;
    #end_time
    constructor(element,  manager, date = new Date().toLocaleString("nl-NL", {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    })){
        this.element = element
        //changesmanager does the change models and so.
        this.changesManager = manager;

        this.setDate(date)

    }

    setDate(date){
        let date_parts = date.split("-");
        this.date = new Date(date_parts[2], date_parts[1] - 1, date_parts[0], 0, 0)
        this.changesManager.setDate(this.date)
        this.table = null;
    }

    makeTable(){
        let yearsOfEducation = Object.keys(this.changesManager.yearsOfEducation).sort()
        let timeslots = this.changesManager.timeslots.sort((a,b)=>a.rank-b.rank)

        let container = document.createElement('div')
        container.classList.add("schedule-container", "schedule-flex")
        container.style.setProperty('--years-of-education', yearsOfEducation.at(-1));
        container.style.setProperty('--timeslots', timeslots.at(-1).rank);
        //set css variables
        let year_row = document.createElement('div')
        year_row.classList.add("year-row","schedule-flex", "header")
        let node = document.createElement('div');
        node.classList.add("schedule-flex", "year-header")
        year_row.append(node)
        container.append(year_row)

        timeslots.forEach(slot=>{
            let el = document.createElement('div')
            el.classList.add("schedule-flex")
            el.innerHTML = slot.name
            el.setAttribute('data-timeslot', slot.rank)
            year_row.append(el)
        })

        yearsOfEducation.forEach(year=>{
            let el = document.createElement('div')
            el.classList.add("year-row","schedule-flex")
            let year_cell = document.createElement('div')
            year_cell.classList.add("schedule-flex", "header", "year-header")
            year_cell.innerHTML = year
            el.append(year_cell)

            let content_cell = document.createElement('div')
            content_cell.classList.add("schedule-content","schedule-flex")
            el.append(content_cell)
            let content_container = document.createElement('div')
            content_container.classList.add("schedule-content-container")
            content_container.id = "schedule-content-year-"+year
            content_cell.append(content_container)
            container.append(el)
        })
        this.element.append(container)
    }

    fillTable(){
        let activities = []
        let changes = []
        let app_filtered =  Object.values(this.changesManager.appointments).filter(app => app.groupsInDepartments.length)

        let valid_activities = []

        app_filtered.filter(app=> app.type === 'activity' && app.valid).forEach(appointment => {
            appointment.groupsInDepartments.forEach(group_id => {
                let group = this.changesManager.getGroupInDepartment(group_id)
                let branch = this.changesManager.getDepartmentOfBranch(group.departmentOfBranch)

                changes.push(new ChangesUIRecordClass(group, branch, appointment.startTimeSlot, appointment.endTimeSlot,appointment))
            })
        })





        let do_app = function(apps, cm){
            apps.forEach(appointment => {
                //alles wat niet uitvalt en valid is
                appointment.groupsInDepartments.forEach(group_id => {
                    let group = cm.changesManager.getGroupInDepartment(group_id)
                    let branch = cm.changesManager.getDepartmentOfBranch(group.departmentOfBranch)
                    let i = appointment.startTimeSlot
                    while(i <= appointment.endTimeSlot){
                        //filteren van dingen die tegelijk met activiteiten uitvallen
                        if(changes.find(c => c.entity.id === group.id && c.period_start <=i && c.period_end >=i)){
                            return;
                        }

                        changes.push(new ChangesUIRecordClass(group, branch, i, i, appointment))
                        i++;
                    }
                })
            })

        }
        do_app(app_filtered.filter(app=> app.type === 'lesson' && app.valid && !app.cancelled), this)
        do_app(app_filtered.filter(app=> app.type === 'lesson' && app.valid && app.cancelled), this)
        do_app(app_filtered.filter(app=> !app.valid), this)

        changes.sort((a,b) =>{
            if(a.appointment.type !== b.appointment.type){
                if(a.appointment.type === 'lesson'){
                    //activities voor lessen
                    return 1
                }
                else{
                    return -1
                }
            }
            else if(a.entity !== b.entity){
                if(a.entity.extendedName > b.entity.extendedName){
                    return 1
                }
                else{
                    return -1
                }
            }
            return 0
        }).forEach(change =>{
            let container = document.querySelector("#schedule-content-year-"+change.departmentOfBranch.yearOfEducation)
            container.append(change.getElement())

        })
    }


}



$(document).ready(function () {
    console.log("loadedsdsdsd")




    let params = new URLSearchParams(window.location.search)

    //portal: naam vh portal, token: api-token, branch: branchcode (vestigingscode)


    var last_hour = 9;
    const last_class = 6;

    let param_date = params.get("date");
    let param_branch = params.get("branch");

    var changesManager = new Changes({zermelo:zapi, branch: param_branch? param_branch : undefined, ignore_departments:['kopkl', 'vavo']});

    var changesUiManager = new ChangesUiManager(document.querySelector("#content-container"), changesManager,param_date ? param_date : undefined)
    window.cm = changesUiManager

    changesManager.waitUntilReady().then(m => m.loadData().then(a=>fillWholeTable(a.changedRecordHolderInstance.getRecords())).then(a=>{changesUiManager.makeTable(); changesUiManager.fillTable()}))


    $("#title").text("Roosterwijzigingen " + changesUiManager.date.toLocaleString("nl-NL", {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }))



    function fillWholeTable(records) {
        return;

        for (let hour = 1; hour <= last_hour; hour++) {
            let this_hour_records = records.filter(item => item.period == hour)
            for (let classyear = 1; classyear <= last_class; classyear++) {
                let this_cell_records = this_hour_records.filter(item => item.classYear == classyear)
                let html_list = $("tr:eq(" + classyear + ") td:eq(" + hour + ") ul")
                this_cell_records.forEach(item => {
                    let elements = item.itemHtml()
                    elements.forEach(el => {
                        let new_item = $("<li>").addClass("change-record").html(item.itemHtml())
                        html_list.append(new_item)
                    })

                })

            }
        }
    }




    // Your code to run since DOM is loaded and ready
});

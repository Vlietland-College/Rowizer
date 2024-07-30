import { ZermeloApi } from "./zermelo/zermelo.js";
import { Changes } from "./changes/changes.js";
let params = new URLSearchParams(window.location.search)

var zapi = new ZermeloApi({
    portal: params.get("portal"),
    token: params.get("token"),
    branch: params.get("branch")
});

class ChangesUiManager{
    #start_time;
    #end_time
    constructor(element, api, date = new Date().toLocaleString("nl-NL", {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    })){
        this.element = element
        this.api = api

        //changesmanager does the change models and so.
        this.changesManager = new Changes();
        this.schoolYear = null
        this.date = null;
        this.setDate(date)

        this.branchOfSchool = null
        this.userBranchCode = null
        this.branches = []


        //find all branches, then if there's one branch find the one in the current schoolyear
        this.branchPromise = new Promise((resolve)=>{
            this.api.branches.get().then(b => {
                this.branches = b;
                //TODO use this.setBranch
                if(this.branches.length === 1) {
                    this.api.branchesOfSchools.get({schoolYear: this.schoolYear}).then(b => {
                        this.branchOfSchool = Object.values(b)[0]
                        resolve();
                    });
                }
                else{
                    resolve();
                }

            })
        })

    }

    async fetchChanges(){
        let request_options = {
            branchOfSchool: this.branchOfSchool.id,
            fields: ["appointmentInstance", "start", "end", "startTimeSlot", "endTimeSlot", "type", "groups", "groupsInDepartments", "locations", "cancelled", "cancelledReason", "modified", "teacherChanged", "groupChanged", "locationChanged", "timeChanged", "moved", "hidden", "changeDescription", "schedulerRemark", "lastModified", "new", "courses", "appointmentLastModified", "remark", "subjects", "teachers","valid" ],
            includeHidden: true,
            start: this.#start_time/1000,
            end:this.#end_time/1000,
            modified: true,
            valid: true
        }

        let modified = this.api.appointments.get(request_options)
        request_options.valid = false
        delete request_options.modified
        let invalid = this.api.appointments.get( request_options)
        delete request_options.valid
        request_options.cancelled = true
        let cancelled = this.api.appointments.get( request_options)

        let data = await Promise.all([modified, invalid, cancelled])

        console.log(data)
        return data

    }
    setDate(date){
        let date_parts = date.split("-");
        this.date = new Date(date_parts[2], date_parts[1] - 1, date_parts[0], 0, 0)
        this.schoolYear = date_parts[2]
        if(date_parts[1] < 8){
            this.schoolYear = date_parts[2] - 1
        }
        this.#start_time = this.date.getTime()
        this.date.setHours(23, 59, 59)
        this.#end_time = this.date.getTime()
    }

    async setBranch(code){
        this.userBranchCode = code
        let branches = await this.api.branchesOfSchools.get({branch: code, schoolYear: this.schoolYear})
        if(Object.values(branches).length !== 1) {
            throw new Error("No branches found (or multuple)")
        }
        this.branchOfSchool = Object.values(branches)[0]
    }

    refresh(){

    }

}



$(document).ready(function () {
    console.log("loadedsd")




    let params = new URLSearchParams(window.location.search)

    //portal: naam vh portal, token: api-token, branch: branchcode (vestigingscode)


    var last_hour = 9;
    var last_class = 6;

    var lastModified = null;


    let param_date = params.get("date");

    var changesUiManager = new ChangesUiManager(null, zapi, param_date ? param_date : undefined)
    window.cm = changesUiManager
    let branch = params.get("branch")
    if(branch !== null){
        changesUiManager.setBranch(branch).then(b=> {zapi.branch = changesUiManager.branchOfSchool; getAllData()})
    }
    else {
        changesUiManager.branchPromise.then(a => {
            zapi.branch = changesUiManager.branchOfSchool;
            getAllData()

        })
    }




    $("#title").text("Roosterwijzigingen " + changesUiManager.date.toLocaleString("nl-NL", {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }))

    async function getAllData(){

        let date_parts = changesUiManager.date.toLocaleString("nl-NL", {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        }).split('-')
        let start_time = (new Date(date_parts[2], date_parts[1]-1, date_parts[0], 0, 0).getTime()/1000)
        let end_time = new Date(date_parts[2], date_parts[1]-1, date_parts[0], 23, 59).getTime()/1000
        console.log(" g data", start_time, end_time)
        changesUiManager.fetchChanges()
       let departmentsofbranch = zapi.departmentsOfBranches.get({branchOfSchool:zapi.branch.id, fields:['id','code','yearOfEducation', 'weekTimeTable', 'educations']}).then(r=>console.log(r))


        let request_options = {
            branchOfSchool: zapi.branch.id,
            fields: ["id","appointmentInstance", "start", "end", "startTimeSlot", "endTimeSlot", "type", "groups", "groupsInDepartments", "locations", "cancelled", "cancelledReason", "modified", "teacherChanged", "groupChanged", "locationChanged", "timeChanged", "moved", "hidden", "changeDescription", "schedulerRemark", "lastModified", "base", "courses", "appointmentLastModified", "remark", "subjects", "teachers","valid"],
            includeHidden: true,
            start: start_time,
            end:end_time,
            modified: true,
            valid: true
        }

        let modified = zapi.appointments.get(request_options)
        request_options.valid = false
        delete request_options.modified
        let invalid = zapi.appointments.get( request_options)
        delete request_options.valid
        request_options.cancelled = true
        let cancelled = zapi.appointments.get( request_options)
        delete request_options.cancelled
        request_options.type = 'activity'
        let activities = zapi.appointments.get( request_options)

        Promise.all([modified, invalid, cancelled, activities]).then(res =>{
            allDataLoaded({
                modified: res[0],
                invalid: res[1],
                cancelled: res[2],
                activities: res[3]
            })
        })



    }


    function allDataLoaded(data) {
        let all_data_for_debug = {}
        Object.values(data).forEach(type => type.forEach((item) => {
            all_data_for_debug[item.id] = item
        }))
        window.ad = all_data_for_debug
        data.activities.filter(obj => obj.groups.length != 0).forEach(obj => changesUiManager.changesManager.changedRecordHolderInstance.add(obj))
        data.modified.filter(obj => obj.groups.length != 0).forEach(obj => changesUiManager.changesManager.changedRecordHolderInstance.add(obj))
        data.cancelled.filter(obj=> obj.groups.length != 0).forEach(obj => changesUiManager.changesManager.changedRecordHolderInstance.add(obj))
        data.invalid.filter(obj => obj.groups.length != 0).forEach(obj => changesUiManager.changesManager.changedRecordHolderInstance.add(obj))

        console.log(changesUiManager.changesManager.changedRecordHolderInstance)
        console.log(changesUiManager.changesManager.changedRecordHolderInstance.find(7601, 2))
        fillWholeTable()


    }

    function fillWholeTable() {
        let records = changesUiManager.changesManager.changedRecordHolderInstance.getRecords()

        for (let hour = 1; hour <= last_hour; hour++) {
            let this_hour_records = records.filter(item => item.period == hour)
            for (let classyear = 1; classyear <= last_class; classyear++) {
                let this_cell_records = this_hour_records.filter(item => item.classYear == classyear)
                let html_list = $("tr:eq(" + classyear + ") td:eq(" + hour + ") ul")
                this_cell_records.forEach(item => {
                    let new_item = $("<li>").addClass("change-record").html(item.itemHtml())
                    html_list.append(new_item)
                })

            }
        }
    }




    // Your code to run since DOM is loaded and ready
});

import { ZermeloApi } from "./zermelo/zermelo.js";
import ChangedRecordHolder from "./changes/changedRecordHolder.js";

let params = new URLSearchParams(window.location.search)

var zapi = new ZermeloApi({
    portal: params.get("portal"),
    token: params.get("token"),
    branch: params.get("branch")
});




window.zapi = zapi
$(document).ready(function () {
    console.log("loaded")
    let params = new URLSearchParams(window.location.search)

    //portal: naam vh portal, token: api-token, brin: brinnummer schoolinyear te zoeken, branch: branchcode (vestigingscode)


    var last_hour = 9;
    var last_class = 6;

    var lastModified = null;



    function setTitle(date_string) {

        let date_parts = date_string.split("-")
        let date_obj = new Date(date_parts[2], date_parts[1] - 1, date_parts[0], 0, 0)
        $("#title").text("Roosterwijzigingen " + date_obj.toLocaleString("nl-NL", {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }))
    }

    var date = "19-06-2024"

    let param_date = params.get("date");

    if(param_date){
        date = param_date
    }
    else{
        let date_obj = new Date()
        date = date_obj.getDate()+"-"+(date_obj.getMonth()+1)+"-"+date_obj.getFullYear()
    }

    let branch = params.get("branch")

    if(branch === null){
        let schools = zapi.brancheOfSchools.get().then(branches=>{
            if(branches.length > 1){
                throw new Error("Multiple branches found, please define branch in the url")
            }
            else{
                zapi.branch = branches[0]
            }
            getAllData()
        })
    }
    else{
        let date_parts = date.split("-")
        let school_year = date_parts[2]
        //als het voor de zvak is moet er een jaar af
        if(date_parts[1] < 8){
            school_year = school_year - 1
        }
        let school = zapi.brancheOfSchools.get({branch: branch, schoolYear: school_year}).then(branches =>{
            if(branches.length === 0){
                throw new Error("No branches found for this year with this code")
            }
            else{
                zapi.branch = branches[0]
            }
            getAllData()
        })
    }

    setTitle(date)

    async function getAllData(){

        let date_parts = date.split('-')
        let start_time = (new Date(date_parts[2], date_parts[1]-1, date_parts[0], 0, 0).getTime()/1000)
        let end_time = new Date(date_parts[2], date_parts[1]-1, date_parts[0], 23, 59).getTime()/1000


        let request_options = {
            branchOfSchool: zapi.branch.id,
            fields: ["appointmentInstance", "start", "end", "startTimeSlot", "endTimeSlot", "type", "groups", "groupsInDepartments", "locations", "cancelled", "cancelledReason", "modified", "teacherChanged", "groupChanged", "locationChanged", "timeChanged", "moved", "hidden", "changeDescription", "schedulerRemark", "lastModified", "new", "courses", "appointmentLastModified", "remark", "subjects", "teachers","valid" ],
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

        let promise_all = Promise.all([modified, invalid, cancelled]).then(res =>{
            allDataLoaded({
                modified: res[0],
                invalid: res[1],
                cancelled: res[2],
            })
        })



    }


    function allDataLoaded(data) {

        data.modified.filter(obj => obj.groups.length != 0).forEach(obj => changedRecordHolderInstance.add(obj))
        //data.cancelled.filter(obj=> obj.groups.length != 0).forEach(obj => changedRecordHolderInstance.add(obj))
        data.invalid.filter(obj => obj.groups.length != 0).forEach(obj => changedRecordHolderInstance.add(obj))
        console.log(changedRecordHolderInstance)
        console.log(changedRecordHolderInstance.find(7601, 2))
        fillWholeTable()


    }

    function fillWholeTable() {
        let records = changedRecordHolderInstance.getRecords()

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






    var changedRecordHolderInstance = new ChangedRecordHolder()


    // Your code to run since DOM is loaded and ready
});

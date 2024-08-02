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
    }

    makeTable(){
        let yearsOfEducation = Object.keys(this.changesManager.yearsOfEducation).sort()
        let timeslots = this.changesManager.timeslots.sort((a,b)=>a.rank-b.rank)
        let table = document.createElement('table');
        table.classList.add('changes-table');

        let first_row = document.createElement('tr');
        first_row.append(document.createElement('th'))

        timeslots.forEach(slot=>{
            let header_cell = document.createElement('th')
            header_cell.innerText = slot.name
            header_cell.setAttribute('data-timeslot', slot.rank)
            first_row.append(header_cell)
        })
        table.append(first_row)

        yearsOfEducation.forEach(year=>{
            let row = document.createElement('tr');
            let first_cell = document.createElement('th')
            first_cell.innerText = year+"e"
            first_cell.classList.add("year-header")
            first_cell.setAttribute('data-year', year)

            row.append(first_cell)

            let container_cell = document.createElement('td');
            container_cell.setAttribute('colspan', (timeslots.length).toString())
            row.append(container_cell)
            let year_table = document.createElement('table')
            year_table.classList.add("year-table")
            container_cell.append(year_table)
            let base_row = document.createElement('tr');
            year_table.append(base_row)
            timeslots.forEach(slot=>{
                let cell = document.createElement('td')
                cell.setAttribute('data-timeslot', slot.rank)
                base_row.append(cell)
            })
            table.append(row)
        })
        this.element.append(table)


        console.log(timeslots)
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

    changesManager.waitUntilReady().then(m => m.loadData().then(a=>fillWholeTable(a.changedRecordHolderInstance.getRecords())).then(a=>changesUiManager.makeTable()))


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

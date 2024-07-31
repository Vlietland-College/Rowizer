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


}



$(document).ready(function () {
    console.log("loadedsdsdsd")




    let params = new URLSearchParams(window.location.search)

    //portal: naam vh portal, token: api-token, branch: branchcode (vestigingscode)


    var last_hour = 9;
    const last_class = 6;

    let param_date = params.get("date");
    let param_branch = params.get("branch");

    var changesManager = new Changes({zermelo:zapi, branch: param_branch? param_branch : undefined});
    var changesUiManager = new ChangesUiManager(null, changesManager,param_date ? param_date : undefined)
    changesManager.waitUntilReady().then(m => m.loadData().then(a=>fillWholeTable(a.changedRecordHolderInstance.getRecords())))

    window.cm = changesUiManager

    $("#title").text("Roosterwijzigingen " + changesUiManager.date.toLocaleString("nl-NL", {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }))



    function fillWholeTable(records) {


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

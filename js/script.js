import {ZermeloApi} from "./zermelo/zermelo.js";
import {Changes} from "./controllers/changes/changes.js";
import Absences from "./controllers/absences/absences.js";
import {ZermeloAuthorizationError} from "./zermelo/utils/errors.js";
import ZermeloConnector from "./connectors/zermeloConnector.js";
import {ChangesUiManager} from "./views/changes/changesUiManager.js";

let params = new URLSearchParams(window.location.search)

var zapi = new ZermeloApi({
    portal: params.get("portal"),
    token: params.get("token"),
    branch: params.get("branch")
});



$(document).ready(function () {
    console.log("loadedsdsdsd")
    //TODO: remove this
    //window.pretendLikeIts = 1717452000000/1000;

    let params = new URLSearchParams(window.location.search)

    //portal: naam vh portal, token: api-token, branch: branchcode (vestigingscode)

    let param_date = params.get("date");
    let param_branch = params.get("branch");

    let connector = new ZermeloConnector(zapi,param_date ? param_date : undefined, {branch: param_branch? param_branch : undefined, ignore_departments:['kopkl', 'vavo']})

    var changesManager = new Changes(connector);
    var changesUiManager = new ChangesUiManager(document.querySelector("#content-container"), connector, changesManager)

    var absences = new Absences(connector)
    window.cm = changesUiManager
    connector.waitUntilReady().then(a=>{
        changesManager.loadData().then(cm => {
            changesUiManager.makeTable();
            changesUiManager.fillTable();
            setInterval(()=> changesUiManager.refreshTable(), 60*1000)
        })
        absences.loadAll().catch(err=>{
            if(err instanceof ZermeloAuthorizationError){
                console.log("No authorization for absences")
            }
            else {
                throw err
            }
        });


    })


    $("#title").text("Roosterwijzigingen " + changesUiManager.date.toLocaleString("nl-NL", {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }))


    // Your code to run since DOM is loaded and ready
});

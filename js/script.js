import {ZermeloApi} from "./zermelo/zermelo.js";
import {Changes} from "./controllers/changes/changes.js";
import Absences from "./controllers/absences/absences.js";
import {ZermeloAuthorizationError} from "./zermelo/utils/errors.js";
import ZermeloConnector from "./connectors/zermeloConnector.js";
import {ChangesUiManager} from "./views/changes/changesUiManager.js";
import AbsenceEntity from "./controllers/absences/absenceEntity.js";
import {AbsencesUiManager} from "./views/absences/absencesUiManager.js";

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
    let param_ignore = params.get("departmentsIgnore");
    let param_merge = params.get("mergeAppointments")


    let connector = new ZermeloConnector(zapi,param_date ? param_date : undefined, {branch: param_branch? param_branch : undefined, ignore_departments:param_ignore ? param_ignore.split(",") : []})
    AbsenceEntity.Connector = connector

    var changesManager = new Changes(connector, {
        merge_multiple_hour_span: !(param_merge && param_merge === "false")
    });
    var changesUiManager = new ChangesUiManager(document.querySelector("#content-container"), connector, changesManager)

    var absences = new Absences(connector)
    var absencesUiManager = new AbsencesUiManager(document.querySelector("#absences-container>div"),connector,absences);

    window.cm = changesUiManager
    window.zc = connector

    let dayChanged = function(){
        changesManager.reset()
        changesUiManager.refreshTable()
        $("#title").text("Roosterwijzigingen " + connector.date.toLocaleString("nl-NL", {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }))
    }
    window.dc = dayChanged

    connector.waitUntilReady().then(a=>{
        changesManager.loadData().then(cm => {
            changesUiManager.makeTable();
            changesUiManager.fillTable();
            var last_checked_date = new Date();
            setInterval(()=> {

                let new_date = new Date();
                if(last_checked_date.getDate() < new_date.getDate()){
                    //FIXME: now we do a hard reload
                    location.reload()
                    let diff = Math.round((new_date.getTime() - last_checked_date.getTime())/ (1000 * 3600 * 24));
                    let new_date_obk = new Date(connector.date)
                    new_date_obk.setDate(new_date_obk.getDate() + diff);
                    last_checked_date = new_date;
                    connector.setDate(new_date_obk).then(a=>{
                        changesManager.reset()
                        $("#title").text("Roosterwijzigingen " + connector.date.toLocaleString("nl-NL", {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        }))
                        absences.reset()

                    })

                }
                changesUiManager.refreshTable();

            }, 5*60*1000)
        })
        absencesUiManager.refresh().then(a=>{
            setInterval(()=>{
                absencesUiManager.refresh();
            }, 5*60*1000)
            document.querySelector("#absences-container").style.display = null
        }).catch(err=>{
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


    $( window ).on( "resize", function() {
        console.log("resize")
        //also keep in mind the height of the resized window, scrollheigt-height is what we need to scroll

    } );


    // Your code to run since DOM is loaded and ready
});

import Session from "./utils/session.js";
import SchoolsManager from "./lib/schools/schoolsManager.js";
import AppointmentsManager from "./lib/appointments/appointmentsManager.js";
import branchesOfSchoolsManager from "./lib/branchesOfSchools/branchesOfSchoolsManager.js";

class ZermeloApi  {
    #url;
    #default_options;
    #session;
    constructor(options) {
        const {
            portal,
            version,
            token,
            key
        } = options;

        options = Object.assign(options, {
            version: 3,
        });

        Object.assign(this, options);

        this.#url = "https://"+this.portal+".zportal.nl/api/v"+this.version+"/"

        this.#default_options = {
            branchOfSchools: null,
            schoolInSchoolYear: null,
            school: null,

        }

        this.#session = new Session(this.portal, this.token);
        this.schools = new SchoolsManager(this.#session);
        this.appointments = new AppointmentsManager(this.#session);
        this.brancheOfSchools = new branchesOfSchoolsManager(this.#session);


    }

}



export { ZermeloApi }

import Session from "./utils/session.js";
import SchoolsManager from "./lib/schools/schoolsManager.js";
import AppointmentsManager from "./lib/appointments/appointmentsManager.js";
import BranchesOfSchoolsManager from "./lib/branchesOfSchools/branchesOfSchoolsManager.js";
import DepartmentsOfBranchesManager from "./lib/departmentsOfBranches/departmentsOfBranchesManager.js";
import GroupInDepartmentsManager from "./lib/groupInDepartments/groupInDepartmentsManager.js";
import BranchesManager from "./lib/branches/branchesManager.js";
import TimeslotsManager from "./lib/timeslots/timeslotsManager.js";
import TimeslotsNamesManager from "./lib/timeslotNames/timeslotsNamesManager.js";



class ZermeloApi  {
    #url;
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

        //this.test =   new SwaggerClient('https://'+this.portal+'.zportal.nl/static/swagger/api-docs.json')
        this.#session = new Session(this.portal, this.token);

        this.schools = new SchoolsManager(this.#session);
        this.appointments = new AppointmentsManager(this.#session);
        this.branches = new BranchesManager(this.#session)

        this.branchesOfSchools = new BranchesOfSchoolsManager(this.#session);
        this.departmentsOfBranches = new DepartmentsOfBranchesManager(this.#session);
        this.groupInDepartments = new GroupInDepartmentsManager(this.#session);

        this.timeslots = new TimeslotsManager(this.#session);
        this.timeslotNames = new TimeslotsNamesManager(this.#session);



    }

}



export { ZermeloApi }

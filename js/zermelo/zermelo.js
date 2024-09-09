import Session from "./utils/session.js";

import {} from  "./utils/date.js";
import SchoolsManager from "./lib/schools/schoolsManager.js";
import AppointmentsManager from "./lib/appointments/appointmentsManager.js";
import BranchesOfSchoolsManager from "./lib/branchesOfSchools/branchesOfSchoolsManager.js";
import DepartmentsOfBranchesManager from "./lib/departmentsOfBranches/departmentsOfBranchesManager.js";
import GroupInDepartmentsManager from "./lib/groupInDepartments/groupInDepartmentsManager.js";
import BranchesManager from "./lib/branches/branchesManager.js";
import TimeslotsManager from "./lib/timeslots/timeslotsManager.js";
import TimeslotsNamesManager from "./lib/timeslotNames/timeslotsNamesManager.js";
import StudentsInDepartmentsManager from "./lib/studentsInDepartments/studentsInDepartmentsManager.js";
import EmployeeAbsencesManager from "./lib/employeeabsences/employeeAbsencesManager.js";
import DaytimetablesManager from "./lib/daytimetables/daytimetablesManager.js";
import RealizedweektimetablesManager from "./lib/realizedweektimetables/realizedweektimetablesManager.js";
import TimetableoverridesManager from "./lib/timetableoverrides/timetableoverridesManager.js";
import WeektimetablesManager from "./lib/weektimetables/weektimetablesManager.js";
import LocationOfBranchesManager from "./lib/locationofbranches/locationOfBranchesManager.js";



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

        this.locationofbranches = new LocationOfBranchesManager(this.#session);

        this.branchesOfSchools = new BranchesOfSchoolsManager(this.#session);
        this.departmentsOfBranches = new DepartmentsOfBranchesManager(this.#session);
        this.groupInDepartments = new GroupInDepartmentsManager(this.#session);

        this.timeslots = new TimeslotsManager(this.#session);
        this.timeslotNames = new TimeslotsNamesManager(this.#session);


        this.daytimetables = new DaytimetablesManager(this.#session);
        this.realizedweektimetables = new RealizedweektimetablesManager(this.#session);
        this.weektimetables = new WeektimetablesManager(this.#session);
        this.timetableoverrides = new TimetableoverridesManager(this.#session);


        this.studentsInDepartments = new StudentsInDepartmentsManager(this.#session);

        this.employeeAbsences = new EmployeeAbsencesManager(this.#session);


    }

}



export { ZermeloApi }

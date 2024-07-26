import Manager from "../manager.js";
import branchOfSchool from "./branchesOfSchoolsInterface.js";

export default class branchesOfSchoolsManager extends Manager{
    endpoint = "branchesofschools";
    interface = branchOfSchool;


}


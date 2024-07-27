import {ManagerWithId} from "../manager.js";
import branchOfSchool from "./branchesOfSchoolsInterface.js";

export default class BranchesOfSchoolsManager extends ManagerWithId{
    endpoint = "branchesofschools";
    interface = branchOfSchool;
}


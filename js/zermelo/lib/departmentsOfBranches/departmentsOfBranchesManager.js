import { ManagerWithId } from "../manager.js";
import departmentOfBranch from "./departmentsOfBranchesInterface.js";

export default class DepartmentsOfBranchesManager extends ManagerWithId{
    endpoint = "departmentsofbranches";
    interface = departmentOfBranch;
}


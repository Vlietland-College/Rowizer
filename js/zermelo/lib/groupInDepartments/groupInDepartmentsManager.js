import { ManagerWithId } from "../manager.js";
import groupInDepartments from "./groupInDepartmentsInterface.js";

export default class GroupInDepartmentsManager extends ManagerWithId{
    endpoint = "groupindepartments";
    interface = groupInDepartments;
}


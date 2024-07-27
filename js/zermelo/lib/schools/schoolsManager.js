import { ManagerWithId } from "../manager.js";
import School from "./schoolInterface.js";

class SchoolsManager extends ManagerWithId{
    endpoint = "schools";
    interface = School;


}

export default SchoolsManager

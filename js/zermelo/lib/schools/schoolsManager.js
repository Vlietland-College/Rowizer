import Manager from "../manager.js";
import School from "./schoolInterface.js";

class SchoolsManager extends Manager{
    endpoint = "schools";
    interface = School;


}

export default SchoolsManager

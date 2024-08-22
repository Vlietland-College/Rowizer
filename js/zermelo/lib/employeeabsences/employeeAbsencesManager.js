import { ManagerWithId} from "../manager.js";
import EmployeeAbsenceInterface from "./employeeAbsenceInterface.js";

class EmployeeAbsencesManager extends ManagerWithId{
    endpoint = "employeeabsences";
    interface = EmployeeAbsenceInterface;
}

export default EmployeeAbsencesManager

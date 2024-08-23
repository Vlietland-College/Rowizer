import { ManagerWithId} from "../manager.js";
import daytimetableInterface from "./daytimetableInterface.js";

class DaytimetablesManager extends ManagerWithId{
    endpoint = "daytimetables";
    interface = daytimetableInterface;
}

export default DaytimetablesManager

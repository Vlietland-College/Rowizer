import { ManagerWithId} from "../manager.js";
import WeektimetableInterface from "./weektimetableInterface.js";

class WeektimetablesManager extends ManagerWithId{
    endpoint = "weektimetables";
    interface = WeektimetableInterface;
}

export default WeektimetablesManager

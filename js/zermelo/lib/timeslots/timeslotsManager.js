import { ManagerWithId} from "../manager.js";
import Timeslot from "./timeslotInterface.js";

class TimeslotsManager extends ManagerWithId{
    endpoint = "timeslots";
    interface = Timeslot;
}

export default TimeslotsManager

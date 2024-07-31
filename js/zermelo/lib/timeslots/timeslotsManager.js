import { Manager } from "../manager.js";
import Timeslot from "./timeslotInterface.js";

class TimeslotsManager extends Manager{
    endpoint = "timeslots";
    interface = Timeslot;
}

export default TimeslotsManager

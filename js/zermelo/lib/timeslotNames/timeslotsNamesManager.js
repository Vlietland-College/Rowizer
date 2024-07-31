import { Manager } from "../manager.js";
import TimeslotName from "./timeslotNameInterface.js";

class TimeslotsNamesManager extends Manager{
    endpoint = "timeslotnames";
    interface = TimeslotName;
}

export default TimeslotsNamesManager

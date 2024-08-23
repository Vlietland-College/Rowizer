import {Manager, ManagerWithId} from "../manager.js";
import TimeslotName from "./timeslotNameInterface.js";

class TimeslotsNamesManager extends ManagerWithId{
    endpoint = "timeslotnames";
    interface = TimeslotName;
}

export default TimeslotsNamesManager

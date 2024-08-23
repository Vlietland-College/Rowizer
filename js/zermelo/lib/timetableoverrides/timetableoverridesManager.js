import { Manager } from "../manager.js";
import TimetableoverrideInterface from "./timetableoverrideInterface.js";

class TimetableoverridesManager extends Manager{
    endpoint = "timetableoverrides";
    interface = TimetableoverrideInterface;
}

export default TimetableoverridesManager

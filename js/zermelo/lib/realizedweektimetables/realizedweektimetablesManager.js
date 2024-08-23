import {Manager} from "../manager.js";
import realizedweektimetableInterface from "./realizedweektimetableInterface.js";

class RealizedweektimetablesManager extends Manager{
    endpoint = "realizedweektimetables";
    interface = realizedweektimetableInterface;
}

export default RealizedweektimetablesManager

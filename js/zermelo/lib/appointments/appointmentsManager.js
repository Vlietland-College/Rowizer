import { Manager } from "../manager.js";
import AppointmentInterface from "./appointmentInterface.js";

class AppointmentsManager extends Manager{
    endpoint = "appointments";
    interface = AppointmentInterface;
}

export default AppointmentsManager

import Manager from "../manager.js";
import Appointment from "./appointmentInterface.js";

class AppointmentsManager extends Manager{
    endpoint = "appointments";
    interface = Appointment;
}

export default AppointmentsManager

export default class OutOfOfficeEntity {
    static Connector;
    constructor(appointments) {
        this.appointments = appointments;
        this.subject = appointments[0].subjects[0]
        this.startTimeSlot = Math.min(...this.appointments.map(appointment => appointment.startTimeSlot));
        this.start = Math.min(...this.appointments.map(appointment => appointment.start));
        this.endTimeSlot = Math.max(...this.appointments.map(appointment => appointment.endTimeSlot));
        this.end = Math.max(...this.appointments.map(appointment => appointment.end));
    }

    get employees(){
        return this.appointments.flatMap(appointment => appointment.teachers)
    }
}

/**
 * Before version 24.07 lessons than span multiple timeslots were split up into different appointments. To anticipate this change, lessons that span multiple hours are combined into a single appointment.
 * @param appointments object with id->appointments
 * @param comp_func
 * @param before_item_func
 */
function mergeAppointments(appointments, comp_func, before_item_func = (original,to_merge)=>{}, before_set_func= (set)=>set, check_merge = (set)=> true){
    let sets = []
    Object.values(appointments).forEach(appointment=>{

        let found_set = sets.find(comp_app_set =>{
            let a = appointment
            let b = comp_app_set[0]
            let is_equal = comp_func(a,b)//arraysEqual(a.courses, b.courses) && arraysEqual(a.subjects, b.subjects) && arraysEqual(a.groupsInDepartments, b.groupsInDepartments) && arraysEqual(a.teachers, b.teachers) && a.appointmentLastModified === b.appointmentLastModified && a.valid === b.valid && a.cancelled === b.cancelled
            return is_equal
        })

        if(found_set){

            found_set.push(appointment)
            //console.log("equal found for ", appointment, found_set[0])
        }
        else{
            sets.push([appointment])
        }


    })
    sets.forEach(set =>{

        if(set.length > 1 ){

            if(check_merge(set)) {
                set = before_set_func(set)

                let first_appointment = set.shift()
                //first_appointment.endTimeSlot = set.slice(-1)[0].endTimeSlot
                //not really necessary but we'll do this for now to debug
                first_appointment.combinedWith = []

                set.forEach(item => {
                    before_item_func(first_appointment, item)

                    first_appointment.combinedWith.push(item)
                    appointments.splice(appointments.findIndex(app=> app === item ), 1);

                })
            }
        }
    })
    return appointments

}

function mergeSubsequentAppointments(appointments){
    return mergeAppointments(
        appointments,
        (a,b) => arraysEqual(a.courses, b.courses) && arraysEqual(a.subjects, b.subjects) && arraysEqual(a.groupsInDepartments, b.groupsInDepartments) && arraysEqual(a.teachers, b.teachers) && a.appointmentLastModified === b.appointmentLastModified && a.valid === b.valid && a.cancelled === b.cancelled,
        (original,to_merge) => {
            original.endTimeSlot = to_merge.endTimeSlot
        },
        (set)=> {
            return set.sort((a,b) => {
                return a.startTimeSlot - b.startTimeSlot
            }
        )},
        (set) => {
            set.sort((a,b) => {
                return a.startTimeSlot - b.startTimeSlot
            })
            return set.slice(0,-1).every((item,index)=> item.endTimeSlot+1 === set[index+1].startTimeSlot)

        }
    )
}

function arraysEqual(a,b){return JSON.stringify(a.sort()) === JSON.stringify(b.sort())}

export {arraysEqual, mergeAppointments, mergeSubsequentAppointments}

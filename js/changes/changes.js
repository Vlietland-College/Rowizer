import ChangedRecordHolder from "./lib/changedRecordHolder.js";
import StudentsInDepartmentsManager from "../zermelo/lib/studentsInDepartments/studentsInDepartmentsManager.js";

class Changes {
    #date;
    #appointments;

    #branch;
    #branchOfSchool;
    #schoolInYear

    //afdeling-jaarlaag (dus A3 is 1 department)
    #departments;

    //klassen en clusters
    #groupsInDepartment;

    #studentsInDepartments

    #yearsOfEducation;

    #timeslots
    #timeslotNames


    #start_time;
    #end_time;
    #schoolYear;

    #appointmentCategories;
    #mergeMultipleHourSpan;

    #ignoreDepartmentCodes;

    constructor(options={}) {
        this.connector = null
        Object.assign(options, {
            merge_multiple_hour_span: true,
            ignore_departments: []
        })
        //bool, do yyou want to merge lessons that span more hours?
        this.#mergeMultipleHourSpan = options.merge_multiple_hour_span

        //array with strings with codes from departments we want to ignore to decide if a whole year has this appointment
        this.#ignoreDepartmentCodes = options.ignore_departments

        this.#appointments = {}

        if(Object.keys(options).includes("zermelo")){
            this.connector = options.zermelo
        }
        this.changedRecordHolderInstance = new ChangedRecordHolder()

        if(!Object.keys(options).includes("branch") && options.branch){
            this.connector.branches.get().then(branches=>{
                if(branches.length !== 1){
                    throw new Error("More than one branch, need to set branch")
                }
                this.#branch = branches[0]
            })
        }
        else{
           this.connector.branches.get({code:options.branch}).then(branches=>{
                if(!branches.length){
                    throw new Error("Branch"+options.branch+" is unknown")
                }
                else if(branches.length > 1){
                    console.warn("There's more than one branch with this id?")
                }
                this.#branch = branches[0]
                if(this.#date){
                   this.#reloadBranchOfSchools()
                }
            })
        }
        this.#appointmentCategories = {
            "activities": {
                options: {type: 'activity'},
                lastModified: 0
            },
            "modified": {
                options: {modified: true},
                lastModified: 0
            },
            "cancelled": {
                options: {cancelled: true},
                lastModified: 0
            },
            "invalid": {
                options: {valid: false},
                lastModified: 0
            }

        }
        this.#yearsOfEducation = {}
    }

    getGroupInDepartment(id){
        return this.#groupsInDepartment[id]
    }

    getDepartmentOfBranch(id){
        return this.#departments[id]
    }

    get appointments(){
        return this.#appointments
    }
    get groupsInDepartments(){
        return this.#groupsInDepartment
    }
    get yearsOfEducation(){
        return this.#yearsOfEducation
    }

    get timeslots(){
        return this.#timeslotNames
    }

    async setDate(date){
        if(!(date instanceof Date)){
            throw new TypeError("Invalid date format must be a valid date.")
        }
        this.#date = date
        this.#start_time = this.#date.getTime()
        this.#date.setHours(23, 59, 59)
        this.#end_time = this.#date.getTime()
        console.log(this.#start_time, this.#end_time)

        let new_schoolYear =  this.#date.getMonth() < 7 ? this.#date.getFullYear() - 1 : this.#date.getFullYear()
        if(new_schoolYear !== this.#schoolYear){
            this.#schoolYear = new_schoolYear
           if(!this.branchPromise && this.#branch){
               await this.#reloadBranchOfSchools()
           }
        }
    }
    async #reloadBranchOfSchools(){
        this.#yearsOfEducation = {}

        let branches =await this.connector.branchesOfSchools.get({schoolYear:this.#schoolYear, branch: this.#branch.code})
        let branches_keys =  Object.keys(branches)

        if(!branches_keys.length){
            throw new Error("BranchesOfSchools is unknown for this year")
        }
        else if(branches_keys.length > 1){
            console.warn("There's more than one branch with this id for this year?")
        }
        this.#branchOfSchool = branches[branches_keys[0]]
        this.#departments =  await this.connector.departmentsOfBranches.get({
            branchOfSchool: this.#branchOfSchool.id,
            fields: ['id', 'code', 'educationType', 'educations', 'weekTimeTable', 'yearOfEducation']
        })
        Object.values(this.#departments).forEach(department=>{

            department.mainGroupsInDepartment = []
            department.groupsInDepartment = []
            if(department.yearOfEducation && !this.#ignoreDepartmentCodes.includes(department.code)){
                let year = department.yearOfEducation
                if(!this.#yearsOfEducation[year]){
                    this.#yearsOfEducation[year] = []
                }
                this.#yearsOfEducation[year].push(department.id)
            }
        })

        this.#groupsInDepartment = await this.connector.groupInDepartments.get({
            branchOfSchool: this.#branchOfSchool.id,
            fields: ['id', 'departmentOfBranch', 'name', 'extendedName',"isMainGroup","isMentorGroup"]
        })

        Object.values(this.#groupsInDepartment).forEach(group=>{
            if(group.isMainGroup){
                this.#departments[group.departmentOfBranch].mainGroupsInDepartment.push(group.id)
            }
            if(group.isMentorGroup){
                group.students = []
            }
            this.#departments[group.departmentOfBranch].groupsInDepartment.push(group.id)
        })


        this.#studentsInDepartments = await this.connector.studentsInDepartments.get({
            schoolInSchoolYear: this.#branchOfSchool.schoolInSchoolYear,
            fields: ['student', 'departmentOfBranch', 'mentorGroup']
        })

        Object.values(this.#studentsInDepartments).forEach(student=>{
            if(student.mentorGroup) {
                this.#groupsInDepartment[student.mentorGroup].students.push(student.student)
            }
        })

        this.#timeslotNames = await this.connector.timeslotNames.get({schoolInSchoolYear: this.#branchOfSchool.schoolInSchoolYear})
        this.#timeslots = await this.connector.timeslots.get({schoolInSchoolYear:  this.#branchOfSchool.schoolInSchoolYear})

    }

    /**
     * Waits until the loadBranch and date are set, after that the changes can be retrieved
     * @return {Promise<unknown>}
     */
    waitUntilReady(){
        return new Promise((resolve) => {
            if(this.#timeslots && this.#date){
                resolve(this);
            }
            let newt = function(resolve, obj){
                setTimeout(() => {
                    if(obj.#timeslots && obj.#date){
                        resolve(obj);
                    }
                    else{
                        newt(resolve, obj)
                    }

                }, 200);
            }
            newt(resolve, this)
        });
    }

    /**
     * Before version 24.07 lessons than span multiple timeslots were split up into different appointments. To anticipate this change, lessons that span multiple hours are combined into a single appointment.
     * @param appointments object with id->appointments
     */
    #combineSpansMultipleHours(appointments){
        let arraysEqual = (a,b) => JSON.stringify(a.sort()) === JSON.stringify(b.sort())
        let sets = []
        Object.values(appointments).forEach(appointment=>{

            let found_set = sets.find(comp_app_set =>{
                let a = appointment
                let b = comp_app_set[0]
                let is_equal = arraysEqual(a.courses, b.courses) && arraysEqual(a.subjects, b.subjects) && arraysEqual(a.groupsInDepartments, b.groupsInDepartments) && arraysEqual(a.teachers, b.teachers) && a.appointmentLastModified === b.appointmentLastModified && a.valid === b.valid && a.cancelled === b.cancelled
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
                set.sort((a,b) => {
                    return a - b
                })
                let can_be_combined = set.slice(0,-1).every((item,index)=> item.endTimeSlot+1 === set[index+1].startTimeSlot)
                if(can_be_combined) {
                    let first_appointment = set.shift()
                    first_appointment.endTimeSlot = set.slice(-1)[0].endTimeSlot
                    //not really necessary but we'll do this for now to debug
                    first_appointment.combinedWith = []

                    set.forEach(item => {
                        first_appointment.combinedWith.push(item)
                        delete appointments[Number(item.id)]
                    })
                }
            }
        })

    }

    async loadData(){
        let common_data = {
            branchOfSchool: this.#branchOfSchool.id,
            type: 'lesson',
            fields: ["id","appointmentInstance", "start", "end", "startTimeSlot", "endTimeSlot", "type", "groups", "groupsInDepartments", "locations", "cancelled", "cancelledReason", "modified", "teacherChanged", "groupChanged", "locationChanged", "timeChanged", "moved", "hidden", "changeDescription", "schedulerRemark", "lastModified", "base", "courses", "appointmentLastModified", "remark", "subjects", "teachers","valid", "students"],
            start: this.#start_time/1000,
            end:this.#end_time/1000
        }
        let category_promises = {}
        let categories_names = Object.keys(this.#appointmentCategories)
        categories_names.forEach(category_name =>{
            category_promises[category_name] = this.connector.appointments.get({...common_data, ...this.#appointmentCategories[category_name].options})
        }, this)

        let nameless_results = await Promise.all(Object.values(category_promises))
        let category_results ={}
        categories_names.forEach((name, index) =>{
            category_results[name] = nameless_results[index]
        })

        let all_appointments = {}

        categories_names.forEach(category=>{
            category_results[category].forEach(appointment => {
                all_appointments[appointment.id] = appointment
                if(appointment.lastModified > this.#appointmentCategories[category].lastModified){
                    this.#appointmentCategories[category].lastModified = appointment.lastModified
                }
            })
        })

        //TODO: remove this
        window.ad = all_appointments

        this.#appointments = all_appointments
        if(this.#mergeMultipleHourSpan){
            this.#combineSpansMultipleHours(this.#appointments)
        }

        Object.values(all_appointments).forEach(appointment=>{
            //bepalen of er hele afdelingen en/of jaarlagen in zitten
            //years heeft jaren als key en array met departments als value
            let years = {}
            //department id als key en array met groepen als value
            let departments = {}

            appointment.groupsMain = []
            appointment.groupsOther = []

            appointment.departmentComplete = []
            appointment.groupsWithoutCompleteDepartment = []

            appointment.groupsInDepartments.forEach(group_id=>{
                let group = this.#groupsInDepartment[group_id]
                if(group.isMainGroup){
                    appointment.groupsMain.push(group_id)
                }else{
                    appointment.groupsOther.push(group_id)
                }

                let department = this.#departments[group.departmentOfBranch]

                if(!departments[department.id]){
                    departments[department.id] = []
                }
                departments[department.id].push(group.id)
            })


            Object.keys(departments).forEach(department_id=>{
                department_id = Number(department_id)
                let appointment_groups = departments[department_id].sort()
                let department = this.#departments[department_id];
                let department_groups = department.mainGroupsInDepartment.sort()
                if(appointment_groups.length === department_groups.length && JSON.stringify(appointment_groups) === JSON.stringify(department_groups)){
                    //console.log("whole department is added to this appointment")
                    appointment.departmentComplete.push(department_id)
                    if(!years[department.yearOfEducation]){
                        years[department.yearOfEducation] = []
                    }
                    years[department.yearOfEducation].push(department_id)
                    //if(appointment_groups.length > 1){debugger;}
                }
                else {
                    appointment.groupsWithoutCompleteDepartment = appointment.groupsWithoutCompleteDepartment.concat(appointment_groups)
                }
            })

            let whole_years = []
            appointment.yearsComplete = []
            appointment.departmentsNotInCompleteYear = []
            Object.keys(years).forEach(year=>{

                let departments_in_year = this.#yearsOfEducation[year].sort()
                let departments_in_appointment = years[year].sort()
                //if(departments_in_appointment.length > 1){debugger;}
                if(departments_in_year.length === departments_in_appointment.length && JSON.stringify(departments_in_year) === JSON.stringify(departments_in_appointment)){
                    appointment.yearsComplete.push(year)
                    //debugger;
                }
                else{
                    appointment.departmentsNotInCompleteYear =  appointment.departmentsNotInCompleteYear.concat(departments_in_appointment)
                }

            })


            if(appointment.groupsInDepartments.length){
                this.changedRecordHolderInstance.add(appointment)
            }
        })
        return this
    }

}


export { Changes }

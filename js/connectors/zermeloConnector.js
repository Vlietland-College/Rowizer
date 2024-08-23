import connector from "./connector.js";

/**
 *  Common data like timeslots, schools, branches, date
 */
export default class ZermeloConnector extends connector {
    #branch
    #date
    #schoolYear
    #branchOfSchool;

    #yearsOfEducation;
    #departments;

    #ignoreDepartmentCodes;
    #studentsInDepartments;
    #groupsInDepartment;

    #timeslotNames;
    #timeslots;
    #realizedWeekTimeTables;
    #dayTimeTables;

    #isReady;
    #loadingPromise;

    constructor(zapi, date = new Date().toLocaleString("nl-NL", {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }), options = {}){
        super(options);
        this.#isReady = false;
        this.api = zapi
        this.#ignoreDepartmentCodes = options.ignore_departments

        let date_parts = date.split("-");
        let date_obj = new Date(date_parts[2], date_parts[1] - 1, date_parts[0], 0, 0)
        this.setDate(date_obj)

        this.#timeslotNames = []
        this.#timeslots = []

        let firstLoad = function(){

        }

        if(!Object.keys(options).includes("branch") && !options.branch){
            this.api.branches.get().then(branches=>{
                if(branches.length !== 1){
                    throw new Error("More than one branch, need to set branch")
                }
                this.#branch = branches[0]
                this.#reloadBranchOfSchools()

            })
        }
        else{
            this.api.branches.get({code:options.branch}).then(branches=>{
                if(!branches.length){
                    throw new Error("Branch"+options.branch+" is unknown")
                }
                else if(branches.length > 1){
                    console.warn("There's more than one branch with this id?")
                }
                this.#branch = branches[0]
                this.#reloadBranchOfSchools()

            })
        }



        this.#yearsOfEducation = {}


    }

    get isReady(){
        return this.#isReady
    }
    get groupsInDepartment(){
        return this.#groupsInDepartment
    }
    get yearsOfEducation(){
        return this.#yearsOfEducation
    }
    get timeslots(){
        return this.#timeslotNames
    }
    get branch(){
        return this.#branchOfSchool
    }
    get date(){
        return this.#date
    }
    get departments(){
        return this.#departments
    }

    getGroupInDepartment(id){
        return this.#groupsInDepartment[id]
    }

    getDepartmentOfBranch(id){
        return this.#departments[id]
    }

    async setDate(date){
        if(!(date instanceof Date)){
            throw new TypeError("Invalid date format must be a valid date.")
        }
        this.#date = date
        console.log(this.#date.getStartOfDayTime(), this.#date.getEndOfDayTime())

        let new_schoolYear =  this.#date.getSchoolYear()
        if(new_schoolYear !== this.#schoolYear){
            this.#schoolYear = new_schoolYear
            if(this.#branch){
                await this.#reloadBranchOfSchools()
            }
        }
    }

    async #reloadBranchOfSchools() {
        this.#isReady = false;
        this.#loadingPromise = new Promise((resolve,reject)=>{
            (async () => {
                this.#yearsOfEducation = {}

                let branches = await this.api.branchesOfSchools.get({
                    schoolYear: this.#schoolYear,
                    branch: this.#branch.code
                })
                let branches_keys = Object.keys(branches)

                if (!branches_keys.length) {
                    throw new Error("BranchesOfSchools is unknown for this year")
                } else if (branches_keys.length > 1) {
                    console.warn("There's more than one branch with this id for this year?")
                }
                this.#branchOfSchool = branches[branches_keys[0]]
                this.#departments = await this.api.departmentsOfBranches.get({
                    branchOfSchool: this.#branchOfSchool.id,
                    fields: ['id', 'code', 'educationType', 'educations', 'weekTimeTable', 'yearOfEducation']
                })
                Object.values(this.#departments).forEach(department => {

                    department.mainGroupsInDepartment = []
                    department.groupsInDepartment = []
                    if (department.yearOfEducation && !this.#ignoreDepartmentCodes.includes(department.code)) {
                        let year = department.yearOfEducation
                        if (!this.#yearsOfEducation[year]) {
                            this.#yearsOfEducation[year] = []
                        }
                        this.#yearsOfEducation[year].push(department.id)
                    }
                })

                this.#groupsInDepartment = await this.api.groupInDepartments.get({
                    branchOfSchool: this.#branchOfSchool.id,
                    fields: ['id', 'departmentOfBranch', 'name', 'extendedName', "isMainGroup", "isMentorGroup"]
                })

                Object.values(this.#groupsInDepartment).forEach(group => {
                    if (group.isMainGroup) {
                        this.#departments[group.departmentOfBranch].mainGroupsInDepartment.push(group.id)
                    }
                    if (group.isMentorGroup) {
                        group.students = []
                    }
                    this.#departments[group.departmentOfBranch].groupsInDepartment.push(group.id)
                })


                this.#studentsInDepartments = await this.api.studentsInDepartments.get({
                    schoolInSchoolYear: this.#branchOfSchool.schoolInSchoolYear,
                    fields: ['student', 'departmentOfBranch', 'mentorGroup']
                })

                Object.values(this.#studentsInDepartments).forEach(student => {
                    if (student.mentorGroup) {
                        this.#groupsInDepartment[student.mentorGroup].students.push(student.student)
                    }
                })
                while (this.#timeslotNames.length > 0) {
                    this.#timeslotNames.pop();
                }
                this.#timeslotNames = await this.api.timeslotNames.get({schoolInSchoolYear: this.#branchOfSchool.schoolInSchoolYear})
                while (this.#timeslots.length > 0) {
                    this.#timeslots.pop();
                }
                this.#timeslots = await this.api.timeslots.get({schoolInSchoolYear: this.#branchOfSchool.schoolInSchoolYear})
                Object.values(this.#timeslots).forEach(timeslot => {
                    timeslot.timeSlotName = this.#timeslotNames[timeslot.timeSlotName]
                })

                this.#realizedWeekTimeTables = await this.api.realizedweektimetables.get({schoolInSchoolYear: this.#branchOfSchool.schoolInSchoolYear, week:this.#date.getFullYear().toString() + this.#date.getWeekNumber().toString()})
                this.#dayTimeTables = await this.api.daytimetables.get({schoolInSchoolYear: this.#branchOfSchool.schoolInSchoolYear})

                this.#isReady = true
                resolve();
            })()
        })
    }

    /**
     * returns timeslots with the startDt and endDt set for today
     * @return {*}
     */
    getTodayTimeSlots(){
        //FIXME: multiple departmensOfBranch can have different timetables
        let realized_table = this.#dayTimeTables[Object.values(this.#realizedWeekTimeTables)[0][this.#date.toLocaleDateString("en-EN", { weekday: 'long' }).toLowerCase()]]
        return realized_table.timeSlots.map(slot_id=> {
            let slot =  this.#timeslots[slot_id]
            slot.startDt = new Date(this.#date.getTime())
            slot.startDt.setHours(slot.start.slice(0,2), slot.start.slice(2,4), 0)
            slot.endDt = new Date(this.#date.getTime())
            slot.endDt.setHours(slot.end.slice(0,2), slot.end.slice(2,4), 0)

            return slot

        }).sort((a,b) => a.timeSlotName.rank - b.timeSlotName.rank)


    }
    /**
     * Waits until the loadBranch and date are set, after that the changes can be retrieved
     * @return {Promise<unknown>}
     */
    waitUntilReady() {
        return new Promise((resolve) => {
            if (this.#isReady) {
                resolve(this);
            } else if (this.#loadingPromise) {
                this.#loadingPromise.then(a => resolve(a))
            } else {

                let newt = function (resolve, obj) {
                    setTimeout(() => {
                        if (obj.#loadingPromise) {
                            obj.#loadingPromise.then(()=>resolve(obj))
                        } else {
                            newt(resolve, obj)
                        }

                    }, 200);
                }
                newt(resolve, this)
            }
        });

    }
}

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

    constructor(zapi, date = new Date().toLocaleString("nl-NL", {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }), options = {}){
        super(options);
        this.api = zapi
        this.#ignoreDepartmentCodes = options.ignore_departments

        let date_parts = date.split("-");
        let date_obj = new Date(date_parts[2], date_parts[1] - 1, date_parts[0], 0, 0)
        this.setDate(date_obj)

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
        this.#yearsOfEducation = {}

        let branches = await this.api.branchesOfSchools.get({schoolYear: this.#schoolYear, branch: this.#branch.code})
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

        this.#timeslotNames = await this.api.timeslotNames.get({schoolInSchoolYear: this.#branchOfSchool.schoolInSchoolYear})
        this.#timeslots = await this.api.timeslots.get({schoolInSchoolYear: this.#branchOfSchool.schoolInSchoolYear})
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
}

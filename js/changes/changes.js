import ChangedRecordHolder from "./lib/changedRecordHolder.js";

class Changes {
    #date;

    #branch;
    #branchOfSchool;
    #schoolInYear

    //afdeling-jaarlaag (dus A3 is 1 department)
    #departments;
    //klassen en clusters
    #groupsInDepartment;
    #timeslots
    #timeslotNames


    #start_time;
    #end_time;
    #schoolYear;

    #appointmentCategories;
    constructor(options={}) {
        this.connector = null

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

        this.#groupsInDepartment = await this.connector.groupInDepartments.get({
            branchOfSchool: this.#branchOfSchool.id,
            fields: ['id', 'departmentOfBranch', 'name', 'extendedName',"isMainGroup","isMentorGroup"]
        })
        this.#timeslotNames = await this.connector.timeslotNames.get({schoolInSchoolYear: this.#branchOfSchool.schoolInSchoolYear})
        this.#timeslots = await this.connector.timeslots.get({schoolInSchoolYear:  this.#branchOfSchool.schoolInSchoolYear})

    }

    waitUntilReady(){
        return new Promise((resolve) => {
            if(this.#branchOfSchool && this.#date){
                resolve(this);
            }
            let newt = function(resolve, obj){
                setTimeout(() => {
                    if(obj.#branchOfSchool && obj.#date){
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

    async loadData(){
        let common_data = {
            branchOfSchool: this.#branchOfSchool.id,
            type: 'lesson',
            fields: ["id","appointmentInstance", "start", "end", "startTimeSlot", "endTimeSlot", "type", "groups", "groupsInDepartments", "locations", "cancelled", "cancelledReason", "modified", "teacherChanged", "groupChanged", "locationChanged", "timeChanged", "moved", "hidden", "changeDescription", "schedulerRemark", "lastModified", "base", "courses", "appointmentLastModified", "remark", "subjects", "teachers","valid"],
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
        //TODO: remove this
        let all_data_for_debug = {}

        categories_names.forEach(category=>{
            category_results[category].forEach(appointment => {
                all_data_for_debug[appointment.id] = appointment
                if(appointment.lastModified > this.#appointmentCategories[category].lastModified){
                    this.#appointmentCategories[category].lastModified = appointment.lastModified
                }
                if(appointment.groupsInDepartments.length){
                    this.changedRecordHolderInstance.add(appointment)
                }
            })
        })
        window.ad = all_data_for_debug
        return this
    }

    get schoolYear(){
       return this.#schoolYear
    }
}


export { Changes }

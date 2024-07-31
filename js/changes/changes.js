import ChangedRecordHolder from "./lib/changedRecordHolder.js";

class Changes {
    #date;

    #branch;
    #branchOfSchool;

    #start_time;
    #end_time;
    #schoolYear;
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

    }

    async setDate(date){
        if(!(date instanceof Date)){
            throw new TypeError("Invalid date format must be a valid date.")
        }
        this.#date = date
        this.#start_time = this.#date.getTime()
        this.#date.setHours(23, 59, 59)
        this.#end_time = this.#date.getTime()

        let new_schoolYear =  this.#date.getMonth() < 7 ? this.#date.getFullYear() - 1 : this.#date.getFullYear()
        if(new_schoolYear !== this.#schoolYear){
            this.#schoolYear = new_schoolYear
           if(this.#branch){
               this.#reloadBranchOfSchools()
           }
        }

    }
    async #reloadBranchOfSchools(){
        let branches = Object.keys(await this.connector.branchesOfSchools.get({schoolYear:this.#schoolYear, branch: this.#branch.code}))

        if(!branches.length){
            throw new Error("BranchesOfSchools is unknown for this year")
        }
        else if(branches.length > 1){
            console.warn("There's more than one branch with this id for this year?")
        }
        this.#branchOfSchool = branches[0]
    }

    get schoolYear(){
       return this.#schoolYear
    }
}


export { Changes }

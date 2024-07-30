export default class ChangedRecord {
    constructor(group, group_name, period) {
        this.group = group

        //nb alleen eerste groep nu
        let parts = group_name.split(".")
        let education_year = parts[0].split(/(\d+)/)
        this.education = education_year[0]
        this.classYear = parseInt(education_year[1])
        this.subclass = education_year[2]


        this.cluster = null
        if (parts.length > 1) {
            this.cluster = parts[1]
        }

        this.period = period
        this.newest = null
        this.old = null
    }

    get subjectOrCluster() {
        if (this.cluster) {
            if( this.newest && this.newest.type === "activity"){
                return this.cluster + " " + this.newest.subjects[0].slice(0,6)
            }
            return this.cluster
        } else {
            return (this.newest ? this.newest.subjects[0].slice(0,6) : this.old.subjects[0]).slice(0,6)
        }

    }

    get readableGroupName() {
        if (this.cluster != null) {
            return this.education + this.classYear
        } else {
            return this.education + this.classYear + this.subclass
        }
    }

    get readableTeachers(){
        if(this.newest.teachers.length > 1){
            return this.newest.teachers[0] + "+"+ (this.newest.teachers.length-1).toString()
        } else{
            return this.newest.teachers[0]
        }
    }

    get readableLocation(){
        let length = this.newest.locations.length
        if(!length){
            return ""
        }
        else if(length === 1){
            return this.newest.locations[0].slice(0,4)
        }
        else if(length === 2){
            return this.newest.locations[0].slice(0,4) + "+"+ (this.newest.locations.length-1).toString()
        }else{
            return this.newest.locations[0] + "+"+ (length-1).toString()

        }
    }

    itemHtml() {
        let str = "<div " + (this.newest ? "newest='"+this.newest.id+"' ": "") + (this.old ? "old='"+this.old.id+"' ": "")+">"
        //of newest is null, dan is de les verplaatst en niks overheen gepland. Of newest is cancelled
        if (this.newest == null || this.newest.cancelled) {
            //les vervalt
            return str + this.readableGroupName + " " + this.subjectOrCluster + " vervalt </div>"
        } else {
            return str + this.readableGroupName + " " + this.subjectOrCluster + " " + this.readableLocation + " " + this.readableTeachers + "</div>"
        }

        console.log(this)

    }
}

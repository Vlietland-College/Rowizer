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
            return this.cluster
        } else {
            return this.newest ? this.newest.subjects[0] : this.old.subjects[0]
        }

    }

    get readableGroupName() {
        if (this.cluster != null) {
            return this.education + this.classYear
        } else {
            return this.education + this.classYear + this.subclass
        }
    }

    itemHtml() {
        let str = "<div " + (this.newest ? "newest='"+this.newest.id+"' ": "") + (this.old ? "newest='"+this.old.id+"' ": "")+">"
        //of newest is null, dan is de les verplaatst en niks overheen gepland. Of newest is cancelled
        if (this.newest == null || this.newest.cancelled) {
            //les vervalt
            return str + this.readableGroupName + " " + this.subjectOrCluster + " vervalt </div>"
        } else {
            return str + this.readableGroupName + " " + this.subjectOrCluster + " " + this.newest.locations.join(",") + " " + this.newest.teachers.join(",") + "</div>"
        }

        console.log(this)

    }
}

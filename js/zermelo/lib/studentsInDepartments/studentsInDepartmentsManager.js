import {Manager} from "../manager.js";
import StudentInDepartmentInterface from "./studentInDepartmentInterface.js";

class StudentsInDepartmentsManager extends Manager{
    endpoint = "studentsindepartments";

    interface = StudentInDepartmentInterface;

    async get(options = {}, req_options = {}){
        if(options.fields !== undefined && !options.fields.includes("student")){
            options.fields.push('student')
        }

        let res = await super.get(options, req_options)

        let res_holder = {}
        res.forEach(r => {
            r.student = Number(r.student)
            res_holder[r.student] = r
        })
        return res_holder
    }


}

export default StudentsInDepartmentsManager

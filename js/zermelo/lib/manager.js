class Manager{
    session;
    constructor(session){
        this.session = session
    }

    async get(options = {}, req_options = {}){
        let res = await this.session.request(this.endpoint, options, req_options)

        return res.map(r => new this.interface(r))
    }
}

class ManagerWithId extends Manager{

    async get(options = {}, req_options = {cache:'force-cache'}){
        if(options.fields !== undefined && !options.fields.includes("id")){
            options.fields.push('id')
        }

        let res = await super.get(options, req_options)

        let res_holder = {}
        res.forEach(r => {
            res_holder[r.id] = r
        })
        return res_holder
    }
}

export { Manager, ManagerWithId };

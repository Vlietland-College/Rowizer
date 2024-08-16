class Manager{
    session;
    constructor(session){
        this.session = session
    }

    async get(options = {}, req_options = {}){
        let res = await this.session.request(this.endpoint, options, req_options)

        return res.map(r => {
            if(r.id){Number(r.id)}
            return new this.interface(r)
        })
    }
}

class ManagerWithId extends Manager{

    async get(options = {}, req_options = {}){
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

class Manager{
    session;
    constructor(session){
        this.session = session
    }

    async get(options = {}){
        let res = await this.session.request(this.endpoint, options)

        return res.map(r => new this.interface(r))
    }
}

class ManagerWithId extends Manager{

    async get(options = {}){
        if(options.fields !== undefined && !options.fields.includes("id")){
            options.fields.push('id')
        }

        let res = await super.get(options)

        let res_holder = {}
        res.forEach(r => {
            res_holder[r.id] = r
        })
        return res_holder
    }
}

export { Manager, ManagerWithId };

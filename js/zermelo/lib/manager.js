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
export default Manager;

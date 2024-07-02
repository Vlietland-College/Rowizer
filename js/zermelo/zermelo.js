class ZermeloApi {
    #url;
    #default_options
    constructor(options) {
        const {
            portal,
            version,
            token,
            key
        } = options;

        options = Object.assign(options, {
            version: 3,
        });

        Object.assign(this, options);

        this.#url = "https://"+this.portal+".zportal.nl/api/v"+this.version+"/"

        this.#default_options = {
            branchOfSchools: null,
            schoolInSchoolYear: null,
            school: null,

        }
    }

    #request(path, options){
        const reqHeaders = new Headers();
        reqHeaders.append("Authorization", "Bearer "+this.token)

        let req = new Request(this.#url+"/"+path+"?"+Object.entries(options).map(e => e.join('=')).join('&'), {
            method: "GET",
            headers: reqHeaders,
        });
    }

}



export { ZermeloApi }

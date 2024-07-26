import { ZermeloError } from "./errors.js"

class Session{
    constructor(portal, token) {
        this.portal = portal;
        this.token = token;
    }

    async request(path, options= {}, version= 3) {
        const reqHeaders = new Headers();
        reqHeaders.append("Authorization", "Bearer " + this.token)

        let req = new Request("https://" + this.portal + ".zportal.nl/api/v" + version + "/" + path + "?" + Object.entries(options).map(e => e.join('=')).join('&'), {
            method: "GET",
            headers: reqHeaders,
        });

        let result = await fetch(req)


        let data = await result.json()
        if(data.response.status !== 200){
            throw new ZermeloError(data.response.status+" "+data.response.message)

        }
        return data.response.data

    }

}
export default Session;

import { ZermeloError } from "./errors.js"

class Session{
    constructor(portal, token) {
        this.portal = portal;
        this.token = token;
        this.cache = window.caches.open("zapi")
    }

    async request(path, options= {}, req_options = {}, version= 3) {
        const reqHeaders = new Headers();
        reqHeaders.append("Authorization", "Bearer " + this.token)

        let url = "https://" + this.portal + ".zportal.nl/api/v" + version + "/" + path + "?" + Object.entries(options).map(e => e.join('=')).join('&');
        let req = new Request(url, {
            method: "GET",
            headers: reqHeaders,
        });
        //TODO: write caching bc zermelo gives no-cache override headers, most things can be cached.
        /*let cache = await this.cache
        let c_res = await cache.match(req)
        if(c_res) {
            let c_json = await c_res.json()
            console.log("from cache", c_res, c_json)
        }*/
        let result = await fetch(req, req_options)
        /*if(!c_res) {
            cache.put(url, result.clone());
        }*/

        let data = await result.json()
        if(data.response.status !== 200){
            throw new ZermeloError(data.response.status+" "+data.response.message)
        }
        return data.response.data
    }
}
export default Session;

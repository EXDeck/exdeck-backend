import OAuth, {RequestOptions} from "oauth-1.0a"
import crypto from "crypto"
import {Context} from "koa"

export class Twitter {
    private ck: string;
    private cs: string;
    private at: string | null;
    private as: string | null;
    private ctx: Context

    constructor(req: Context){
        this.ctx = req;
        const ckcs = this.getConsumerKeys();
        this.ck = ckcs.ck;
        this.cs = ckcs.cs;
        const atas = this.getAccessTokens();
        if(atas){
            this.at = atas.at;
            this.as = atas.as;
        } else {
            this.at = null;
            this.as = null;
        }
    }

    getSelectedAccount(): string | null{
        let q = this.ctx.query;
        if(q.id){
            return q.id as string;
        }
        return null;
    }

    getSelectedKeys(): {at: string, as: string} | {ck: string, cs: string, at: string, as: string} | null {
        const accountid = this.getSelectedAccount();
        if(accountid && this.ctx.cookies.get("accounts")){
            const keys: string = this.ctx.cookies.get("accounts") as string;
            const accounts = JSON.parse(keys);
            if(accountid in accounts){
                const account = accounts[accountid];
                if("at" in account && "as" in account) {
                    if("ck" in account && "cs" in account){
                        return {at: account.at, as: account.as, ck: account.ck, cs: account.cs};
                    }
                    else{
                        return {at: account.at, as: account.as};
                    }
                }
                
            }
        }
        return null;
    }

    getConsumerKeys(): {ck: string, cs: string} {
        const keys = this.getSelectedKeys();
        if(keys && "ck" in keys && "cs" in keys){
            return {ck: keys.ck, cs: keys.cs};
        }
        if("x-consumer-key" in this.ctx.headers && "x-consumer-secret" in this.ctx.headers){
            return {ck: this.ctx.headers["x-consumer-key"] as string, cs: this.ctx.headers["x-consumer-secret"] as string};
        }
        return {ck: process.env["CK"] as string, cs: process.env["CS"] as string}; //TODO: make it better
    }

    getAccessTokens(): {at: string, as: string} | null {
        const keys = this.getSelectedKeys();
        if(keys){
            return {at: keys.at, as: keys.as};
        }
        return null;
    }

    generateHeaders(req: RequestOptions = this.ctx): {"Authorization": string} | undefined {
        const auth = new OAuth({
            consumer: {key: this.ck, secret: this.cs},
            signature_method: "HMAC-SHA1",
            hash_function: (base_string, key) => {
                return crypto
                    .createHmac('sha1', key)
                    .update(base_string)
                    .digest('base64');
            }
        })
        let signiture;
        if(this.at && this.as){
            signiture = auth.authorize(req, {key: this.at, secret: this.as})
        }
        else{
            signiture = auth.authorize(req)
        }
        const header = auth.toHeader(signiture);

        return header;
    }

    async makeRequest(req: RequestOptions): Promise<Response> {
        const header = this.generateHeaders(req);
        const resp  = fetch(req.url, {
            method: req.method,
            headers: header,
            body: req.data
        })
        return resp;
    }

    async get(url: string): Promise<Response> {
        return this.makeRequest({url, method: "GET"});
    }

    async post(url: string, data: any): Promise<Response> {
        return this.makeRequest({url, method: "POST", data});
    }
}
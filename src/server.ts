import Koa from "koa"
import koaBody from "koa-body"
import Router from "@koa/router"
import cors from "@koa/cors"
import {Twitter} from "./twitter"
import config from "./env"

//Init dotenv


//Init server
const app = new Koa()
const router = new Router()

app.use(koaBody())
app.use(cors(
    {
        origin: config.ORIGIN,
        credentials: true,
    }
))

// Loads from .env OR environment vars
const CK = config.CK
const CS = config.CS

//Setup routes
router
    .get("/", async (ctx, next) => {
        ctx.body = "Hello World. This is the backend. "
    })
    .get("/api/auth", async (ctx, next) => {
        const twitter = new Twitter(ctx);
        const resp = await twitter.post("https://api.twitter.com/oauth/request_token", {"oauth_callback": "oob"});
        const j = await resp.text();
        let oauth_token = "";
        let oauth_token_secret = "";
        let oauth_callback_confirmed = false;
        for(let item of j.split("&")){
            const kv = item.split("=");
            const key = kv[0];
            const value = kv[1];
            if(key == "oauth_token"){
                oauth_token = value;
            }
            if(key == "oauth_token_secret"){
                oauth_token_secret = value;
            }
            if(key == "oauth_callback_confirmed"){
                oauth_callback_confirmed = Boolean(value);
            }
        }
        if(!oauth_callback_confirmed){
            ctx.response.status = 500;
            ctx.body = "Something went wrong; oauth_callback_confirmed is false";
        }
        else {
            ctx.response.status = 200;
            ctx.response.type = "application/json";
            ctx.body = {
                oauth_token: oauth_token,
                oauth_token_secret: oauth_token_secret
            }
        }
    }) //ずらす
    .post("/api/auth", async(ctx, next) => {
        const body = JSON.parse(ctx.request.body)
        const oauth_token = body.oauth_token;
        const oauth_verifier = body.oauth_verifier;
        const resp = await fetch(`https://api.twitter.com/oauth/access_token?oauth_token=${oauth_token}&oauth_verifier=${oauth_verifier}`, {method: "POST"});
        const tokens = await resp.text()
        let access_token = ""
        let access_token_secret = ""
        let user_id = ""
        for(let item of tokens.split("&")){
            const key = item.split("=")[0];
            if(key == "oauth_token"){
                access_token = item.split("=")[1];
            }
            if(key == "oauth_token_secret"){
                access_token_secret = item.split("=")[1];
            }
            if(key == "user_id"){
                user_id = item.split("=")[1];
            }
        }
        if(!access_token || !access_token_secret || !user_id){
            console.log("Error creating access tokens: ", tokens)
            ctx.body = "error"                                          // TODO: better error
            return
        }
        const ck = ctx.request.headers["x-consumer-key"] as string || null;
        const cs = ctx.request.headers["x-consumer-secret"] as string || null;

        const account: {access_token: string, access_token_secret: string, consumer_key?: string, consumer_secret?: string}
            = {
                access_token: access_token,
                access_token_secret: access_token_secret,
            }

        if(ck && cs){
            account.consumer_key = ck;
            account.consumer_secret = cs;
        }

        const accounts_cookie = ctx.cookies.get("accounts")
        if(accounts_cookie){
            const accounts = JSON.parse(accounts_cookie)
            accounts[user_id] = account
            ctx.cookies.set("accounts", JSON.stringify(accounts), config.COOKIE)                 //TODO: 期限を設定する
        }else{
            ctx.cookies.set("accounts", JSON.stringify({[user_id]: account}), config.COOKIE)
        }
        ctx.body = "ok"
    }) //ずらす
    .get("/1.1/:path(.+)", async(ctx, next) => {
        // ctx.body = ctx.params.path
        const url = "https://api.twitter.com/1.1/" + ctx.params.path + "?" + ctx.request.querystring
        const twitter = new Twitter(ctx)
        const resp = await twitter.get(url);
        ctx.body = await resp.json()
    })
    .post("/1.1/:path(.+)", async(ctx, next) => {
        const url = "https://api.twitter.com/1.1/" + ctx.params.path
        const twitter = new Twitter(ctx)
        const resp = await twitter.post(url, ctx.request.body)
        ctx.body = await resp.json()
    })


//Finish initializing the server
app.use(router.routes())
app.listen(config.PORT)
console.log("server is up!")
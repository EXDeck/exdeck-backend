import { randomUUID } from "crypto"
import { readFileSync } from "fs"
import https from "https"
import path from "path"

import cors from "@koa/cors"
import Router from "@koa/router"
import Koa from "koa"
import koaBody from "koa-body"
import { fetch } from "undici"

import config from "./env"
import Twitter from "./twitter"
import { Account } from "./types/cookie"

// Init dotenv

// Init server
const app = new Koa
const router = new Router

app.use(koaBody())
app.use(
	cors({
		origin: config.ORIGIN,
		credentials: true,
	}),
)

// Loads from .env OR environment vars
const { CK, CS } = config

// Setup routes
router
	.get("/", async (ctx, next) =>
	{
		ctx.body = "Hello World. This is the backend. "
	})

// NOTE Cookie受取テスト用エンドポイント
	.get("/api/cookie", async ctx =>
	{
		console.log(ctx.cookies.get("accounts"))
		ctx.response.status = 200
		ctx.response.body = "ok"
	})
	.post("/api/cookie", async ctx =>
	{
		console.log(ctx.cookies.get("accounts"))
		ctx.response.status = 200
		ctx.response.body = "ok"
	})

// NOTE End Cookie受取テスト用エンドポイント

	.get("/api/auth", async (ctx, next) =>
	{
		const twitter = new Twitter(ctx)
		const resp = await twitter.post("https://api.twitter.com/oauth/request_token", {
			oauth_callback: "oob",
		})
		const j = await resp.text()
		let oauthToken = ""
		let oauthTokenSecret = ""
		let oauthCallbackConfirmed = false
		for (const item of j.split("&"))
		{
			const kv = item.split("=")
			const key = kv[0]
			const value = kv[1]
			if (key === "oauth_token")
			{
				oauthToken = value
			}
			if (key === "oauth_token_secret")
			{
				oauthTokenSecret = value
			}
			if (key === "oauth_callback_confirmed")
			{
				oauthCallbackConfirmed = Boolean(value)
			}
		}
		if (!oauthCallbackConfirmed)
		{
			ctx.response.status = 500
			ctx.body = "Something went wrong; oauthCallbackConfirmed is false"
		}
		else
		{
			ctx.response.status = 200
			ctx.response.type = "application/json"
			ctx.body = {
				oauthToken,
				oauthTokenSecret,
			}
		}
	}) // ずらす
	.post("/api/auth", async (ctx, next) =>
	{
		const body = JSON.parse(ctx.request.body)
		const { oauth_token: oauthToken, oauth_verifier: oauthVerifier } = body
		const resp = await fetch(
			`https://api.twitter.com/oauth/access_token?oauth_token=${oauthToken}&oauth_verifier=${oauthVerifier}`,
			{ method: "POST" },
		)
		const tokens = await resp.text()
		let accessToken = ""
		let accessTokenSecret = ""
		let userId = ""
		for (const item of tokens.split("&"))
		{
			const key = item.split("=")[0]
			if (key === "oauth_token")
			{
				accessToken = item.split("=")[1]
			}
			if (key === "oauth_token_secret")
			{
				accessTokenSecret = item.split("=")[1]
			}
			if (key === "user_id")
			{
				userId = item.split("=")[1]
			}
		}
		if (!accessToken || !accessTokenSecret || !userId)
		{
			console.log("Error creating access tokens: ", tokens)
			ctx.body = "error" // TODO: better error
			return
		}
		const ck = ctx.request.headers["x-consumer-key"] as string || null
		const cs = ctx.request.headers["x-consumer-secret"] as string || null

		const account: Account = {
			accessToken,
			accessTokenSecret,
		}

		if (ck && cs)
		{
			account.consumerKey = ck
			account.consumerSecret = cs
		}

		const accountsCookie = ctx.cookies.get("accounts")
		if (accountsCookie)
		{
			const accounts = JSON.parse(accountsCookie)
			accounts[userId] = account
			ctx.cookies.set("accounts", JSON.stringify(accounts), config.COOKIE) // TODO: 期限を設定する
		}
		else
		{
			ctx.cookies.set("accounts", JSON.stringify({ [userId]: account }), config.COOKIE)
		}
		ctx.body = "ok"
	}) // ずらす
	.get("/api/auth/status", async (ctx, next) =>
	{
		const accountsCookie = ctx.cookies.get("accounts")
		const res = {
			signIn: false,
			specialKey: false,
		}
		if (accountsCookie)
		{
			res.signIn = true

			// NOTE 検索でヒットしなさそうな文字列を並べることでレスポンスを向上
			const url = `https://api.twitter.com/1.1/search/universal.json?q=${
				randomUUID() + randomUUID()
			}`
			const twitter = new Twitter(ctx)
			const resp = await twitter.get(url)

			// Console.log(await resp.json());

			if (resp.ok) res.specialKey = true
		}
		ctx.body = res
	})
	.get("/1.1/:path(.+)", async (ctx, next) =>
	{
		// Ctx.body = ctx.params.path
		const url = `https://api.twitter.com/1.1/${ctx.params.path}?${ctx.request.querystring}`
		const twitter = new Twitter(ctx)
		const resp = await twitter.get(url)
		ctx.body = await resp.json()
	})
	.post("/1.1/:path(.+)", async (ctx, next) =>
	{
		const url = `https://api.twitter.com/1.1/${ctx.params.path}`
		const twitter = new Twitter(ctx)
		const resp = await twitter.post(url, ctx.request.body)
		ctx.body = await resp.json()
	});

// Finish initializing the server
(async () =>
{
	app.use(router.routes())
	if (config.LOCAL_SSL)
	{
		https
			.createServer(
				{
					key: readFileSync(path.join(process.cwd(), "localhost-key.pem")),
					cert: readFileSync(path.join(process.cwd(), "localhost.pem")),
				},
				app.callback(),
			)
			.listen(config.PORT)
	}
	else
	{
		app.listen(config.PORT)
	}
	console.log(
		`server is up!: ${config.LOCAL_SSL ? "https" : "http"}://localhost:${config.PORT}/`,
	)
})()

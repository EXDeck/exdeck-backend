import {config} from "dotenv"

config()

export default {
    CK: process.env.CK,
    CS: process.env.CS,
    PORT: process.env.PORT ?? 3000,
    ORIGIN: (process.env.ORIGIN ?? "https://localhost:3000") as string,
    COOKIE: { //このオブジェクトはcookeisのオプションにそのまま突っ込めるようになってる
        httpOnly: process.env.C_HTTPONLY == undefined ? true : Boolean(process.env.C_HTTPONLY),
        secure: process.env.C_SECURE == undefined ? true : Boolean(process.env.C_SECURE),
        sameSite: process.env.C_SAMESITE as "strict" | "lax" | "none" ?? "strict",
        domain: process.env.C_DOMAIN,
        maxAge: process.env.C_MAXAGE == undefined ?  60 * 60 * 24 * 365 : Number(process.env.C_MAXAGE),
    }
}

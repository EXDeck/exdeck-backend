import {config} from "dotenv"

config()

export default {
    CK: process.env.CK,
    CS: process.env.CS,
    PORT: process.env.PORT ?? 3000,
    COOKIE: { //このオブジェクトはcookeisのオプションにそのまま突っ込めるようになってる
        httpOnly: process.env.C_HTTPONLY ?? true,
        secure: process.env.C_SECURE ?? true,
        sameSite: process.env.C_SAMESITE ?? "Strict",
        domain: process.env.C_DOMAIN,
        maxAge: process.env.C_MAXAGE ?? 60 * 60 * 24 * 365,
    }
}

import {config} from "dotenv"

config()

export default {
    CK: process.env.CK,
    CS: process.env.CS,
    PORT: process.env.PORT ?? 3000,
    COOKIE: {
        HttpOnly: process.env.C_HTTPONLY ?? true,
        Secure: process.env.C_SECURE ?? true,
        SameSite: process.env.C_SAMESITE ?? "Strict",
        Domain: process.env.C_DOMAIN,
        MaxAge: process.env.C_MAXAGE ?? 60 * 60 * 24 * 365,
    }
}

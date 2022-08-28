import { config } from "dotenv";

config();

function boolean(boolStr: string) {
    return boolStr.toLowerCase() === "true" ? true : false;
}

console.log(process.env.NODE_ENV);

export default {
    CK: process.env.CK,
    CS: process.env.CS,
    PORT: process.env.PORT ?? 3000,
    ORIGIN: (process.env.ORIGIN ?? "https://localhost:3000") as string,
    LOCAL_SSL:
        process.env.NODE_ENV !== "development"
            ? false
            : process.env.SSL == undefined
            ? true
            : boolean(process.env.SSL),
    COOKIE: {
        //このオブジェクトはcookiesのオプションにそのまま突っ込めるようになってる
        httpOnly: process.env.C_HTTPONLY == undefined ? true : boolean(process.env.C_HTTPONLY),
        secure: process.env.C_SECURE == undefined ? true : boolean(process.env.C_SECURE),
        sameSite: (process.env.C_SAMESITE as "strict" | "lax" | "none") ?? "strict",
        domain: process.env.C_DOMAIN,
        maxAge:
            process.env.C_MAXAGE == undefined ? 60 * 60 * 24 * 365 : Number(process.env.C_MAXAGE),
        Path: "/",
    },
};

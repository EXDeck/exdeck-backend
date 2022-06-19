import {config} from "dotenv"

config()

export default {
    CK: process.env.CK,
    CS: process.env.CS,
    PORT: process.env.PORT || 3000,
}
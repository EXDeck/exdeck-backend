import { certificateFor } from "devcert";
import env from "./env";

const { ORIGIN: origin } = env;
const originUrl = new URL(origin);

const cert = certificateFor(originUrl.hostname);

export { cert };

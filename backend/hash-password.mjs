
import { scryptSync, randomBytes } from "node:crypto";

const password = process.env.ADMIN_PASSWORD;

if (!password || password.length < 12) {
    throw new Error(
        "Set ADMIN_PASSWORD to a password of at least 12 characters."
    );
}

const salt = randomBytes(16).toString("hex");

const hash = scryptSync(password, salt, 64).toString("hex");

console.log(`${salt}:${hash}`);

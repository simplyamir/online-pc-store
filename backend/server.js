import fs from "node:fs";
import express from "express";
import mariadb from "mariadb";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import {
    randomBytes,
    scryptSync,
    timingSafeEqual,
    createHash,
} from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";
import "dotenv/config";

// ==================================================
// CONFIGURATION
// ==================================================

const app = express();

const PORT = Number(process.env.PORT || 3001);
const IS_PRODUCTION = process.env.NODE_ENV === "production";

const CLIENT_ORIGIN =
    process.env.CLIENT_ORIGIN || "http://localhost:5173";

const PUBLIC_ORIGIN =
    process.env.PUBLIC_ORIGIN || CLIENT_ORIGIN;

const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;

const SESSION_COOKIE = "pcstore_admin_session";
const SESSION_DURATION = 8 * 60 * 60 * 1000;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.resolve(__dirname, "../dist");

if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) {
    throw new Error("Invalid PORT");
}


const HAS_DATABASE_URL = Boolean(process.env.JAWSDB_MARIA_URL);

const requiredVariables = [
    "ADMIN_USERNAME",
    "ADMIN_PASSWORD_HASH",
];

if (!HAS_DATABASE_URL) {
    requiredVariables.push(
        "DB_HOST",
        "DB_USER",
        "DB_PASSWORD",
        "DB_NAME"
    );
}

for (const name of requiredVariables) {
    if (!process.env[name]) {
        throw new Error(`Missing environment variable: ${name}`);
    }
}


if (!/^https?:\/\/[^/]+$/.test(CLIENT_ORIGIN)) {
    throw new Error("Invalid CLIENT_ORIGIN");
}

if (
    IS_PRODUCTION &&
    !/^https:\/\/[^/]+$/.test(PUBLIC_ORIGIN)
) {
    throw new Error(
        "PUBLIC_ORIGIN must be an HTTPS origin in production"
    );
}

// ==================================================
// MIDDLEWARE
// ==================================================

app.disable("x-powered-by");

if (IS_PRODUCTION) {
    app.set("trust proxy", 1);
}

app.use(helmet());

if (!IS_PRODUCTION) {
    app.use(
        cors({
            origin: CLIENT_ORIGIN,
            credentials: true,
            methods: ["GET", "POST", "PUT", "DELETE"],
            allowedHeaders: ["Content-Type"],
        })
    );
}

app.use(express.json({ limit: "20kb" }));
app.use(cookieParser());

// ==================================================
// DATABASE
// ==================================================


const databaseConfig = {
    connectionLimit: 5,
    acquireTimeout: 10000,
    connectTimeout: 10000,
    idleTimeout: 60,
};

if (HAS_DATABASE_URL) {
    const databaseUrl = new URL(process.env.JAWSDB_MARIA_URL);

    if (!["mysql:", "mariadb:"].includes(databaseUrl.protocol)) {
        throw new Error("Unsupported database URL protocol");
    }

    databaseConfig.host = databaseUrl.hostname;
    databaseConfig.port = databaseUrl.port
        ? Number(databaseUrl.port)
        : 3306;

    databaseConfig.user = decodeURIComponent(
        databaseUrl.username
    );

    databaseConfig.password = decodeURIComponent(
        databaseUrl.password
    );

    databaseConfig.database = decodeURIComponent(
        databaseUrl.pathname.slice(1)
    );

    if (
        !databaseConfig.host ||
        !databaseConfig.user ||
        !databaseConfig.password ||
        !databaseConfig.database
    ) {
        throw new Error("Incomplete JAWSDB_MARIA_URL");
    }
} else {
    databaseConfig.host = process.env.DB_HOST;
    databaseConfig.port = Number(process.env.DB_PORT || 3306);
    databaseConfig.user = process.env.DB_USER;
    databaseConfig.password = process.env.DB_PASSWORD;
    databaseConfig.database = process.env.DB_NAME;
}

if (process.env.DB_SSL === "true") {
    if (!process.env.DB_SSL_CA_PATH) {
        throw new Error("DB_SSL_CA_PATH is required when DB_SSL=true");
    }

    databaseConfig.ssl = {
        ca: fs.readFileSync(process.env.DB_SSL_CA_PATH, "utf8"),
        rejectUnauthorized: true,
    };
}

const pool = mariadb.createPool(databaseConfig);


// ==================================================
// TABLE CONFIGURATION
// ==================================================

const tableConfig = {
    categories: {
        id: "category_id",
        fields: [
            "category_name",
            "description",
        ],
        required: ["category_name"],
    },

    products: {
        id: "product_id",
        fields: [
            "category_id",
            "product_name",
            "brand",
            "price",
            "stock_quantity",
            "warranty_months",
        ],
        required: [
            "category_id",
            "product_name",
            "price",
        ],
    },

    customers: {
        id: "customer_id",
        fields: [
            "first_name",
            "last_name",
            "email",
            "phone",
            "address",
        ],
        required: [
            "first_name",
            "last_name",
            "email",
        ],
    },

    orders: {
        id: "order_id",
        fields: [
            "customer_id",
            "order_date",
            "status",
        ],
        required: ["customer_id"],
    },

    order_items: {
        id: "order_item_id",
        fields: [
            "order_id",
            "product_id",
            "quantity",
            "unit_price",
        ],
        required: [
            "order_id",
            "product_id",
            "quantity",
            "unit_price",
        ],
    },

    payments: {
        id: "payment_id",
        fields: [
            "order_id",
            "payment_date",
            "amount",
            "payment_method",
            "payment_status",
        ],
        required: [
            "order_id",
            "amount",
        ],
    },
};

const integerFields = new Set([
    "category_id",
    "customer_id",
    "order_id",
    "product_id",
    "quantity",
    "stock_quantity",
    "warranty_months",
]);

const positiveIntegerFields = new Set([
    "category_id",
    "customer_id",
    "order_id",
    "product_id",
    "quantity",
]);

const decimalFields = new Set([
    "price",
    "unit_price",
    "amount",
]);

const dateFields = new Set([
    "order_date",
    "payment_date",
]);

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ==================================================
// HELPERS
// ==================================================

function getConfig(table) {
    return Object.hasOwn(tableConfig, table)
        ? tableConfig[table]
        : null;
}

function parseId(value) {
    if (!/^[1-9]\d*$/.test(String(value))) {
        return null;
    }

    const id = Number(value);

    return Number.isSafeInteger(id) ? id : null;
}

function badRequest(message) {
    const error = new Error(message);
    error.status = 400;
    return error;
}

function asyncHandler(handler) {
    return (req, res, next) => {
        Promise.resolve(handler(req, res, next)).catch(next);
    };
}

// ==================================================
// VALIDATION
// ==================================================

function validateDate(value, field) {
    if (
        typeof value !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(value)
    ) {
        throw badRequest(
            `${field} must use YYYY-MM-DD format`
        );
    }

    const [year, month, day] = value
        .split("-")
        .map(Number);

    const date = new Date(
        Date.UTC(year, month - 1, day)
    );

    if (
        date.getUTCFullYear() !== year ||
        date.getUTCMonth() + 1 !== month ||
        date.getUTCDate() !== day
    ) {
        throw badRequest(`${field} is not a valid date`);
    }

    return value;
}

function validateRecord(config, body, isCreate) {
    if (
        !body ||
        typeof body !== "object" ||
        Array.isArray(body)
    ) {
        throw badRequest("Invalid request body");
    }

    const entries = Object.entries(body);

    if (entries.length === 0) {
        throw badRequest("No fields provided");
    }

    const values = Object.create(null);

    for (const [key, raw] of entries) {
        if (!config.fields.includes(key)) {
            throw badRequest(
                `Field '${key}' is not editable`
            );
        }

        if (
            raw !== null &&
            typeof raw !== "string" &&
            typeof raw !== "number"
        ) {
            throw badRequest(
                `Invalid value for '${key}'`
            );
        }

        const value =
            typeof raw === "string" && raw.trim() === ""
                ? null
                : raw;

        if (value === null) {
            values[key] = null;
            continue;
        }

        if (integerFields.has(key)) {
            if (
                typeof value !== "number" &&
                !/^\d+$/.test(value)
            ) {
                throw badRequest(
                    `${key} must be an integer`
                );
            }

            const number = Number(value);
            const minimum =
                positiveIntegerFields.has(key) ? 1 : 0;

            if (
                !Number.isSafeInteger(number) ||
                number < minimum
            ) {
                throw badRequest(
                    `${key} must be an integer of at least ${minimum}`
                );
            }

            values[key] = number;
            continue;
        }

        if (decimalFields.has(key)) {
            if (
                typeof value !== "number" &&
                !/^\d+(\.\d{1,2})?$/.test(value)
            ) {
                throw badRequest(
                    `${key} must be a non-negative amount with at most 2 decimal places`
                );
            }

            const number = Number(value);

            if (
                !Number.isFinite(number) ||
                number < 0 ||
                !Number.isSafeInteger(
                    Math.round(number * 100)
                )
            ) {
                throw badRequest(
                    `${key} must be a valid amount`
                );
            }

            values[key] = number;
            continue;
        }

        if (dateFields.has(key)) {
            values[key] = validateDate(value, key);
            continue;
        }

        if (typeof value !== "string") {
            throw badRequest(
                `${key} must be text`
            );
        }

        const text = value.trim();

        if (text.length > 1000) {
            throw badRequest(
                `${key} exceeds maximum length`
            );
        }

        if (
            key === "email" &&
            !emailPattern.test(text)
        ) {
            throw badRequest("Invalid email address");
        }

        values[key] = text;
    }

    for (const field of config.required) {
        if (
            (isCreate || Object.hasOwn(values, field)) &&
            (
                values[field] === null ||
                values[field] === undefined ||
                values[field] === ""
            )
        ) {
            throw badRequest(`${field} is required`);
        }
    }

    return values;
}

// ==================================================
// DATABASE ERROR HANDLING
// ==================================================

function handleDatabaseError(error, res) {
    console.error(
        "Database error:",
        error.message
    );

    const code = error.code;

    if (
        code === "ER_ROW_IS_REFERENCED_2" ||
        code === "ER_ROW_IS_REFERENCED"
    ) {
        return res.status(409).json({
            error:
                "Cannot delete this record because other records depend on it.",
        });
    }

    if (
        code === "ER_NO_REFERENCED_ROW_2" ||
        code === "ER_NO_REFERENCED_ROW"
    ) {
        return res.status(400).json({
            error:
                "Referenced record does not exist. Check the related ID.",
        });
    }

    if (code === "ER_DUP_ENTRY") {
        return res.status(409).json({
            error:
                "A record with this unique value already exists.",
        });
    }

    if (
        [
            "ER_BAD_NULL_ERROR",
            "ER_NO_DEFAULT_FOR_FIELD",
            "ER_DATA_TOO_LONG",
            "ER_TRUNCATED_WRONG_VALUE",
            "WARN_DATA_TRUNCATED",
            "ER_WARN_DATA_OUT_OF_RANGE",
            "ER_CHECK_CONSTRAINT_VIOLATED",
        ].includes(code)
    ) {
        return res.status(400).json({
            error:
                "Invalid or missing field value. Check the form.",
        });
    }

    return res.status(500).json({
        error: "Database operation failed",
    });
}

// ==================================================
// PERSISTENT ADMIN SESSIONS
// ==================================================

// Automatically creates the sessions table.
// Only SHA-256 hashes of tokens are stored.

async function initializeSessions() {
    await pool.query(`
    CREATE TABLE IF NOT EXISTS admin_sessions (
      token_hash CHAR(64)
        CHARACTER SET ascii
        COLLATE ascii_bin
        PRIMARY KEY,
      username VARCHAR(100) NOT NULL,
      expires_at DATETIME(3) NOT NULL,
      INDEX idx_expires_at (expires_at)
    ) ENGINE=InnoDB
  `);

    // Remove sessions that have already expired.
    await pool.query(`
    DELETE FROM admin_sessions
    WHERE expires_at <= UTC_TIMESTAMP(3)
  `);
}

function hashSessionToken(token) {
    return createHash("sha256")
        .update(token)
        .digest("hex");
}

function verifyPassword(password) {
    try {
        const [salt, expectedHex] =
            ADMIN_PASSWORD_HASH.split(":");

        if (
            !salt ||
            !/^[a-f0-9]{128}$/i.test(expectedHex)
        ) {
            return false;
        }

        const actual = scryptSync(
            password,
            salt,
            64
        );

        const expected = Buffer.from(
            expectedHex,
            "hex"
        );

        return timingSafeEqual(actual, expected);
    } catch {
        return false;
    }
}

function cookieOptions() {
    return {
        httpOnly: true,
        secure: IS_PRODUCTION,
        sameSite: "strict",
        path: "/api",
        maxAge: SESSION_DURATION,
    };
}

async function getSession(req) {
    const token = req.cookies?.[SESSION_COOKIE];

    if (
        typeof token !== "string" ||
        !/^[a-f0-9]{64}$/.test(token)
    ) {
        return null;
    }

    const rows = await pool.query(
        `
      SELECT username
      FROM admin_sessions
      WHERE token_hash = ?
        AND expires_at > UTC_TIMESTAMP(3)
      LIMIT 1
    `,
        [hashSessionToken(token)]
    );

    return rows[0] || null;
}

const requireAuth = asyncHandler(
    async (req, res, next) => {
        const session = await getSession(req);

        if (!session) {
            return res.status(401).json({
                error: "Authentication required",
            });
        }

        req.admin = session.username;
        next();
    }
);

// ==================================================
// ORIGIN PROTECTION
// ==================================================

function checkOrigin(req, res, next) {
    if (
        ["POST", "PUT", "PATCH", "DELETE"].includes(
            req.method
        )
    ) {
        const allowedOrigin = IS_PRODUCTION
            ? PUBLIC_ORIGIN
            : CLIENT_ORIGIN;

        if (req.get("origin") !== allowedOrigin) {
            return res.status(403).json({
                error: "Request origin not allowed",
            });
        }
    }

    next();
}

app.use("/api", checkOrigin);

// ==================================================
// LOGIN RATE LIMIT
// ==================================================

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: {
        error:
            "Too many login attempts. Try again later.",
    },
});

// ==================================================
// LOGIN
// ==================================================

app.post(
    "/api/auth/login",
    loginLimiter,
    asyncHandler(async (req, res) => {
        const { username, password } = req.body || {};

        if (
            typeof username !== "string" ||
            typeof password !== "string" ||
            username.length > 100 ||
            password.length > 1024
        ) {
            return res.status(400).json({
                error: "Invalid login request",
            });
        }

        const passwordMatches = verifyPassword(password);

        if (
            username !== ADMIN_USERNAME ||
            !passwordMatches
        ) {
            return res.status(401).json({
                error: "Invalid username or password",
            });
        }

        // Remove the previous session, if present.
        const oldToken = req.cookies?.[SESSION_COOKIE];

        if (
            typeof oldToken === "string" &&
            /^[a-f0-9]{64}$/.test(oldToken)
        ) {
            await pool.query(
                `
          DELETE FROM admin_sessions
          WHERE token_hash = ?
        `,
                [hashSessionToken(oldToken)]
            );
        }

        // Create a cryptographically random token.
        const token = randomBytes(32).toString("hex");

        // Store only the hash in MariaDB.
        await pool.query(
            `
        INSERT INTO admin_sessions
          (token_hash, username, expires_at)
        VALUES (
          ?,
          ?,
          DATE_ADD(
            UTC_TIMESTAMP(3),
            INTERVAL 8 HOUR
          )
        )
      `,
            [
                hashSessionToken(token),
                ADMIN_USERNAME,
            ]
        );

        res.cookie(
            SESSION_COOKIE,
            token,
            cookieOptions()
        );

        res.json({
            message: "Login successful",
            user: {
                username: ADMIN_USERNAME,
            },
        });
    })
);

// ==================================================
// CHECK LOGIN SESSION
// ==================================================

app.get(
    "/api/auth/me",
    asyncHandler(async (req, res) => {
        const session = await getSession(req);

        if (!session) {
            return res.status(401).json({
                error: "Not authenticated",
            });
        }

        res.json({
            authenticated: true,
            user: {
                username: session.username,
            },
        });
    })
);

// ==================================================
// LOGOUT
// ==================================================

app.post(
    "/api/auth/logout",
    asyncHandler(async (req, res) => {
        const token = req.cookies?.[SESSION_COOKIE];

        if (
            typeof token === "string" &&
            /^[a-f0-9]{64}$/.test(token)
        ) {
            await pool.query(
                `
          DELETE FROM admin_sessions
          WHERE token_hash = ?
        `,
                [hashSessionToken(token)]
            );
        }

        res.clearCookie(SESSION_COOKIE, {
            httpOnly: true,
            secure: IS_PRODUCTION,
            sameSite: "strict",
            path: "/api",
        });

        res.json({
            message: "Logged out",
        });
    })
);

// Protect all remaining API endpoints.
app.use("/api", requireAuth);

// ==================================================
// DATABASE HEALTH CHECK
// ==================================================

app.get(
    "/api/health",
    asyncHandler(async (req, res) => {
        const rows = await pool.query(
            "SELECT DATABASE() AS db_name"
        );

        res.json({
            status: "connected",
            database: rows[0].db_name,
        });
    })
);

// ==================================================
// READ RECORDS
// ==================================================

app.get(
    "/api/:table",
    asyncHandler(async (req, res) => {
        const table = req.params.table;
        const config = getConfig(table);

        if (!config) {
            return res.status(404).json({
                error: "Unknown table",
            });
        }

        const columns = [
            config.id,
            ...config.fields,
        ];

        const sql = `
      SELECT ${columns
                .map((column) => `\`${column}\``)
                .join(", ")}
      FROM \`${table}\`
      ORDER BY \`${config.id}\`
    `;

        const rows = await pool.query(sql);

        res.json(rows);
    })
);

// ==================================================
// CREATE RECORD
// ==================================================

app.post(
    "/api/:table",
    asyncHandler(async (req, res) => {
        const table = req.params.table;
        const config = getConfig(table);

        if (!config) {
            return res.status(404).json({
                error: "Unknown table",
            });
        }

        const values = validateRecord(
            config,
            req.body,
            true
        );

        const columns = Object.keys(values);

        const placeholders = columns
            .map(() => "?")
            .join(", ");

        const sql = `
      INSERT INTO \`${table}\`
      (${columns
                .map((column) => `\`${column}\``)
                .join(", ")})
      VALUES (${placeholders})
    `;

        try {
            const result = await pool.query(
                sql,
                Object.values(values)
            );

            res.status(201).json({
                message: "Record created",
                id: Number(result.insertId),
            });
        } catch (error) {
            handleDatabaseError(error, res);
        }
    })
);

// ==================================================
// UPDATE RECORD
// ==================================================

app.put(
    "/api/:table/:id",
    asyncHandler(async (req, res) => {
        const table = req.params.table;
        const config = getConfig(table);
        const id = parseId(req.params.id);

        if (!config) {
            return res.status(404).json({
                error: "Unknown table",
            });
        }

        if (!id) {
            return res.status(400).json({
                error: "Invalid record ID",
            });
        }

        const values = validateRecord(
            config,
            req.body,
            false
        );

        const columns = Object.keys(values);

        const assignments = columns
            .map((column) => `\`${column}\` = ?`)
            .join(", ");

        const sql = `
      UPDATE \`${table}\`
      SET ${assignments}
      WHERE \`${config.id}\` = ?
    `;

        try {
            const result = await pool.query(
                sql,
                [
                    ...Object.values(values),
                    id,
                ]
            );

            if (Number(result.affectedRows) === 0) {
                return res.status(404).json({
                    error: "Record not found",
                });
            }

            res.json({
                message: "Record updated",
            });
        } catch (error) {
            handleDatabaseError(error, res);
        }
    })
);

// ==================================================
// DELETE RECORD
// ==================================================

app.delete(
    "/api/:table/:id",
    asyncHandler(async (req, res) => {
        const table = req.params.table;
        const config = getConfig(table);
        const id = parseId(req.params.id);

        if (!config) {
            return res.status(404).json({
                error: "Unknown table",
            });
        }

        if (!id) {
            return res.status(400).json({
                error: "Invalid record ID",
            });
        }

        const sql = `
      DELETE FROM \`${table}\`
      WHERE \`${config.id}\` = ?
    `;

        try {
            const result = await pool.query(
                sql,
                [id]
            );

            if (Number(result.affectedRows) === 0) {
                return res.status(404).json({
                    error: "Record not found",
                });
            }

            res.json({
                message: "Record deleted",
            });
        } catch (error) {
            handleDatabaseError(error, res);
        }
    })
);

// ==================================================
// SERVE REACT IN PRODUCTION
// ==================================================

if (IS_PRODUCTION) {
    const indexFile = path.join(
        DIST_DIR,
        "index.html"
    );

    if (!existsSync(indexFile)) {
        throw new Error(
            "React dist/index.html not found. Run npm run build first."
        );
    }

    // Serve compiled JavaScript, CSS and assets.
    app.use(
        express.static(DIST_DIR, {
            index: false,
        })
    );

    // Return React for frontend routes.
    app.use((req, res, next) => {
        if (
            req.method !== "GET" ||
            req.path === "/api" ||
            req.path.startsWith("/api/")
        ) {
            return next();
        }

        res.sendFile(indexFile);
    });
}

// ==================================================
// UNKNOWN ENDPOINT
// ==================================================

app.use((req, res) => {
    res.status(404).json({
        error: "Endpoint not found",
    });
});

// ==================================================
// CENTRAL ERROR HANDLER
// ==================================================

app.use((error, req, res, next) => {
    if (res.headersSent) {
        return next(error);
    }

    if (
        error.type === "entity.too.large" ||
        error.status === 413
    ) {
        return res.status(413).json({
            error: "Request body is too large",
        });
    }

    if (
        error instanceof SyntaxError &&
        error.status === 400 &&
        "body" in error
    ) {
        return res.status(400).json({
            error: "Invalid JSON request body",
        });
    }

    if (error.status === 400) {
        return res.status(400).json({
            error: error.message,
        });
    }

    console.error(
        "Unhandled error:",
        error.message
    );

    res.status(500).json({
        error: "Internal server error",
    });
});

// ==================================================
// STARTUP AND GRACEFUL SHUTDOWN
// ==================================================

let server;
let shuttingDown = false;

async function start() {
    try {
        const rows = await pool.query(
            "SELECT DATABASE() AS db_name"
        );

        console.log(
            `Database connected: ${rows[0].db_name}`
        );

        // Create the session table automatically.
        await initializeSessions();

        console.log(
            "Persistent admin sessions ready"
        );

        server = app.listen(PORT, () => {
            console.log(
                `Backend running on port ${PORT}`
            );

            console.log(
                "Admin authentication enabled"
            );
        });

        server.on("error", (error) => {
            console.error(
                "HTTP server error:",
                error.message
            );

            process.exitCode = 1;
            shutdown();
        });
    } catch (error) {
        console.error(
            "Startup failed:",
            error.message
        );

        process.exitCode = 1;
        await pool.end();
    }
}

async function shutdown() {
    if (shuttingDown) {
        return;
    }

    shuttingDown = true;

    console.log("Shutting down...");

    if (server) {
        await new Promise((resolve) => {
            server.close(resolve);
            server.closeAllConnections?.();
        });
    }

    try {
        await pool.end();

        console.log(
            "Database pool closed"
        );
    } catch (error) {
        console.error(
            "Shutdown error:",
            error.message
        );

        process.exitCode = 1;
    }
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

start();

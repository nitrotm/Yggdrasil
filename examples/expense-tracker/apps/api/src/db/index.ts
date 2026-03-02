import Database from "better-sqlite3";
import { schema, seedPredefCategories } from "./schema.js";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = process.env.DB_PATH || path.join(__dirname, "../../data.db");

export const db = new Database(dbPath);

db.exec(schema);
seedPredefCategories(db);

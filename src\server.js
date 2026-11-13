import pg from "pg";
import { createApp } from "./app.js";

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const port = Number(process.env.PORT ?? 3000);
createApp(pool).listen(port, () => console.log(`Product Catalog API listening on http://localhost:${port}`));

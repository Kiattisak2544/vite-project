import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
    user: "user",
    password: "12345678",
    host: "localhost",
    port: 5432,
    database: "postgres",
});

pool.connect((err) => {
    if (err) {
        console.log("❌ PostgreSQL Error:", err.message);
    } else {
        console.log("✅ PostgreSQL Connected");
    }
});

export { pool };
export default pool;
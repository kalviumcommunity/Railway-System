import { Pool } from "pg";


const pool = new Pool({
  host: process.env.DB_Host,
  port: Number(process.env.DB_Port),
  user: process.env.DB_User,
  password: process.env.DB_Password,
  database: process.env.DB_Name,
});

export async function GET() {
  try {
    await pool.query("SELECT 1");
    return Response.json({ status: "UP" });
    console.log("DB_PASSWORD:", process.env.DB_PASSWORD);

  } catch (err) {
    return Response.json(
      { status: "DOWN", error: err.message },
      { status: 500 }
    );
  }
}

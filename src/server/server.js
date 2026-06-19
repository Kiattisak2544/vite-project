//ใช้สำหรับอ่านค่าจากไฟล์ .env
import dotenv from "dotenv";
//ใช้สำหรับจัดการ path ของไฟล์
import path from "path";
//ใช้สำหรับจัดการ path ของไฟล์
import { fileURLToPath } from "url";
// ใช้สำหรับจัดการ session
import session from "express-session";
//ใช้สำหรับเชื่อมต่อฐานข้อมูล
import { connectDB } from "./connect.js";
//ไลบรารีทำเซิร์ฟเวอร์
import express from "express";
import cors from "cors";
//ไฟล์ register API
import registerRouter from "./register.js";
//ไฟล์ login API
import loginRouter from "./login.js";
//ไฟล์เช็คเร้าเตอร์ API
import routerCheckRouter from "./routerCheck.js";

//ไฟล์เช็คคอมพิวเตอร์ API
import comCheckRouter from "./comCheck.js";
//ไฟล์เช็คcofee API
import cofeeCheckRouter from "./cofeecheck.js";
//ไฟล์เช็ค sale API
import saleCheckRouter from "./saleCheck.js";
//ไฟล์แจ้งเตือนเมื่อเร้าเตอร์ down
import routerDownRouter from "./router-down.js";

//ใช้สำหรับจัดการ path ของไฟล์
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//ใช้สำหรับอ่านค่าจากไฟล์ .env
dotenv.config({ path: path.join(__dirname, ".env") });

// สร้างแอป Express
const app = express();

// อนุญาตให้หน้าบ้าน (React) เรียก API ได้ข้ามโดเมน
app.use(cors());

// อนุญาตให้รับข้อมูลแบบ JSON
app.use(express.json());

// เปิดใช้งาน API สำหรับ register
app.use("/", registerRouter);

// เปิดใช้งาน API สำหรับ login
app.use("/", loginRouter);

// 
app.use(
    session({
        secret: 'TnG_System',
        resave: false,
        saveUninitialized: true,
        cookie: {
            maxAge: 24 * 60 * 60 * 1000,
        }

    })
)

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

// เปิดใช้งาน API สำหรับเช็คเร้าเตอร์
app.use("/", routerCheckRouter);

// เปิดใช้งาน API สำหรับเช็คคอมพิวเตอร์
app.use("/", comCheckRouter);

//เปิดใช้งาน API สำหรับเช็คsale
app.use("/", saleCheckRouter);

//เปิดใช้งาน API สำหรับเช็คcofee
app.use("/server", cofeeCheckRouter);

//เปิดใช้งาน API สำหรับแจ้งเตือนเมื่อเร้าเตอร์ down
app.use("/server", routerDownRouter);

//เปิดเซิร์ฟเวอร์ที่ port 5000 (หรือตาม .env)
const PORT = process.env.PORT || 5000;

//เชื่อมต่อฐานข้อมูลพร้อมกับสั่งรันเซิร์ฟเวอร์
await connectDB();
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});

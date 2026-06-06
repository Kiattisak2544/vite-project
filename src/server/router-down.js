import express from "express";
import { pool } from "./connectPG.js";

const router = express.Router();

router.post("/router-down", async (req, res) => {
    try {
        const { routers } = req.body;

        if (!Array.isArray(routers)) {
            return res.status(400).json({
                status: "error",
                message: "Invalid routers list"
            });
        }

        for (const r of routers) {

            if (!r?.ip || !r?.name_route) continue;

            const newStatus = r.status ?? "offline";

            const result = await pool.query(
                `SELECT new_status
                 FROM ping_error
                 WHERE ip = $1`,
                [r.ip.trim()]
            );

            // ======================
            // INSERT (ยังไม่มีข้อมูล)
            // ======================
            if (result.rows.length === 0) {
                await pool.query(
                    `INSERT INTO ping_error
                    (ip, new_status, old_status, name_route, date_error)
                    VALUES ($1, $2, $3, $4, NOW())`,
                    [
                        r.ip.trim(),
                        newStatus,
                        newStatus,
                        r.name_route
                    ]
                );
                continue;
            }

            // ======================
            // UPDATE (มีข้อมูลแล้ว)
            // ======================
            const oldStatus = result.rows[0].new_status;

            await pool.query(
                `UPDATE ping_error
                 SET old_status = $1,
                     new_status = $2,
                     name_route = $3,
                     date_error = NOW()
                 WHERE ip = $4`,
                [
                    oldStatus,
                    newStatus,
                    r.name_route,
                    r.ip.trim()
                ]
            );
        }

        return res.json({
            status: "success",
            message: "updated successfully"
        });

    } catch (error) {
        // console.error(error);

        return res.status(500).json({
            status: "error",
            message: error.message
        });
    }
});

export default router;
/*
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

            const ip = r.ip.trim();
            const newStatus = r.status ?? "offline";

            const result = await pool.query(
                `SELECT new_status FROM ping_error WHERE ip = $1`,
                [ip]
            );

            // ======================================
            // INSERT (ตารางแรก - ยังไม่มีข้อมูลในตาราง ping_error)
            // ======================================
            if (result.rows.length === 0) {
                // 1. บันทึกข้อมูลตั้งต้นลงตารางแรก (ping_error)
                await pool.query(
                    `INSERT INTO ping_error
                    (ip, new_status, old_status, name_route, date_error)
                    VALUES ($1, $2, $3, $4, NOW())`,
                    [ip, newStatus, newStatus, r.name_route]
                );

                // 2. ถ้าเริ่มมาเป็น offline ให้เพิ่มบันทึกในตารางประวัติ offline_history
                if (newStatus === "offline") {
                    await pool.query(
                        `INSERT INTO offline_history
                        (ip, name_route, offline_time, online_time, duration_minute)
                        VALUES ($1, $2, NOW(), NULL, NULL)`,
                        [ip, r.name_route]
                    );
                }
                continue;
            }

            const oldStatus = result.rows[0].new_status;

            // ======================
            // ไม่เปลี่ยน status → ข้าม
            // ======================
            if (oldStatus === newStatus) {
                continue;
            }

            // ==========================================
            // UPDATE เมื่อสถานะเปลี่ยน (อัปเดตตารางแรก ping_error)
            // ==========================================
            await pool.query(
                `UPDATE ping_error
                 SET old_status = $1,
                     new_status = $2,
                     name_route = $3,
                     date_error = NOW()
                 WHERE ip = $4`,
                [oldStatus, newStatus, r.name_route, ip]
            );

            // ===================================================
            // บันทึกลงตารางที่ 2 offline_history (ตามการเปลี่ยนสถานะ)
            // ===================================================
            if (newStatus === "offline") {
                // เปลี่ยนเป็น offline -> เพิ่มประวัติใหม่
                await pool.query(
                    `INSERT INTO offline_history
                    (ip, name_route, offline_time, online_time, duration_minute)
                    VALUES ($1, $2, NOW(), NULL, NULL)`,
                    [ip, r.name_route]
                );
            } else if (newStatus === "online" && oldStatus === "offline") {
                // เปลี่ยนจาก offline กลับมาเป็น online -> อัปเดตเวลาออนไลน์และคำนวณเวลาที่เสีย (นาที)
                await pool.query(
                    `UPDATE offline_history 
                     SET online_time = NOW(),
                         duration_minute = ROUND(EXTRACT(EPOCH FROM (NOW() - offline_time)) / 60)
                     WHERE ip = $1 AND online_time IS NULL`,
                    [ip]
                );
            }
        }

        return res.json({
            status: "success",
            message: "updated successfully"
        });

    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: error.message
        });
    }
});

export default router;
*/

import express from "express";
import { pool } from "./connectPG.js";

const router = express.Router();

router.post("/router-down", async (req, res) => {
    const client = await pool.connect();

    try {
        const { routers } = req.body;

        if (!Array.isArray(routers)) {
            return res.status(400).json({
                status: "error",
                message: "Invalid routers list"
            });
        }

        const cleanRouters = routers
            .filter(r => r?.ip && r?.name_route)
            .map(r => ({
                ip: r.ip.trim(),
                name_route: r.name_route,
                status: r.status ?? "offline",
                ping: r.ping ?? null,
                packet_loss: r.packet_loss ?? 0
            }));

        if (cleanRouters.length === 0) {
            return res.json({
                status: "success",
                message: "no valid routers"
            });
        }

        await client.query("BEGIN");

        // ================================
        // 1. ดึงข้อมูลเดิมทีเดียว (ลด DB load)
        // ================================
        const ips = cleanRouters.map(r => r.ip);

        const existing = await client.query(
            `SELECT ip, new_status
             FROM ping_error
             WHERE ip = ANY($1)`,
            [ips]
        );

        const statusMap = new Map(
            existing.rows.map(r => [r.ip, r.new_status])
        );

        // ================================
        // 2. loop แบบ optimized
        // ================================
        for (const r of cleanRouters) {

            const oldStatus = statusMap.get(r.ip);
            const newStatus = r.status;

            // ==================================
            // INSERT ใหม่ (ยังไม่มีในระบบ)
            // ==================================
            if (!oldStatus) {

                await client.query(
                    `INSERT INTO ping_error
                    (ip, new_status, old_status, name_route, date_error)
                    VALUES ($1, $2, $3, $4, NOW())`,
                    [r.ip, newStatus, newStatus, r.name_route]
                );

                if (newStatus === "offline") {
                    // กัน duplicate offline
                    const check = await client.query(
                        `SELECT id FROM offline_history
                         WHERE ip = $1 AND online_time IS NULL`,
                        [r.ip]
                    );

                    if (check.rows.length === 0) {
                        await client.query(
                            `INSERT INTO offline_history
                            (ip, name_route, offline_time, online_time, duration_minute)
                            VALUES ($1, $2, NOW(), NULL, NULL)`,
                            [r.ip, r.name_route]
                        );
                    }
                }

                continue;
            }

            // ================================
            // ไม่เปลี่ยน status → skip
            // ================================
            if (oldStatus === newStatus) continue;

            // ================================
            // UPDATE ping_error
            // ================================
            await client.query(
                `UPDATE ping_error
                 SET old_status = $1,
                     new_status = $2,
                     name_route = $3,
                     date_error = NOW()
                 WHERE ip = $4`,
                [oldStatus, newStatus, r.name_route, r.ip]
            );

            // ================================
            // OFFLINE → INSERT history
            // ================================
            if (newStatus === "offline") {

                const active = await client.query(
                    `SELECT id FROM offline_history
                     WHERE ip = $1 AND online_time IS NULL`,
                    [r.ip]
                );

                if (active.rows.length === 0) {
                    await client.query(
                        `INSERT INTO offline_history
                        (ip, name_route, offline_time, online_time, duration_minute)
                        VALUES ($1, $2, NOW(), NULL, NULL)`,
                        [r.ip, r.name_route]
                    );
                }
            }

            // ================================
            // ONLINE → close session
            // ================================
            else if (newStatus === "online" && oldStatus === "offline") {

                await client.query(
                    `UPDATE offline_history
                     SET online_time = NOW(),
                         duration_minute =
                         ROUND(EXTRACT(EPOCH FROM (NOW() - offline_time)) / 60)
                     WHERE ip = $1 AND online_time IS NULL`,
                    [r.ip]
                );
            }

            // ================================
            // (OPTION) AI HOOK READY
            // ================================
            // ตรงนี้คุณสามารถส่งเข้า ML service ได้เลย
            // เช่น:
            // await aiService.send(r);
        }

        await client.query("COMMIT");

        return res.json({
            status: "success",
            message: "updated successfully",
            count: cleanRouters.length
        });

    } catch (error) {
        await client.query("ROLLBACK");

        return res.status(500).json({
            status: "error",
            message: error.message
        });

    } finally {
        client.release();
    }
});

export default router;
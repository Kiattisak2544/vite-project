import express from "express";
import { pool } from "./connectPG.js";

const router = express.Router();
router.get("/fetch_data", async (req, res) => {

    try {

        const result = await pool.query(`
            SELECT *
            FROM offline_history
            ORDER BY id DESC
            LIMIT 10
        `);


        res.status(200).json({
            status: "success",
            data: result.rows
        });


    } catch (error) {

        console.log(error);

        res.status(500).json({
            status: "error",
            message: error.message
        });

    }

});

export default router;
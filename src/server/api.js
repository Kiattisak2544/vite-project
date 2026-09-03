import express from "express";
import { testDownloadSpeed, testUploadSpeed } from "./speedtest.js";

const router = express.Router();


// Download
router.get("/speedtest/download", async (req, res) => {

    try {

        const speed = await testDownloadSpeed();

        res.json({
            status: "success",
            type: "download",
            speed,
            unit: "Mbps"
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            status: "error",
            message: error.message
        });

    }

});



// Upload
router.get("/speedtest/upload", async (req, res) => {

    try {

        const speed = await testUploadSpeed();

        res.json({
            status: "success",
            type: "upload",
            speed,
            unit: "Mbps",
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
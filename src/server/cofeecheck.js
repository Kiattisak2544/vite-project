import express from 'express';
import ping from 'ping';
import defaultGateway from 'default-gateway'; // ติดตั้งเพิ่ม: npm install default-gateway

const router = express.Router();

router.post("/check-cofee", async (req, res) => {
    try {
        const { cofee } = req.body;

        if (!cofee || !Array.isArray(cofee)) {
            return res.status(400).json({
                status: "error",
                message: "Invalid cofee list"
            });
        }

        const results = await Promise.all(
            cofee.map(async (co) => {
                try {
                    const pingResp = await ping.promise.probe(co.ip, { timeout: 2 });

                    return {
                        ...co,
                        status: pingResp.alive ? "online" : "offline",
                        pingTime: pingResp.time,
                        quality: pingResp.time < 100 ? "good" : "bad"
                    };
                } catch (err) {
                    return {
                        ...co,
                        status: "offline",
                        pingTime: null
                    };
                }
            })
        );

        res.json({
            status: "ok",
            count: results.length,
            timestamp: new Date(),
            data: results
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: "error",
            message: "Server error"
        });
    }
});

export default router;

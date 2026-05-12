import express from 'express';
import ping from 'ping';
import defaultGateway from 'default-gateway'; // ติดตั้งเพิ่ม: npm install default-gateway

const router = express.Router();

router.post("/server/check-computer", async (req, res) => {
    try {
        const { computer } = req.body;

        if (!computer || !Array.isArray(computer)) {
            return res.status(400).json({
                status: "error",
                message: "Invalid computer list"
            });
        }

        const results = await Promise.all(
            computer.map(async (c) => {
                try {
                    const pingResp = await ping.promise.probe(c.ip, { timeout: 2 });

                    return {
                        ...c,
                        status: pingResp.alive ? "online" : "offline",
                        pingTime: pingResp.time
                    };
                } catch (err) {
                    return {
                        ...c,
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
import express from 'express';
import ping from 'ping';
import defaultGateway from 'default-gateway'; // ติดตั้งเพิ่ม: npm install default-gateway

const router = express.Router();

router.post("/server/check-sale", async (req, res) => {
    try {
        const { sale } = req.body;

        if (!sale || !Array.isArray(sale)) {
            return res.status(400).json({
                status: "error",
                message: "Invalid sale list"
            });
        }

        const results = await Promise.all(
            sale.map(async (s) => {
                try {
                    const pingResp = await ping.promise.probe(s.ip, { timeout: 2 });

                    return {
                        ...s,
                        status: pingResp.alive ? "online" : "offline",
                        pingTime: pingResp.time
                    };
                } catch (err) {
                    return {
                        ...s,
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
// import express from 'express';
// import ping from 'ping';

// const router = express.Router();

// router.post("/server/check-routers", async (req, res) => {
//     try {
//         const { routers } = req.body;

//         if (!routers || !Array.isArray(routers)) {
//             return res.status(400).json({
//                 status: "error",
//                 message: "Invalid router list"
//             });
//         }

//         const results = await Promise.all(
//             routers.map(async (r) => {
//                 try {
//                     const pingRes = await ping.promise.probe(r.ip, { timeout: 2 });

//                     return {
//                         ...r,
//                         status: pingRes.alive ? "online" : "offline",
//                         pingTime: pingRes.time
//                     };
//                 } catch (err) {
//                     return {
//                         ...r,
//                         status: "offline",
//                         pingTime: null
//                     };
//                 }
//             })
//         );

//         res.json({
//             status: "ok",
//             count: results.length,
//             timestamp: new Date(),
//             data: results
//         });

//     } catch (error) {
//         console.error(error);
//         res.status(500).json({
//             status: "error",
//             message: "Server error"
//         });
//     }
// });

// export default router;


// รันได้ทุก วงแลน
import express from 'express';
import ping from 'ping';
import defaultGateway from 'default-gateway'; // ติดตั้งเพิ่ม: npm install default-gateway

const router = express.Router();

router.post("/server/check-routers", async (req, res) => {
    try {
        let { routers } = req.body;

        // --- ส่วนที่เพิ่มเข้ามา: ถ้าไม่มีการส่ง IP มา ให้ Auto-detect Gateway ของวงแลนนั้น ---
        if (!routers || (Array.isArray(routers) && routers.length === 0)) {
            try {
                const { gateway } = await defaultGateway.v4();
                routers = [{ name: "Auto-Detected Router", ip: gateway }];
            } catch (err) {
                return res.status(404).json({
                    status: "error",
                    message: "Could not detect default gateway and no routers provided"
                });
            }
        }
        // --------------------------------------------------------------------------

        const results = await Promise.all(
            routers.map(async (r) => {
                try {
                    // ปรับค่า timeout ให้เหมาะสม (เช่น 2 วินาที)
                    const pingRes = await ping.promise.probe(r.ip, {
                        timeout: 800,
                        extra: ['-n', '3', '-w', '1000'] // สำหรับ Windows เพื่อความรวดเร็ว
                    });

                    return {
                        ...r,
                        status: pingRes.alive ? "online" : "offline",
                        pingTime: pingRes.time !== "unknown" ? pingRes.time : null,
                        lastChecked: new Date()
                    };
                } catch (err) {
                    return {
                        ...r,
                        status: "offline",
                        pingTime: null
                    };
                }
            })
        );

        res.json({
            status: "ok",
            network_context: routers.length === 1 && routers[0].name === "Auto-Detected Router" ? "dynamic" : "static",
            count: results.length,
            timestamp: new Date(),
            data: results
        });

    } catch (error) {
        console.error("Internal Server Error:", error);
        res.status(500).json({ status: "error", message: "Server error" });
    }


});

export default router;
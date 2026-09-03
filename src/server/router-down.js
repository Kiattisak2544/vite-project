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



        // ไม่เก็บ checking
        const cleanRouters = routers
            .filter(r =>
                r?.ip &&
                r?.name_route &&
                r.status !== "checking"
            )
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



        const ips = cleanRouters.map(r => r.ip);



        const existing = await client.query(
            `
            SELECT ip,new_status
            FROM ping_error
            WHERE ip = ANY($1)
            `,
            [ips]
        );



        const statusMap = new Map(
            existing.rows.map(row => [
                row.ip,
                row.new_status
            ])
        );





        for (const r of cleanRouters) {


            const oldStatus = statusMap.get(r.ip);
            const newStatus = r.status;



            /*
            ===============================
            1. DEVICE ใหม่
            ===============================
            */

            if (!oldStatus) {


                await client.query(
                    `
                    INSERT INTO ping_error
                    (
                        ip,
                        new_status,
                        old_status,
                        name_route,
                        date_error
                    )
                    VALUES
                    ($1,$2,$3,$4,NOW())
                    `,
                    [
                        r.ip,
                        newStatus,
                        newStatus,
                        r.name_route
                    ]
                );



                if (newStatus === "offline") {

                    const result = await client.query(
                        `
                        SELECT ip,name_route,offline_time,count,status
                        FROM offline_history
                        WHERE ip = $1
                        `,
                        [r.ip]
                    );

                    if (result.rows.length == 0) {

                        await client.query(
                            `
                        INSERT INTO offline_history
                        (
                            ip,
                            name_route,
                            offline_time,
                            count,
                            status
                        )
                        VALUES
                        ($1,$2,NOW(),1,'offline')
                        `,
                            [
                                r.ip,
                                r.name_route
                            ]
                        );

                    }

                    await client.query(
                        `
                        INSERT INTO offline_history
                        (
                            ip,
                            name_route,
                            offline_time,
                            count,
                            status
                        )
                        VALUES
                        ($1,$2,NOW(),1,'offline')
                        `,
                        [
                            r.ip,
                            r.name_route
                        ]
                    );

                }


                statusMap.set(
                    r.ip,
                    newStatus
                );


                continue;
            }





            /*
            ===============================
            2. offline ต่อเนื่อง
            offline -> offline
            ===============================
            */

            if (
                oldStatus === "offline" &&
                newStatus === "offline"
            ) {


                await client.query(
                    `
                    UPDATE offline_history
                    SET count = COALESCE(count,0)+1
                    WHERE ip=$1
                    `,
                    [
                        r.ip
                    ]
                );


                continue;

            }





            /*
            ===============================
            3. สถานะเปลี่ยน
            ===============================
            */

            if (oldStatus !== newStatus) {



                await client.query(
                    `
                    UPDATE ping_error
                    SET
                        old_status=$1,
                        new_status=$2,
                        name_route=$3,
                        date_error=NOW()
                    WHERE ip=$4
                    `,
                    [
                        oldStatus,
                        newStatus,
                        r.name_route,
                        r.ip
                    ]
                );





                // online -> offline

                if (
                    oldStatus === "online" &&
                    newStatus === "offline"
                ) {


                    await client.query(
                        `
                        INSERT INTO offline_history
                        (
                            ip,
                            name_route,
                            offline_time,
                            count,
                            status
                        )
                        VALUES
                        ($1,$2,NOW(),1,'offline')
                        `,
                        [
                            r.ip,
                            r.name_route
                        ]
                    );


                }
                // offline -> online

                if (
                    oldStatus === "offline" &&
                    newStatus === "online"
                ) {


                    await client.query(
                        `
                        UPDATE offline_history
                        SET status='online'
                        WHERE ip=$1
                        `,
                        [
                            r.ip
                        ]
                    );


                }

                statusMap.set(
                    r.ip,
                    newStatus
                );

            }



        }




        await client.query("COMMIT");



        return res.json({
            status: "success",
            message: "updated successfully",
            count: cleanRouters.length,
            routers: cleanRouters,
        });



    } catch (error) {


        await client.query("ROLLBACK");


        console.error(error);


        return res.status(500).json({
            status: "error",
            message: error.message
        });


    } finally {


        client.release();

    }

});


export default router;
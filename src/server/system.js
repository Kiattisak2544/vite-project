import express from "express";
import si from "systeminformation";
import { exec } from "child_process";

const router = express.Router();


function getCounter(path) {

    return new Promise((resolve, reject) => {

        exec(
            `powershell -Command "(Get-Counter '${path}').CounterSamples.CookedValue"`,
            (error, stdout) => {

                if (error) {
                    reject(error);
                    return;
                }

                const value = Number(stdout.trim());

                resolve(
                    isNaN(value) ? 0 : Math.round(value)
                );

            }
        );

    });

}



let systemData = {
    cpu: 0,
    ram: 0,
    ssd: 0
};



async function updateSystemData() {

    try {

        const [cpu, disk, memory] = await Promise.all([

            getCounter(
                "\\Processor(_Total)\\% Processor Time"
            ),

            getCounter(
                "\\PhysicalDisk(_Total)\\% Disk Time"
            ),

            si.mem()

        ]);



        systemData = {

            cpu: cpu > 100 ? 100 : cpu,

            ram: Math.round(
                ((memory.total - memory.available)
                    / memory.total) * 100
            ),

            ssd: disk > 100 ? 100 : disk

        };


        // console.log("System updated", systemData);


    } catch (error) {

        console.error(
            "System Update Error:",
            error.message
        );

    }

}



// โหลดครั้งแรก
updateSystemData();


// อัปเดตทุก 5 นาที
setInterval(
    updateSystemData,
    300000
);



// API ส่งค่าล่าสุด
router.get("/system", (req, res) => {

    res.json(systemData);

});


export default router;
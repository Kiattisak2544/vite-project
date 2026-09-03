import FastSpeedtest from "fast-speedtest-api";
import axios from "axios";

// ทดสอบ Download Speed โดยใช้ fast-speedtest-api
export async function testDownloadSpeed() {
    const speedtest = new FastSpeedtest({
        token: "YXNkZmFzZGxmbnNkYWZoYXNkZmhrYWxm",
        verbose: false,
        timeout: 15000,
        https: true,
        urlCount: 5,
        unit: FastSpeedtest.UNITS.Mbps
    });

    const speed = await speedtest.getSpeed();
    return Number(speed.toFixed(2));
}

// ทดสอบ Upload Speed โดยส่งข้อมูลไปยัง server httpbin แล้วคำนวณเวลา
export async function testUploadSpeed() {
    try {
        // สร้าง payload ขนาด 2MB
        const payloadSizeMB = 2;
        const payloadSizeBytes = payloadSizeMB * 1024 * 1024;
        const payload = Buffer.alloc(payloadSizeBytes, "A");

        const startTime = Date.now();

        await axios.post("https://speed.cloudflare.com/__up?bytes=2500000", payload, {
            headers: { "Content-Type": "application/octet-stream" },
            timeout: 20000,
        });

        const durationSeconds = (Date.now() - startTime) / 1000;
        const speedMbps = (payloadSizeMB * 8) / durationSeconds; // Mbps = (MB * 8) / s
        return Number(speedMbps.toFixed(2));
    } catch (err) {
        console.error("Upload test error:", err.message);
        return 0;
    }
}

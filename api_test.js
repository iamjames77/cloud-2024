const express = require("express");
const fetch = require("node-fetch");

const app = express();

// 메타데이터 토큰을 가져오는 함수
async function fetchToken() {
    const response = await fetch("http://169.254.169.254/latest/api/token", {
        method: "PUT",
        headers: {
            "X-aws-ec2-metadata-token-ttl-seconds": "21600",
        },
    });
    return response.text();
}

// 주어진 메타데이터 경로에서 데이터를 가져오는 함수
async function fetchMetadata(path, token) {
    const response = await fetch(`http://169.254.169.254/latest/meta-data/${path}`, {
        headers: {
            "X-aws-ec2-metadata-token": token,
        },
    });
    return await response.text();
}

// 여러 메타데이터 정보를 한 번에 가져오는 함수
async function getMetadataInfo() {
    const token = await fetchToken();
    const paths = ["instance-id", "instance-type", "placement/availability-zone", "ami-id", "local-ipv4"];

    const metadata = {};
    for (const path of paths) {
        metadata[path] = await fetchMetadata(path, token);
    }
    return metadata;
}

// /metadata 엔드포인트 정의
app.get("/metadata", async (req, res) => {
    try {
        const metadataInfo = await getMetadataInfo();
        res.status(200).json(metadataInfo);
    } catch (error) {
        console.error("Error fetching metadata:", error.message);
        res.status(500).send("Failed to fetch metadata");
    }
});

// 서버 실행
const PORT = process.env.PORT || 80;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
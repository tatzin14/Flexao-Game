const https = require("https");
const fs = require("fs");
const path = require("path");

const options = {
    key: fs.readFileSync("./192.168.1.26+2-key.pem"),
    cert: fs.readFileSync("./192.168.1.26+2.pem")
};

const mimeTypes = {
    ".html": "text/html",
    ".js": "text/javascript",
    ".css": "text/css",
    ".json": "application/json",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".svg": "image/svg+xml"
};

const server = https.createServer(options, (req, res) => {

    let filePath = path.join(
        __dirname,
        req.url === "/" ? "index.html" : req.url
    );

    filePath = decodeURIComponent(filePath);

    const ext = path.extname(filePath);
    const contentType = mimeTypes[ext] || "application/octet-stream";

    fs.readFile(filePath, (err, data) => {

        if (err) {
            res.writeHead(404);
            res.end("Arquivo não encontrado");
            return;
        }

        res.writeHead(200, {
            "Content-Type": contentType
        });

        res.end(data);
    });
});

server.listen(5500, "0.0.0.0", () => {
    console.log("Servidor HTTPS iniciado!");
    console.log("https://192.168.1.26:5500");
});
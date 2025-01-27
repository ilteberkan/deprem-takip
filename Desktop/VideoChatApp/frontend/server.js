const express = require('express');
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const app = express();

// SSL sertifika ayarları
const sslOptions = {
  key: fs.readFileSync(path.join(__dirname, '../backend/ssl/private.key')),
  cert: fs.readFileSync(path.join(__dirname, '../backend/ssl/certificate.crt'))
};

// Statik dosyaları serve et
app.use(express.static(__dirname));

// Her iki portta da dinle
const HTTP_PORT = 8080;
const HTTPS_PORT = 8443;

// HTTP server
const httpServer = http.createServer(app);
httpServer.listen(HTTP_PORT, () => {
  console.log(`HTTP Frontend http://localhost:${HTTP_PORT} adresinde çalışıyor`);
});

// HTTPS server
const httpsServer = https.createServer(sslOptions, app);
httpsServer.listen(HTTPS_PORT, () => {
  console.log(`HTTPS Frontend https://localhost:${HTTPS_PORT} adresinde çalışıyor`);
}); 
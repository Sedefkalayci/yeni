const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// Hedef site
const TARGET = 'https://1wbfqv.life';

// Proxy middleware ayarı
app.use('/', createProxyMiddleware({
    target: TARGET,
    changeOrigin: true,
    onProxyReq: (proxyReq, req, res) => {
        // Gerekirse burada özel header veya cookie manipülasyonu yapılabilir
    }
}));

app.listen(4000, () => {
    console.log('Reverse proxy çalışıyor: http://localhost:4000');
});

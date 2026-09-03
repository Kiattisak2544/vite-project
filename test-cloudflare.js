const axios = require('axios');
const payload = Buffer.alloc(2 * 1024 * 1024, 'A'); 
axios.post('https://speed.cloudflare.com/__up', payload, {
    headers: { 'Content-Type': 'application/octet-stream' }, 
    timeout: 20000
}).then(() => console.log('Success'))
  .catch(e => console.log('Error:', e.message));

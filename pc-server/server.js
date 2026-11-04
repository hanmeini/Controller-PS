const { WebSocketServer } = require('ws');
const os = require('os');

const PORT = 8765;
const wss = new WebSocketServer({ port: PORT });

function getLocalIp() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return '127.0.0.1';
}

console.log('==================================================================');
console.log('           🎮  CONTROLLER-PS - NODE RECEIVER SERVER  🎮           ');
console.log('==================================================================');
console.log(`IP Laptop : ws://${getLocalIp()}:${PORT}`);
console.log(`Port      : ${PORT}`);
console.log('Hubungkan aplikasi Android ke alamat di atas.');
console.log('==================================================================');

wss.on('connection', (ws, req) => {
  const clientIp = req.socket.remoteAddress;
  console.log(`[+] Controller HP terhubung dari: ${clientIp}`);

  ws.send(JSON.stringify({ type: 'handshake', status: 'connected' }));

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      if (data.type === 'ping') {
        ws.send(JSON.stringify({ type: 'pong', time: data.time }));
      } else if (data.type === 'input') {
        // Log button events or forward to gamepad/robotjs
        // process.stdout.write(`\rButtons: ${JSON.stringify(data.buttons || {})} | Axes: ${JSON.stringify(data.axes || {})}`);
      }
    } catch (err) {
      // ignore malformed packets
    }
  });

  ws.on('close', () => {
    console.log(`\n[-] HP terputus: ${clientIp}`);
  });
});

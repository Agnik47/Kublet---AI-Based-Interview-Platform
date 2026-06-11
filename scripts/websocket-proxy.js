const fs = require('fs');
const path = require('path');
const { WebSocketServer } = require('ws');
const ws = require('ws');

// 1. Manually parse .env file to extract Bolna credentials
try {
  const envPath = path.join(__dirname, '../.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split(/\r?\n/).forEach(line => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || '';
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.substring(1, value.length - 1);
        } else if (value.startsWith("'") && value.endsWith("'")) {
          value = value.substring(1, value.length - 1);
        }
        process.env[key] = value.trim();
      }
    });
  }
} catch (e) {
  console.error('[Proxy] Failed to load .env file:', e);
}

const PORT = 3001;
const BOLNA_API_KEY = process.env.BOLNA_API_KEY;

if (!BOLNA_API_KEY) {
  console.error('[Proxy] CRITICAL: BOLNA_API_KEY is not defined in the .env file!');
  process.exit(1);
}

// 2. Initialize local WebSocket Server
const wss = new WebSocketServer({ port: PORT });

console.log(`[Proxy] WebSocket Proxy Server is running on ws://localhost:${PORT}`);
console.log(`[Proxy] Listening for browser connections...`);

wss.on('connection', (clientWs, req) => {
  const reqUrl = req.url;
  console.log(`[Proxy] Browser connected. Path: ${reqUrl}`);
  
  if (!reqUrl.includes('/web-call/v1/')) {
    console.warn(`[Proxy] Invalid connection request path: ${reqUrl}`);
    clientWs.close(4000, 'Invalid Path');
    return;
  }

  // Replace dummy/client authorization token with the real BOLNA_API_KEY
  const targetUrl = `wss://api.bolna.ai` + reqUrl.replace(/auth_token=[^&]*/, `auth_token=${BOLNA_API_KEY}`);
  console.log(`[Proxy] Connecting to Bolna...`);
  
  // Establish secure connection to Bolna
  const bolnaWs = new ws(targetUrl);
  const pendingMessages = [];

  bolnaWs.on('open', () => {
    console.log(`[Proxy] Bolna connected successfully.`);
    // Flush any pending messages that arrived while connecting
    if (pendingMessages.length > 0) {
      console.log(`[Proxy] Flushing ${pendingMessages.length} queued client messages.`);
      while (pendingMessages.length > 0) {
        const { message, isBinary } = pendingMessages.shift();
        bolnaWs.send(message, { binary: isBinary });
      }
    }
  });

  // Pipe client messages to Bolna
  clientWs.on('message', (message, isBinary) => {
    const messageStr = isBinary ? '<binary>' : message.toString();
    console.log(`[Proxy] Incoming message from Browser: ${messageStr.substring(0, 150)}`);

    if (bolnaWs.readyState === ws.OPEN) {
      bolnaWs.send(message, { binary: isBinary });
    } else {
      console.log(`[Proxy] Bolna connection is in state ${bolnaWs.readyState}. Queueing message.`);
      pendingMessages.push({ message, isBinary });
    }
  });

  // Pipe Bolna messages back to client
  bolnaWs.on('message', (message, isBinary) => {
    const messageStr = isBinary ? '<binary>' : message.toString();
    console.log(`[Proxy] Incoming message from Bolna: ${messageStr.substring(0, 150)}`);

    if (clientWs.readyState === ws.OPEN) {
      clientWs.send(message, { binary: isBinary });
    }
  });

  // Handle connection closes
  clientWs.on('close', (code, reason) => {
    console.log(`[Proxy] Browser disconnected. Code: ${code}, Reason: ${reason}`);
    bolnaWs.close();
  });

  bolnaWs.on('close', (code, reason) => {
    console.log(`[Proxy] Bolna disconnected. Code: ${code}, Reason: ${reason}`);
    if (code === 1002 || code === 1008 || code === 4001) {
      console.log(`[Proxy] Bolna auth failure detected (Close code: ${code})`);
    }
    clientWs.close(code, reason);
  });

  // Handle errors
  clientWs.on('error', (err) => {
    console.error('[Proxy] Browser socket error:', err.message);
    bolnaWs.close();
  });

  bolnaWs.on('error', (err) => {
    console.error('[Proxy] Bolna socket error:', err.message);
    clientWs.close();
  });
});

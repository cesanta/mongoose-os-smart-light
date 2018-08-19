const Websocket = require('ws');
const argv = require('minimist')(process.argv.slice(2));
const httpServer = require('http').createServer();
const request = require('request');

const dashReconnect = () => {
  const addr = `ws://${argv.dash}/api/v2/notify?access_token=${argv.token}`;
  console.log('Connecting to', addr, '...');
  const ws = new Websocket(addr, {origin: addr});
  ws.on('open', () => {
    console.log('Dash connected.');
    wsClient = ws;
  });
  ws.on('close', () => {
    console.log('Dash disconnected.');
    wsClient = null;
    setTimeout(dashReconnect, 1000);
  });
  ws.on('error', (err) => {
    console.log('Dash error:', err);
  });
  ws.on('message', (message) => {
    console.log('Dash message:', message.toString());
  });
};
dashReconnect();

const getCookie = (name, cookie) => {
  const value = `; ${cookie}`, parts = value.split(`; ${name}=`);
  return parts.length === 2 ? parts.pop().split(';').shift() : undefined;
};

const callDash = (uri, data, callback) => {
  const opts = {
    method: data ? 'POST' : 'GET',
    auth: {bearer: argv.token, sendImmediately: true},
    url: `http://${argv.dash}/api/v2${uri}`
  };
  if (data) opts.json = data;
  console.log('->', JSON.stringify(opts));
  return request(opts, callback);
};

httpServer.listen(argv.port || 8002, () => {
  console.log('Starting API Server on port', argv.port || 8002);
});

wsServer = new Websocket.Server({server: httpServer});
wsServer.on('connection', (conn, req) => {
  var appID = getCookie('app_id', req.headers.cookie);
  console.log('PWA connected:', req.connection.remoteAddress, ', app:', appID);
  conn.on('close', () => {
    console.log('PWA connection closed:', req.connection.remoteAddress);
  });
  conn.on('message', (msg) => {
    console.log('Got PWA message:', msg);
    if (msg.type === 'utf8') {
    }
  });
  if (!appID) conn.close();
  callDash('/user/add', {name: appID, pass: appID});  // Create user if needed
});

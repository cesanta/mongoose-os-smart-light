const Websocket = require('ws');
const argv = require('minimist')(process.argv.slice(2));
const httpServer = require('http').createServer();
const axios = require('axios');

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

const callDash = (uri, options) => {
  const opts = {
    method: options.method || options.data ? 'POST' : 'GET',
    transformRequest: data => JSON.stringify(data),
    headers: {
      Authorization: `Bearer ${options.token || argv.token}`,
      'Content-Type': 'application/json; charset=utf-8',
    },
    url: `http://${argv.dash}/api/v2${uri}`,
  };
  Object.assign(opts, options);
  console.log('->', JSON.stringify(opts));
  return axios(opts).catch(err => console.log('Error:', uri, err));
};

httpServer.listen(argv.port || 8002, () => {
  console.log('Starting API Server on port', argv.port || 8002);
});

const wsServer = new Websocket.Server({server: httpServer});
wsServer.on('connection', (conn, req) => {
  const appID = getCookie('app_id', req.headers.cookie);
  console.log('PWA connected:', req.connection.remoteAddress, ', app:', appID);
  conn.on('close', () => {
    console.log('PWA connection closed:', req.connection.remoteAddress);
  });

  if (!appID) {
    conn.close();
    return;
  }

  // Create user if needed. Get access token.
  callDash('/user/add', {data: {name: appID, pass: appID}});

  const wssend = (name, args) => conn.send(JSON.stringify({name, args}));

  conn.on('message', (data) => {
    console.log('PWA', appID, data);
    try {
      const msg = JSON.parse(data);
      wssend('boo', msg);
      if (msg.name === 'pair') {
        callDash(
            `/devices/${msg.args.id}`,
            {method: 'PUT', data: {shared_with: appID, name: msg.args.name}})
            .then(d => wssend('pair', d))
            .catch(err => wssend('error', {name: 'pair', d, err}));
      }
    } catch (e) {
      console.log('Malformed message: ', data);
    }
  });
});

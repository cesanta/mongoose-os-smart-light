const WebSocket = require('ws');
const argv = require('minimist')(process.argv.slice(2));
const httpServer = require('http').createServer();
const axios = require('axios');
const wsclients = {};  // id -> wsconnection

const dashReconnect = () => {
  const addr = `ws://${argv.dash}/api/v2/notify?access_token=${argv.token}`;
  console.log('Connecting to', addr, '...');
  const ws = new WebSocket(addr, {origin: addr});
  ws.on('open', () => {
    console.log('Dash connected.');
  });
  ws.on('close', () => {
    console.log('Dash disconnected.');
    setTimeout(dashReconnect, 1000);
  });
  ws.on('error', (err) => {
    console.log('Dash error:', err);
  });
  ws.on('message', (data) => {
    const msg = JSON.parse(data);
    console.log('Dash message:', data);
    Object.keys(wsclients[msg.id] || {}).forEach((connectionID) => {
      console.log(msg.id, connectionID);
      wsclients[msg.id][connectionID].send(data);
    });
  });
};
dashReconnect();

const getCookie = (name, cookie) => {
  const parts = `; ${cookie}`.split(`; ${name}=`);
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
  console.log('DASH ->', JSON.stringify(opts));
  return axios(opts).catch(err => console.log('DASH ERROR:', err.message));
};

httpServer.listen(argv.port || 8002, () => {
  console.log('Starting API Server on port', argv.port || 8002);
});

const wsServer = new WebSocket.Server({server: httpServer});
wsServer.on('connection', (conn, req) => {
  const appID = getCookie('app_id', req.headers.cookie);
  const connectionID = req.connection.remoteAddress;
  console.log('PWA connected:', connectionID, ', app:', appID);
  conn.on('close', () => {
    console.log('PWA connection closed:', req.connection.remoteAddress);
  });

  if (!appID) {
    conn.close();
    return;
  }

  const wssend = (name, data) => conn.send(JSON.stringify({name, data}));

  callDash('/user/add', {data: {name: appID, pass: appID}});  // Create user

  const uauth = {auth: {username: appID, password: appID}};
  let devices = [];

  conn.on('close', () => {
    devices.forEach(d => delete (wsclients[d.id] || {})[connectionID]);
  });

  const listDevices = () => callDash('/devices', uauth).then(r => {
    devices.forEach(d => delete (wsclients[d.id] || {})[connectionID]);
    devices = r.data;
    devices.sort((a, b) => {
      if (a.name === b.name) return 0;
      return a.name < b.name ? -1 : 1;
    });
    devices.forEach((d) => {
      if (!wsclients[d.id]) wsclients[d.id] = {};
      wsclients[d.id][connectionID] = conn;
    });
    wssend('devices', devices);
  });
  listDevices();

  conn.on('message', (data) => {
    console.log('PWA', appID, data);
    try {
      const msg = JSON.parse(data);
      if (msg.name === 'pair') {
        const args = {shared_with: `email_${appID}`, name: msg.data.name};
        callDash(`/devices/${msg.data.id}`, {method: 'PUT', data: args})
            .then(resp => wssend('pair', resp.data))
            .catch(err => wssend('error', {name: 'pair', err}));
      } else if (msg.name === 'on') {
        callDash(`/devices/${msg.data.id}/shadow`, {
          data: {state: {desired: {on: msg.data.on}}}
        }).then(() => listDevices());
      } else if (msg.name === 'list') {
        listDevices();
      } else {
        console.log('Unhandled message: ', data);
      }
    } catch (e) {
      console.log('Malformed message: ', data);
    }
  });
});

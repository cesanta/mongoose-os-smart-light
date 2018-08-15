// const Websocket = require('ws');
const argv = require('minimist')(process.argv.slice(2));
const httpServer = require('http').createServer();
const bodyParser = require('body-parser');
const app = require('express')();

// const reconnectToNotificationEndpoint = () => {
//   const addr = argv.notif;
//   console.log('Connecting to', addr, '...');
//   const ws = new Websocket(addr, {origin: addr});
//   ws.on('open', () => {
//     console.log('Connected.');
//   });
//   ws.on('close', () => {
//     console.log('Disconnected.');
//     setTimeout(reconnectToNotificationEndpoint, 1000);
//   });
//   ws.on('error', (err) => {
//     console.log('error:', err);
//   });
//   ws.on('message', (message) => {
//     console.log('Got message:', message.toString());
//   });
// };
// reconnectToNotificationEndpoint();

app.set('json spaces', 2);
app.use(bodyParser.urlencoded({extended: true}));

app.get('/api/listDevices', (req, res) => {
  res.json({foo: 123, body: req.body});
});

const catchAll = (req, res) => res.json({error: 404, message: 'doh'});
app.get('*', catchAll);
app.post('*', catchAll);

httpServer.on('request', app);
httpServer.listen(argv.port || 8002, () => {
  console.log('Starting API Server on port', argv.port || 8002);
});

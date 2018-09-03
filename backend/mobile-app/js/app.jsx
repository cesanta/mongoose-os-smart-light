/** @jsx h */
const { h, render, Component } = window.preact;
const { Router } = window.preactRouter;
const { createHashHistory } = window.History;

const Header = () => (
  <header className="jumbotron mt-3 py-2 mb-4">
    <h2 className="text-center">
      <img src="images/logo-512x512.png" width="32" alt="" className="my-1 mx-2" />
      Smart Light
     </h2>
  </header>
);

// const Device = ({ d }) => (

class Device extends Component {
  render({ d, ws }) {
    return (
      <div className="list-group-item">
        {d.name}
        <span className={`ml-2 small ${d.online ? 'text-success' : 'text-danger'}`}>
          {d.online ? 'online' : 'offline'}
        </span>
        <div className="onoffswitch float-right">
          <input
            disabled={!d.online}
            type="checkbox"
            name="onoffswitch"
            checked={d.online && (((d.shadow || {}).state || {}).reported || {}).on}
            className="onoffswitch-checkbox"
            id={`switch_${d.id}`}
            onChange={ev => wsend(ws, 'on', { id: d.id, on: ev.target.checked })}
          />
          <label className="onoffswitch-label py-0 my-0" for={`switch_${d.id}`}>
            <span className="onoffswitch-inner" />
            <span className="onoffswitch-switch" />
          </label>
        </div>
      </div>
    );
  }
};

const DeviceList = ({ devices, ws }) => (
  <div>
    <h3 className="mb-3">
      My devices
      <a href="/add1" className="ml-3 btn btn-danger text-white float-right">Add device</a>
    </h3>
    <div className="list-group">
      {devices.map(d => <Device d={d} ws={ws} />)}
    </div>
  </div>
);

const rpc = (func, data, addr) => window.axios({
  transformRequest: data => JSON.stringify(data),
  method: data ? 'post' : 'get',
  url: `http://${addr || 'mongoose-os-smart-light.local'}/rpc/${func}`,
  timeout: 2000,
  data,
});

class AddDeviceStep1 extends Component {
  constructor() {
    super();
    this.state = { loading: false, done: false, name: 'Kitchen Light', error: '' };
  }
  render() {
    return (
      <div>
        <div><a href="/">&larr; back to device list</a></div>
        <div className="my-3 alert alert-secondary text-muted small">
          Go to your phone settings, join WiFi network
          "Mongoose-OS-Smart-Light-??????".
          Wait until connected, then click next.
        </div>
        <pre className="my-3 alert alert-warning text-muted small d-none">
          {JSON.stringify([this.props, this.state], null, 2)}
        </pre>
        <h4>Step 1: Set device name</h4>
        <input
          type="text"
          className="form-control mb-2"
          placeholder="Type name..."
          value={this.state.name}
          onInput={e => this.setState({ name: e.target.value })}
        />
        <button
          className="btn btn-danger btn-block mb-1"
          onClick={() => {
            this.setState({ loading: true, error: '' });
            rpc('Config.Set', { config: { device: { password: this.state.name } } }, '192.168.4.1')
              .then(() => Router.route('/add2'))
              .catch(() => this.setState({ error: 'Error! Make sure you have joined device WiFi.' }))
              .finally(() => this.setState({ loading: false }));
          }}
        >
          <span className={`spinner mr-2 ${this.state.loading ? '' : 'd-none'}`} />
          Set device name
        </button>
        <div className={`alert alert-danger small ${this.state.error ? '' : 'd-none'}`}>{this.state.error}</div>
      </div>
    )
  }
};

class AddDeviceStep2 extends Component {
  render({ }, { ssid, pass, loading, error }) {
    return (
      <div>
        <div><a href="/add1">&larr; back to step1</a></div>
        <h4 className="my-3">Step 2: Set device WiFi</h4>
        <div className="my-3 alert alert-warning text-muted small d-none">
          {JSON.stringify([this.state, this.props])}
        </div>
        <input type="text" className="form-control mb-2" placeholder="WiFi network name" value={ssid} onInput={e => this.setState({ ssid: e.target.value })} />
        <input type="password" className="form-control mb-2" placeholder="WiFi password" value={pass} onInput={e => this.setState({ pass: e.target.value })} />
        <button
          className="btn btn-danger btn-block mb-1"
          onClick={() => {
            const param1 = {
              config: {
                wifi: {
                  ap: { enable: false }, sta: { ssid, pass, enable: true }
                }
              }
            };
            const param2 = JSON.stringify({ reboot: true });
            this.setState({ loading: true });
            rpc('Config.Set', param1, '192.168.4.1')
              .then(() => rpc('Config.Save', param2, '192.168.4.1'))
              .then(() => Router.route('/add3'))
              .catch(err => this.setState({ error: `Error: ${err.message}. Please retry` }))
              .finally(() => this.setState({ loading: false }));
          }}
        >
          <span className={`spinner mr-2 ${loading ? '' : 'd-none'}`} />
          Set device WiFi
        </button>
        <div className={`alert alert-danger small ${error ? '' : 'd-none'}`}>{error}</div>
      </div >
    )
  }
};

const wsend = (ws, name, data) => ws.ws.send(JSON.stringify({ name, data }));

class AddDeviceStep3 extends Component {
  constructor({ ws }) {
    super();
    this.setState({ loading: false, error: '' });
    ws.callbacks.AddDeviceStep3 = (msg) => { // eslint-disable-line
      if (msg.name === 'pair' && msg.data.id == this.deviceDashID) {
        rpc('Config.Set', { config: { dash: { enable: true }, dns_sd: { enable: false } } })
          .then(() => rpc('Config.Save', { reboot: true }))
          .then(() => { Router.route('/'); wsend(ws, 'list'); })
          .catch(err => this.setState({ error: `Error: ${err.message}. Please retry` }))
          .finally(() => this.setState({ loading: false }))
      }
    };
  }
  render(props, state) {
    return (
      <div>
        <div><a href="/add2">&larr; back to step 2</a></div>
        <div className="my-3 alert alert-secondary text-muted small">
          Go to your mobile phone settings,
          switch back to your local WiFi network.
          Then click on a button to finish.
        </div>
        <h4 className="my-3">Step 3: Finish registration</h4>
        <button
          className="btn btn-danger btn-block mb-1"
          onClick={() => {
            this.setState({ loading: true, error: '' });
            rpc('Config.Get').then((resp) => {
              this.deviceDashID = resp.data.device.id;
              wsend(props.ws, 'pair', { id: resp.data.device.id, name: resp.data.device.password });
            }).catch(err => this.setState({ loading: false, error: `Error: ${err.message}. Please retry` }))
          }}
        >
          <span className={`spinner mr-2 ${state.loading ? '' : 'd-none'}`} />
          Finish registration
        </button>
        <div className={`alert alert-danger small ${state.error ? '' : 'd-none'}`}>{state.error}</div>
      </div>
    )
  }
};

class App extends Component {
  constructor() {
    super();
    // TODO(lsm): use more robust method, like evercookie or fingerprintjs
    var appID = window.util.getCookie('app_id');
    if (!appID) {
      appID = window.util.generateUniqueID();
      document.cookie = `app_id=${appID}`;
    }
    const ws = window.util.wsconnect();
    ws.callbacks = {};
    ws.onmessage = (msg) => {
      console.log('ws', msg);
      if (msg.name === 'devices') this.setState({ devices: msg.data });
      if (['created', 'deleted', 'updated'].includes(msg.name)) wsend(ws, 'list');
      Object.keys(ws.callbacks).forEach(k => ws.callbacks[k](msg));
    };
    this.state = { ws, devices: [] };
  }
  render() {
    return (
      <div className="container-fluid" style={{ 'max-width': '480px' }}>
        <Header />
        <Router history={createHashHistory()} onChange={(e) => { this.currentUrl = e.url; }}>
          <DeviceList path="/" default devices={this.state.devices} ws={this.state.ws} />
          <AddDeviceStep1 path="/add1" />
          <AddDeviceStep2 path="/add2" />
          <AddDeviceStep3 path="/add3" ws={this.state.ws} />
        </Router>
      </div>
    )
  }
};

render(<App />, document.body);

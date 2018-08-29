/** @jsx h */
const { h, render, Component } = window.preact;
const { Router } = window.preactRouter;
const { createHashHistory } = window.History;

const Header = () => (
  <header className="jumbotron mt-3 py-2 mb-4">
    <h2>Mongoose OS Smart Light</h2>
  </header>
);

const Device = ({ name }) => (
  <div className="list-group-item">{name}
    <div className="onoffswitch float-right">
      <input type="checkbox" name="onoffswitch" className="onoffswitch-checkbox" id={`switch_${name}`} />
      <label className="onoffswitch-label py-0 my-0" for={`switch_${name}`}>
        <span className="onoffswitch-inner" />
        <span className="onoffswitch-switch" />
      </label>
    </div>
  </div>
);

const DeviceList = () => (
  <div>
    <h3 className="mb-3">
      My devices
      <a href="/add1" className="ml-3 btn btn-danger text-white float-right">Add device</a>
    </h3>
    <div className="list-group">
      <Device name="device_1" />
      <Device name="device_2" />
    </div>
  </div>
);

class AddDeviceStep1 extends Component {
  constructor() {
    super();
    this.state = { connected: false };
  }
  componentDidMount() {
    // this.props.setDevice(null);
    this.timer = setInterval(() =>
      window.axios({ url: 'http://192.168.4.1/rpc/Config.Get', timeout: 1000 })
        .then(() => {
          this.setState({ connected: true });
          // this.props.setDevice({ name: res.data.device.id, token: res.data.dash.token });
          clearInterval(this.timer);
        }).catch(() => { }), 1000);
  }
  componentWillUnmount() {
    clearInterval(this.timer);
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
        <h4>Step 1: Connect to device</h4>
        {
          this.state.connected ?
            <a className="btn btn-danger btn-block mb-1" href="/add2">
              Connected! Next step &rarr;
            </a>
            :
            <button className="btn btn-danger btn-block mb-1 disabled" disabled>
              <span className="spinner mr-2" />
              Connecting ...
            </button>
        }
      </div>
    )
  }
};

class AddDeviceStep2 extends Component {
  render({ }, { ssid, pass, done, loading, error }) {
    return (
      <div>
        <div><a href="/add1">&larr; back to step1</a></div>
        <h4 className="my-3">Step 2: Set device WiFi</h4>
        <div className="my-3 alert alert-warning text-muted small d-none">
          {JSON.stringify([this.state, this.props])}
        </div>
        <input type="text" className="form-control mb-2" placeholder="WiFi network name" value={ssid} onInput={e => this.setState({ ssid: e.target.value })} />
        <input type="password" className="form-control mb-2" placeholder="WiFi password" value={pass} onInput={e => this.setState({ pass: e.target.value })} />
        <div className={`alert alert-info ${error ? '' : 'd-none'}`}>
          Error: {JSON.stringify(error)}
        </div>
        <a
          className={`btn btn-danger btn-block mb-1 ${ssid ? '' : 'disabled'}`}
          disabled={!ssid}
          href={done ? '/add3' : window.location.hash}
          onClick={(ev) => {
            ev.preventDefault();
            const param1 = JSON.stringify({
              config: {
                wifi: {
                  ap: { enable: false },
                  sta: { ssid, pass, enable: true },
                },
              },
            });
            const param2 = JSON.stringify({ reboot: true });
            this.setState({ loading: true });
            window.axios.post('http://192.168.4.1/rpc/Config.Set', param1, { timeout: 3000 })
              .then(() => window.axios.post('http://192.168.4.1/rpc/Config.Save', param2, { timeout: 1000 }))
              .then(() => this.setState({ done: true, loading: false }))
              .catch(err => this.setState({ loading: false, error: err }));
          }}
        >
          <span className={`spinner mr-2 ${loading ? '' : 'd-none'}`} />
          {done ? <span>Done! Next step &rarr;</span> : 'Set device WiFi'}
        </a>
      </div>
    )
  }
};

const wsend = (ws, name, args) => ws.ws.send(JSON.stringify({ name, args }));

class AddDeviceStep3 extends Component {
  constructor({ ws }) {
    super();
    this.setState({ buttonDisabled: true, buttonLabel: 'Pairing device...' });
    this.timer = setInterval(() => {
      window.axios({ url: 'http://mongoose-os-smart-light.local/rpc/Config.Get', timeout: 1500 })
        .then((resp) => {
          this.setState({ buttonDisabled: false, buttonLabel: 'Done!' });
          clearInterval(this.timer);
          wsend(ws, 'pair', { id: resp.data.device.id });
        }).catch((err) => { console.log(err); });
    }, 2000);
  }
  componentWillUnmount() {
    clearInterval(this.timer);
  }
  render({ }, { buttonDisabled, buttonLabel }) {
    return (
      <div>
        <div><a href="/add2">&larr; back to step 2</a></div>
        <div className="my-3 alert alert-secondary text-muted small">
          Go to your mobile phone settings
          and switch back to your local WiFi network.
          Wait until device is paired, then click next.
        </div>
        <h4 className="my-3">Step 3: Pairing device</h4>
        <a
          disabled={buttonDisabled}
          className={`btn btn-danger btn-block mb-1 ${buttonDisabled ? 'disabled' : ''}`}
          href="/"
        >
          <span className={`spinner mr-2 ${buttonDisabled ? '' : 'd-none'}`} />
          {buttonLabel}
        </a>
      </div>
    )
  }
};

class App extends Component {
  constructor(props) {
    super(props);
    let appID = window.util.getCookie('app_id');
    if (!appID) {
      appID = window.util.generateUniqueID();
      document.cookie = `app_id=${appID}`;
    }
    const ws = window.util.wsconnect(appID);
    ws.callbacks = {};
    ws.onmessage = msg =>
      Object.keys(ws.callbacks).forEach(k => ws.callbacks[k](msg));
    this.state = { ws, appID };
  }
  render({ }, { ws, appID }) {
    return (
      <div className="container-fluid" style={{ 'max-width': '480px' }}>
        <Header />
        <Router history={createHashHistory()} onChange={(e) => { this.currentUrl = e.url; }}>
          <DeviceList path="/" default title="Device List" />
          <AddDeviceStep1 path="/add1" />
          <AddDeviceStep2 path="/add2" />
          <AddDeviceStep3 path="/add3" ws={ws} />
        </Router>
      </div>
    )
  }
};

render(<App />, document.body);

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
        <span className="onoffswitch-inner"></span>
        <span className="onoffswitch-switch"></span>
      </label>
    </div>
  </div>
);

const DeviceList = ({ }) => (
  <div>
    <h3 className="mb-3">My devices <a href="/add1" className="ml-3 btn btn-danger text-white float-right">Add device</a></h3>
    <div className="list-group">
      <Device name="device_1" />
      <Device name="device_2" />
    </div>
  </div>
);

class AddDeviceStep1 extends Component {
  componentDidMount() {
    this.props.setNewDeviceName('');
    this.getDeviceName();
  }
  componentWillUnmount() {
    clearTimeout(this.t);
  }
  getDeviceName() {
    util.xhr('GET', 'http://192.168.4.1/rpc/Config.Get', '', 1000)
      .then(res => this.props.setNewDeviceName(res.device.id))
      .catch((err) => this.setState({ res: { error: err, ts: Date.now() } }));
    if (!this.props.newDeviceName) this.t = setTimeout(() => this.getDeviceName(), 1000);
  }
  render({ newDeviceName }, { }) {
    return (
      <div>
        <div><a href="/">&larr; back to device list</a></div>
        <div className="my-3 alert alert-info text-muted small">
          Go to your mobile phone settings
          and join the WiFi network "MongooseOS-????".
          Wait until connected, then press the button.
        </div>
        <div className="my-3 alert alert-warning text-muted small d-none">
          {JSON.stringify([this.state, this.props, newDeviceName])}
        </div>
        <h4>Step 1: Connect to device</h4>
        {
          newDeviceName ?
            <a className="btn btn-danger btn-block mb-1" href="/add2">
              Connected! Next step ->
            </a>
            :
            <a className="btn btn-danger btn-block mb-1 disabled" disabled>
              <span className="spinner mr-2"></span>
              Connecting ...
            </a>
        }
      </div>
    )
  }
};

class AddDeviceStep2 extends Component {
  render({ newDeviceName }, { ssid, pass, done, loading, error }) {
    return (
      <div>
        <div><a href="/step1">&larr; back to step1</a></div>
        <h4 className="my-3">Step 2: Set device WiFi</h4>
        <div className="my-3 alert alert-warning text-muted small d-none">
          {JSON.stringify([this.state, this.props, newDeviceName])}
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
            ev.preventDefault;
            const newConfig = {
              wifi: {
                ap: { enable: false },
                sta: { ssid: ssid, pass: pass, enable: true },
                http: { enable: false },
              }
            };
            this.setState({ loading: true });
            util.xhr('POST', 'http://192.168.4.1/rpc/Config.Set', { config: newConfig }, 3000)
              .then(() => util.xhr('POST', 'http://192.168.4.1/rpc/Config.Save', { reboot: true }, 300))
              .then(() => this.setState({ done: true, loading: false }))
              .catch((err) => this.setState({ loading: false, error: err }));
          }}
        >
          <span className={`spinner mr-2 ${loading ? '' : 'd-none'}`}></span>
          {done ? 'Done! Next step ->' : 'Set device WiFi'}
        </a>
      </div>
    )
  }
};

class AddDeviceStep3 extends Component {
  componentDidMount() {
  }
  render({ newDeviceName }, { done }) {
    return (
      <div>
        <div><a href="/add2">&larr; back to step 2</a></div>
        <div className="my-3 alert alert-secondary text-muted small">
          Go to your mobile phone settings
          and switch back to your local WiFi network.
          Wait until connected to the device, then click on the button.
        </div>
        <h4 className="my-3">Step 3: Register device</h4>
        {
          done ?
            <a className="btn btn-danger btn-block mb-1" href="/"> Done!</a>
            :
            <a className="btn btn-danger btn-block mb-1 disabled" disabled>
              <span className="spinner mr-2"></span>
              Registering ...
            </a>
        }
      </div>
    )
  }
};

class App extends Component {
  componentDidMount() {
    this.ws = util.wsconnect();
  }
  render({ }, { dn }) {
    return (
      <div className="container-fluid" style={{ 'max-width': '480px' }}>
        <Header />
        <Router history={createHashHistory()} onChange={e => { this.currentUrl = e.url }}>
          <DeviceList path="/" default title="Device List" />
          <AddDeviceStep1 path="/add1" setNewDeviceName={dn => this.setState({ dn })} newDeviceName={dn} />
          <AddDeviceStep2 path="/add2" setNewDeviceName={dn => this.setState({ dn })} newDeviceName={dn} />
          <AddDeviceStep3 path="/add3" setNewDeviceName={dn => this.setState({ dn })} newDeviceName={dn} />
        </Router>
      </div>
    )
  }
};

render(<App />, document.body);

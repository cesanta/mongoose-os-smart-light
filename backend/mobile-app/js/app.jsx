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
    this.setState({ res: null });
    this.getDeviceName();
  }
  getDeviceName() {
    util.xhr('GET', 'http://192.168.4.1/rpc/Config.Get', '', 1000)
      .then(res => this.setState({ deviceName: res.device.id }))
      .catch((err) => this.setState({ res: { error: err, ts: Date.now() } }));
    if (!this.state.deviceName) setTimeout(() => this.getDeviceName(), 1000);
  }
  render({ }, { res, deviceName }) {
    return (
      <div>
        <div><a href="/">&larr; back to device list</a></div>
        <div className="my-3 alert alert-secondary text-muted small">
          Go to your mobile phone settings
          and join the WiFi network "MongooseOS-????".
          Wait until connected, then press the button.
        </div>
        <div className="my-3 alert alert-light text-muted small">
          {JSON.stringify([res, deviceName])}
        </div>
        <h4>Step 1: connect to device</h4>
        <a
          className={`btn btn-danger btn-block mb-1 ${deviceName ? '' : 'disabled'}`}
          href="/add2"
          disabled={!deviceName}
          onClick={() => {
            const email = document.querySelector('.ssid');
            const password = document.querySelector('.pass');
            const ev = email.value;
            const pv = password.value;
            email.value = '';
            password.value = '';
            dash.login(ev, pv).then(() => route('/'));
          }}
        >
          {
            deviceName ?
              `Connected! Next step ->`
              :
              <div>
                <span className="spinner mr-2"></span>
                Connecting ...
              </div>
          }

        </a>
      </div>
    )
  }
};

class AddDeviceStep2 extends Component {
  componentDidMount() {
    // this.setState({ res: null });
    // this.getDeviceName();
  }
  render({ }, { deviceName }) {
    return (
      <div>
        <div><a href="/step1">&larr; back step1</a></div>
        <h4>Step 2: set device WiFi</h4>
        <input
          type="text"
          className="form-control mb-2 ssid"
          placeholder="WiFi network name"
        />
        <input
          type="password"
          className="form-control mb-2 pass"
          placeholder="WiFi password"
        />
        <a
          className={`btn btn-danger btn-block mb-1 ${deviceName ? '' : 'disabled'}`}
          href="/add3"
          disabled={!deviceName}
          onClick={() => {
            const email = document.querySelector('.ssid');
            const password = document.querySelector('.pass');
            const ev = email.value;
            const pv = password.value;
            email.value = '';
            password.value = '';
            dash.login(ev, pv).then(() => route('/'));
          }}
        >
          {
            deviceName ? 'Configure WiFi' :
              <div>
                <span className="spinner mr-2"></span>
                Connecting to device ...
              </div>
          }

        </a>
      </div>
    )
  }
};

class AddDeviceStep3 extends Component {
  componentDidMount() {
  }
  render({ }, { deviceName }) {
    return (
      <div>
        <div><a href="/add1">&larr; back to step 1</a></div>
        <div className="my-3 alert alert-secondary text-muted small">
          Go to your mobile phone settings
          and join the WiFi network "MongooseOS-????".
          Then enter WiFi name/pass and click on the button.
        </div>
        <h4>Step 2. <small>Configure WiFi on a device</small></h4>
      </div>
    )
  }
};

class App extends Component {
  componentDidMount() {
    this.ws = util.wsconnect();
  }
  render({ }, { }) {
    return (
      <div className="container-fluid" style={{ 'max-width': '480px' }}>
        <Header />
        <Router history={createHashHistory()} onChange={e => { this.currentUrl = e.url }}>
          <DeviceList path="/" default title="Device List" />
          <AddDeviceStep1 path="/add1" title="Add 1" />
          <AddDeviceStep2 path="/add2" title="Add 2" />
          <AddDeviceStep3 path="/add3" title="Add 3" />
        </Router>
      </div>
    )
  }
};

render(<App />, document.body);

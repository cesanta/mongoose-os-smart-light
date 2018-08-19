/** @jsx h */
const { h, render, Component } = window.preact;
const { Router } = window.preactRouter;
const { createHashHistory } = window.History;

const Header = () => (
  <header className="jumbotron mt-3 py-2 mb-4">
    <h2>Mongoose OS Smart Light</h2>
  </header >
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
    <h3 className="mb-3">My devices <a href="/provision" className="ml-3 btn btn-danger text-white float-right">Add device</a></h3>
    <div className="list-group">
      <Device name="device_1" />
      <Device name="device_2" />
    </div>
  </div>
);

const Provision = ({ }) => (
  <div>
    <div><a href="/">&larr; back to device list</a></div>
    <h4>Provision New Device</h4>
    <div className="my-2 alert alert-info small">
      In order to provision new device, go to your mobile phone settings
      and join the WiFi network with prefix "MongooseOS".
      After that, click on the "Add Device" button below,
      and switch back to your home WiFi network.
    </div>
    <button>
      Add New Device
    </button>
  </div>
);

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
          <Provision path="/provision" title="Add New Device" />
        </Router>
      </div >
    )
  }
};

render(<App />, document.body);

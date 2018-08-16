/** @jsx h */
const { h, render, Component } = window.preact;
const { Router } = window.preactRouter;
const { createHashHistory } = window.History;

const Header = () => (
  <header className="jumbotron mt-3 py-2 mb-4">
    <h2>Mongoose OS Smart Light</h2>
  </header >
);

const DeviceList = ({ }) => (
  <div>
    <h3 className="mb-3">My devices <a className="ml-3 btn btn-danger text-white float-right">Add device</a></h3>
    <ul className="list-group">
      <li className="list-group-item">device 1
      <div className="onoffswitch d-inline-block ml-4">
          <input type="checkbox" name="onoffswitch" className="onoffswitch-checkbox" id="myonoffswitch" />
          <label className="onoffswitch-label py-0 my-0" for="myonoffswitch">
            <span className="onoffswitch-inner"></span>
            <span className="onoffswitch-switch"></span>
          </label>
        </div>
      </li>
      <li className="list-group-item">device 2</li>
    </ul>
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
        </Router>
      </div >
    )
  }
};

render(<App />, document.body);

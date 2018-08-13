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
    <h3>My devices <a className="ml-3 btn btn-danger text-white">Add</a></h3>
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

const Login = () => (
  <div className="mt-5">
    <input
      type="text"
      className="form-control mb-2 login-input-email"
      placeholder="Email"
    />
    <input
      type="password"
      className="form-control mb-2 login-input-password"
      placeholder="Password"
      onChange={() => document.querySelector('.login-input-submit').click()}
    />
    <button
      className="btn btn-danger btn-block mb-1 login-input-submit"
      onClick={() => {
        const email = document.querySelector('.login-input-email');
        const password = document.querySelector('.login-input-password');
        const ev = email.value;
        const pv = password.value;
        email.value = '';
        password.value = '';
        dash.login(ev, pv).then(() => route('/'));
      }}
    >
      Sign In
    </button>
    <hr />
    Not registered yet? Please <a href="/signup">Sign Up</a>
  </div>
);

const Signup = () => (
  <div>
    <div className="my-2  "><a href="/">&larr; back to login</a></div>

    <input
      type="text"
      className="form-control mb-2 login-input-email"
      placeholder="Email"
    />
    <input
      type="password"
      className="form-control mb-2 login-input-password"
      placeholder="Password"
      onChange={() => document.querySelector('.login-input-submit').click()}
    />
    <button
      className="btn btn-danger btn-block mb-1 login-input-submit"
      onClick={() => {
        const email = document.querySelector('.login-input-email');
        const password = document.querySelector('.login-input-password');
        const ev = email.value;
        const pv = password.value;
        email.value = '';
        password.value = '';
        dash.login(ev, pv).then(() => route('/'));
      }}
    >
      Sign Up
    </button>
  </div>
);

class App extends Component {
  render({ }, { }) {
    return (
      <div className="container-fluid" style={{ 'max-width': '480px' }}>
        <Header />
        <Router history={createHashHistory()} onChange={e => { this.currentUrl = e.url }}>
          <Login default path="/" />
          <Signup path="/signup" title="Sign Up" />
          <DeviceList path="/devices" title="Device List" />
        </Router>
      </div >
    )
  }
};

render(<App />, document.body);

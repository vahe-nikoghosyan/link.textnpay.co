import {
    BrowserRouter as Router,
    Switch,
    Route,
} from 'react-router-dom'
import './App.scss';
import SmallLogoSvg from './images/small-logo.svg';
import Form from "./form/Form";
import Coupon from "./coupon/Coupon";
import {auth} from "./firebase";

import {io} from "socket.io-client";
import {useEffect} from "react";


const App = () => {

    useEffect(() => {
    }, []);

  return (
      <Router>
          <div className="App">
              <header className="App-header">
                  <img src={SmallLogoSvg} alt='small logo' />
              </header>
              <Switch>
                  <Route path={'/magic-link'}>
                        <Form auth={auth} />
                  </Route>
                  <Route path={'/coupon'}>
                      <Coupon />
                  </Route>
              </Switch>
          </div>
      </Router>
  );
}

export default App;

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

const ENDPOINT = "ws://localhost:3000?userId=256";
const socket = io(ENDPOINT, {transports: ['websocket']});
const App = () => {

    useEffect(() => {
        console.log('trying ...')


        socket.on('transaction', function(msg){
            console.log('transaction msg', msg);
        });
        socket.on(`${256}`, function(msg){
            console.log('transaction msg', msg);
        });
        // const socket = socketIOClient(ENDPOINT);
        // socket.on("connection", (sok) => {
        //     console.log('connected', sok);
        // })
        // console.log(socket, 'soket')
        //
        // socket.on('transaction', function(msg){
        //     console.log('transaction msg', msg);
        // });

        // socket.emit('transaction', 'gago')

        // return () => socket.disconnect() // unmount
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

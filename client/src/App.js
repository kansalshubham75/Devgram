import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Landing from './components/layout/Landing';
import Login from './components/auth/Login';
import Register from './components/auth/Register';

import {Provider} from 'react-redux';
import store from './store';
import Alert from './components/layout/Alert'

const App = () => (
    <Provider store={store}>
    <Router>
      <div className="App">
        <Navbar />
        <Route exact path='/' component={Landing} />
        <section className="container">
        <Alert/>
          <Switch>
            <Route exact path="/register" component={Register}/>
            <Route exact path="/login" component={Login}/>
          </Switch>
        </section>
      </div>
    </Router>
    </Provider>
);

export default App;

import logo from './logo.svg';
import './App.css';
import React,{Fragment} from 'react';
import Landing from './components/layouts/Landing'
import Navbar from './components/layouts/Navbar'
import Login from './components/auth/Login'
import Register from './components/auth/Register'
//redux
import {Provider} from 'react-redux'
import store from './store'
import {BrowserRouter as Router,Route,Switch} from 'react-router-dom'
import Alert from './components/layouts/Alert';
function App() {
  return (
  <Provider store={store}>
     <Router>
     <Fragment>
     <Navbar/> 
     <Route exact path='/' component={Landing}/>
    <section className="container">
    <Alert />
     <Switch>
       <Route exact path='/login' component={Login}/>
       <Route exact path='/register' component={Register}/>
     </Switch>
    </section>
   </Fragment>
   </Router>
  </Provider>
  );
}

export default App;

import React from 'react';
import './App.css';
import Navbar from './components/Navbar';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { ToastProvider, useToasts } from 'react-toast-notifications';
import Home from './pages/Home';
import Employees from './pages/Employees';
import Messages from './pages/Messages';

function App() {
  return (
    <ToastProvider>
      <Router>
        <Navbar/>
        <Switch>
          <Route path='/' exact component={Home} />
          <Route path='/employees' component={Employees} />
          <Route path='/messages' component={Messages} />
        </Switch>
      </Router>
    </ToastProvider>
  );
}

export default App;

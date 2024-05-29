import React from 'react';
import logo from './logo.svg';
import './App.css';
import Authun from './components/Authun';
import Aiueoto from './components/Aiueoto';
import Login from './components/Login';
import AddTabacco from './components/AddTabacco';
import Home from './components/Home';
import TaskManager from './components/TaskManager';
import { BrowserRouter as Router, Route, Routes  } from 'react-router-dom';
import Bath from './components/Bath_aki';
import FoodAki from './components/Food_Aki';
import LaunAki from './components/Laun_Aki';
import Aki_Sleep from './components/Sleep_Aki';
import Aki_Smoke from './components/Smoke_Aki';

function App() {
  return (
    <Router>
       <Routes>
          <Route path="/home" Component={Home} />
          <Route path="/signup" Component={Authun} />
          <Route path="/" Component={Login} />
          <Route path="/admin" Component = {AddTabacco}/>
          <Route path="/task" Component = {TaskManager} />
          <Route path="/bath" Component = {Bath} /> 
          <Route path="/food" Component = {FoodAki}  />
          <Route path="/laun" Component = {LaunAki} />
          <Route path="/sleep" Component = {Aki_Sleep} />
          <Route path="/smoke" Component= {Aki_Smoke} />
        </Routes>
    </Router>

  );
}
 
export default App;

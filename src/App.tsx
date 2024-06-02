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
import Bur_Home from './components/Bur_Home';
import Header from './components/Header';
import Footer from './components/Footer';
import EventCalendar from './components/calendar';
import ToDo from './components/todo';

function App() {
  return (
    <Router>
      <Header />
      <div style={{ paddingTop: '-10px', paddingBottom: '8px' }}> 
       <Routes>
          <Route path="/home" Component={Bur_Home} />
          <Route path="/signup" Component={Authun} />
          <Route path="/" Component={Login} />
          <Route path="/admin" Component = {AddTabacco}/>
          <Route path="/task" Component = {TaskManager} />
          <Route path="/bath" Component = {Bath} /> 
          <Route path="/food" Component = {FoodAki}  />
          <Route path="/laun" Component = {LaunAki} />
          <Route path="/sleep" Component = {Aki_Sleep} />
          <Route path="/smoke" Component= {Aki_Smoke} />
          <Route path="/calendar" Component= {EventCalendar} />
          <Route path="/todo" Component= {ToDo} />
        </Routes>
        </div>
      <Footer />
    </Router>

  );
}
 
export default App;

import React from 'react';
import './App.css';
import Authun from './components/Authun';
import Aiueoto from './components/Aiueoto';
import Login from './components/Login';
import AddTabacco from './components/AddTabacco';
import Home from './components/Home';
import TaskManager from './components/TaskManager';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
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
import Memories from './components/memories';

function App() {
  return (
    <Router>
      <Header />
      <div className="app-content">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/home" element={<Bur_Home />} />
          <Route path="/signup" element={<Authun />} />
          <Route path="/admin" element={<AddTabacco />} />
          <Route path="/task" element={<TaskManager />} />
          <Route path="/bath" element={<Bath />} />
          <Route path="/food" element={<FoodAki />} />
          <Route path="/laun" element={<LaunAki />} />
          <Route path="/sleep" element={<Aki_Sleep />} />
          <Route path="/smoke" element={<Aki_Smoke />} />
          <Route path="/calendar" element={<EventCalendar />} />
          <Route path="/todo" element={<ToDo />} />
          <Route path="/memories" Component= {Memories} />
      <ConditionalFooter />
    </Router>
  );
}

function ConditionalFooter() {
  const location = useLocation();
  const footerPaths = ['/home', '/calendar', '/todo']; // フッターを表示するパスを指定

  if (!footerPaths.includes(location.pathname)) {
    return null;
  }

  return <Footer />;
}

export default App;

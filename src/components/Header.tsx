import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';

const Header: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // ログアウト処理を実装します
    localStorage.removeItem('userToken'); // 例としてトークンを削除
    navigate('/');
    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', function () {
      window.history.pushState(null, '', window.location.href);
    });
  };
  return (
    <header className="header">
      <IconButton edge="start" color="inherit" aria-label="menu" className="menu-button">
        <MenuIcon />
      </IconButton>
      <h1 className="title">BurgerLendar</h1>
      <IconButton edge="end" color="inherit" aria-label="logout" onClick={handleLogout} className="logout-button">
        <ExitToAppIcon />
      </IconButton>
    </header>
  );
};

export default Header;

import React from 'react';
import { AppBar, Toolbar, Typography, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';

const Header: React.FC = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <IconButton edge="start" color="inherit" aria-label="menu">
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" style={{ flexGrow: 1 }}>
          BurgerLendar
        </Typography>
        <IconButton edge="end" color="inherit" aria-label="burger">
          <EmojiEmotionsIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export default Header;

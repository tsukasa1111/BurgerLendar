import React from 'react';
import { BottomNavigation, BottomNavigationAction } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import EventIcon from '@mui/icons-material/Event';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import MemoryIcon from '@mui/icons-material/Memory';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';

const Footer: React.FC = () => {
  const navigate = useNavigate();
  const [value, setValue] = React.useState(0);

  const handleChange = (newValue: number) => {
    setValue(newValue);
    switch (newValue) {
      case 0:
        navigate('/home');
        break;
      case 1:
        navigate('/calendar');
        break;
      case 2:
        navigate('/todo');
        break;
      case 3:
        navigate('/memories');
        break;
      case 4:
        navigate('/burger');
        break;
      default:
        navigate('/home');
        break;
    }
  };

  return (
    <BottomNavigation
      value={value}
      onChange={(event, newValue) => handleChange(newValue)}
      showLabels
    >
      <BottomNavigationAction label="Home" icon={<HomeIcon />} />
      <BottomNavigationAction label="Calendar" icon={<EventIcon />} />
      <BottomNavigationAction label="ToDo" icon={<CheckCircleIcon />} />
      <BottomNavigationAction label="Memories" icon={<MemoryIcon />} />
      <BottomNavigationAction label="Burger" icon={<EmojiEmotionsIcon />} />
    </BottomNavigation>
  );
};

export default Footer;

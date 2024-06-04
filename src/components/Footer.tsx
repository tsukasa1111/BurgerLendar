import React from 'react';
import { BottomNavigation, BottomNavigationAction } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import EventIcon from '@mui/icons-material/Event';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import MemoryIcon from '@mui/icons-material/Memory';
import MemoryOutlinedIcon from '@mui/icons-material/MemoryOutlined';

const Footer: React.FC = () => {
  const navigate = useNavigate();
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
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
        navigate('/profile');
        break;
      default:
        navigate('/mode-selector');
        break;
    }
  };

  return (
    <BottomNavigation
      value={value}
      onChange={handleChange}
      showLabels
      style={{ width: '100%', height: '60px', backgroundColor: '#fff' }}
      className="bottom-navigation"
    >
      <BottomNavigationAction
        label="Home"
        icon={value === 0 ? <HomeIcon /> : <HomeOutlinedIcon />}
        className={`nav-action ${value === 0 ? 'selected' : ''}`}
      />
      <BottomNavigationAction
        label="Calendar"
        icon={value === 1 ? <EventIcon /> : <EventOutlinedIcon />}
        className={`nav-action ${value === 1 ? 'selected' : ''}`}
      />
      <BottomNavigationAction
        label="ToDo"
        icon={value === 2 ? <CheckCircleIcon /> : <CheckCircleOutlineIcon />}
        className={`nav-action ${value === 2 ? 'selected' : ''}`}
      />
      <BottomNavigationAction
        label="Memories"
        icon={value === 3 ? <MemoryIcon /> : <MemoryOutlinedIcon />}
        className={`nav-action ${value === 3 ? 'selected' : ''}`}
      />
      <BottomNavigationAction
        label="MyPage"
        icon={<span role="img" aria-label="burger">🍔</span>}
        className={`nav-action ${value === 4 ? 'selected' : ''}`}
      />
    </BottomNavigation>
  );
};

export default Footer;

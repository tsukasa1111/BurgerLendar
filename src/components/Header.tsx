import React, { useState, useEffect, useRef } from 'react';
import { AppBar, Tabs, Tab, Dialog, IconButton, Grid, Toolbar, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import { DataSet, Network, Node, Edge, Data } from 'vis-network/standalone/esm/vis-network';
import burgerIcon from './11543-removebg-preview.png'; // 画像のパスを指定

const Header: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [tabValue, setTabValue] = useState(1); // 最初にコレクションタブを表示
  const [nodes, setNodes] = useState<Node[]>([
    { id: 0, label: '0', shape: 'image', image: burgerIcon, size: 50 },
    { id: 1, label: '1', shape: 'image', image: burgerIcon, size: 50 },
    { id: 2, label: '2', shape: 'image', image: burgerIcon, size: 50 },
    { id: 3, label: '3', shape: 'image', image: burgerIcon, size: 50 },
    { id: 4, label: '4', shape: 'image', image: burgerIcon, size: 50 },
    { id: 5, label: '5', shape: 'image', image: burgerIcon, size: 50 },
    { id: 6, label: '6', shape: 'image', image: burgerIcon, size: 50 },
    { id: 7, label: '7', shape: 'image', image: burgerIcon, size: 50 }
  ]);
  const [edges, setEdges] = useState<Edge[]>([
    { from: 0, to: 3 },
    { from: 0, to: 5 },
    { from: 1, to: 4 },
    { from: 1, to: 6 },
    { from: 2, to: 4 },
    { from: 2, to: 7 },
    { from: 3, to: 7 },
    { from: 4, to: 6 },
    { from: 5, to: 7 },
    { from: 6, to: 7 }
  ]);
  const [newFriendId, setNewFriendId] = useState(8);
  const [selectedNodes, setSelectedNodes] = useState<number[]>([]);
  const [selectedImages, setSelectedImages] = useState<number[]>([]);
  const networkRef = useRef<HTMLDivElement>(null);
  const networkInstance = useRef<Network | null>(null);

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    navigate('/');
    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', () => {
      window.history.pushState(null, '', window.location.href);
    });
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setTabValue(newValue);
  };

  const handleAddFriend = () => {
    setNodes(prevNodes => [
      ...prevNodes,
      { id: newFriendId, label: `${newFriendId}`, shape: 'image', image: burgerIcon, size: 50 }
    ]);
    setNewFriendId(prevId => prevId + 1);
  };

  const handleNodeSelect = (params: any) => {
    if (params.nodes.length === 1) {
      setSelectedNodes(prevSelected => {
        const newSelected = [...prevSelected, params.nodes[0]];
        return newSelected.length > 2 ? newSelected.slice(-2) : newSelected;
      });
    }
  };

  const handleConnect = () => {
    if (selectedNodes.length === 2) {
      setEdges(prevEdges => [
        ...prevEdges,
        { from: selectedNodes[0], to: selectedNodes[1] }
      ]);
      setSelectedNodes([]);
    }
  };

  const handleImageClick = (id: number) => {
    setSelectedImages(prevSelected => {
      const newSelected = [...prevSelected, id];
      return newSelected.length > 2 ? newSelected.slice(-2) : newSelected;
    });
  };

  const collections = [
    { id: 1, image: burgerIcon },
    { id: 2, image: burgerIcon },
    // More icons
  ];

  useEffect(() => {
    if (networkRef.current && tabValue === 0) {
      const data: Data = { nodes: new DataSet(nodes), edges: new DataSet(edges) };
      const options = {
        nodes: {
          shape: 'dot',
          size: 50,
          color: {
            border: '#2B7CE9',
            background: '#2B7CE9',
            highlight: {
              border: '#2B7CE9',
              background: '#D2E5FF'
            },
            hover: {
              border: '#2B7CE9',
              background: '#D2E5FF'
            }
          },
          font: { color: '#ffffff' }
        },
        edges: {
          color: '#848484',
          smooth: true
        },
        physics: {
          enabled: true,
          barnesHut: {
            gravitationalConstant: -2000,
            centralGravity: 0.3,
            springLength: 95,
            springConstant: 0.04,
            damping: 0.09
          }
        }
      };

      networkInstance.current = new Network(networkRef.current, data, options);
      networkInstance.current.on('selectNode', handleNodeSelect);
    }
  }, [tabValue, nodes, edges]);

  useEffect(() => {
    if (networkInstance.current) {
      const updatedNodes = nodes.map(node => ({
        ...node,
        color: selectedNodes.includes(node.id as number) ? '#FF0000' : '#2B7CE9'
      }));
      networkInstance.current.setData({
        nodes: new DataSet(updatedNodes),
        edges: new DataSet(edges)
      });
    }
  }, [selectedNodes, nodes, edges]);

  return (
    <header className="header">
      <IconButton edge="start" color="inherit" aria-label="menu" className="menu-button" onClick={handleOpen}>
        <MenuIcon />
      </IconButton>
      <h1 className="title" style={{ color: 'white' }}>BurgerLendar</h1>
      <IconButton edge="end" color="inherit" aria-label="logout" onClick={handleLogout} className="logout-button">
        <ExitToAppIcon />
      </IconButton>
      <Dialog
        open={open}
        onClose={handleClose}
        fullScreen
        PaperProps={{ style: { margin: 0, width: '100%', height: '100%' } }}
      >
        <AppBar position="static">
          <Toolbar>
            <IconButton edge="start" color="inherit" onClick={handleClose} aria-label="close">
              <CloseIcon />
            </IconButton>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="simple tabs example" style={{ color: 'white' }}>
              <Tab label="Friends" style={{ color: 'white' }} />
              <Tab label="Collection" style={{ color: 'white' }} />
            </Tabs>
          </Toolbar>
        </AppBar>
        {tabValue === 0 && (
          <div style={{ padding: 20 }}>
            <Button variant="contained" color="primary" startIcon={<SearchIcon />} onClick={handleAddFriend} style={{ color: 'white', marginRight: 10 }}>
              Add Friend
            </Button>
            <Button variant="contained" color="secondary" onClick={handleConnect} style={{ color: 'white' }}>
              Connect
            </Button>
            <div style={{ height: '80vh', marginTop: 20 }} ref={networkRef} />
          </div>
        )}
        {tabValue === 1 && (
          <Grid container spacing={2} style={{ padding: 20 }}>
            {collections.map((item: { id: number; image: string }) => (
              <Grid item xs={6} key={item.id} onClick={() => handleImageClick(item.id)}>
                <div style={{ border: selectedImages.includes(item.id) ? '5px solid red' : 'none', padding: '5px' }}>
                  <img src={item.image} alt={`Icon ${item.id}`} style={{ width: '100%' }} />
                </div>
              </Grid>
            ))}
          </Grid>
        )}
      </Dialog>
    </header>
  );
};

export default Header;

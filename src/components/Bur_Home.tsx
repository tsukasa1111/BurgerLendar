import React from 'react';
import ReactDOM from 'react-dom';
import { Button, Container, Grid, TextField, Typography, Box, MenuItem, FormControlLabel, Checkbox } from "@mui/material";
import { auth } from "../firebase/firebase";
import { useNavigate } from "react-router-dom"; // useNavigateをインポート

const Home: React.FC = () => {
  const events = [
    { time: '8:30', title: 'event 1' },
    { time: '11:00', title: 'event 2' },
  ];

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Today's schedule</h1>
      <div style={styles.schedule}>
        <div style={styles.headerRow}>
          <div style={styles.headerCell}>Sun 5/19</div>
        </div>
        <div style={styles.scheduleContent}>
          {Array.from({ length: 24 }, (_, i) => i).map(hour => (
            <div style={styles.row} key={hour}>
              <div style={styles.timeCell}>{hour % 12 === 0 ? 12 : hour % 12}{hour < 12 ? 'am' : 'pm'}</div>
              <div style={styles.eventCell}>
                {events.map((event, index) =>
                  parseInt(event.time.split(':')[0], 10) === hour ? (
                    <div key={index} style={styles.event}>
                      {event.time} {event.title}
                    </div>
                  ) : null
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    backgroundColor: '#F9ECCB',
    color: '#000',
    textAlign: 'center' as 'center',
  },
  title: {
    fontSize: '1.5em',
    marginBottom: '20px',
  },
  schedule: {
    width: '90%',
    maxWidth: '400px',
    backgroundColor: '#fff',
    border: '1px solid #ddd',
    borderRadius: '10px',
    overflow: 'hidden',
  },
  headerRow: {
    display: 'flex',
    backgroundColor: '#f5f5f5',
    borderBottom: '1px solid #ddd',
    justifyContent: 'center' as 'center',
  },
  headerCell: {
    flex: '1',
    padding: '10px',
    textAlign: 'center' as 'center',
    fontWeight: 'bold' as 'bold',
  },
  scheduleContent: {
    maxHeight: '70vh', // Adjust as needed
    overflowY: 'scroll' as 'scroll',
  },
  row: {
    display: 'flex',
    borderBottom: '1px solid #ddd',
  },
  timeCell: {
    flex: '1',
    padding: '10px',
    textAlign: 'center' as 'center',
    borderRight: '1px solid #ddd',
  },
  eventCell: {
    flex: '3',
    padding: '10px',
    position: 'relative' as 'relative',
  },
  event: {
    position: 'absolute' as 'absolute',
    width: '100%',
    backgroundColor: '#add8e6',
    borderRadius: '5px',
    padding: '5px',
    textAlign: 'center' as 'center',
  },
};

ReactDOM.render(<Home />, document.getElementById('root'));

export default Home;

import React, { useState } from 'react';

const ToDo: React.FC = () => {
  const [items, setItems] = useState<string[]>(['スーパーへ行く']);
  const [newItem, setNewItem] = useState<string>('');

  const handleAddItem = () => {
    if (newItem.trim() !== '') {
      setItems([...items, newItem.trim()]);
      setNewItem('');
    }
  };

  const handleNewItemChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewItem(event.target.value);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, idx) => idx !== index));
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>To do list</h1>
      <ul style={styles.list}>
        {items.map((item, index) => (
          <li key={index} style={styles.listItem}>
            <img src="https://thumb.ac-illust.com/36/36ac3e42b8ed38dce15bc0ad7c5e9a1c_t.jpeg" width={50} height={50} alt="hamburger-icon" style={styles.icon} />
            {item}
            <button onClick={() => handleRemoveItem(index)} style={styles.removeButton}>Remove</button>
          </li>
        ))}
        <li style={styles.listItem}>
          <input
            type="text"
            value={newItem}
            onChange={handleNewItemChange}
            placeholder="+Add..."
            style={styles.input}
          />
          <button onClick={handleAddItem} style={styles.addButton}>Add</button>
        </li>
      </ul>
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
  },
  title: {
    fontSize: '2.5em',
    marginBottom: '20px',
  },
  list: {
    listStyleType: 'none' as 'none',
    padding: '0',
    width: '80%',
    maxWidth: '400px',
  },
  listItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 0',
    borderBottom: '1px solid #ddd',
  },
  icon: {
    marginRight: '10px',
  },
  input: {
    flex: '1',
    padding: '5px',
    border: '1px solid #ddd',
    borderRadius: '5px',
  },
  addButton: {
    marginLeft: '10px',
    padding: '5px 10px',
    border: 'none',
    borderRadius: '5px',
    backgroundColor: '#003366',
    color: '#F9ECCB',
    cursor: 'pointer',
  },
  removeButton: {
    marginLeft: '10px',
    padding: '5px 10px',
    border: 'none',
    borderRadius: '5px',
    backgroundColor: '#CC3333',
    color: 'white',
    cursor: 'pointer',
  }
};

export default ToDo;
/*
const root=document.getElementById('root');
ReactDOM.createRoot(root).render(<App />);
*/
import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { db, auth } from '../firebase/firebase'; // Adjust the import based on your file structure
import { collection, addDoc, getDocs, deleteDoc, doc, query, writeBatch } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { CSSProperties } from 'react'; // Import CSSProperties from react
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import EventIcon from '@mui/icons-material/Event';

interface Item {
  id: string;
  text: string;
  dueDate: string;
}

const ToDo: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [newItem, setNewItem] = useState<string>('');
  const [newDueDate, setNewDueDate] = useState<Date | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchItems(currentUser.uid);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchItems = async (userId: string) => {
    try {
      const q = query(collection(db, "users", userId, "todos"));
      const querySnapshot = await getDocs(q);
      const itemsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Item[];
      setItems(itemsData);
    } catch (error) {
      console.error('Error fetching items: ', error);
    }
  };

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleAddItem = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) {
      alert('User is not authenticated');
      return;
    }
    if (newDueDate) {
      try {
        await addDoc(collection(db, "users", user.uid, "todos"), {
          text: newItem,
          dueDate: formatDate(newDueDate),
        });
        setNewItem('');
        setNewDueDate(null);
        fetchItems(user.uid);
      } catch (error) {
        console.error('Error adding item: ', error);
      }
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!user) {
      alert('ユーザーが認証されていません');
      return;
    }

    try {
      await deleteDoc(doc(db, "users", user.uid, "todos", itemId));
      fetchItems(user.uid);
    } catch (error) {
      console.error('アイテムの削除中にエラーが発生しました: ', error);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.todoTitle}>To do list</h1>
      </div>
      <form onSubmit={handleAddItem} style={styles.addContainer}>
        <input
          type="text"
          value={newItem}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setNewItem(e.target.value)}
          placeholder="+Add..."
          style={styles.input}
          required
        />
        <div style={styles.datePickerContainer}>
          <DatePicker
            selected={newDueDate}
            onChange={(date: Date) => setNewDueDate(date)}
            customInput={<EventIcon style={styles.calendarIcon} />}
            popperClassName="date-picker-popper"
          />
        </div>
        <button
          type="submit"
          style={{
            ...styles.addButton,
            ...(newItem.trim() === '' || newDueDate === null ? styles.addButtonDisabled : {}),
          }}
          disabled={newItem.trim() === '' || newDueDate === null}
        >
          Add
        </button>
      </form>

      <ul style={styles.list}>
        {items.map(item => (
          <li key={item.id} style={styles.listItem}>
            <span>{item.text} (Due: {item.dueDate})</span>
            <button onClick={() => handleDeleteItem(item.id)} style={styles.removeButton}>
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'flex-start',
    height: 'calc(100vh - 120px)',
    backgroundColor: '#F9ECCB',
    color: '#000',
    padding: '20px',
  } as CSSProperties,
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center', // 中央揃え
    width: '100%',
  } as CSSProperties,
  todoTitle: {
    fontSize: '2.5em',
    color: '#003366',
    fontWeight: 'bold',
  } as CSSProperties,
  addContainer: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    marginTop: '10px',
  } as CSSProperties,
  list: {
    listStyleType: 'none' as const,
    padding: '0',
    maxWidth: '100%',
    overflowY: 'scroll' as const,
    maxHeight: 'calc(100vh - 200px)',
    marginTop: '10px',
    width: '100%',
  } as CSSProperties,
  listItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 0',
    borderBottom: '1px solid #ddd',
    width: '100%',
    fontWeight: 'bold',
  } as CSSProperties,
  input: {
    flex: '1',
    width: '150px',
    padding: '5px',
    border: '1px solid #ddd',
    borderRadius: '5px',
  } as CSSProperties,
  datePickerContainer: {
    marginLeft: '10px',
    width: '30px',
  } as CSSProperties,
  calendarIcon: {
    fontSize: '1.5em',
    cursor: 'pointer',
  } as CSSProperties,
  addButton: {
    marginLeft: '10px',
    padding: '5px 10px',
    border: 'none',
    borderRadius: '5px',
    backgroundColor: '#003366',
    color: '#F9ECCB',
    cursor: 'pointer',
  } as CSSProperties,
  addButtonDisabled: {
    backgroundColor: '#A9A9A9',
    cursor: 'not-allowed',
  } as CSSProperties,
  removeButton: {
    marginLeft: '10px',
    padding: '5px 10px',
    border: 'none',
    borderRadius: '5px',
    backgroundColor: '#CC3333',
    color: 'white',
    cursor: 'pointer',
  } as CSSProperties,
};

export default ToDo;

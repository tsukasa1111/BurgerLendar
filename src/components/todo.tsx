import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { db, auth } from '../firebase/firebase'; // Adjust the import based on your file structure
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, writeBatch } from "firebase/firestore";
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
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
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
      const q = query(collection(db, "users", userId, "items"));
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

  const handleAddItem = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) {
      alert('User is not authenticated');
      return;
    }
    if (newDueDate) {
      try {
        await addDoc(collection(db, "users", user.uid, "items"), {
          text: newItem,
          dueDate: newDueDate.toISOString().split('T')[0],
        });
        alert('Item has been added!');
        setNewItem('');
        setNewDueDate(null);
        fetchItems(user.uid);
      } catch (error) {
        console.error('Error adding item: ', error);
        alert('Failed to add item');
      }
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!user) {
      alert('User is not authenticated');
      return;
    }
    try {
      await deleteDoc(doc(db, "users", user.uid, "items", itemId));
      alert('Item has been deleted!');
      fetchItems(user.uid);
    } catch (error) {
      console.error('Error deleting item: ', error);
      alert('Failed to delete item');
    }
  };

  const handleUpdateItems = async () => {
    if (!user) {
      alert('User is not authenticated');
      return;
    }
    try {
      const batch = writeBatch(db); // Updated to use writeBatch
      items.forEach(item => {
        const itemRef = doc(db, "users", user.uid, "items", item.id);
        batch.update(itemRef, {
          text: item.text,
          dueDate: item.dueDate,
        });
      });
      await batch.commit();
      alert('Items have been updated!');
      setIsEditMode(false);
      fetchItems(user.uid);
    } catch (error) {
      console.error('Error updating items: ', error);
      alert('Failed to update items');
    }
  };

  const toggleEditMode = () => {
    if (isEditMode) {
      handleUpdateItems();
    } else {
      setIsEditMode(true);
    }
  };

  const calculateDaysLeft = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const timeDiff = due.getTime() - today.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  };

  const getDueDateStyle = (daysLeft: number) => {
    if (daysLeft <= 0) {
      return { color: 'red' };
    } else if (daysLeft <= 3) {
      return { color: 'red' };
    } else if (daysLeft <= 10) {
      return { color: 'orange' };
    } else {
      return { color: 'black' };
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>To do list</h1>
        <button
          onClick={toggleEditMode}
          style={{
            ...styles.editButton,
            ...(newItem.trim() !== '' && newDueDate !== null ? styles.editButtonDisabled : {}),
          }}
          disabled={newItem.trim() !== '' && newDueDate !== null}
        >
          {isEditMode ? 'Save' : 'Edit'}
        </button>
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
        {items.map((item, index) => {
          const daysLeft = calculateDaysLeft(item.dueDate);
          return (
            <li key={index} style={styles.listItem}>
              <img
                src="https://thumb.ac-illust.com/36/36ac3e42b8ed38dce15bc0ad7c5e9a1c_t.jpeg"
                width={50}
                height={50}
                alt="hamburger-icon"
                style={styles.icon}
              />
              {isEditMode ? (
                <>
                  <input
                    type="text"
                    value={item.text}
                    onChange={(e) => {
                      const updatedItems = items.map(it =>
                        it.id === item.id ? { ...it, text: e.target.value } : it
                      );
                      setItems(updatedItems);
                    }}
                    style={styles.input}
                  />
                  <div style={styles.datePickerContainer}>
                  <DatePicker
                  selected={newDueDate}
                  onChange={(date: Date) => setNewDueDate(date)}
                  customInput={<EventIcon style={styles.calendarIcon} />}
                  popperClassName="date-picker-popper"
                  />

                  </div>
                  <button onClick={() => handleDeleteItem(item.id)} style={styles.removeButton}>
                    Delete
                  </button>
                </>
              ) : (
                <>
                  <span>{item.text}</span>
                  {item.dueDate && (
                    <span style={{ ...styles.dueDate, ...getDueDateStyle(daysLeft) }}>
                      {daysLeft < 0 ? ' (Past Due)' : ` (Due in ${daysLeft} days)`}
                    </span>
                  )}
                </>
              )}
            </li>
          );
        })}
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
    justifyContent: 'space-between',
    width: '100%',
  } as CSSProperties,
  title: {
    fontSize: '2.5em',
    color: '#003366', // Changed text color
    fontWeight: 'bold', // Added bold text
  } as CSSProperties,
  addContainer: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    marginTop: '10px', // Top margin reduced
  } as CSSProperties,
  editButton: {
    padding: '10px 20px',
    width: '80px', // Increased width for consistency
    backgroundColor: '#003366',
    color: '#F9ECCB',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  } as CSSProperties,
  editButtonDisabled: {
    backgroundColor: '#A9A9A9',
    cursor: 'not-allowed',
  } as CSSProperties,
  list: {
    listStyleType: 'none' as const,
    padding: '0',
    maxWidth: '100%', // Fixed width
    overflowY: 'scroll' as const,
    maxHeight: 'calc(100vh - 200px)', // Adjusted for header, footer, and padding
    marginTop: '10px', // Top margin reduced
    width: '100%', // Ensure full width for consistency
  } as CSSProperties,
  listItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between', // Added to space out items
    padding: '10px 0',
    borderBottom: '1px solid #ddd',
    width: '100%',
    fontWeight: 'bold',
  } as CSSProperties,
  icon: {
    marginRight: '10px',
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
    width: '30px', // Set the width of the container to fit the icon
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
  dueDate: {
    marginLeft: '10px',
    textAlign: 'right', // Added to right-align the due date
    flex: '1', // Ensure it takes available space to be right-aligned
  } as CSSProperties,
};

export default ToDo;

import axios from "axios";
import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { db, auth } from "../firebase/firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
  writeBatch,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { CSSProperties } from "react";
import GPT from "./Bur_Home";

interface Item {
  id: string;
  text: string;
  dueDate: string;
}

interface Location {
  latitude: number;
  longitude: number;
}

interface WeatherData {
  name: string;
  main: {
    temp: number;
  };
  weather: {
    description: string;
    icon: string;
  }[];
}

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Item[]>([]);
  const [todos, setTodos] = useState<Item[]>([]);
  const [newTask, setNewTask] = useState<string>("");
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [done, setdone] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null);
  const [selectedMode, setSelectedMode] = useState<string>("");
  const [confirmMode, setConfirmMode] = useState<boolean>(false);
  const [location, setLocation] = useState<Location | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);

  const modes = [
    { id: "relax", label: "ゆるゆる日", icon: "😊", color: "#E48B63" },
    { id: "normal", label: "ふつうの日", icon: "😐", color: "#E48B63" },
    { id: "hard", label: "がんばる日", icon: "😤", color: "#E48B63" },
  ];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchTasks(currentUser.uid);
        fetchTodos(currentUser.uid);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchTasks = async (userId: string) => {
    try {
      const q = query(collection(db, "users", userId, "tasks"));
      const querySnapshot = await getDocs(q);
      const tasksData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        text: doc.data().text,
        dueDate: doc.data().dueDate,
      })) as Item[];
      setTasks(tasksData);
    } catch (error) {
      console.error("Error fetching tasks: ", error);
    }
  };

  const fetchTodos = async (userId: string) => {
    try {
      const today = formatDate(new Date());
      const q = query(
        collection(db, "users", userId, "todos"),
        where("dueDate", "==", today)
      );
      const querySnapshot = await getDocs(q);
      const todosData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        text: doc.data().text,
        dueDate: doc.data().dueDate,
      })) as Item[];
      setTodos(todosData);
    } catch (error) {
      console.error("Error fetching todos: ", error);
    }
  };

  const handleAddTask = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) {
      alert("User is not authenticated");
      return;
    }
    const today = new Date();
    const dueDate = formatDate(today);
    try {
      await addDoc(collection(db, "users", user.uid, "tasks"), {
        text: newTask,
        dueDate,
      });
      setNewTask("");
      fetchTasks(user.uid);
    } catch (error) {
      console.error("Error adding task: ", error);
    }
  };

  const handleDeleteTask = async (itemId: string) => {
    if (!user) {
      alert("User is not authenticated");
      return;
    }

    try {
      await deleteDoc(doc(db, "users", user.uid, "tasks", itemId));
      fetchTasks(user.uid);
    } catch (error) {
      console.error("Error deleting task: ", error);
    }
  };

  const handleDeleteTodo = async (itemId: string) => {
    if (!user) {
      alert("User is not authenticated");
      return;
    }

    try {
      await deleteDoc(doc(db, "users", user.uid, "todos", itemId));
      fetchTodos(user.uid);
    } catch (error) {
      console.error("Error deleting todo: ", error);
    }
  };

  const handleUpdateTasks = async () => {
    if (!user) {
      alert("User is not authenticated");
      return;
    }
    try {
      const batch = writeBatch(db);
      tasks.forEach((task) => {
        const taskRef = doc(db, "users", user.uid, "tasks", task.id);
        batch.update(taskRef, {
          text: task.text,
          dueDate: task.dueDate,
        });
      });
      await batch.commit();
      setIsEditMode(false);
      fetchTasks(user.uid);
    } catch (error) {
      console.error("Error updating tasks: ", error);
    }
  };

  const toggleEditMode = () => {
    if (isEditMode) {
      handleUpdateTasks();
    } else {
      setIsEditMode(true);
    }
  };

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleModeClick = (modeId: string) => {
    setSelectedMode(modeId);
    setConfirmMode(true);
  };

  const handleConfirmClick = (confirm: boolean) => {
    if (confirm && selectedMode) {
      setdone(true);
    }
    setConfirmMode(false);
  };
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });
      },
      (error) => {
        console.error("Geolocation error:", error);
      }
    );
  }, []);

  useEffect(() => {
    if (location) {
      const API_KEY = process.env.REACT_APP_OPENWEATHERMAP_API_KEY;
      const url = `https://api.openweathermap.org/data/2.5/weather?lon=${location.longitude}&lat=${location.latitude}&appid=${API_KEY}&lang=ja&units=metric`;
      axios
        .get<WeatherData>(url)
        .then((response) => {
          setWeatherData(response.data);
        })
        .catch((error) => {
          console.error("Weather data fetching error:", error);
        });
    }
  }, [location]);

  return (
    <div style={styles.container}>
      {done ? (
        // GPTコンポーネントを表示
        <GPT mode={selectedMode} />
      ) : (
        // doneがfalseの場合のUIレンダリング
        <>
          {weatherData ? (
            <div className="weather-container" style={styles.weatherContainer}>
              <div className="weather" style={styles.weather}>
                <div className="weather-info" style={styles.weatherInfo}>
                  <div className="date" style={styles.date}>
                    {/* 日付 */}
                  </div>
                  <div className="temperature" style={styles.temperature}>
                    {weatherData.main.temp} °C
                  </div>
                  <div className="location" style={styles.location}>
                    {weatherData.name} {weatherData.weather[0].description}
                  </div>
                  <div className="weather-icon">
                    <img
                      src={`https://openweathermap.org/img/wn/${weatherData.weather[0].icon}.png`}
                      alt={weatherData.weather[0].description}
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p>Loading...</p>
          )}

          <div style={styles.header}>
            <h1 style={styles.todoTitle}>To do list</h1>
          </div>
          <form onSubmit={handleAddTask} style={styles.addContainer}>
            <input
              type="text"
              value={newTask}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setNewTask(e.target.value)
              }
              placeholder="+Add..."
              style={styles.input}
              required
            />
            <button
              type="submit"
              style={
                newTask.trim() === ""
                  ? styles.addButtonDisabled
                  : styles.addButton
              }
              disabled={newTask.trim() === ""}
            >
              Add
            </button>
          </form>

          <ul style={styles.list}>
            {tasks.map((task) => (
              <li key={task.id} style={styles.listItem}>
                <span>
                  {task.text} (Due: {task.dueDate})
                </span>
                <button
                  onClick={() => handleDeleteTask(task.id)}
                  style={styles.removeButton}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>

          <ul style={styles.list}>
            {todos.map((todo) => (
              <li key={todo.id} style={styles.listItem}>
                <span>
                  {todo.text} (Due: {todo.dueDate})
                </span>
                <button
                  onClick={() => handleDeleteTodo(todo.id)}
                  style={styles.removeButton}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>

          <div className="mode-selection" style={styles.modeSelection}>
            <div className="title" style={styles.title}>
              モード選択...
            </div>
            <div className="modes" style={styles.modes}>
              {modes.map((mode) => (
                <div
                  key={mode.id}
                  className={`mode ${selectedMode === mode.id ? "selected" : ""}`}
                  style={
                    selectedMode === mode.id
                      ? { ...styles.mode, ...styles.selectedMode }
                      : styles.mode
                  }
                  onClick={() => handleModeClick(mode.id)}
                >
                  <div className="icon" style={styles.icon}>
                    {mode.icon}
                  </div>
                  <div className="label" style={styles.label}>
                    {mode.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {confirmMode && (
            <div className="confirmation" style={styles.confirmation}>
              <div
                className="confirmation-text"
                style={styles.confirmationText}
              >
                {modes.find((mode) => mode.id === selectedMode)?.label}
                モードでいいか？
              </div>
              <div
                className="confirmation-buttons"
                style={styles.confirmationButtons}
              >
                <button
                  onClick={() => handleConfirmClick(true)}
                  style={styles.button}
                >
                  Yes
                </button>
                <button
                  onClick={() => handleConfirmClick(false)}
                  style={styles.button}
                >
                  No
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const styles: { [key: string]: CSSProperties } = {
  app: {
    fontFamily: "Arial, sans-serif",
    padding: "20px",
    backgroundColor: "#F9ECCB",
    color: "#333",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  weatherContainer: {
    backgroundColor: "#F9ECCB",
    padding: "10px",
    borderRadius: "8px",
    display: "flex",
    justifyContent: "center",
    width: "100%",
    maxWidth: "500px",
    marginBottom: "20px",
  },
  weather: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    width: "100%",
  },
  weatherInfo: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
  },
  date: {
    fontSize: "14px",
    textAlign: "right",
  },
  temperature: {
    fontSize: "20px",
    fontWeight: "bold",
    textAlign: "right",
  },
  location: {
    fontSize: "14px",
    textAlign: "right",
  },
  weatherIcon: {
    fontSize: "32px",
  },
  container: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "flex-start",
    backgroundColor: "#F9ECCB",
    color: "#000",
    padding: "20px",
    width: "100%",
    maxWidth: "500px",
    minHeight: "100vh",
    marginBottom: "20px",
  } as CSSProperties,
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  } as CSSProperties,
  todoTitle: {
    fontSize: "2.5em",
    color: "#003366",
    fontWeight: "bold",
  } as CSSProperties,
  addContainer: {
    display: "flex",
    alignItems: "center",
    width: "100%",
    marginTop: "10px",
  } as CSSProperties,
  list: {
    listStyleType: "none" as const,
    padding: "0",
    maxWidth: "100%",
    overflowY: "scroll" as const,
    maxHeight: "calc(100vh - 200px)",
    marginTop: "10px",
    width: "100%",
  } as CSSProperties,
  listItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 0",
    borderBottom: "1px solid #ddd",
    width: "100%",
    fontWeight: "bold",
  } as CSSProperties,
  input: {
    flex: "1",
    width: "150px",
    padding: "5px",
    border: "1px solid #ddd",
    borderRadius: "5px",
  } as CSSProperties,
  addButton: {
    marginLeft: "10px",
    padding: "5px 10px",
    border: "none",
    borderRadius: "5px",
    backgroundColor: "#003366",
    color: "#F9ECCB",
    cursor: "pointer",
  } as CSSProperties,
  addButtonDisabled: {
    backgroundColor: "#A9A9A9",
    cursor: "not-allowed",
  } as CSSProperties,
  removeButton: {
    marginLeft: "10px",
    padding: "5px 10px",
    border: "none",
    borderRadius: "5px",
    backgroundColor: "#CC3333",
    color: "white",
    cursor: "pointer",
  } as CSSProperties,
  dueDate: {
    marginLeft: "10px",
    textAlign: "right",
    flex: "1",
  } as CSSProperties,
  modeSelection: {
    textAlign: "center",
    width: "100%",
    maxWidth: "500px",
  },
  title: {
    fontSize: "18px",
    fontWeight: "bold",
  },
  modes: {
    display: "flex",
    justifyContent: "space-around",
    marginTop: "10px",
  },
  mode: {
    padding: "10px",
    borderRadius: "8px",
    backgroundColor: "#ccc",
    cursor: "pointer",
    flex: "1",
    margin: "0 5px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  selectedMode: {
    border: "2px solid #333",
  },
  icon: {
    fontSize: "24px",
  },
  label: {
    marginTop: "5px",
    fontSize: "14px",
  },
  confirmation: {
    marginTop: "20px",
    textAlign: "center",
  },
  confirmationText: {
    fontSize: "18px",
    fontWeight: "bold",
  },
  confirmationButtons: {
    marginTop: "10px",
  },
  button: {
    margin: "0 5px",
    padding: "10px 20px",
    fontSize: "16px",
    borderRadius: "8px",
    cursor: "pointer",
    border: "none",
    backgroundColor: "#333",
    color: "#fff",
  },
};

export default App;

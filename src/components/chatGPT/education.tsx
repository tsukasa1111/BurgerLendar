import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import {
  collection,
  doc,
  setDoc,
  serverTimestamp,
  getDocs,
  getDoc,
  query,
  where,
} from "firebase/firestore";
import {
  Quote,
  MotivationQuotes,
  NonMotivationQuotes,
  DefoMotivationQuotes,
} from "./loading/data";
import { auth, db } from "../../firebase/firebase"; // Import the initialized Firestore instance
import { onAuthStateChanged } from "firebase/auth";
import Home from "./home";
import axios from "axios";
import { CSSProperties } from "react";
import { set } from "date-fns";

interface Item {
  id: string;
  text: string;
  dueDate: string;
}

interface EduProps {
  setOutput: (output: string) => void;
  mode: string; // Add mode to the props interface
}
interface ScheduledTask {
  Title: string;
  deadline: string;
}
interface Event {
  id: string;
  name: string;
  date: string;
}
interface aki {
  bath: string[];
  food: string[];
  laun: number;
  laundry: number;
  sleep: number;
  smoke: number;
}

const Edu: React.FC<EduProps> = ({ setOutput, mode }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [scheduleTasks, setScheduleTasks] = useState<ScheduledTask[]>([]);
  

  const [Aki, setAki] = useState<aki>({
    bath: [],
    food: [],
    laun: 0,
    laundry: 0,
    sleep: 0,
    smoke: 0,
  });

  const [out, setout] = useState<string>("");
  const [user, setUser] = useState<any>(null);
  const [userName, setUserName] = useState<any>(null);
  const [quote, setQuote] = useState<Quote | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

      } 
      

    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!user) {
      console.log("User is not authenticated or not available.");
      return; // ユーザーがいない場合は早期リターン
    }
    if (mode === "relax") {
      const randomQuote =
        NonMotivationQuotes[
          Math.floor(Math.random() * NonMotivationQuotes.length)
        ];
      setQuote(randomQuote);
      return;
    }
    if (mode === "normal") {
      const randomQuote =
        DefoMotivationQuotes[
          Math.floor(Math.random() * DefoMotivationQuotes.length)
        ];
      setQuote(randomQuote);
      return;
    }
    if (mode === "hard") {
      const randomQuote =
        MotivationQuotes[Math.floor(Math.random() * MotivationQuotes.length)];
      setQuote(randomQuote);
      return;
    }
    throw new Error("No such document!");
  }, [user]);

  /////////////////////////////////////////////////////////
  const fetchUserAki = async () => {
    try {
      const docRef = doc(db, "Users_Aki", user.uid);
      const docSnap = await getDoc(docRef);
  
      if (docSnap.exists()) {
        const data = docSnap.data() as aki;
        setAki({
          ...data,
        });
        const docNem = doc(db, "Users", user.uid);
        const docSn = await getDoc(docRef);
        const displayName = docSn.data()?.displayName || "Unknown User";
        setUserName(displayName);
      } else {
        console.log("No such document!");
        setUserName("Unknown User"); // ドキュメントが存在しない場合も安全な値を設定
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
    }
  };
  const fetchEvents = async () => {
    try {
      const eventsRef = collection(db, "users", user.uid, "events");
      
      const q = query(eventsRef);
      const querySnapshot = await getDocs(q);
      const fetchedEvents = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().title,
        date: doc.data().date,
      }));

      setEvents(fetchedEvents);
      // console.log("events:", events);
    } catch (err) {
      throw new Error("Error fetching user data:");
    }
  };
  const fetchtodos = async () => {
    try {
      const eventsRef = collection(db, "users", user.uid, "todos");
      const q = query(eventsRef);
      const querySnapshot = await getDocs(q);
      const fetchedTodos = querySnapshot.docs.map((doc) => ({
        Title: doc.data().text,
        deadline: doc.data().dueDate,
      }));

      setScheduleTasks(fetchedTodos);
      // console.log("todos:", scheduleTasks);
    } catch (err) {
      throw new Error("Error fetching user data:");
    }
  };

  

  useEffect(() => {
    async function fetchData() {
      if (!user) {
        console.log("User is not authenticated or not available.");
        return;
      }
      try {
        await Promise.all([
          fetchUserAki(),
          fetchEvents(),
          fetchtodos(),
        ]);
        console.log('All data fetching complete');
        handleSubmit();
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }
  
    fetchData();
  }, [quote]);

  useEffect(() => {
    if (events.length >= 1 || scheduleTasks.length >= 1 ) {
      handleSubmit();
      console.log("you finished handleSubmit");
    }
  }, []);

  const handleSubmit = async () => {
    const prompt = `
    Given the following schedule items and tasks with their respective start and end times,
    and considering the motivation level for the day (${mode}).
    if (mode) is relax, you can not need to include any other tasks.
    if (mode) is normal, please put in one task that is closest to the due date.
    if (mode) is hard, put in as many tasks as possible in order of due date.
    organize a schedule in the specified format.

    Schedule Items(To be done at a specific time during the day):
    ${events
      .map((item) => `ItemName: ${item.name}, DeadlineDay: ${item.date}`)
      .join("\n")}

    Tasks (To be done at any time during the day):
    - ${scheduleTasks.join("\n- ")}

    Scheduled Tasks (with Deadline but you don't have to do it during the day, just need to finish it by the deadline):
    ${scheduleTasks
      .map((task) => `Title: ${task.Title}, Deadline: ${task.deadline}`)
      .join("\n")}

    Please organize the schedule, followed by a short description if available and Schedule title in one word. 
    Use the format:
    hh:mm - Schedule Title
    Description

    And you have to add breakfast,lunch,dinner and sleep and smoke(7times and each time take 10 minutes) in the schedule.
    
    If there is no task, do not write anything about the task.

    Generate a schedule considering the best times to fit the tasks around the fixed schedule items, optimizing productivity based on the motivation level.
        `;

    try {
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-3.5-turbo",
          messages: [{ role: "system", content: prompt }],
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
          },
        }
      );
      
      console.log(response.data.choices[0].message.content);
      setOutput(response.data.choices[0].message.content);
      setout(response.data.choices[0].message.content);
    } catch (error) {
      throw new Error("error in generating schedule:");
    }
  };
  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>Welcome to</h1>
        <h1 style={styles.mainTitle}>BurgerLendar</h1>
      </header>
      <main style={styles.main}>
        <img
          src="https://thumb.ac-illust.com/36/36ac3e42b8ed38dce15bc0ad7c5e9a1c_t.jpeg"
          alt="burger"
          style={styles.burgerImage}
        />
        <div style={styles.username}>
          {userName }
        </div>
        <div style={styles.quote}>
          {quote ? (
            <div
              style={{
                padding: "20px",
                border: "1px solid #ccc",
                borderRadius: "5px",
                textAlign: "center",
              }}
            >
              <p style={{ fontSize: "1.5em", fontStyle: "italic" }}>
                {quote.text}
              </p>
              <p style={{ fontSize: "1.2em", marginTop: "10px" }}>
                — {quote.author}
              </p>
            </div>
          ) : (
            <p>Loading quote...</p>
          )}
        </div>
      </main>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column" as "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    backgroundColor: "#003366",
    color: "#F9ECCB",
    textAlign: "center" as "center",
  },
  header: {
    marginBottom: "20px",
  },
  title: {
    fontSize: "1.5em",
    margin: "0",
    color: "#F9ECCB",
  },
  mainTitle: {
    fontSize: "2.5em",
    margin: "0",
    color: "#F9ECCB",
  },
  main: {
    display: "flex",
    flexDirection: "column" as "column",
    alignItems: "center",
    backgroundColor: "#003366",
    padding: "20px",
    borderRadius: "10px",
  },
  burgerImage: {
    width: "150px",
    height: "150px",
  },
  username: {
    marginTop: "20px",
    fontSize: "1.2em",
    color: "#F9ECCB",
  },
  quote: {
    marginTop: "10px",
    fontSize: "1em",
    color: "#F9ECCB",
  },
};

export default Edu;

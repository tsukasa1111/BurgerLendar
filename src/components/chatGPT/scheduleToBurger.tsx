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
import { auth, db } from "../../firebase/firebase"; // Import the initialized Firestore instance
import { onAuthStateChanged } from "firebase/auth";
import axios from "axios";

interface ScheduledTask {
  Title: string;
  startTime: string;
  endTime: string;
  done: boolean;
}

const ScheduleToBurger: React.FC = () => {
  const [schedule, setschedule] = useState<ScheduledTask[]>([]);

  const [out, setout] = useState<string>("");
  const [user, setUser] = useState<any>(null);
  const [userName, setUserName] = useState<any>(null);
  const [today, setToday] = useState<string>("");

  const getCurrentDateFormatted = () => {
    const now = new Date();
    const year = now.getFullYear(); // 年を取得
    const month = now.getMonth() + 1; // 月を取得（月は0から始まるため+1する）
    const day = now.getDate(); // 日を取得

    // MMとDDの形式を保証するために、必要に応じて0を追加
    const formattedMonth = month < 10 ? `0${month}` : month;
    const formattedDay = day < 10 ? `0${day}` : day;

    return `${year}${"-"}${formattedMonth}${"-"}${formattedDay}`; // 'YYYY-MMDD'の形式で返す
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setToday(getCurrentDateFormatted());
      if (currentUser) {
        setUser(currentUser);
        fetchSchedule(currentUser.uid);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchSchedule = async (userId: string) => {
    try {
      const eventsRef = query(collection(db,"schedule", userId, today));

      const querySnapshot = await getDocs(eventsRef);
      const fetchedschedule = querySnapshot.docs.map((doc) => ({
        Title: doc.data().title,
        startTime: doc.data().startTime,
        endTime: doc.data().endTime,
        done: doc.data().done,
      }));
      console.log("fetchedschedule", fetchedschedule);

      setschedule(fetchedschedule);

      // console.log("events:", events);
    } catch (err) {
      throw new Error("Error fetching user data:");
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setToday(getCurrentDateFormatted());
      if (currentUser) {
        setUser(currentUser);
        fetchSchedule(currentUser.uid);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, [out]);

  const handleSubmit = async () => {
    const prompt = `
    
    ${schedule
      .map(
        (ScheduledTask) =>
          `Title: ${ScheduledTask.Title}, done: ${ScheduledTask.done}`
      )
      .join("\n")}
    
    
    Please categorize these schedule(done is True) into:
    1. Work/School/Studies
    2. Personal Appointments
    3. Entertainment
    4. Exercise
    And count how many items fall into each category. 
    Output the results in an array format representing the count for each category.

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
        <div style={styles.username}>{userName}</div>
        <div style={styles.quote}>
          {out ? (
            <div
              style={{
                padding: "20px",
                border: "1px solid #ccc",
                borderRadius: "5px",
                textAlign: "center",
              }}
            >
              <p style={{ fontSize: "1.5em", fontStyle: "italic" }}>{out}</p>
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

export default ScheduleToBurger;

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
import Unity, { UnityContext } from "react-unity-webgl";
import { Web } from "@mui/icons-material";
import { set } from "date-fns";
interface ScheduledTask {
  title: string;
  startTime: string;
  endTime: string;
  done: boolean;
}



const Webgl: React.FC<{ m: number; c: number; t: number; l: number }> = ({
  m,
  c,
  t,
  l,
}) => {
  const unityContext = new UnityContext({
    loaderUrl: "unity/test8.loader.js",
    dataUrl: "unity/test8.data",
    frameworkUrl: "unity/test8.framework.js",
    codeUrl: "unity/test8.wasm",
  });

  const burgerConfig = {
    meatCount: m,
    cheeseCount: c,
    tomatoCount: t,
    lettuceCount: l,
  };

  useEffect(() => {
    unityContext.on("loaded", () => {
      unityContext.send(
        "Scripts",
        "ConfigureBurger",
        JSON.stringify(burgerConfig)
      );
    });
  }, [unityContext]);

  return (
    <div style={{ position: "relative" }}>
      <Unity unityContext={unityContext} style={{ width: 640, height: 640 }} />
    </div>
  );
};


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
    const docPath =  `schedule/${userId}/schedule/${today}`;

    try {
        const docRef = doc(db, docPath);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()){
            const data = docSnap.data();
            const Schedule = data.scheduledTask.ScheduledTask.map((ScheduledTask: ScheduledTask) => ({
                title: ScheduledTask.title,
                startTime: ScheduledTask.startTime,
                endTime: ScheduledTask.endTime,
                done: ScheduledTask.done
            }));
            console.log('fetched data', Schedule);
            setschedule(Schedule);  // スケジュールイベントの配列を設定
            console.log('schedule', schedule);
            return schedule;
        } else {
            console.log("No such document!");
            return [];  // ドキュメントが存在しない場合は空の配列を返す
        }
    } catch (error) {
        console.error("Error fetching schedule events:", error);
        throw new Error("Failed to fetch schedule events");
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
          `Title: ${ScheduledTask.title}, done: ${ScheduledTask.done}`
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
        <Webgl m={10} c={2} t={2} l={2} />
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

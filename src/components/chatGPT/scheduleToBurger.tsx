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
import { count } from "console";
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
  const [burger, setburger] = useState<number[]>([]);
  const [countdata, setcountdata] = useState<number>(0);
  const [out, setout] = useState<string[]>([]);
  const [user, setUser] = useState<any>(null);
  const [userName, setUserName] = useState<any>(null);
  const [today, setToday] = useState<string>(getCurrentDateFormatted());

  function getCurrentDateFormatted() {
    const today = new Date();
    const year = today.getFullYear().toString().slice(2); // 年の下2桁を取得
    const month = (today.getMonth() + 1).toString().padStart(2, "0"); // 月を2桁で取得
    const day = today.getDate().toString().padStart(2, "0"); // 日を2桁で取得
    return year + month + day; // 結合して文字列を返す
  }

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
      console.log("today===", today);
      const docRef = doc(db, "schedule", userId, "schedule", today);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        console.log("Document data:", docSnap.data() as any);
        const data = docSnap.data();
        const da = Object.values(data);
        const Schedule = da.map((event: ScheduledTask) => ({
          title: event.title,
          startTime: event.startTime,
          endTime: event.endTime,
          done: event.done,
        }));
        console.log("fetched data", Schedule);
        setschedule(Schedule); // スケジュールイベントの配列を設定

        return schedule;
      } else {
        console.log("No such document!");
        return []; // ドキュメントが存在しない場合は空の配列を返す
      }
    } catch (error) {
      console.error("Error fetching schedule events:", error);
      throw new Error("Failed to fetch schedule events");
    }
  };

  useEffect(() => {
    if (countdata === 0) handleSubmit();

    return;
  }, [schedule]);

  useEffect(() => {
    const str = "2,2,2";
    console.log(typeof out);
    console.log(typeof out[0]);
    const numberArray: number[] = [];

    for (let i = 0; i < out.length; i++) {
      if (out[i] >= "0" && out[i] <= "99") {
        numberArray.push(parseInt(out[i]));
      }
    }
    console.log("numberArray", numberArray);
    setburger(numberArray);
    //

    return;
  }, [out]);

  const handleSubmit = async () => {
    setcountdata(countdata + 1);
    const prompt = `
    
    ${schedule
      .map(
        (ScheduledTask) =>
          `Title: ${ScheduledTask.title}, done: ${ScheduledTask.done}`
      )
      .join("\n")}
    
    
    Please categorize these schedule(if done is True) into:
    1. Work/School/Studies
    2. Personal Appointments
    3. Entertainment
    4. Exercise
    And count how many items fall into each category. 
    Output the results in an array format representing the count for each category.
    for example [1, 2, 3, 4] means 1 item in category 1, 2 items in category 2, 3 items in category 3, 4 items in category 4.
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
      console.log("out", response.data.choices[0].message.content);
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
        <div style={styles.quote}>
          {burger ? (
            <div
              style={{
                padding: "20px",
                border: "1px solid #ccc",
                borderRadius: "5px",
                textAlign: "center",
              }}
            >
              <p style={{ fontSize: "1.5em", fontStyle: "italic" }}>{out}</p>
              <Webgl m={burger[0]} c={burger[1]} t={burger[2]} l={burger[3]} />
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

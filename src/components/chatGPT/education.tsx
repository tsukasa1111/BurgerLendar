import React, { useState, useEffect } from "react";
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

interface EduProps {
  setOutput: (output: string) => void;
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

const Edu: React.FC<EduProps> = ({ setOutput }) => {
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
  const [motivation, setMotivation] = useState<"low" | "medium" | "high">(
    "low"
  );
  const [out, setout] = useState<string>("");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const fetchUserAki = async () => {
      try {
        const docRef = doc(db, "Users_Aki", user.uid); // 'Users_Aki' is the collection name and `userId` is the document ID
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as aki;
          setAki({
            ...data,
          });
          console.log("aki:", Aki);
        } else {
          Error("No such document!");
          alert("No such document!");
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
        console.log("events:", events);
      } catch (err) {
        console.error("Error fetching user data:", err);
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
        console.log("todos:", scheduleTasks);
      } catch (err) {
        console.error("Error fetching user data:", err);
      }
    };

    fetchUserAki();
    fetchEvents();
    fetchtodos();
  }, [user]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const prompt = `
    Given the following schedule items and tasks with their respective start and end times,
    and considering the motivation level for the day (${motivation}).
    if (motivation) is low, you can not need to include any other tasks.
    if (motivation) is medium, please put in one task that is closest to the due date.
    if (motivation) is high, put in as many tasks as possible in order of due date.
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
      setOutput(response.data.choices[0].message.content);
      setout(response.data.choices[0].message.content);
    } catch (error) {
      console.error("Error fetching response:", error);
    }
  };

  return (
    <div>
      <div>
      <form onSubmit={handleSubmit}>
        <button type="submit">Good Morning</button>
      </form>

        <h1>{out}</h1>
      </div>
    </div>
  );
};

export default Edu;

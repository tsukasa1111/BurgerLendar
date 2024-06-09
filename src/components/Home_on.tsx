import React, { useState, useEffect, useRef } from "react";
import { parseSchedule, ScheduleEvent } from "./ScheduleParser";
import { collection, doc, getDoc, getDocs, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import Unity, { UnityContext } from "react-unity-webgl";
import '../App.css';

interface UnityInstanceUrls {
  dataUrl: string;
  frameworkUrl: string;
  codeUrl: string;
  loaderUrl: string;
}

interface BurgerConfig {
  includeMeatCount: number;
  includeCheeseCount: number;
  includeTomatoCount: number;
  includeLettuceCount: number;
}

const Webgl: React.FC<{ burgerConfig: BurgerConfig }> = ({ burgerConfig }) => {
  const unityContext = new UnityContext({
    loaderUrl: "unity/hamberger.loader.js",
    dataUrl: "unity/hamberger.data",
    frameworkUrl: "unity/hamberger.framework.js",
    codeUrl: "unity/hamberger.wasm",
  });

  useEffect(() => {
    unityContext.on("loaded", () => {
      unityContext.send("Scripts", "ConfigureBurger", JSON.stringify(burgerConfig));
    });

    return () => {
      unityContext.removeAllEventListeners();
    };
  }, [burgerConfig, unityContext]);

  return <Unity unityContext={unityContext} style={{ width: 1240, height: 600 }} />;
};

const Bur_Home: React.FC = () => {
  const [scheduleEvents, setScheduleEvents] = useState<ScheduleEvent[]>([]);
  const [completedEvents, setCompletedEvents] = useState<Set<number>>(new Set());
  const [user, setUser] = useState<any>(null);
  const currentEventRef = useRef<HTMLLIElement | null>(null);
  const [scheduleText, setScheduleText] = useState<string>("");
  const [showWebGL, setShowWebGL] = useState(false);
  const [burgerConfig, setBurgerConfig] = useState<BurgerConfig>({
    includeMeatCount: 4,
    includeCheeseCount: 2,
    includeTomatoCount: 1,
    includeLettuceCount: 1,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchSchedule(currentUser.uid);
        fetchCompletedEvents(currentUser.uid); // Fetch completed events
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchSchedule = async (userId: string) => {
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const formattedDate = today.slice(2);

    try {
      const docRef = doc(db, "users", userId, "schedule", formattedDate);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setScheduleText(data.text);
      } else {
        console.log("No such document!");
      }
    } catch (error) {
      console.error("Error fetching schedule: ", error);
    }
  };

  const fetchCompletedEvents = async (userId: string) => {
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const formattedDate = today.slice(2);

    try {
      const completedEventsRef = collection(db, "users", userId, "schedule", formattedDate, "completedEvents");
      const completedEventsSnap = await getDocs(completedEventsRef);
      const completedEventsSet = new Set<number>();

      completedEventsSnap.forEach((doc) => {
        completedEventsSet.add(parseInt(doc.id));
      });

      setCompletedEvents(completedEventsSet);
    } catch (error) {
      console.error("Error fetching completed events: ", error);
    }
  };

  useEffect(() => {
    if (scheduleText) {
      const events = parseSchedule(scheduleText);
      saveScheduleEvents(events);
    }
  }, [scheduleText]);

  const saveScheduleEvents = async (events: ScheduleEvent[]) => {
    if (user) {
      const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
      const formattedDate = today.slice(2);
      const eventsCollectionRef = collection(db, "users", user.uid, "schedule", formattedDate, "scheduleEvents");

      try {
        const sortedEvents = events.sort((a, b) => {
          const aTime = getMinutes(a.startTime);
          const bTime = getMinutes(b.startTime);
          return aTime - bTime;
        });

        for (let i = 0; i < sortedEvents.length; i++) {
          const event = sortedEvents[i];
          await setDoc(doc(eventsCollectionRef, i.toString()), { ...event, done: false });
        }
        
        setScheduleEvents(sortedEvents);
      } catch (error) {
        console.error("Error saving schedule events: ", error);
      }
    }
  };

  const toggleCheck = async (index: number) => {
    const newCheckedEvents = new Set(completedEvents);
    if (newCheckedEvents.has(index)) {
      newCheckedEvents.delete(index);
    } else {
      if (window.confirm("完了しましたか？")) {
        newCheckedEvents.add(index);
        if (user) {
          const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
          const formattedDate = today.slice(2);
          const docRef = doc(db, "users", user.uid, "schedule", formattedDate, "completedEvents", index.toString());
          try {
            await setDoc(docRef, { done: true });
          } catch (error) {
            console.error("Error updating schedule: ", error);
          }
        }
      }
    }
    setCompletedEvents(newCheckedEvents);
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  };

  const currentTime = getCurrentTime();

  const getMinutes = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}年${month}月${day}日`;
  };

  const todayDate = formatDate(new Date());

  let currentEventIndex = scheduleEvents.findIndex(event => {
    const eventStartTime = getMinutes(event.startTime);
    const eventEndTime = getMinutes(event.endTime);
    return currentTime >= eventStartTime && currentTime < eventEndTime;
  });

  useEffect(() => {
    if (currentEventRef.current) {
      currentEventRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [scheduleEvents]);

  return (
    <div className="schedule-container">
      <h1>Today's Schedule</h1>
      <div className="schedule-date">{todayDate}</div>
      <div className="schedule-content">
        <ul className="schedule-list">
          {scheduleEvents.map((event, index) => {
            const isCurrent = index === currentEventIndex;
            const isPast = getMinutes(event.endTime) < currentTime;
            const isCompleted = completedEvents.has(index);
            return (
              <li
                key={index}
                ref={isCurrent ? currentEventRef : null}
                className={`schedule-item ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''} ${isPast ? 'past' : ''}`}
                onClick={isCompleted ? undefined : () => toggleCheck(index)}
              >
                <div>
                  <div className="schedule-time">{event.startTime} - {event.endTime}</div>
                  <div className="schedule-title-item">{event.title.split('\n')[0]}</div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
      <button onClick={() => setShowWebGL(!showWebGL)}>
        {showWebGL ? 'ハンバーガー隠すよ！' : 'ハンバーガー見たい？'}
      </button>
      {showWebGL && <Webgl burgerConfig={burgerConfig} />}
    </div>
  );
};

export default Bur_Home;

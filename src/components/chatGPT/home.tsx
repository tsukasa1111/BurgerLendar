import { WidthFull } from "@mui/icons-material";
import React, {
  useState,
  useEffect,
  useRef,
  ChangeEvent,
  FormEvent,
} from "react";
import { db, auth } from "../../firebase/firebase";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  setDoc,
  doc,
  query,
  where,
  arrayUnion,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { set } from "date-fns";

interface ScheduleEvent {
  startTime: string;
  endTime: string;
  title: string;
  done: boolean;
}

function parseSchedule(text: string): ScheduleEvent[] {
  const events: ScheduleEvent[] = [];
  const lines = text.split("\n");

  let currentStartTime: string | null = null;
  let currentTitle: string = "";

  for (const line of lines) {
    const timeMatch = line.match(/^(\d{1,2}:\d{2}) - (.+)$/);
    if (timeMatch) {
      if (currentStartTime) {
        events.push({
          startTime: currentStartTime,
          endTime: timeMatch[1],
          title: currentTitle,
          done: false,
        });
      }
      currentStartTime = timeMatch[1];
      currentTitle = timeMatch[2].trim();
    } else if (currentStartTime) {
      currentTitle += "\n" + line.trim();
    }
  }
  if (currentStartTime) {
    events.push({
      startTime: currentStartTime,
      endTime: "",
      title: currentTitle,
      done: false,
    });
  }

  return events;
}

interface AnotherComponentProps {
  output: string;
}

const Home: React.FC<AnotherComponentProps> = ({ output }) => {
  const [scheduleEvents, setScheduleEvents] = useState<ScheduleEvent[]>([]);
  const [checkedEvents, setCheckedEvents] = useState<Set<number>>(new Set());
  const [formattedText, setFormattedText] = useState<string>("");
  const currentEventRef = useRef<HTMLLIElement | null>(null);
  const [user, setUser] = useState<any>(null);
  const [userid, setUserid] = useState<string>("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setUserid(currentUser.uid);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);
  function getCurrentDateFormatted() {
    const today = new Date();
    const year = today.getFullYear().toString().slice(2); // 年の下2桁を取得
    const month = (today.getMonth() + 1).toString().padStart(2, "0"); // 月を2桁で取得
    const day = today.getDate().toString().padStart(2, "0"); // 日を2桁で取得
    return year + month + day; // 結合して文字列を返す
  }

  const handleAddEvent = async (userId: string) => {
    const currentDate = getCurrentDateFormatted();

    try {
      const docRef = doc(db, "schedule", userId, "schedule", currentDate);
      await setDoc(docRef, { ...scheduleEvents });
      console.log("Event has been added!");
    } catch (error) {
      console.error("Error adding event: ", error);
      console.log("Failed to add event");
    }
  };

  const formatSchedule = (text: string) => {
    const pattern = /(\d{2}:\d{2}) - ([^\.]+\.) /g;
    const formatted = text.replace(pattern, "$1 - $2\n");
    setFormattedText(formatted);
    return formatted;
  };
  useEffect(() => {
    const events = parseSchedule(formatSchedule(output));
    setScheduleEvents(events);
  }, [output]);

  useEffect(() => {
    handleAddEvent(userid);
    if (currentEventRef.current) {
      currentEventRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [scheduleEvents]);

  const toggleCheck = (index: number) => {
    const newCheckedEvents = new Set(checkedEvents);
    if (newCheckedEvents.has(index)) {
      newCheckedEvents.delete(index);
    } else {
      newCheckedEvents.add(index);
    }

    setCheckedEvents(newCheckedEvents);
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  };

  const currentTime = getCurrentTime();

  const getMinutes = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const sortedEvents = [...scheduleEvents].sort((a, b) => {
    const aTime = getMinutes(a.startTime);
    const bTime = getMinutes(b.startTime);

    if (aTime < currentTime && bTime >= currentTime) return 1;
    if (aTime >= currentTime && bTime < currentTime) return -1;
    return aTime - bTime;
  });

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}年${month}月${day}日`;
  };

  const todayDate = formatDate(new Date());

  let currentEventIndex = sortedEvents.findIndex((event) => {
    const eventStartTime = getMinutes(event.startTime);
    const eventEndTime = getMinutes(event.endTime);
    return currentTime >= eventStartTime && currentTime < eventEndTime;
  });

  if (currentEventIndex !== -1) {
    const currentEvent = sortedEvents.splice(currentEventIndex, 1)[0];
    sortedEvents.unshift(currentEvent);
  }
  // console.log("schedule");
  // console.log(scheduleEvents);
  //console.log(formattedText);

  return (
    <div className="schedule-container">
      <h1>Today's Schedule</h1>

      <div className="schedule-content">
        <ul className="schedule-list">
          {sortedEvents.map((event, index) => {
            const isCurrent = currentEventIndex !== -1 && index === 0;
            const isPast = getMinutes(event.endTime) < currentTime;
            return (
              <li
                key={index}
                ref={isCurrent ? currentEventRef : null}
                className={`schedule-item ${checkedEvents.has(index) ? "completed" : ""} ${isCurrent ? "current" : ""} ${isPast ? "past" : ""}`}
                onClick={() => toggleCheck(index)}
              >
                <div>
                  <div className="schedule-time">
                    {event.startTime} - {event.endTime}
                  </div>
                  <div className="schedule-title-item">
                    {event.title.split("\n")[0]}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default Home;

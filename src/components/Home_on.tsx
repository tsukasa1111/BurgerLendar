import React, { useState, useEffect, useRef } from 'react';
import { parseSchedule, ScheduleEvent } from './ScheduleParser';
import { collection, doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebase/firebase"; // Import the initialized Firestore instance
import { onAuthStateChanged } from "firebase/auth";
import '../App.css';

const Bur_Home: React.FC = () => {
    const [scheduleEvents, setScheduleEvents] = useState<ScheduleEvent[]>([]);
    const [checkedEvents, setCheckedEvents] = useState<Set<number>>(new Set());
    const [user, setUser] = useState<any>(null);
    const currentEventRef = useRef<HTMLLIElement | null>(null);
    const [scheduleText, setScheduleText] = useState<string>("");

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
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
        const today = new Date().toISOString().split('T')[0]; // 現在の日付を 'YYYY-MM-DD' フォーマットで取得
        console.log(today);
        try {
            const docRef = doc(db, "users", userId, "schedule", today);
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

    useEffect(() => {
        if (scheduleText) {
            const events = parseSchedule(scheduleText);
            setScheduleEvents(events);
        }
    }, [scheduleText]);

    useEffect(() => {
        if (currentEventRef.current) {
            currentEventRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [scheduleEvents]);

    const toggleCheck = async (index: number) => {
        const newCheckedEvents = new Set(checkedEvents);
        if (newCheckedEvents.has(index)) {
            newCheckedEvents.delete(index);
        } else {
            if (window.confirm("完了しましたか？")) {
                newCheckedEvents.add(index);
                if (user) {
                    const today = new Date().toISOString().split('T')[0];
                    const docRef = doc(db, "users", user.uid, "schedule", today);
                    try {
                        const scheduleUpdate = scheduleEvents.map((event, i) => {
                            if (i === index) {
                                return { ...event, done: true };
                            }
                            return event;
                        });
                        const updatedText = scheduleUpdate.map(event => {
                            return `${event.startTime} - ${event.endTime} ${event.title}`;
                        }).join('\n');
                        await updateDoc(docRef, { text: updatedText });
                    } catch (error) {
                        console.error("Error updating schedule: ", error);
                    }
                }
            }
        }
        setCheckedEvents(newCheckedEvents);
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

    const sortedEvents = [...scheduleEvents].sort((a, b) => {
        const aTime = getMinutes(a.startTime);
        const bTime = getMinutes(b.startTime);

        if (aTime < currentTime && bTime >= currentTime) return 1;
        if (aTime >= currentTime && bTime < currentTime) return -1;
        return aTime - bTime;
    });

    const formatDate = (date: Date) => {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}年${month}月${day}日`;
    };

    const todayDate = formatDate(new Date());

    let currentEventIndex = sortedEvents.findIndex(event => {
        const eventStartTime = getMinutes(event.startTime);
        const eventEndTime = getMinutes(event.endTime);
        return currentTime >= eventStartTime && currentTime < eventEndTime;
    });

    if (currentEventIndex !== -1) {
        const currentEvent = sortedEvents.splice(currentEventIndex, 1)[0];
        sortedEvents.unshift(currentEvent);
    }

    return (
        <div className="schedule-container">
            <h1>Today's Schedule</h1>
            <div className="schedule-date">{todayDate}</div>
            <div className="schedule-content">
                <ul className="schedule-list">
                    {sortedEvents.map((event, index) => {
                        const isCurrent = currentEventIndex !== -1 && index === 0;
                        const isPast = getMinutes(event.endTime) < currentTime;
                        return (
                            <li
                                key={index}
                                ref={isCurrent ? currentEventRef : null}
                                className={`schedule-item ${checkedEvents.has(index) ? 'completed' : ''} ${isCurrent ? 'current' : ''} ${isPast ? 'past' : ''}`}
                                onClick={() => toggleCheck(index)}
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
        </div>
    );
};

export default Bur_Home;

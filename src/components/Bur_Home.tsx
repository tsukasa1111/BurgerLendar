import React, { useState, useEffect, useRef } from 'react';
import { parseSchedule, ScheduleEvent } from './ScheduleParser';
import '../App.css';

const scheduleText = `
6:00 - 起床
身支度を整える
ストレッチや軽い運動
7:00 - 通勤/通学
通勤時間を有効に使い、ポッドキャストを聞く、本を読むなど
8:00 - 仕事/学校
メールチェック
重要なタスクの優先順位を確認
集中作業
10:00 - 休憩
コーヒーブレイク
軽いストレッチ
10:15 - 仕事/授業再開
ミーティングや授業
プロジェクト作業
12:00 - 昼食
同僚や友人と昼食を取る
散歩してリフレッシュ
13:00 - 仕事/学校再開
午後の作業開始
重要なタスクの処理
15:00 - 休憩
スナックタイム
同僚や友人と雑談
15:15 - 仕事/授業再開
残りのタスク処理
進捗確認
17:00 - 退社/帰宅
帰宅準備
帰りの交通手段
18:00 - 自由時間
趣味や運動
友人や家族との時間
19:00 - 夕食
家族や友人と食事を楽しむ
20:00 - リラックスタイム
読書やテレビ鑑賞
お風呂に入る
21:00 - 次の日の準備
服の準備
予定の確認
22:00 - 就寝準備
歯磨きやスキンケア
瞑想や軽いストレッチ
22:30 - 就寝
十分な睡眠を取る
`;

const Bur_Home: React.FC = () => {
    const [scheduleEvents, setScheduleEvents] = useState<ScheduleEvent[]>([]);
    const [checkedEvents, setCheckedEvents] = useState<Set<number>>(new Set());
    const currentEventRef = useRef<HTMLLIElement | null>(null);

    useEffect(() => {
        const events = parseSchedule(scheduleText);
        setScheduleEvents(events);
    }, []);

    useEffect(() => {
        if (currentEventRef.current) {
            currentEventRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

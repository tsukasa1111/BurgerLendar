import React, { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getStorage, ref, getDownloadURL, listAll } from "firebase/storage";
import Unity, { UnityContext } from "react-unity-webgl";

interface UnityInstanceUrls {
  dataUrl: string;
  frameworkUrl: string;
  codeUrl: string;
  loaderUrl: string;
}

const Memories: React.FC = () => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);
  const [unityInstanceUrl, setUnityInstanceUrl] = useState<UnityInstanceUrls | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<{ date: string; files: UnityInstanceUrls }[]>([]);

  useEffect(() => {
    const handleResize = () => {
      setViewportHeight(window.innerHeight);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    const auth = getAuth();
    const storage = getStorage();

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const folderPath = `Users_Burger/${currentUser.uid}`;
          const listRef = ref(storage, folderPath);
          const res = await listAll(listRef);
          const eventPromises = res.prefixes.map(async (folderRef) => {
            const yymmdd = folderRef.name;
            const files = await Promise.all([
              getDownloadURL(ref(storage, `${folderRef.fullPath}/test8.data`)),
              getDownloadURL(ref(storage, `${folderRef.fullPath}/test8.framework.js`)),
              getDownloadURL(ref(storage, `${folderRef.fullPath}/test8.wasm`)),
              getDownloadURL(ref(storage, `${folderRef.fullPath}/test8.loader.js`)),
            ]);
            return { date: yymmdd, files: { dataUrl: files[0], frameworkUrl: files[1], codeUrl: files[2], loaderUrl: files[3] } };
          });
          const eventsData = await Promise.all(eventPromises);
          setEvents(eventsData);
        } catch (error) {
          setError("Failed to load Unity files.");
          console.error("Error loading Unity files: ", error);
        } finally {
          setLoading(false);
        }
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      window.removeEventListener('resize', handleResize);
      unsubscribe();
    };
  }, []);

  const handleDateClick = (date: number) => {
    const yymmdd = formatDate(new Date(currentYear, currentMonth, date));
    setSelectedDate(yymmdd);
    const event = events.find((event) => event.date === yymmdd);
    if (event) {
      setUnityInstanceUrl(event.files);
    } else {
      setUnityInstanceUrl(null);
    }
  };

  const formatDate = (date: Date) => {
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}${month}${day}`;
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const UnityInstance: React.FC<{ files: UnityInstanceUrls }> = ({ files }) => {
    const unityContext = new UnityContext({
      loaderUrl: files.loaderUrl,
      dataUrl: files.dataUrl,
      frameworkUrl: files.frameworkUrl,
      codeUrl: files.codeUrl,
    });

    useEffect(() => {
      unityContext.on("loaded", () => {
        unityContext.send(
          "Scripts",
          "ConfigureBurger",
          JSON.stringify({
            meatCount: 10,
            cheeseCount: 2,
            tomatoCount: 2,
            lettuceCount: 2,
          })
        );
      });
    }, [unityContext]);

    return <Unity unityContext={unityContext} style={{ width: '100%', height: `${viewportHeight - 450}px` }} />;
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const formattedToday = formatDate(today);

  return (
    <div className="w-full flex flex-col items-start justify-start" style={{ height: `${viewportHeight - 120}px`, backgroundColor: '#F9ECCB' }}>
      <div className="header w-full shadow-md rounded-lg overflow-hidden bg-white">
        <div className="flex items-center justify-between p-4" style={{ backgroundColor: '#1a237e' }}>
          <button className="text-gray-500" onClick={() => setCurrentMonth((prev) => prev === 0 ? 11 : prev - 1)}>&lt;</button>
          <h2 className="text-lg font-bold text-white cursor-pointer">{`${currentYear}年${currentMonth + 1}月`}</h2>
          <button className="text-gray-500" onClick={() => setCurrentMonth((prev) => prev === 11 ? 0 : prev + 1)}>&gt;</button>
        </div>
        <div className="grid grid-cols-7 text-center border-t border-b bg-white">
          {['日', '月', '火', '水', '木', '金', '土'].map((day, index) => (
            <div key={index} className="py-2 text-sm text-gray-700">{day}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 text-center bg-white">
          {Array.from({ length: new Date(currentYear, currentMonth, 1).getDay() }).map((_, index) => (
            <div key={index} className="py-2"></div>
          ))}
          {Array.from({ length: daysInMonth }).map((_, dateIndex) => {
            const date = dateIndex + 1;
            const yymmdd = formatDate(new Date(currentYear, currentMonth, date));
            const hasEvent = events.some((event) => event.date === yymmdd);
            const isToday = date === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
            return (
              <div
                key={dateIndex}
                className={`py-2 relative cursor-pointer ${selectedDate === yymmdd ? 'bg-blue-500 text-white' : 'text-gray-900'} ${isToday && selectedDate !== yymmdd ? 'text-red-500' : ''} ${hasEvent ? 'bg-red-500 text-white' : ''}`}
                onClick={() => handleDateClick(date)}
              >
                {date}
              </div>
            );
          })}
        </div>
      </div>
      {unityInstanceUrl && <UnityInstance files={unityInstanceUrl} />}
      <style>{`
        .calendar {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 10px;
          margin-top: 20px;
        }
        .day {
          padding: 10px;
          text-align: center;
          cursor: pointer;
          border: 1px solid #ccc;
          marginBottom: "20px",
        }
        .day.has-event {
          background-color: red;
          color: white;
        }
        .day.today {
          border: 2px solid blue;
        }
      `}</style>
    </div>
  );
};

export default Memories;
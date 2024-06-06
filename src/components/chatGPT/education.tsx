import React, { useState } from "react";
import axios from "axios";

interface ScheduleItem {
  startTime: string;
  endTime: string;
  description: string;
}
interface EduProps {
  setOutput: (output: string) => void;
}
interface ScheduledTask {
  Title: string;
  deadline: string;
}

const Edu: React.FC<EduProps> = ({ setOutput }) => {
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([
    { startTime: "", endTime: "", description: "" },
  ]);

  const [scheduleTasks, setScheduleTasks] = useState<ScheduledTask[]>([]);

  const [tasks, setTasks] = useState<string[]>([""]);
  const [motivation, setMotivation] = useState<"low" | "medium" | "high">(
    "low"
  );
  const [out, setout] = useState<string>("");

  const handleScheduleChange = (
    index: number,
    field: keyof ScheduleItem,
    value: string
  ) => {
    const newItems = scheduleItems.map((item, idx) =>
      idx === index ? { ...item, [field]: value } : item
    );
    setScheduleItems(newItems);
  };

  const addScheduleItem = () => {
    setScheduleItems([
      ...scheduleItems,
      { startTime: "", endTime: "", description: "" },
    ]);
  };

  const handleScheduledTaskChange = (
    index: number,
    field: keyof ScheduledTask,
    value: string
  ) => {
    const newTasks = scheduleTasks.map((task, idx) =>
      idx === index ? { ...task, [field]: value } : task
    );
    setScheduleTasks(newTasks);
  };

  const addScheduledTask = () => {
    setScheduleTasks([...scheduleTasks, { Title: "", deadline: "" }]);
  };

  const handleTaskChange = (index: number, value: string) => {
    const newTasks = tasks.map((task, idx) => (idx === index ? value : task));
    setTasks(newTasks);
  };

  const addTask = () => {
    setTasks([...tasks, ""]);
  };

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
    ${scheduleItems
      .map(
        (item) =>
          `Start: ${item.startTime}, End: ${item.endTime}, Description: ${item.description}`
      )
      .join("\n")}

    Tasks (To be done at any time during the day):
    - ${tasks.join("\n- ")}

    Scheduled Tasks (with Deadline but ):
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
      <h1>Schedule Planner</h1>
      <form onSubmit={handleSubmit}>
        {scheduleItems.map((item, index) => (
          <div key={index}>
            <input
              type="time"
              value={item.startTime}
              onChange={(e) =>
                handleScheduleChange(index, "startTime", e.target.value)
              }
            />
            <input
              type="time"
              value={item.endTime}
              onChange={(e) =>
                handleScheduleChange(index, "endTime", e.target.value)
              }
            />
            <input
              type="text"
              value={item.description}
              onChange={(e) =>
                handleScheduleChange(index, "description", e.target.value)
              }
            />
          </div>
        ))}
        <button type="button" onClick={addScheduleItem}>
          Add Schedule Item
        </button>

        {tasks.map((task, index) => (
          <div key={index}>
            <input
              type="text"
              value={task}
              onChange={(e) => handleTaskChange(index, e.target.value)}
            />
          </div>
        ))}
        <button type="button" onClick={addTask}>
          Add Task
        </button>

        {scheduleTasks.map((task, index) => (
          <div key={index}>
            <input
              type="text"
              value={task.Title}
              onChange={(e) =>
                handleScheduledTaskChange(index, "Title", e.target.value)
              }
            />
            <input
              type="date"
              value={task.deadline}
              onChange={(e) =>
                handleScheduledTaskChange(index, "deadline", e.target.value)
              }
            />
          </div>
        ))}
        <button type="button" onClick={addScheduledTask}>
          Add Scheduled Task
        </button>

        <div>
          <label>Motivation Level:</label>
          <select
            value={motivation}
            onChange={(e) =>
              setMotivation(e.target.value as "low" | "medium" | "high")
            }
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <button type="submit">Generate Schedule</button>
      </form>
      <div>
        <h1>{out}</h1>
      </div>
    </div>
  );
};

export default Edu;

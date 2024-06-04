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

const Edu: React.FC<EduProps> = ({ setOutput }) => {
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([
    { startTime: "", endTime: "", description: "" },
  ]);
  const [tasks, setTasks] = useState<string[]>([""]);
  const [motivation, setMotivation] = useState<"low" | "medium" | "high">(
    "low"
  );
  const [output, setoutput] = useState<string>("");
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
        Given the following schedule items and tasks with their respective start and end times, and considering the motivation level for the day (${motivation}), organize a schedule in the specified format.

        Schedule Items:
        ${scheduleItems.map((item) => `Start: ${item.startTime}, End: ${item.endTime}, Description: ${item.description}`).join("\n")}

        Tasks (To be done at any time during the day):
        - ${tasks.join("\n- ")}

        Please organize the schedule, followed by a description if available and Schedule title in one word. 
        Use the format:
        hh:mm - Schedule Title
        Description
        
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
      setoutput(response.data.choices[0].message.content);
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
        <h1>{output}</h1>
      </div>
    </div>
  );
};

export default Edu;

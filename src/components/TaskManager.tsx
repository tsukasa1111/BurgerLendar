import React, { useState } from "react";
import { getFirestore, collection, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { Button, Container, Grid, TextField, Typography, Box, MenuItem, FormControlLabel, Checkbox } from "@mui/material";
import { auth } from "../firebase/firebase";
import { useNavigate } from "react-router-dom"; // useNavigateをインポート

const TaskManager = () => {
  const [taskTitle, setTaskTitle] = useState<string>("");
  const [taskDeadline, setTaskDeadline] = useState<string>("");
  const [taskCategory, setTaskCategory] = useState<string>("General");
  const [taskFlag, setTaskFlag] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate(); // useNavigateフックを使用

  const addTask = async () => {
    if (!taskTitle || !taskDeadline) {
      setError("タイトルと期限は必須です");
      return;
    }

    try {
      const db = getFirestore();
      const user = auth.currentUser;

      if (!user) {
        throw new Error("ユーザーが認証されていません");
      }

      const userTodoRef = collection(db, "Users_todo", user.uid, "Tasks");

      await setDoc(doc(userTodoRef), {
        title: taskTitle,
        deadline: taskDeadline,
        category: taskCategory,
        flag: taskFlag,
        created_at: serverTimestamp()
      });

      setTaskTitle("");
      setTaskDeadline("");
      setTaskCategory("General");
      setTaskFlag(false);
      setError(null);

      console.log("Task added successfully");
      navigate("/home"); // タスク追加後に/homeへ遷移
    } catch (error: any) {
      setError(error.message);
      console.error(error);
    }
  };

  const handleChangeTaskTitle = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTaskTitle(event.currentTarget.value);
  };

  const handleChangeTaskDeadline = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTaskDeadline(event.currentTarget.value);
  };

  const handleChangeTaskCategory = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTaskCategory(event.target.value);
  };

  const handleChangeTaskFlag = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTaskFlag(event.currentTarget.checked);
  };

  return (
    <Container>
      <Grid container justifyContent="center" alignItems="center" style={{ height: "100vh" }}>
        <Grid item xs={12} md={6}>
          <Box p={3} boxShadow={2} borderRadius={2}>
            <h2>タスク管理</h2>
            <TextField
              style={{ marginBottom: "0.5em" }}
              label="Task Title"
              fullWidth
              variant="outlined"
              value={taskTitle}
              onChange={handleChangeTaskTitle}
            />
            <TextField
              style={{ marginBottom: "0.5em" }}
              label="Task Deadline"
              fullWidth
              variant="outlined"
              type="date"
              InputLabelProps={{
                shrink: true,
              }}
              value={taskDeadline}
              onChange={handleChangeTaskDeadline}
            />
            <TextField
              style={{ marginBottom: "0.5em" }}
              label="Task Category"
              fullWidth
              variant="outlined"
              select
              value={taskCategory}
              onChange={handleChangeTaskCategory}
            >
              <MenuItem value="General">General</MenuItem>
              <MenuItem value="Work">Work</MenuItem>
              <MenuItem value="Personal">Personal</MenuItem>
            </TextField>
            <FormControlLabel
              control={
                <Checkbox
                  checked={taskFlag}
                   onChange={handleChangeTaskFlag}
                />
              }
              label="Task Flag"
            />
            {error && <Typography color="error">{error}</Typography>}
            <Button
              fullWidth
              style={{ marginBottom: "0.5em" }}
              onClick={addTask}
            >
              タスクを追加
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default TaskManager;

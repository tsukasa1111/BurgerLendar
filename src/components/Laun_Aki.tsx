import React, { useState, useEffect } from 'react';
import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase/firebase"; // Import the initialized Firestore instance
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom"; // useNavigateをインポート

const LaunAki: React.FC = () => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate(); // useNavigateフックを使用

  // Monitor auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
  };

  const handleSubmit = async () => {
    if (!user) {
      alert("ユーザーがログインしていません");
      return;
    }

    if (selectedOption) {
      try {
        const userAkiRef = doc(db, "Users_Aki", user.uid);
        await setDoc(userAkiRef, {
          laun: selectedOption,
          created_at: serverTimestamp()
        },{ merge: true });
        alert("Selected option saved successfully.");
        navigate('/sleep'); // 決定ボタンが押された後に/foodに遷移
      } catch (error) {
        console.error("Error saving selected option: ", error);
        alert("Error saving selected option.");
      }
    } else {
      alert("オプションを選択してください");
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>BurgerNator</h1>
      </header>
      <main style={styles.main}>
        <div style={styles.questionContainer}>
          <h2 style={styles.question}>質問3/5:</h2>
          <p style={styles.subQuestion}>洗濯はどれくらいの頻度でしますか？</p>
        </div>
        <div style={styles.optionsContainer}>
          {['毎日', '二日に一回', '三日に一回'].map(option => (
            <button
              key={option}
              style={{
                ...styles.optionButton,
                backgroundColor: selectedOption === option ? '#f4a261' : '#f1faee',
                color: selectedOption === option ? '#1d3557' : '#000',
              }}
              onClick={() => handleOptionSelect(option)}
            >
              {option}
            </button>
          ))}
        </div>
        <button style={styles.submitButton} onClick={handleSubmit}>
          決定
        </button>
      </main>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    backgroundColor: '#1d3557',
    color: '#f4a261',
  },
  header: {
    width: '100%',
    textAlign: 'center' as 'center',
    backgroundColor: '#1d3557',
    padding: '10px 0',
  },
  title: {
    fontSize: '2.5em',
    margin: '0',
  },
  main: {
    display: 'flex',
    flexDirection: 'column' as 'column',
    alignItems: 'center',
    backgroundColor: '#f1faee',
    padding: '20px',
    borderRadius: '10px',
  },
  questionContainer: {
    textAlign: 'center' as 'center',
    marginBottom: '20px',
  },
  question: {
    fontSize: '1.5em',
    margin: '0',
    color: '#000',
  },
  subQuestion: {
    fontSize: '1em',
    margin: '0',
    color: '#000',
  },
  optionsContainer: {
    display: 'flex',
    flexDirection: 'column' as 'column',
    width: '100%',
    alignItems: 'center',
  },
  optionButton: {
    width: '80%',
    padding: '10px 0',
    margin: '10px 0',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '1em',
  },
  submitButton: {
    backgroundColor: '#f4a261',
    color: '#1d3557',
    border: 'none',
    padding: '10px 20px',
    margin: '20px 0 0 0',
    fontSize: '1em',
    borderRadius: '5px',
    cursor: 'pointer',
  },
};

export default LaunAki;

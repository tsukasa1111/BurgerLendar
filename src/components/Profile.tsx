import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase/firebase';
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import useViewportHeight from './hooks/useViewportHeight';

const Profile: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingField, setEditingField] = useState<null | string>(null);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    bath: '',
    food: '',
    laundry: '',
    sleep: '',
    smoke: '',
  });
  const [bathFlags, setBathFlags] = useState({
    朝: false,
    昼: false,
    夜: false,
  });
  const [foodFlags, setFoodFlags] = useState({
    朝: false,
    昼: false,
    夜: false,
  });
  const [user, setUser] = useState<any>(null);
  const viewportHeight = useViewportHeight();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchUserProfile(currentUser.uid);
        fetchProfile(currentUser.uid);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchUserProfile = async (uid: string) => {
    try {
      const docRef = doc(db, "Users", uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setProfile(prevProfile => ({
          ...prevProfile,
          name: data.displayName,
          email: data.email,
        }));
      } else {
        console.log("No such document in Users!");
      }
    } catch (error) {
      console.error("Error fetching user profile: ", error);
    }
  };

  const fetchProfile = async (uid: string) => {
    try {
      const docRef = doc(db, "Users_Aki", uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setProfile(prevProfile => ({
          ...prevProfile,
          ...data,
        }));
        setBathFlags({
          朝: data.bath?.includes('朝') || false,
          昼: data.bath?.includes('昼') || false,
          夜: data.bath?.includes('夜') || false,
        });
        setFoodFlags({
          朝: data.food?.includes('朝') || false,
          昼: data.food?.includes('昼') || false,
          夜: data.food?.includes('夜') || false,
        });
      } else {
        console.log("No such document in Users_Aki!");
      }
    } catch (error) {
      console.error("Error fetching profile: ", error);
    }
  };

  const handleEdit = (field: string) => {
    if (isEditing) {
      setEditingField(field);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (/^\d*$/.test(value)) { // 数字のみ入力を許可
      setProfile({ ...profile, [name]: value });
    }
  };

  const handleFlagChange = (field: string, time: '朝' | '昼' | '夜') => {
    if (isEditing) {
      const newFlags = { ...((field === 'bath') ? bathFlags : foodFlags), [time]: !((field === 'bath') ? bathFlags : foodFlags)[time] };
      if (field === 'bath') {
        setBathFlags(newFlags);
      } else {
        setFoodFlags(newFlags);
      }
    }
  };

  const handleSave = async () => {
    if (user) {
      try {
        const docRef = doc(db, "Users_Aki", user.uid);
        await updateDoc(docRef, {
          bath: Object.keys(bathFlags).filter(key => bathFlags[key as keyof typeof bathFlags]),
          food: Object.keys(foodFlags).filter(key => foodFlags[key as keyof typeof foodFlags]),
          laundry: profile.laundry,
          sleep: profile.sleep,
          smoke: profile.smoke,
        });
        setEditingField(null);
      } catch (error) {
        console.error("Error updating profile: ", error);
      }
    }
  };

  const toggleEditMode = () => {
    if (isEditing) {
      handleSave();
    }
    setIsEditing(!isEditing);
  };

  const renderProfileRow = (label: string, value: string, field: string, unit: string) => (
    <div className="profile-row" onClick={() => handleEdit(field)}>
      <div className="profile-label">{label}</div>
      {editingField === field ? (
        <div className="profile-input-wrapper">
          <input
            className="profile-value-edit"
            type="text"
            name={field}
            value={profile[field as keyof typeof profile]}
            onChange={handleChange}
            autoFocus
          />
          <span className="profile-unit">{unit}</span>
        </div>
      ) : (
        <div className="profile-value">
          {value} <span className="profile-unit">{unit}</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="profile-container" style={{ height: `${viewportHeight - 120}px` }}>
    <div className="profile-header">
      <h2>Profile</h2>
      <button className="edit-button" onClick={toggleEditMode}>
        {isEditing ? 'Save' : 'Edit'}
      </button>
    </div>
    <div className="profile-picture-section">
      <div className="profile-picture">
        <span role="img" aria-label="burger">🍔</span>
      </div>
      <div className="edit-profile-text">My Burger</div>
    </div>
    <div className="profile-details">
      {renderProfileRow('Name', profile.name, 'name', '')}
      {renderProfileRow('Email', profile.email, 'email', '')}
      <div className="profile-row">
        <div className="profile-label">Bath</div>
        <div className="profile-buttons">
          {['朝', '昼', '夜'].map(time => (
            <button
              key={time}
              onClick={() => handleFlagChange('bath', time as '朝' | '昼' | '夜')}
              style={{
                backgroundColor: bathFlags[time as '朝' | '昼' | '夜'] ? '#f4a261' : '#f1faee',
                color: bathFlags[time as '朝' | '昼' | '夜'] ? '#000' : '#000', // 色を変更
                pointerEvents: isEditing ? 'auto' : 'none'
              }}
            >
              {time}
            </button>
          ))}
        </div>
      </div>
      <div className="profile-row">
        <div className="profile-label">Food</div>
        <div className="profile-buttons">
          {['朝', '昼', '夜'].map(time => (
            <button
              key={time}
              onClick={() => handleFlagChange('food', time as '朝' | '昼' | '夜')}
              style={{
                backgroundColor: foodFlags[time as '朝' | '昼' | '夜'] ? '#f4a261' : '#f1faee',
                color: foodFlags[time as '朝' | '昼' | '夜'] ? '#000' : '#000', // 色を変更
                pointerEvents: isEditing ? 'auto' : 'none'
              }}
            >
              {time}
            </button>
          ))}
        </div>
      </div>
      {renderProfileRow('Laundry', profile.laundry, 'laundry', '回/週')}
      {renderProfileRow('Sleep', profile.sleep, 'sleep', '時間/日')}
      {renderProfileRow('Smoke', profile.smoke, 'smoke', '本/日')}
    </div>
    <style>{`
      .profile-container {
        width: 100vw;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        border: 1px solid #ccc;
        border-radius: 8px;
        overflow: hidden;
        font-family: Arial, sans-serif;
        background-color: #fff;
      }

      .profile-header {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 10px;
        background-color: #003366;
        color: #fff;
        position: relative;
      }

      .edit-button {
        position: absolute;
        right: 10px;
        background: none;
        border: none;
        font-size: 16px;
        color: #fff;
        cursor: pointer;
      }

      .profile-header h2 {
        margin: 0;
        font-size: 18px;
      }

      .profile-picture-section {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        padding: 20px;
        background-color: #F9ECCB;
        flex-grow: 0;
      }

      .profile-picture {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        background-color: #fff;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 36px;
      }

      .edit-profile-text {
        margin-top: 10px;
        color: #003366;
        font-size: 14px;
      }

      .profile-details {
        background-color: #003366;
        color: #F9ECCB;
        flex-grow: 1;
        overflow-y: auto;
      }

      .profile-row {
        display: flex;
        justify-content: space-between;
        padding: 10px 15px;
        border-bottom: 1px solid #fff;
        align-items: center;
        height: 50px; /* 全ての行の高さを揃える */
        cursor: ${isEditing ? 'pointer' : 'default'};
      }

      .profile-label {
        font-weight: bold;
        font-size: 14px;
      }

      .profile-value, .profile-value-edit {
        flex: 1;
        text-align: right;
        padding-right: 10px;
        color: #F9ECCB;
        font-size: 14px;
      }

      .profile-value-edit {
        background: #003366;
        border: none;
        border-bottom: 1px solid #F9ECCB;
        color: #F9ECCB;
        font-size: 14px;
      }

      .profile-input-wrapper {
        display: flex;
        align-items: center;
      }

      .profile-unit {
        margin-left: 5px;
      }

      .profile-buttons {
        display: flex;
        justify-content: flex-end;
        width: 60%; /* ボタンのコンテナの幅を調整 */
      }

      .profile-buttons button {
        margin-left: 5px; /* ボタン間のスペースを狭く */
        padding: 5px 10px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        transition: background-color 0.3s;
        color: #000;
      }

      .profile-row[data-field="laundry"] .profile-label,
      .profile-row[data-field="sleep"] .profile-label,
      .profile-row[data-field="smoke"] .profile-label {
        font-size: 18px; /* ラベルの文字を大きく */
      }
    `}</style>
  </div>
);
};

export default Profile;


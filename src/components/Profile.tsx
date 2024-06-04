import React, { useState } from 'react';
import WebGL from './webGL/webGL';

interface ProfileProps {
  name: string;
  username: string;
  email: string;
  bath: string;
  food: string;
  laundry: string;
  sleep: string;
  smoke: string;
}

const Profile: React.FC<ProfileProps> = ({ name, username, email, bath, food, laundry, sleep, smoke }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingField, setEditingField] = useState<null | string>(null);
  const [profile, setProfile] = useState({
    name,
    username,
    email,
    bath,
    food,
    laundry,
    sleep,
    smoke,
  });

  const handleEdit = (field: string) => {
    if (isEditing) {
      setEditingField(field);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    setEditingField(null);
  };

  const toggleEditMode = () => {
    if (isEditing) {
      setEditingField(null);
    }
    setIsEditing(!isEditing);
  };

  const renderProfileRow = (label: string, value: string, field: string) => (
    <div className="profile-row" onClick={() => handleEdit(field)}>
      <div className="profile-label">{label}</div>
      {editingField === field ? (
        <input
          className="profile-value-edit"
          type="text"
          name={field}
          value={profile[field as keyof typeof profile]}
          onChange={handleChange}
          onBlur={handleSave}
          autoFocus
        />
      ) : (
        <div className="profile-value">{value}</div>
      )}
    </div>
  );

  return (
    <div className="profile-container">
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
        <div className="edit-profile-text">Edit profile image</div>
      </div>
      <div className="profile-details">
        {renderProfileRow('Name', profile.name, 'name')}
        {renderProfileRow('Username', profile.username, 'username')}
        {renderProfileRow('Email', profile.email, 'email')}
        {renderProfileRow('Bath', profile.bath, 'bath')}
        {renderProfileRow('Food', profile.food, 'food')}
        {renderProfileRow('Laundry', profile.laundry, 'laundry')}
        {renderProfileRow('Sleep', profile.sleep, 'sleep')}
        {renderProfileRow('Smoke', profile.smoke, 'smoke')}
      </div>
      <style>{`
        .profile-container {
          width: 100vw;
          height: calc(100vh - 120px);
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
          background: none;
          border: none;
          color: #F9ECCB;
        }

        .profile-row:last-child {
          border-bottom: none;
        }
      `}</style>
    </div>
  );
};

export default Profile;

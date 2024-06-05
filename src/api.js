import axios from 'axios';
import { db, doc, getDoc } from './firebase/firebase';

const API_URL = 'http://127.0.0.1:5000/api/data';

export const fetchData = async () => {
    try {
        const response = await axios.get(API_URL);
        return response.data;
    } catch (error) {
        console.error('Error fetching data from Flask API:', error);
        throw error;
    }
};

export const sendData = async (data) => {
    try {
        const response = await axios.post(API_URL, data);
        return response.data;
    } catch (error) {
        console.error('Error sending data to Flask API:', error);
        throw error;
    }
};

export const fetchFirebaseData = async (docId) => {
    try {
        const docRef = doc(db, 'collectionName', docId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data();
        } else {
            console.error('No such document!');
            return null;
        }
    } catch (error) {
        console.error('Error fetching data from Firebase:', error);
        throw error;
    }
};

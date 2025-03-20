import axios from 'axios';

// בסיס URL לפונקציות Netlify
const API_BASE_URL = '/.netlify/functions';

// פונקציה לקבלת כל האנשים
export const getAllPeople = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/people`);
    return response.data;
  } catch (error) {
    console.error('Error fetching all people:', error);
    throw error;
  }
};

// פונקציה לקבלת אדם ספציפי
export const getPerson = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/person?id=${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching person with id ${id}:`, error);
    throw error;
  }
};

// פונקציה להוספת אדם חדש
export const addPerson = async (personData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/add-person`, personData);
    return response.data;
  } catch (error) {
    console.error('Error adding new person:', error);
    throw error;
  }
};

// פונקציה למחיקת אדם ספציפי
export const deletePerson = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/person?id=${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting person with id ${id}:`, error);
    throw error;
  }
};

// פונקציה למחיקת כל האנשים
export const deleteAllPeople = async () => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/people`);
    return response.data;
  } catch (error) {
    console.error('Error deleting all people:', error);
    throw error;
  }
};

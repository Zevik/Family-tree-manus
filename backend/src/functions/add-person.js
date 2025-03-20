const mongoose = require('mongoose');
const serverless = require('serverless-http');
const express = require('express');
const cors = require('cors');
const Person = require('../models/Person');
const { formatGregorianDate, formatHebrewDate } = require('../utils/dateUtils');

// יצירת אפליקציית Express
const app = express();

// הגדרת middleware
app.use(cors());
app.use(express.json());

// חיבור למסד הנתונים MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://zaviner:k8j7vwtfKvuxgRGy@cluster0.bdnjk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB Connected');
  } catch (err) {
    console.error('MongoDB Connection Error:', err.message);
    process.exit(1);
  }
};

// ניתוב להוספת אדם חדש
app.post('/add-person', async (req, res) => {
  try {
    await connectDB();
    
    const {
      firstName,
      lastName,
      email,
      phone,
      birthDateGregorian,
      birthDateHebrew,
      deathDateGregorian,
      deathDateHebrew,
      primaryDateFormat,
      notes,
      fatherId,
      motherId,
      spouseId
    } = req.body;
    
    // בדיקת שדות חובה
    if (!firstName || !lastName || !birthDateGregorian || !birthDateHebrew || !primaryDateFormat) {
      return res.status(400).json({ error: 'חסרים שדות חובה' });
    }
    
    // פורמט תאריכים
    const formattedBirthDateGregorian = formatGregorianDate(birthDateGregorian);
    const formattedBirthDateHebrew = formatHebrewDate(birthDateHebrew);
    const formattedDeathDateGregorian = deathDateGregorian ? formatGregorianDate(deathDateGregorian) : undefined;
    const formattedDeathDateHebrew = deathDateHebrew ? formatHebrewDate(deathDateHebrew) : undefined;
    
    // יצירת אדם חדש
    const newPerson = new Person({
      firstName,
      lastName,
      email,
      phone,
      birthDateGregorian: formattedBirthDateGregorian,
      birthDateHebrew: formattedBirthDateHebrew,
      deathDateGregorian: formattedDeathDateGregorian,
      deathDateHebrew: formattedDeathDateHebrew,
      primaryDateFormat,
      notes,
      fatherId,
      motherId,
      spouseId
    });
    
    // שמירת האדם החדש במסד הנתונים
    const savedPerson = await newPerson.save();
    
    // עדכון קשר בן/בת זוג הדדי
    if (spouseId) {
      const spouse = await Person.findById(spouseId);
      if (spouse && !spouse.spouseId) {
        spouse.spouseId = savedPerson._id;
        await spouse.save();
      }
    }
    
    res.status(201).json(savedPerson);
  } catch (err) {
    console.error('Error adding person:', err.message);
    res.status(500).json({ error: 'שגיאה בהוספת אדם חדש' });
  }
});

// יצוא הפונקציה כפונקציית Netlify
exports.handler = serverless(app);

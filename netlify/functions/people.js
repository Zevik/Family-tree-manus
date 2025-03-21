const mongoose = require('mongoose');
const serverless = require('serverless-http');
const express = require('express');
const cors = require('cors');
const Person = require('../models/Person');
const { calculateDaysUntilNextBirthday } = require('../utils/dateUtils');

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

// ניתוב לקבלת כל האנשים
app.get('/people', async (req, res) => {
  try {
    await connectDB();
    
    // שליפת כל האנשים ממסד הנתונים
    const people = await Person.find();
    
    // יצירת מיפוי של כל האנשים לפי מזהה
    const peopleMap = {};
    people.forEach(person => {
      peopleMap[person._id.toString()] = person;
    });
    
    // הוספת מידע על קשרים משפחתיים לכל אדם
    const enrichedPeople = people.map(person => {
      const personObj = person.toObject();
      
      // הוספת מידע על הורים
      if (person.fatherId && peopleMap[person.fatherId.toString()]) {
        personObj.father = {
          _id: person.fatherId,
          firstName: peopleMap[person.fatherId.toString()].firstName,
          lastName: peopleMap[person.fatherId.toString()].lastName
        };
      }
      
      if (person.motherId && peopleMap[person.motherId.toString()]) {
        personObj.mother = {
          _id: person.motherId,
          firstName: peopleMap[person.motherId.toString()].firstName,
          lastName: peopleMap[person.motherId.toString()].lastName
        };
      }
      
      // הוספת מידע על בן/בת זוג
      if (person.spouseId && peopleMap[person.spouseId.toString()]) {
        personObj.spouse = {
          _id: person.spouseId,
          firstName: peopleMap[person.spouseId.toString()].firstName,
          lastName: peopleMap[person.spouseId.toString()].lastName
        };
      }
      
      // הוספת מידע על ילדים
      personObj.children = people
        .filter(p => 
          (p.fatherId && p.fatherId.toString() === person._id.toString()) ||
          (p.motherId && p.motherId.toString() === person._id.toString())
        )
        .map(child => ({
          _id: child._id,
          firstName: child.firstName,
          lastName: child.lastName
        }));
      
      // הוספת מידע על אחים ואחיות
      personObj.siblings = people
        .filter(p => 
          p._id.toString() !== person._id.toString() && (
            (person.fatherId && p.fatherId && p.fatherId.toString() === person.fatherId.toString()) ||
            (person.motherId && p.motherId && p.motherId.toString() === person.motherId.toString())
          )
        )
        .map(sibling => ({
          _id: sibling._id,
          firstName: sibling.firstName,
          lastName: sibling.lastName
        }));
      
      // חישוב ימים עד יום ההולדת הבא
      const birthDateField = person.primaryDateFormat === 'hebrew' ? 'birthDateHebrew' : 'birthDateGregorian';
      personObj.daysUntilBirthday = calculateDaysUntilNextBirthday(
        person[birthDateField],
        person.primaryDateFormat
      );
      
      return personObj;
    });
    
    // מיון האנשים לפי ימים עד יום ההולדת
    enrichedPeople.sort((a, b) => {
      // אם אין מידע על ימים עד יום ההולדת, להציב בסוף
      if (a.daysUntilBirthday === null) return 1;
      if (b.daysUntilBirthday === null) return -1;
      
      return a.daysUntilBirthday - b.daysUntilBirthday;
    });
    
    res.json(enrichedPeople);
  } catch (err) {
    console.error('Error fetching people:', err.message);
    res.status(500).json({ error: 'שגיאה בשליפת נתונים ממסד הנתונים' });
  }
});

// ניתוב למחיקת כל האנשים
app.delete('/people', async (req, res) => {
  try {
    await connectDB();
    
    // מחיקת כל האנשים ממסד הנתונים
    await Person.deleteMany({});
    
    res.json({ message: 'כל האנשים נמחקו בהצלחה' });
  } catch (err) {
    console.error('Error deleting people:', err.message);
    res.status(500).json({ error: 'שגיאה במחיקת נתונים ממסד הנתונים' });
  }
});

// יצוא הפונקציה כפונקציית Netlify
exports.handler = serverless(app);

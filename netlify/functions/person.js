const mongoose = require('mongoose');
const serverless = require('serverless-http');
const express = require('express');
const cors = require('cors');
const Person = require('../models/Person');

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

// ניתוב לקבלת אדם ספציפי
app.get('/person', async (req, res) => {
  try {
    await connectDB();
    
    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({ error: 'נדרש מזהה אדם' });
    }
    
    // שליפת האדם ממסד הנתונים
    const person = await Person.findById(id);
    
    if (!person) {
      return res.status(404).json({ error: 'אדם לא נמצא' });
    }
    
    // שליפת כל האנשים ממסד הנתונים לצורך קישור קשרים משפחתיים
    const people = await Person.find();
    
    // יצירת מיפוי של כל האנשים לפי מזהה
    const peopleMap = {};
    people.forEach(p => {
      peopleMap[p._id.toString()] = p;
    });
    
    // הוספת מידע על קשרים משפחתיים
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
    
    res.json(personObj);
  } catch (err) {
    console.error('Error fetching person:', err.message);
    res.status(500).json({ error: 'שגיאה בשליפת נתונים ממסד הנתונים' });
  }
});

// ניתוב למחיקת אדם ספציפי
app.delete('/person', async (req, res) => {
  try {
    await connectDB();
    
    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({ error: 'נדרש מזהה אדם' });
    }
    
    // שליפת האדם ממסד הנתונים
    const person = await Person.findById(id);
    
    if (!person) {
      return res.status(404).json({ error: 'אדם לא נמצא' });
    }
    
    // מחיקת האדם ממסד הנתונים
    await Person.findByIdAndDelete(id);
    
    // עדכון קשרים משפחתיים
    // הסרת קשרי אב/אם/בן זוג מאנשים אחרים
    await Person.updateMany(
      { fatherId: id },
      { $unset: { fatherId: 1 } }
    );
    
    await Person.updateMany(
      { motherId: id },
      { $unset: { motherId: 1 } }
    );
    
    await Person.updateMany(
      { spouseId: id },
      { $unset: { spouseId: 1 } }
    );
    
    res.json({ message: `${person.firstName} ${person.lastName} נמחק בהצלחה` });
  } catch (err) {
    console.error('Error deleting person:', err.message);
    res.status(500).json({ error: 'שגיאה במחיקת נתונים ממסד הנתונים' });
  }
});

// יצוא הפונקציה כפונקציית Netlify
exports.handler = serverless(app);

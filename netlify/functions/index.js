const mongoose = require('mongoose');
const serverless = require('serverless-http');
const express = require('express');
const cors = require('cors');

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

// ניתוב בסיסי לבדיקת חיבור
app.get('/', (req, res) => {
  res.json({ message: 'Family Tree API is running' });
});

// יצוא הפונקציה כפונקציית Netlify
exports.handler = serverless(app);

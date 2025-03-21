const { HDate, HebrewCalendar } = require('@hebcal/core');

// מיפוי חודשים עבריים למספרים
const hebrewMonthsMap = {
  'ניסן': 1,
  'אייר': 2,
  'סיון': 3,
  'תמוז': 4,
  'אב': 5,
  'אלול': 6,
  'תשרי': 7,
  'חשון': 8,
  'כסלו': 9,
  'טבת': 10,
  'שבט': 11,
  'אדר': 12,
  'אדר א': 12,
  'אדר ב': 13
};

// פורמט תאריך לועזי מ-YYYY-MM-DD ל-DD/MM/YYYY
const formatGregorianDate = (dateStr) => {
  if (!dateStr) return '';
  
  // אם התאריך כבר בפורמט DD/MM/YYYY, להחזיר אותו כמו שהוא
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
    return dateStr;
  }
  
  // אם התאריך בפורמט של אובייקט Date
  if (dateStr instanceof Date) {
    const day = String(dateStr.getDate()).padStart(2, '0');
    const month = String(dateStr.getMonth() + 1).padStart(2, '0');
    const year = dateStr.getFullYear();
    return `${day}/${month}/${year}`;
  }
  
  // אחרת, להמיר מפורמט YYYY-MM-DD
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  
  return dateStr;
};

// הוספת המילה "ב" לפני החודש בתאריך עברי אם היא חסרה
const formatHebrewDate = (dateStr) => {
  if (!dateStr) return '';
  
  // אם התאריך כבר מתחיל ב-"ב", להחזיר אותו כמו שהוא
  if (dateStr.startsWith('ב')) {
    return dateStr;
  }
  
  // אחרת, להוסיף "ב" בתחילת התאריך
  return `ב${dateStr}`;
};

// המרת תאריך לועזי לתאריך עברי
const convertGregorianToHebrew = (gregorianDate) => {
  if (!gregorianDate) return '';
  
  try {
    // פיצול התאריך הלועזי
    const parts = gregorianDate.split('/');
    if (parts.length !== 3) return '';
    
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // חודשים ב-JavaScript מתחילים מ-0
    const year = parseInt(parts[2], 10);
    
    // יצירת אובייקט תאריך לועזי
    const date = new Date(year, month, day);
    
    // המרה לתאריך עברי
    const hdate = new HDate(date);
    
    // קבלת היום והחודש העברי
    const hebrewDay = hdate.getDate();
    const hebrewMonth = hdate.getMonthName('he');
    
    // החזרת התאריך העברי בפורמט המבוקש
    return `ב${hebrewDay} ${hebrewMonth}`;
  } catch (error) {
    console.error('Error converting Gregorian to Hebrew date:', error);
    return '';
  }
};

// המרת תאריך עברי לתאריך לועזי
const convertHebrewToGregorian = (hebrewDate) => {
  if (!hebrewDate) return '';
  
  try {
    // הסרת המילה "ב" מתחילת התאריך אם קיימת
    let cleanDate = hebrewDate;
    if (cleanDate.startsWith('ב')) {
      cleanDate = cleanDate.substring(1);
    }
    
    // פיצול התאריך לחלקים
    const parts = cleanDate.trim().split(' ');
    if (parts.length < 2) return '';
    
    const day = parseInt(parts[0], 10);
    const monthName = parts.slice(1).join(' '); // שם החודש העברי
    const monthNum = hebrewMonthsMap[monthName];
    
    if (!monthNum) return '';
    
    // יצירת אובייקט HDate
    const hdateToday = new HDate();
    const year = hdateToday.getFullYear();
    
    // יצירת תאריך עברי
    const hdate = new HDate(day, monthNum, year);
    
    // המרה לתאריך לועזי
    const gregDate = hdate.greg();
    
    // פורמט התאריך הלועזי
    const gregDay = String(gregDate.getDate()).padStart(2, '0');
    const gregMonth = String(gregDate.getMonth() + 1).padStart(2, '0');
    const gregYear = gregDate.getFullYear();
    
    return `${gregDay}/${gregMonth}/${gregYear}`;
  } catch (error) {
    console.error('Error converting Hebrew to Gregorian date:', error);
    return '';
  }
};

// חישוב מספר הימים עד יום ההולדת הבא
const calculateDaysUntilNextBirthday = (birthDate, primaryDateFormat) => {
  try {
    const today = new Date();
    let nextBirthday;
    
    if (primaryDateFormat === 'gregorian') {
      // טיפול בתאריך לועזי
      const parts = birthDate.split('/');
      if (parts.length !== 3) return null;
      
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // חודשים ב-JavaScript מתחילים מ-0
      
      // יצירת תאריך יום ההולדת הבא בשנה הנוכחית
      nextBirthday = new Date(today.getFullYear(), month, day);
      
      // אם התאריך כבר עבר השנה, להוסיף שנה
      if (nextBirthday < today) {
        nextBirthday.setFullYear(today.getFullYear() + 1);
      }
    } else {
      // טיפול בתאריך עברי
      // הסרת המילה "ב" מתחילת התאריך אם קיימת
      let cleanDate = birthDate;
      if (cleanDate.startsWith('ב')) {
        cleanDate = cleanDate.substring(1);
      }
      
      // פיצול התאריך לחלקים
      const parts = cleanDate.trim().split(' ');
      if (parts.length < 2) return null;
      
      const day = parseInt(parts[0], 10);
      const monthName = parts.slice(1).join(' '); // שם החודש העברי
      const monthNum = hebrewMonthsMap[monthName];
      
      if (!monthNum) return null;
      
      // יצירת אובייקט HDate
      const hdateToday = new HDate();
      
      // חישוב התאריך העברי הבא
      const nextHebrewBirthday = HebrewCalendar.getBirthdayOrAnniversary(day, monthNum, hdateToday.getFullYear());
      
      // המרה לתאריך לועזי
      nextBirthday = nextHebrewBirthday.greg();
      
      // אם התאריך כבר עבר השנה, לחשב לשנה הבאה
      if (nextBirthday < today) {
        const nextYearHebrew = HebrewCalendar.getBirthdayOrAnniversary(day, monthNum, hdateToday.getFullYear() + 1);
        nextBirthday = nextYearHebrew.greg();
      }
    }
    
    // חישוב מספר הימים עד יום ההולדת הבא
    const timeDiff = nextBirthday.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    return daysDiff;
  } catch (error) {
    console.error('Error calculating days until next birthday:', error);
    return null;
  }
};

module.exports = {
  hebrewMonthsMap,
  formatGregorianDate,
  formatHebrewDate,
  convertGregorianToHebrew,
  convertHebrewToGregorian,
  calculateDaysUntilNextBirthday
};

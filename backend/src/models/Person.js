const mongoose = require('mongoose');

const personSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'כתובת אימייל לא תקינה']
  },
  phone: {
    type: String,
    trim: true
  },
  birthDateGregorian: {
    type: String,
    required: true,
    match: [/^\d{2}\/\d{2}\/\d{4}$/, 'פורמט תאריך לועזי לא תקין (DD/MM/YYYY)']
  },
  birthDateHebrew: {
    type: String,
    required: true
  },
  deathDateGregorian: {
    type: String,
    match: [/^\d{2}\/\d{2}\/\d{4}$/, 'פורמט תאריך לועזי לא תקין (DD/MM/YYYY)']
  },
  deathDateHebrew: {
    type: String
  },
  primaryDateFormat: {
    type: String,
    enum: ['hebrew', 'gregorian'],
    required: true,
    default: 'hebrew'
  },
  notes: {
    type: String
  },
  fatherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Person'
  },
  motherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Person'
  },
  spouseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Person'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// וירטואלים לקבלת מידע על קשרים משפחתיים
personSchema.virtual('father', {
  ref: 'Person',
  localField: 'fatherId',
  foreignField: '_id',
  justOne: true
});

personSchema.virtual('mother', {
  ref: 'Person',
  localField: 'motherId',
  foreignField: '_id',
  justOne: true
});

personSchema.virtual('spouse', {
  ref: 'Person',
  localField: 'spouseId',
  foreignField: '_id',
  justOne: true
});

// וירטואל לקבלת ילדים (אנשים שהאדם הנוכחי הוא האב או האם שלהם)
personSchema.virtual('children', {
  ref: 'Person',
  localField: '_id',
  foreignField: 'fatherId',
  match: function() {
    return { fatherId: this._id };
  }
});

personSchema.virtual('childrenAsMother', {
  ref: 'Person',
  localField: '_id',
  foreignField: 'motherId',
  match: function() {
    return { motherId: this._id };
  }
});

// מתודה סטטית לקבלת כל הילדים של אדם (מאחד את הילדים כאב וכאם)
personSchema.statics.findAllChildren = async function(personId) {
  const childrenAsFather = await this.find({ fatherId: personId });
  const childrenAsMother = await this.find({ motherId: personId });
  
  // מיזוג ומניעת כפילויות
  const allChildren = [...childrenAsFather];
  childrenAsMother.forEach(child => {
    if (!allChildren.some(c => c._id.toString() === child._id.toString())) {
      allChildren.push(child);
    }
  });
  
  return allChildren;
};

// מתודה סטטית לקבלת כל האחים והאחיות של אדם
personSchema.statics.findSiblings = async function(personId) {
  const person = await this.findById(personId);
  if (!person) return [];
  
  const siblings = [];
  
  // אחים ואחיות מאותו אב
  if (person.fatherId) {
    const siblingsFromFather = await this.find({
      fatherId: person.fatherId,
      _id: { $ne: personId }
    });
    siblings.push(...siblingsFromFather);
  }
  
  // אחים ואחיות מאותה אם
  if (person.motherId) {
    const siblingsFromMother = await this.find({
      motherId: person.motherId,
      _id: { $ne: personId }
    });
    
    // הוספת אחים ואחיות מהאם שלא נוספו כבר מהאב
    siblingsFromMother.forEach(sibling => {
      if (!siblings.some(s => s._id.toString() === sibling._id.toString())) {
        siblings.push(sibling);
      }
    });
  }
  
  return siblings;
};

const Person = mongoose.model('Person', personSchema);

module.exports = Person;

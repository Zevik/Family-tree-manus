import React from 'react';
import { Card, Button } from 'react-bootstrap';
import { deletePerson } from '../services/api';

const PersonCard = ({ person, onPersonDeleted }) => {
  // טיפול במחיקת אדם
  const handleDelete = async () => {
    if (window.confirm(`האם אתה בטוח שברצונך למחוק את ${person.firstName} ${person.lastName}? פעולה זו אינה ניתנת לביטול.`)) {
      try {
        await deletePerson(person._id);
        onPersonDeleted();
      } catch (error) {
        console.error('Error deleting person:', error);
        alert('שגיאה במחיקת האדם. אנא נסה שוב מאוחר יותר.');
      }
    }
  };

  // הצגת תאריך לידה בהתאם לפורמט המועדף
  const displayBirthDate = person.primaryDateFormat === 'hebrew' 
    ? person.birthDateHebrew 
    : person.birthDateGregorian;

  // הצגת תאריך פטירה בהתאם לפורמט המועדף (אם קיים)
  const displayDeathDate = person.deathDateHebrew || person.deathDateGregorian
    ? (person.primaryDateFormat === 'hebrew' && person.deathDateHebrew
        ? person.deathDateHebrew
        : person.deathDateGregorian)
    : null;

  return (
    <Card className="person-card">
      <Card.Body>
        <Card.Title>
          <h3>{person.firstName} {person.lastName}</h3>
        </Card.Title>
        
        <div className="person-dates">
          <div>תאריך לידה: {displayBirthDate}</div>
          {displayDeathDate && <div>תאריך פטירה: {displayDeathDate}</div>}
          {person.daysUntilBirthday !== null && !displayDeathDate && (
            <div>ימים עד יום ההולדת: <span className="days-until">{person.daysUntilBirthday}</span></div>
          )}
        </div>
        
        <div className="person-relations">
          {person.father && (
            <div>אב: {person.father.firstName} {person.father.lastName}</div>
          )}
          
          {person.mother && (
            <div>אם: {person.mother.firstName} {person.mother.lastName}</div>
          )}
          
          {person.spouse && (
            <div>בן/בת זוג: {person.spouse.firstName} {person.spouse.lastName}</div>
          )}
          
          {person.children && person.children.length > 0 && (
            <div>
              <div>ילדים:</div>
              <ul>
                {person.children.map(child => (
                  <li key={child._id}>{child.firstName} {child.lastName}</li>
                ))}
              </ul>
            </div>
          )}
          
          {person.siblings && person.siblings.length > 0 && (
            <div>
              <div>אחים ואחיות:</div>
              <ul>
                {person.siblings.map(sibling => (
                  <li key={sibling._id}>{sibling.firstName} {sibling.lastName}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        <div className="person-contact">
          {person.email && <div>אימייל: {person.email}</div>}
          {person.phone && <div>טלפון: {person.phone}</div>}
          {person.notes && <div>הערות: {person.notes}</div>}
        </div>
        
        <Button 
          variant="danger" 
          size="sm" 
          className="mt-3"
          onClick={handleDelete}
        >
          מחק
        </Button>
      </Card.Body>
    </Card>
  );
};

export default PersonCard;

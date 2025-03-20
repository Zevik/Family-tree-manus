import React, { useState, useEffect } from 'react';
import { Form, Card } from 'react-bootstrap';

const SuggestedRelationships = ({ people, selectedRelationships, onUpdate }) => {
  const [suggestedRelationships, setSuggestedRelationships] = useState([]);
  const [selectedSuggestions, setSelectedSuggestions] = useState({});

  // עדכון הצעות קשרים משפחתיים בעת שינוי בקשרים הנבחרים
  useEffect(() => {
    if (!people || people.length === 0) return;

    const suggestions = [];
    
    // הוספת ילד - הצעת הורה שני
    if (selectedRelationships.fatherId && !selectedRelationships.motherId) {
      const father = people.find(p => p._id === selectedRelationships.fatherId);
      if (father && father.spouseId) {
        const spouse = people.find(p => p._id === father.spouseId);
        if (spouse) {
          suggestions.push({
            type: 'mother',
            id: spouse._id,
            name: `${spouse.firstName} ${spouse.lastName}`,
            description: `האם להוסיף את ${spouse.firstName} ${spouse.lastName} כאם?`
          });
        }
      }
    }
    
    if (selectedRelationships.motherId && !selectedRelationships.fatherId) {
      const mother = people.find(p => p._id === selectedRelationships.motherId);
      if (mother && mother.spouseId) {
        const spouse = people.find(p => p._id === mother.spouseId);
        if (spouse) {
          suggestions.push({
            type: 'father',
            id: spouse._id,
            name: `${spouse.firstName} ${spouse.lastName}`,
            description: `האם להוסיף את ${spouse.firstName} ${spouse.lastName} כאב?`
          });
        }
      }
    }
    
    // הוספת אח/אחות - הצעת אותם הורים
    if (selectedRelationships.personId) {
      const person = people.find(p => p._id === selectedRelationships.personId);
      if (person) {
        if (person.fatherId && !selectedRelationships.fatherId) {
          const father = people.find(p => p._id === person.fatherId);
          if (father) {
            suggestions.push({
              type: 'father',
              id: father._id,
              name: `${father.firstName} ${father.lastName}`,
              description: `האם להוסיף את ${father.firstName} ${father.lastName} כאב?`
            });
          }
        }
        
        if (person.motherId && !selectedRelationships.motherId) {
          const mother = people.find(p => p._id === person.motherId);
          if (mother) {
            suggestions.push({
              type: 'mother',
              id: mother._id,
              name: `${mother.firstName} ${mother.lastName}`,
              description: `האם להוסיף את ${mother.firstName} ${mother.lastName} כאם?`
            });
          }
        }
      }
    }
    
    // הוספת הורה - הצעת בן/בת זוג והוספת ילדים
    if (selectedRelationships.fatherId && !selectedRelationships.spouseId) {
      const children = people.filter(p => p.fatherId === selectedRelationships.fatherId);
      if (children.length > 0) {
        const childrenWithMother = children.filter(child => child.motherId);
        if (childrenWithMother.length > 0) {
          const motherId = childrenWithMother[0].motherId;
          const mother = people.find(p => p._id === motherId);
          if (mother) {
            suggestions.push({
              type: 'spouse',
              id: mother._id,
              name: `${mother.firstName} ${mother.lastName}`,
              description: `האם להוסיף את ${mother.firstName} ${mother.lastName} כבת זוג?`
            });
          }
        }
      }
    }
    
    if (selectedRelationships.motherId && !selectedRelationships.spouseId) {
      const children = people.filter(p => p.motherId === selectedRelationships.motherId);
      if (children.length > 0) {
        const childrenWithFather = children.filter(child => child.fatherId);
        if (childrenWithFather.length > 0) {
          const fatherId = childrenWithFather[0].fatherId;
          const father = people.find(p => p._id === fatherId);
          if (father) {
            suggestions.push({
              type: 'spouse',
              id: father._id,
              name: `${father.firstName} ${father.lastName}`,
              description: `האם להוסיף את ${father.firstName} ${father.lastName} כבן זוג?`
            });
          }
        }
      }
    }
    
    // הוספת בן/בת זוג - הצעת ילדים
    if (selectedRelationships.spouseId) {
      const spouse = people.find(p => p._id === selectedRelationships.spouseId);
      if (spouse) {
        const spouseChildren = people.filter(p => 
          (p.fatherId === spouse._id && !p.motherId) || 
          (p.motherId === spouse._id && !p.fatherId)
        );
        
        if (spouseChildren.length > 0) {
          suggestions.push({
            type: 'children',
            children: spouseChildren.map(child => ({
              id: child._id,
              name: `${child.firstName} ${child.lastName}`
            })),
            description: `האם להוסיף את הילדים הבאים כילדים שלך?`
          });
        }
      }
    }
    
    setSuggestedRelationships(suggestions);
    
    // איפוס בחירות קודמות
    setSelectedSuggestions({});
  }, [people, selectedRelationships]);
  
  // טיפול בשינוי בחירת הצעה
  const handleSuggestionChange = (e) => {
    const { name, checked, value } = e.target;
    
    setSelectedSuggestions(prev => ({
      ...prev,
      [name]: checked ? value : null
    }));
    
    // עדכון הקשרים המשפחתיים בהתאם לבחירה
    if (name === 'father' && checked) {
      onUpdate({ fatherId: value });
    } else if (name === 'mother' && checked) {
      onUpdate({ motherId: value });
    } else if (name === 'spouse' && checked) {
      onUpdate({ spouseId: value });
    } else if (name.startsWith('child_') && checked) {
      const childId = value;
      const child = people.find(p => p._id === childId);
      
      if (child) {
        if (selectedRelationships.fatherId) {
          // אם האדם הנוכחי הוא האב, להוסיף אותו כאב לילד
          onUpdate({ childrenAsFather: [...(selectedRelationships.childrenAsFather || []), childId] });
        } else if (selectedRelationships.motherId) {
          // אם האדם הנוכחי הוא האם, להוסיף אותה כאם לילד
          onUpdate({ childrenAsMother: [...(selectedRelationships.childrenAsMother || []), childId] });
        }
      }
    }
  };
  
  if (suggestedRelationships.length === 0) {
    return null;
  }
  
  return (
    <Card className="relation-suggestion mb-4">
      <Card.Body>
        <h4 className="relation-suggestion-title">קשרים משפחתיים מוצעים</h4>
        
        {suggestedRelationships.map((suggestion, index) => (
          <div key={index} className="mb-3">
            <p>{suggestion.description}</p>
            
            {suggestion.type === 'children' ? (
              // הצעת ילדים
              suggestion.children.map(child => (
                <Form.Check
                  key={child.id}
                  type="checkbox"
                  id={`child-${child.id}`}
                  name={`child_${child.id}`}
                  label={child.name}
                  value={child.id}
                  checked={selectedSuggestions[`child_${child.id}`] === child.id}
                  onChange={handleSuggestionChange}
                  className="mb-2"
                />
              ))
            ) : (
              // הצעת אב/אם/בן זוג
              <Form.Check
                type="checkbox"
                id={`${suggestion.type}-${suggestion.id}`}
                name={suggestion.type}
                label={suggestion.name}
                value={suggestion.id}
                checked={selectedSuggestions[suggestion.type] === suggestion.id}
                onChange={handleSuggestionChange}
              />
            )}
          </div>
        ))}
      </Card.Body>
    </Card>
  );
};

export default SuggestedRelationships;

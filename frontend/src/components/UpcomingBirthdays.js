import React from 'react';
import { Card, ListGroup } from 'react-bootstrap';

const UpcomingBirthdays = ({ birthdays }) => {
  if (!birthdays || birthdays.length === 0) {
    return (
      <Card className="upcoming-birthdays">
        <Card.Body>
          <h3>ימי הולדת קרובים</h3>
          <p>אין ימי הולדת קרובים להצגה.</p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="upcoming-birthdays">
      <Card.Body>
        <h3>ימי הולדת קרובים</h3>
        <ListGroup variant="flush">
          {birthdays.map(person => (
            <ListGroup.Item key={person._id} className="birthday-item">
              <div>
                <strong>{person.firstName} {person.lastName}</strong>
              </div>
              <div>
                {person.primaryDateFormat === 'hebrew' 
                  ? person.birthDateHebrew 
                  : person.birthDateGregorian}
              </div>
              <div>
                בעוד <span className="days-until">{person.daysUntilBirthday}</span> ימים
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Card.Body>
    </Card>
  );
};

export default UpcomingBirthdays;

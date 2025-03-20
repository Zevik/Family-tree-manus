import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Alert } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import PersonCard from './components/PersonCard';
import AddPersonForm from './components/AddPersonForm';
import SearchBar from './components/SearchBar';
import UpcomingBirthdays from './components/UpcomingBirthdays';
import { getAllPeople, deleteAllPeople } from './services/api';

function App() {
  const [people, setPeople] = useState([]);
  const [filteredPeople, setFilteredPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshData, setRefreshData] = useState(0);

  // טעינת נתונים בעת טעינת האפליקציה
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getAllPeople();
        setPeople(data);
        setFilteredPeople(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('שגיאה בטעינת נתונים. אנא נסה שוב מאוחר יותר.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [refreshData]);

  // פילטור אנשים לפי חיפוש
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredPeople(people);
      return;
    }

    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    const filtered = people.filter(person => {
      // חיפוש בשם פרטי ושם משפחה
      if (
        person.firstName.toLowerCase().includes(lowerCaseSearchTerm) ||
        person.lastName.toLowerCase().includes(lowerCaseSearchTerm)
      ) {
        return true;
      }

      // חיפוש באימייל וטלפון
      if (
        (person.email && person.email.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (person.phone && person.phone.includes(lowerCaseSearchTerm))
      ) {
        return true;
      }

      // חיפוש במידע על הורים
      if (
        (person.father && 
          (`${person.father.firstName} ${person.father.lastName}`).toLowerCase().includes(lowerCaseSearchTerm)) ||
        (person.mother && 
          (`${person.mother.firstName} ${person.mother.lastName}`).toLowerCase().includes(lowerCaseSearchTerm))
      ) {
        return true;
      }

      // חיפוש במידע על בן/בת זוג
      if (
        person.spouse && 
        (`${person.spouse.firstName} ${person.spouse.lastName}`).toLowerCase().includes(lowerCaseSearchTerm)
      ) {
        return true;
      }

      return false;
    });

    setFilteredPeople(filtered);
  }, [searchTerm, people]);

  // טיפול במחיקת כל האנשים
  const handleDeleteAll = async () => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק את כל האנשים? פעולה זו אינה ניתנת לביטול.')) {
      try {
        await deleteAllPeople();
        setRefreshData(prev => prev + 1);
      } catch (err) {
        console.error('Error deleting all people:', err);
        setError('שגיאה במחיקת נתונים. אנא נסה שוב מאוחר יותר.');
      }
    }
  };

  // טיפול בהוספת אדם חדש
  const handlePersonAdded = () => {
    setShowAddForm(false);
    setRefreshData(prev => prev + 1);
  };

  // טיפול במחיקת אדם
  const handlePersonDeleted = () => {
    setRefreshData(prev => prev + 1);
  };

  // מיון אנשים לפי ימי הולדת קרובים
  const upcomingBirthdays = [...people]
    .filter(person => person.daysUntilBirthday !== null)
    .sort((a, b) => a.daysUntilBirthday - b.daysUntilBirthday)
    .slice(0, 5);

  return (
    <div className="app" dir="rtl">
      <Container>
        <header className="app-header text-center my-4">
          <h1>עץ משפחה</h1>
          <Button 
            variant="danger" 
            onClick={handleDeleteAll}
            className="mt-2"
          >
            מחק את כל האנשים
          </Button>
        </header>

        <Row className="mb-4">
          <Col>
            <SearchBar 
              searchTerm={searchTerm} 
              setSearchTerm={setSearchTerm} 
            />
          </Col>
          <Col className="text-left">
            <Button 
              variant="primary" 
              onClick={() => setShowAddForm(!showAddForm)}
            >
              {showAddForm ? 'סגור טופס' : 'הוסף אדם חדש'}
            </Button>
          </Col>
        </Row>

        {error && (
          <Alert variant="danger" className="mb-4">
            {error}
          </Alert>
        )}

        {showAddForm && (
          <Row className="mb-4">
            <Col>
              <AddPersonForm 
                people={people} 
                onPersonAdded={handlePersonAdded} 
              />
            </Col>
          </Row>
        )}

        <Row className="mb-4">
          <Col md={4}>
            <UpcomingBirthdays birthdays={upcomingBirthdays} />
          </Col>
          <Col md={8}>
            <h2 className="mb-3">אנשים ({filteredPeople.length})</h2>
            {loading ? (
              <p>טוען נתונים...</p>
            ) : filteredPeople.length === 0 ? (
              <p>אין אנשים להצגה. נסה להוסיף אדם חדש.</p>
            ) : (
              <Row>
                {filteredPeople.map(person => (
                  <Col md={6} key={person._id} className="mb-4">
                    <PersonCard 
                      person={person} 
                      onPersonDeleted={handlePersonDeleted}
                    />
                  </Col>
                ))}
              </Row>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default App;

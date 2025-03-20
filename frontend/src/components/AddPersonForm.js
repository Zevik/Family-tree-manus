import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Card } from 'react-bootstrap';
import { addPerson } from '../services/api';
import { convertGregorianToHebrew, convertHebrewToGregorian, formatGregorianDateForInput } from '../utils/dateUtils';
import SuggestedRelationships from './SuggestedRelationships';

const AddPersonForm = ({ people, onPersonAdded }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    birthDateGregorian: '',
    birthDateHebrew: '',
    deathDateGregorian: '',
    deathDateHebrew: '',
    primaryDateFormat: 'hebrew',
    notes: '',
    fatherId: '',
    motherId: '',
    spouseId: ''
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  
  // עדכון תאריך עברי בעת שינוי תאריך לועזי
  useEffect(() => {
    if (formData.birthDateGregorian) {
      const hebrewDate = convertGregorianToHebrew(formData.birthDateGregorian);
      if (hebrewDate) {
        setFormData(prev => ({ ...prev, birthDateHebrew: hebrewDate }));
      }
    }
  }, [formData.birthDateGregorian]);
  
  // עדכון תאריך לועזי בעת שינוי תאריך עברי
  useEffect(() => {
    if (formData.birthDateHebrew) {
      const gregorianDate = convertHebrewToGregorian(formData.birthDateHebrew);
      if (gregorianDate) {
        setFormData(prev => ({ ...prev, birthDateGregorian: gregorianDate }));
      }
    }
  }, [formData.birthDateHebrew]);
  
  // עדכון תאריך פטירה עברי בעת שינוי תאריך פטירה לועזי
  useEffect(() => {
    if (formData.deathDateGregorian) {
      const hebrewDate = convertGregorianToHebrew(formData.deathDateGregorian);
      if (hebrewDate) {
        setFormData(prev => ({ ...prev, deathDateHebrew: hebrewDate }));
      }
    }
  }, [formData.deathDateGregorian]);
  
  // עדכון תאריך פטירה לועזי בעת שינוי תאריך פטירה עברי
  useEffect(() => {
    if (formData.deathDateHebrew) {
      const gregorianDate = convertHebrewToGregorian(formData.deathDateHebrew);
      if (gregorianDate) {
        setFormData(prev => ({ ...prev, deathDateGregorian: gregorianDate }));
      }
    }
  }, [formData.deathDateHebrew]);
  
  // טיפול בשינוי שדות הטופס
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // ניקוי שגיאות בעת שינוי שדה
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };
  
  // עדכון קשרים משפחתיים מוצעים
  const handleSuggestedRelationshipsUpdate = (updates) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };
  
  // בדיקת תקינות הטופס
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'שם פרטי הוא שדה חובה';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'שם משפחה הוא שדה חובה';
    }
    
    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'כתובת אימייל לא תקינה';
    }
    
    if (!formData.birthDateGregorian || !/^\d{2}\/\d{2}\/\d{4}$/.test(formData.birthDateGregorian)) {
      newErrors.birthDateGregorian = 'תאריך לידה לועזי הוא שדה חובה (פורמט: DD/MM/YYYY)';
    }
    
    if (!formData.birthDateHebrew) {
      newErrors.birthDateHebrew = 'תאריך לידה עברי הוא שדה חובה';
    }
    
    if (formData.deathDateGregorian && !/^\d{2}\/\d{2}\/\d{4}$/.test(formData.deathDateGregorian)) {
      newErrors.deathDateGregorian = 'פורמט תאריך פטירה לועזי לא תקין (DD/MM/YYYY)';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // שליחת הטופס
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      await addPerson(formData);
      
      // איפוס הטופס
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        birthDateGregorian: '',
        birthDateHebrew: '',
        deathDateGregorian: '',
        deathDateHebrew: '',
        primaryDateFormat: 'hebrew',
        notes: '',
        fatherId: '',
        motherId: '',
        spouseId: ''
      });
      
      setErrors({});
      onPersonAdded();
    } catch (error) {
      console.error('Error adding person:', error);
      setErrors({ submit: 'שגיאה בהוספת אדם חדש. אנא נסה שוב מאוחר יותר.' });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card className="add-person-form">
      <Card.Body>
        <h3>הוספת אדם חדש</h3>
        
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>שם פרטי *</Form.Label>
                <Form.Control
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  isInvalid={!!errors.firstName}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.firstName}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>שם משפחה *</Form.Label>
                <Form.Control
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  isInvalid={!!errors.lastName}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.lastName}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>אימייל</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  isInvalid={!!errors.email}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.email}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>טלפון</Form.Label>
                <Form.Control
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>
          
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>תאריך לידה לועזי *</Form.Label>
                <Form.Control
                  type="date"
                  name="birthDateGregorian"
                  value={formatGregorianDateForInput(formData.birthDateGregorian)}
                  onChange={(e) => {
                    const date = e.target.value;
                    if (date) {
                      const parts = date.split('-');
                      const formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
                      setFormData(prev => ({ ...prev, birthDateGregorian: formattedDate }));
                    } else {
                      setFormData(prev => ({ ...prev, birthDateGregorian: '' }));
                    }
                  }}
                  isInvalid={!!errors.birthDateGregorian}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.birthDateGregorian}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>תאריך לידה עברי *</Form.Label>
                <Form.Control
                  type="text"
                  name="birthDateHebrew"
                  value={formData.birthDateHebrew}
                  onChange={handleChange}
                  placeholder="לדוגמה: ב טבת"
                  isInvalid={!!errors.birthDateHebrew}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.birthDateHebrew}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>תאריך פטירה לועזי</Form.Label>
                <Form.Control
                  type="date"
                  name="deathDateGregorian"
                  value={formatGregorianDateForInput(formData.deathDateGregorian)}
                  onChange={(e) => {
                    const date = e.target.value;
                    if (date) {
                      const parts = date.split('-');
                      const formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
                      setFormData(prev => ({ ...prev, deathDateGregorian: formattedDate }));
                    } else {
                      setFormData(prev => ({ ...prev, deathDateGregorian: '' }));
                    }
                  }}
                  isInvalid={!!errors.deathDateGregorian}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.deathDateGregorian}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>תאריך פטירה עברי</Form.Label>
                <Form.Control
                  type="text"
                  name="deathDateHebrew"
                  value={formData.deathDateHebrew}
                  onChange={handleChange}
                  placeholder="לדוגמה: ב טבת"
                />
              </Form.Group>
            </Col>
          </Row>
          
          <Form.Group className="mb-3">
            <Form.Label>פורמט תאריך מועדף *</Form.Label>
            <div>
              <Form.Check
                inline
                type="radio"
                label="עברי"
                name="primaryDateFormat"
                value="hebrew"
                checked={formData.primaryDateFormat === 'hebrew'}
                onChange={handleChange}
              />
              <Form.Check
                inline
                type="radio"
                label="לועזי"
                name="primaryDateFormat"
                value="gregorian"
                checked={formData.primaryDateFormat === 'gregorian'}
                onChange={handleChange}
              />
            </div>
          </Form.Group>
          
          <Row>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>אב</Form.Label>
                <Form.Select
                  name="fatherId"
                  value={formData.fatherId}
                  onChange={handleChange}
                >
                  <option value="">בחר אב</option>
                  {people
                    .filter(person => person.deathDateGregorian === undefined || person.deathDateGregorian === '')
                    .map(person => (
                      <option key={person._id} value={person._id}>
                        {person.firstName} {person.lastName}
                      </option>
                    ))
                  }
                </Form.Select>
              </Form.Group>
            </Col>
            
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>אם</Form.Label>
                <Form.Select
                  name="motherId"
                  value={formData.motherId}
                  onChange={handleChange}
                >
                  <option value="">בחר אם</option>
                  {people
                    .filter(person => person.deathDateGregorian === undefined || person.deathDateGregorian === '')
                    .map(person => (
                      <option key={person._id} value={person._id}>
                        {person.firstName} {person.lastName}
                      </option>
                    ))
                  }
                </Form.Select>
              </Form.Group>
            </Col>
            
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>בן/בת זוג</Form.Label>
                <Form.Select
                  name="spouseId"
                  value={formData.spouseId}
                  onChange={handleChange}
                >
                  <option value="">בחר בן/בת זוג</option>
                  {people
                    .filter(person => person.deathDateGregorian === undefined || person.deathDateGregorian === '')
                    .map(person => (
                      <option key={person._id} value={person._id}>
                        {person.firstName} {person.lastName}
                      </option>
                    ))
                  }
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          
          <Form.Group className="mb-3">
            <Form.Label>הערות</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="notes"
              value={formData.notes}
              onChange={handleChange}
            />
          </Form.Group>
          
          {/* קומפוננטת הצעת קשרים משפחתיים */}
          <SuggestedRelationships
            people={people}
            selectedRelationships={{
              personId: '',
              fatherId: formData.fatherId,
              motherId: formData.motherId,
              spouseId: formData.spouseId
            }}
            onUpdate={handleSuggestedRelationshipsUpdate}
          />
          
          {errors.submit && (
            <div className="text-danger mb-3">
              {errors.submit}
            </div>
          )}
          
          <Button 
            variant="primary" 
            type="submit" 
            disabled={loading}
          >
            {loading ? 'מוסיף...' : 'הוסף אדם'}
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default AddPersonForm;

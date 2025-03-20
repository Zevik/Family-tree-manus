import React from 'react';
import { Form, InputGroup } from 'react-bootstrap';

const SearchBar = ({ searchTerm, setSearchTerm }) => {
  return (
    <div className="search-bar">
      <InputGroup>
        <Form.Control
          type="text"
          placeholder="חפש לפי שם, אימייל, טלפון, או קשרים משפחתיים..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <InputGroup.Text 
            style={{ cursor: 'pointer' }}
            onClick={() => setSearchTerm('')}
          >
            ✕
          </InputGroup.Text>
        )}
      </InputGroup>
    </div>
  );
};

export default SearchBar;

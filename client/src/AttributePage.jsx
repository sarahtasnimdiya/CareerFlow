import { useState, useEffect, useRef, useCallback } from "react";
import { Table, Input} from "@heroui/react";
import {jwtDecode} from "jwt-decode";
import { useNavigate } from "react-router-dom";

import { fetchWithAuth } from "./lib/api";


function AttributePage() {
  const [attributes, setAttributes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectCategory, setSelectCategory] = useState("");
  const [categories, setCategories] = useState([]);

  const [selectedId, setSelectedId] = useState(null);

  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();

  const [recentAttributes, setRecentAttributes] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem('recentAttributes');
    const ids = stored ? JSON.parse(stored) : [];
    Promise.all(
    ids.map(id => fetchWithAuth(import.meta.env.VITE_API_URL + `/api/attributes/${id}`))
    ).then(results => setRecentAttributes(results));
  }, [attributes]);


  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = jwtDecode(token);
      setUserRole(decoded.role);
    }
  }, []);

  useEffect(() => {
    fetchWithAuth(import.meta.env.VITE_API_URL + "/api/categories")
      .then(data => setCategories(data))
      .catch(error => console.error(error));
  }, []);



  useEffect(() => {
    loadAttributes();

  
  }, [searchTerm, selectCategory]);

  function loadAttributes() {
    let url = import.meta.env.VITE_API_URL + "/api/attributes";
    const params = new URLSearchParams();
    if (searchTerm) {
      params.append('prefix', searchTerm);
    }
    if (selectCategory) {
      params.append('categoryId', selectCategory);
    }
    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    fetchWithAuth(url)
      .then(data => setAttributes(data))
      .catch(error => console.error(error));
  }



  function selectCategoryHandler(event) {
    setSelectCategory(event.target.value);
  }

  function handleDelete() {
    if (!selectedId) return;
    if (!window.confirm("Are you sure you want to delete this attribute?")) return;

    fetchWithAuth(import.meta.env.VITE_API_URL + `/api/attributes/${selectedId}`, {
    method: 'DELETE'
    })
      .then(() => {
        setSelectedId(null);
        loadAttributes();
      })
      .catch(error => console.error(error));
  }

  console.log(attributes);

  return (
    <div>
      {recentAttributes.length > 0 && (
      <div className="mb-4 text-sm text-navy">
        Recently used: {recentAttributes.map(a => a.name).join(', ')}
      </div>
    )}
      <div className="flex gap-3 mb-4 items-center">
      <Input placeholder="Search attributes..."  
      value={searchTerm} 
      onChange={(e) => setSearchTerm(e.target.value)} />
      <select value={selectCategory} onChange={selectCategoryHandler}>
        <option value="">All Categories</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
      </select>
      
      {(userRole === 'RECRUITER' || userRole === 'ADMIN' ) && (
        <button onClick={() => navigate('/add-attribute')}> + Add Attribute</button>
      )}
      {(userRole === 'RECRUITER' || userRole === 'ADMIN') && selectedId && (
        <>
          <button onClick={() => navigate(`/edit-attribute/${selectedId}`)}>Edit</button>
          <button onClick={handleDelete}>Delete</button>
        </>
      )}
      </div>
        <Table>
          <Table.ScrollContainer>
            <Table.Content aria-label="Attributes Table"
            selectionMode="single"
            onSelectionChange={(keys) => {
              const id = Array.from(keys)[0];
              setSelectedId(id);
            }}
            >
              <Table.Header>
                <Table.Column isRowHeader>Name</Table.Column>
                <Table.Column>Description</Table.Column>
                <Table.Column>Type</Table.Column>
                <Table.Column>Category</Table.Column>
              </Table.Header>
              <Table.Body>
                {attributes.map(attribute => (
                  <Table.Row key={attribute.id} id={attribute.id}>
                    <Table.Cell>{attribute.name}</Table.Cell>
                    <Table.Cell>{attribute.description}</Table.Cell>
                    <Table.Cell>{attribute.type}</Table.Cell>
                    <Table.Cell>{attribute.category.name}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Content>
          </Table.ScrollContainer>
        </Table>
    </div>
  );
}

export default AttributePage;
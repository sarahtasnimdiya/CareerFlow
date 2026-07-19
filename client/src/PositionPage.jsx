import { useState, useEffect, useRef, useCallback } from "react";
import { Table, Input} from "@heroui/react";
import {jwtDecode} from "jwt-decode";
import { useNavigate } from "react-router-dom";

import { fetchWithAuth } from "./lib/api";


function PositionPage() {
  const [positions, setPositions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectAttribute, setSelectAttribute] = useState("");
  const [attributes, setAttributes] = useState([]);

  const [selectedId, setSelectedId] = useState(null);

  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();



  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = jwtDecode(token);
      setUserRole(decoded.role);
    }
  }, []);

  useEffect(() => {
    fetchWithAuth(import.meta.env.VITE_API_URL + "/api/attributes")
      .then(data => setAttributes(data))
      .catch(error => console.error(error));
  }, []);



  useEffect(() => {
    loadPositions();

  
  }, [searchTerm, selectAttribute]);

  function loadPositions() {
    let url = import.meta.env.VITE_API_URL + "/api/positions";
    const params = new URLSearchParams();
    if (searchTerm) {
      params.append('prefix', searchTerm);
    }
    if (selectAttribute) {
      params.append('attributeId', selectAttribute);
    }
    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    fetchWithAuth(url)
      .then(data => setPositions(data))
      .catch(error => console.error(error));
  }



  function selectAttributeHandler(event) {
    setSelectAttribute(event.target.value);
  }

  function handleDelete() {
    if (!selectedId) return;
    if (!window.confirm("Are you sure you want to delete this position?")) return;

    fetchWithAuth(import.meta.env.VITE_API_URL + `/api/positions/${selectedId}`, {
    method: 'DELETE'
    })
      .then(() => {
        setSelectedId(null);
        loadPositions();
      })
      .catch(error => console.error(error));
  }

  function handleDuplicate() {
      if (!selectedId) return;

      fetchWithAuth(import.meta.env.VITE_API_URL + `/api/positions/${selectedId}`)
        .then(original => {
          return fetchWithAuth(import.meta.env.VITE_API_URL + "/api/positions", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: original.title + ' (Copy)',
              shortDescription: original.shortDescription,
              isPublic: original.isPublic,
              maxProjects: original.maxProjects,
              projectTags: original.projectTags,
              attributeIds: original.attributes.map(pa => pa.attributeId),
              accessRules: original.accessRules.map(rule => ({
                attributeId: rule.attributeId,
                operator: rule.operator,
                value: rule.value
              }))
            })
          });
        })
        .then(() => {
          loadPositions();
        })
        .catch(error => console.error(error));
    }

    function handleCreateCV(positionId) {
      fetchWithAuth(import.meta.env.VITE_API_URL + "/api/cvs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ positionId })
      }).then(data => {
        if (data.error) {
          alert(data.error);
        } else {
          navigate(`/cv/${data.id}`);
        }
      });
    }

  console.log(positions);

  return (
    <div>
      <div className="flex gap-3 mb-4 items-center">
      <Input placeholder="Search positions..."  
      value={searchTerm} 
      onChange={(e) => setSearchTerm(e.target.value)} />
      <select value={selectAttribute} onChange={selectAttributeHandler}>
        <option value="">All Attributes</option>
          {attributes.map(attribute => (
            <option key={attribute.id} value={attribute.id}>
              {attribute.name}
            </option>
          ))}
      </select>
      
      {(userRole === 'RECRUITER' || userRole === 'ADMIN' ) && (
        <button onClick={() => navigate('/add-position')}> + Add Position</button>
      )}
      {(userRole === 'RECRUITER' || userRole === 'ADMIN') && selectedId && (
        <>
          <button onClick={() => navigate(`/edit-position/${selectedId}`)}>Edit</button>
          <button onClick={handleDuplicate}>Duplicate</button>
          <button onClick={handleDelete}>Delete</button>
        </>
      )}
      {userRole === 'CANDIDATE' && selectedId && (
          <button onClick={() => handleCreateCV(selectedId)}>Create CV</button>
        )}
      </div>
        <Table>
          <Table.ScrollContainer>
            <Table.Content aria-label="Positions Table"
            selectionMode="single"
            onSelectionChange={(keys) => {
              const id = Array.from(keys)[0];
              setSelectedId(id);
            }}
            >
              <Table.Header>
                <Table.Column isRowHeader>Title</Table.Column>
                <Table.Column>Short Description</Table.Column>
                <Table.Column>Type</Table.Column>
                <Table.Column>Attributes</Table.Column>
              </Table.Header>
              <Table.Body>
                {positions.map(position => (
                  <Table.Row key={position.id} id={position.id}>
                    <Table.Cell>{position.title}</Table.Cell>
                    <Table.Cell>{position.shortDescription}</Table.Cell>
                    <Table.Cell>{position.isPublic ? 'Public' : 'Private'}</Table.Cell>
                    <Table.Cell>{(position.attributes || []).map(pa => pa.attribute.name).join(', ')}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Content>
          </Table.ScrollContainer>
        </Table>
    </div>
  );
}

export default PositionPage;
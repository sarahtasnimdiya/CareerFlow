import { useState, useEffect } from 'react';
import { TextField, Label, Input, Button } from "@heroui/react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchWithAuth } from "./lib/api";

const ATTRIBUTE_TYPES = ['STRING', 'TEXT', 'IMAGE', 'NUMERIC', 'DATE', 'PERIOD', 'BOOLEAN', 'SELECT'];

function EditAttributePage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("STRING");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const [version, setVersion] = useState(null);
  const {id} = useParams();

  useEffect(() => {
    fetchWithAuth(import.meta.env.VITE_API_URL + "/api/categories")
      .then(data => setCategories(data))
      .catch(error => console.error(error));
  }, []);

  useEffect(() => {
    fetchWithAuth(import.meta.env.VITE_API_URL + `/api/attributes/${id}`)
      .then(data => {
        setName(data.name);
        setDescription(data.description);
        setType(data.type);
        setCategoryId(data.categoryId);
        setVersion(data.version);
      }
        )
        .catch(error => console.error(error));
    }, [id]);

  function handleSubmit(event) {
    setErrorMessage("");
    fetchWithAuth(import.meta.env.VITE_API_URL + `/api/attributes/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name, description, type, categoryId: parseInt(categoryId) , version})
    })
      .then(data => {
        if (data.message) {
          setErrorMessage(data.message);
        } else {
          navigate("/attributes");
        }
      })
      .catch(error => {
        console.error('Error:', error);
        setErrorMessage("Something went wrong. Please try again.");
      });
  }

  return (
     <div className="flex flex-col gap-4 max-w-md p-8">
      <h1 className="text-xl font-semibold">Edit Attribute</h1>

      {errorMessage && <p className="text-red-600">{errorMessage}</p>}
        
             <TextField>
        <Label>Name</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} />
      </TextField>

      <TextField>
        <Label>Description</Label>
        <Input value={description} onChange={(e) => setDescription(e.target.value)} />
      </TextField>
      <div className="flex flex-col gap-1">
        <label>Type</label>
        <select value={type} onChange={(e) => setType(e.target.value)}>
          {ATTRIBUTE_TYPES.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

     <div className="flex flex-col gap-1">
        <label>Category</label>
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">Select a category</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <Button className="bg-orange text-ink font-semibold" onPress={handleSubmit}>
        Save Changes
      </Button>   
    </div>
  );
}

export default EditAttributePage;


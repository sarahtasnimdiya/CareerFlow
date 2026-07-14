import { useState, useEffect } from 'react';
import { TextField, Label, Input, Button } from "@heroui/react";
import { useNavigate } from "react-router-dom";
import { fetchWithAuth } from "./lib/api";



function AddPositionPage() {
  const [title, setTitle] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [maxProjects, setMaxProjects] = useState(3);
  const [projectTags, setProjectTags] = useState("");
  const [attributeId, setAttributeId] = useState("");
  const [selectedAttributeIds, setSelectedAttributeIds] = useState([]);
  const [attributes, setAttributes] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchWithAuth(import.meta.env.VITE_API_URL + "/api/attributes")
      .then(data => setAttributes(data))
      .catch(error => console.error(error));
  }, []);

  function handleSubmit(event) {
    setErrorMessage("");
    fetchWithAuth(import.meta.env.VITE_API_URL + "/api/positions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ title, shortDescription, isPublic, maxProjects, projectTags: projectTags.split(',').map(t => t.trim()).filter(Boolean), attributeIds: selectedAttributeIds })
    })
      .then(data => {
        if (data.message) {
          setErrorMessage(data.message);
        } else {
          navigate("/positions");
        }
      })
      .catch(error => {
        console.error('Error:', error);
        setErrorMessage("Something went wrong. Please try again.");
      });
  }

  return (
     <div className="flex flex-col gap-4 max-w-md p-8">
      <h1 className="text-xl font-semibold">Add Position</h1>

      {errorMessage && <p className="text-red-600">{errorMessage}</p>}
        
             <TextField>
        <Label>Title</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} />
      </TextField>

      <TextField>
        <Label>Short Description</Label>
        <Input value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} />
      </TextField>
      <div className="flex flex-col gap-1">
        <label>Is Public</label>
        <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
      </div>
      <div className="flex flex-col gap-1">
        <label>Max Projects</label>
        <Input type="number" value={maxProjects} onChange={(e) => setMaxProjects(parseInt(e.target.value))} />
      </div>
      <div className="flex flex-col gap-1">
        <label>Project Tags</label>
        <Input value={projectTags} onChange={(e) => setProjectTags(e.target.value)} />
      </div>
      <div className="flex flex-col gap-1">
        <label>Attributes</label>
        {attributes.map(attribute => (
            <label key={attribute.id} className="flex items-center gap-2">
            <input
                type="checkbox"
                checked={selectedAttributeIds.includes(attribute.id)}
                onChange={(e) => {
                if (e.target.checked) {
                    setSelectedAttributeIds([...selectedAttributeIds, attribute.id]);
                } else {
                    setSelectedAttributeIds(selectedAttributeIds.filter(aid => aid !== attribute.id));
                }
                }}
            />
            {attribute.name}
            </label>
        ))}
        </div>
        

      <Button className="bg-orange text-ink font-semibold" onPress={handleSubmit}>
        Create Position
      </Button>   
    </div>
  );
}

export default AddPositionPage;


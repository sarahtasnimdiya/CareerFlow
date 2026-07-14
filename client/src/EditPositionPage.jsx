import { useState, useEffect } from 'react';
import { TextField, Label, Input, Button } from "@heroui/react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchWithAuth } from "./lib/api";


function EditPositionPage() {
  const [title, setTitle] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [maxProjects, setMaxProjects] = useState(3);
  const [projectTags, setProjectTags] = useState("");
  const [attributeId, setAttributeId] = useState("");
  const [attributes, setAttributes] = useState([]);
  const [selectedAttributeIds, setSelectedAttributeIds] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const [version, setVersion] = useState(null);
  const {id} = useParams();

  useEffect(() => {
    fetchWithAuth(import.meta.env.VITE_API_URL + "/api/attributes")
      .then(data => setAttributes(data))
      .catch(error => console.error(error));
  }, []);

  useEffect(() => {
    fetchWithAuth(import.meta.env.VITE_API_URL + `/api/positions/${id}`)
      .then(data => {
        setTitle(data.title);
        setShortDescription(data.shortDescription);
        setIsPublic(data.isPublic);
        setMaxProjects(data.maxProjects);
        
        if (Array.isArray(data.projectTags)) {
          setProjectTags(data.projectTags.join(', '));
        } else {
          setProjectTags(data.projectTags || "");
        }

        setSelectedAttributeIds(data.attributeIds || []);
        setVersion(data.version);
      }
        )
        .catch(error => console.error(error));
    }, [id]);

  function handleSubmit(event) {
    setErrorMessage("");
    fetchWithAuth(import.meta.env.VITE_API_URL + `/api/positions/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ title, shortDescription, isPublic, maxProjects, projectTags: String(projectTags || "").split(',').map(t => t.trim()).filter(Boolean), attributeIds: selectedAttributeIds, version })
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
      <h1 className="text-xl font-semibold">Edit Position</h1>

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
        <label>Public</label>
        <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
      </div>
      <div className="flex flex-col gap-1">
        <label>Max Projects</label>
        <Input type="number" value={maxProjects} onChange={(e) => setMaxProjects(parseInt(e.target.value))} />
      </div>

     <div className="flex flex-col gap-1">
        <label>Attributes</label>
        {attributes.map(attribute => (
            <label key={attribute.id} className="flex items-center gap-2">
            <input
                type="checkbox"
                checked={selectedAttributeIds.includes(attribute.id)}
                onChange={(e) => {

                    const currentTags = projectTags ? projectTags.split(',').map(t => t.trim()).filter(Boolean) : [];
                    if (e.target.checked) {
                        setSelectedAttributeIds
                        ([...selectedAttributeIds, attribute.id]);
                        if (!currentTags.includes(attribute.name)) {
                            const updatedTags = [...currentTags, attribute.name];
                            setProjectTags(updatedTags.join(', '));
                            }
                    } else {
                        setSelectedAttributeIds(selectedAttributeIds.filter(aid => aid !== attribute.id));

                        const updatedTags = currentTags.filter(t => t !== attribute.name);
                        setProjectTags(updatedTags.join(', '));
                            }
                }}
            />
            {attribute.name}
            </label>
        ))}
        </div>

      <Button className="bg-orange text-ink font-semibold" onPress={handleSubmit}>
        Save Changes
      </Button>   
    </div>
  );
}

export default EditPositionPage;


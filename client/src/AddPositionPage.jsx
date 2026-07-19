import { useState, useEffect } from 'react';
import { TextField, Label, Input, Button } from "@heroui/react";
import { useNavigate } from "react-router-dom";
import { fetchWithAuth } from "./lib/api";
import { TagsInput } from 'react-tag-input-component';
import { btnPrimary, btnSecondary, inputStyle, pageContainer, card, labelStyle } from "./lib/styles";



function AddPositionPage() {
  const [title, setTitle] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [maxProjects, setMaxProjects] = useState(3);
  const [projectTags, setProjectTags] = useState([]);
  const [selectedAttributeIds, setSelectedAttributeIds] = useState([]);
  const [attributes, setAttributes] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const [accessRules, setAccessRules] = useState([]);
  const [newRuleAttributeId, setNewRuleAttributeId] = useState("");
  const [newRuleOperator, setNewRuleOperator] = useState(">");
  const [newRuleValue, setNewRuleValue] = useState("");

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
      body: JSON.stringify({ title, shortDescription, isPublic, maxProjects, projectTags: projectTags, 
      attributeIds: selectedAttributeIds, accessRules })
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

  function handleAddRule() {
    if (!newRuleAttributeId || !newRuleValue) return;
    setAccessRules([...accessRules, {
      attributeId: parseInt(newRuleAttributeId),
      operator: newRuleOperator,
      value: newRuleValue
    }]);
    setNewRuleAttributeId("");
    setNewRuleOperator(">");
    setNewRuleValue("");
  }

  function handleRemoveRule(index) {
    setAccessRules(accessRules.filter((_, i) => i !== index));
  }

  return (
     <div className={pageContainer}>
      <h1 className="text-xl font-semibold">Add Position</h1>

      {errorMessage && <p className="text-red-600">{errorMessage}</p>}
        
      <TextField>
        <Label className={labelStyle}>Title</Label>
        <Input className={inputStyle} value={title} onChange={(e) => setTitle(e.target.value)} />
      </TextField>

      <TextField>
        <Label className={labelStyle}>Short Description</Label>
        <Input className={inputStyle} value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} />
      </TextField>
        <label className="flex items-center gap-2">
          <span className="font-medium text-navy w-16">Public</span>
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
          />
        </label>
      <div className="flex flex-col gap-1">
        <label className={labelStyle}>Max Projects</label>
        <Input className={inputStyle} type="number" value={maxProjects} onChange={(e) => setMaxProjects(parseInt(e.target.value))} />
      </div>
      <div className="flex flex-col gap-1">
        <label className={labelStyle}>Project Tags</label>
        <TagsInput className={inputStyle} value={projectTags} onChange={setProjectTags}
        name = "tags" 
        placeHolder="Type a tag and press Enter"/>
      </div>
      <div className="flex flex-col gap-1">
        <label className={labelStyle}>Attributes</label>
        {attributes.map(attribute => (
            <label key={attribute.id} className="flex items-center gap-2">
            <input
                className={inputStyle}
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

        <div className="flex flex-col gap-2">
      <label className={labelStyle}>Access Rules</label>

      {accessRules.map((rule, index) => {
        const attr = attributes.find(a => a.id === rule.attributeId);
        return (
          <div key={index} className="flex items-center gap-2">
            <span>{attr ? attr.name : 'Unknown'} {rule.operator} {rule.value}</span>
            <button className={btnSecondary} onClick={() => handleRemoveRule(index)}>
              Remove
            </button>
          </div>
        );
      })}

      <div className="flex gap-2 items-center">
        <select className={inputStyle} value={newRuleAttributeId} onChange={(e) => setNewRuleAttributeId(e.target.value)}>
          <option value="">Select attribute</option>
          {attributes.map(attribute => (
            <option key={attribute.id} value={attribute.id}>{attribute.name}</option>
          ))}
        </select>

        <select className={inputStyle} value={newRuleOperator} onChange={(e) => setNewRuleOperator(e.target.value)}>
          <option value=">">&gt;</option>
          <option value="<">&lt;</option>
          <option value="=">=</option>
        </select>

        <input
          type="text"
          className={inputStyle}
          value={newRuleValue}
          onChange={(e) => setNewRuleValue(e.target.value)}
          placeholder="Value"
        />

        <button className={btnSecondary} type="button" onClick={handleAddRule}>
          Add Rule
        </button>
      </div>
    </div>
        

      <Button className={btnPrimary} onPress={handleSubmit}>
        Create Position
      </Button>   
    </div>
  );
}

export default AddPositionPage;


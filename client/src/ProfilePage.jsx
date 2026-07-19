import { useState, useEffect } from "react";
import { fetchWithAuth } from "./lib/api";
import { btnPrimary, btnSecondary, inputStyle, labelStyle, card, pageContainer } from "./lib/styles";
import {TagsInput} from "react-tag-input-component";
import ReactMarkdown from 'react-markdown';

function ProfilePage() {
  const [user, setUser] = useState(null);
  const [builtIn, setBuiltIn] = useState([]);
  const [libraryAttrs, setLibraryAttrs] = useState([]);
  const [values, setValues] = useState({});  
  const [addAttrId, setAddAttrId] = useState("");
  const [statusMsg, setStatusMsg] = useState({});

  const [projects, setProjects] = useState([]);const [newProjectName, setNewProjectName] = useState("");
  const [newProjectStart, setNewProjectStart] = useState("");
  const [newProjectEnd, setNewProjectEnd] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");const [newProjectTags, setNewProjectTags] = useState([]);

  function loadAll() {
    Promise.all([
      fetchWithAuth(import.meta.env.VITE_API_URL + "/api/attributes"),
      fetchWithAuth(import.meta.env.VITE_API_URL + "/api/profile/me")
    ]).then(([attributes, profile]) => {
      setUser(profile);
      setBuiltIn(attributes.filter(a => a.isBuiltIn));
      setLibraryAttrs(attributes.filter(a => !a.isBuiltIn));

      const map = {};
      profile.profileValues.forEach(pv => {
        map[pv.attributeId] = { text: pv.value, version: pv.version };
      });
      setValues(map);
    });
  }

  useEffect(() => { loadAll(); }, []);

  function loadProjects() {
    fetchWithAuth(import.meta.env.VITE_API_URL + "/api/projects")
        .then(data => setProjects(data));
    }

    useEffect(() => { loadProjects(); }, []);

  function handleTextChange(attributeId, text) {
    setValues(prev => ({ ...prev, [attributeId]: { ...prev[attributeId], text } }));
  }

  function saveValue(attributeId) {
    const current = values[attributeId] || { text: "" };
    fetchWithAuth(import.meta.env.VITE_API_URL + "/api/profile/values", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ attributeId, value: current.text, version: current.version || 1 })
    }).then(data => {
      if (data.message) {
        setStatusMsg(prev => ({ ...prev, [attributeId]: data.message }));
      } else {
        setValues(prev => ({ ...prev, [attributeId]: { text: data.value, version: data.version } }));
        setStatusMsg(prev => ({ ...prev, [attributeId]: "Saved" }));
      }
    });
  }

  function removeValue(attributeId) {
    fetchWithAuth(import.meta.env.VITE_API_URL + `/api/profile/values/${attributeId}`, { method: "DELETE" })
      .then(() => loadAll());
  }

  function addLibraryAttr() {
    if (!addAttrId) return;
    fetchWithAuth(import.meta.env.VITE_API_URL + "/api/profile/values", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ attributeId: parseInt(addAttrId), value: "", version: 1 })
    }).then(() => { setAddAttrId(""); loadAll(); });
  }

  if (!user) return <p className="p-4">Loading...</p>;

  const infoIds = Object.keys(values).map(Number);
  const infoAttrs = libraryAttrs.filter(a => infoIds.includes(a.id));
  const availableToAdd = libraryAttrs.filter(a => !infoIds.includes(a.id));

  function handleAddProject() {
    fetchWithAuth(import.meta.env.VITE_API_URL + "/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
        name: newProjectName,
        startDate: newProjectStart,
        endDate: newProjectEnd || null,
        description: newProjectDescription,
        tags: newProjectTags
        })
    }).then(() => {
        setNewProjectName("");
        setNewProjectStart("");
        setNewProjectEnd("");
        setNewProjectDescription("");
        setNewProjectTags([]);
        loadProjects();
    });
    }

    function handleDeleteProject(projectId) {
    fetchWithAuth(import.meta.env.VITE_API_URL + `/api/projects/${projectId}`, { method: "DELETE" })
        .then(() => loadProjects());
    }


  console.log(projects);

  return (
    <div className={pageContainer}>
      <h1 className="text-2xl font-bold">Profile</h1>

      <section className={card}>
        <h2 className="text-lg font-semibold mb-4 text-navy">Me</h2>
        <div className="grid grid-cols-2 gap-4">
          {builtIn.map(attr => (
            <div key={attr.id} className="flex flex-col gap-1">
              <label className={labelStyle}>{attr.name}</label>
              <div className="flex gap-2">
              <input
                className={`${inputStyle} flex-1`}
                value={values[attr.id]?.text || ""}
                onChange={(e) => handleTextChange(attr.id, e.target.value)}
              />
              <button  className={btnPrimary} onClick={() => saveValue(attr.id)}>
                Save
              </button>
              </div>
              {statusMsg[attr.id] && <span className="text-xs text-navy">{statusMsg[attr.id]}</span>}
            </div>
          ))}
        </div>
      </section>

      <section className={card}>
        <h2 className="text-lg font-semibold mb-4 text-navy">Info</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          {infoAttrs.map(attr => (
            <div key={attr.id} className="flex flex-col gap-1">
              <label className={labelStyle}>{attr.name}</label>
              <div className="flex gap-2">
              <input
                className={`${inputStyle} flex-1`}
                value={values[attr.id]?.text || ""}
                onChange={(e) => handleTextChange(attr.id, e.target.value)}
              />
              <button className={btnPrimary} onClick={() => saveValue(attr.id)}>Save</button>
              <button className={btnSecondary} onClick={() => removeValue(attr.id)}>Remove</button>
              </div>
            </div>
          ))}
        </div>


          <div className="flex gap-2 items-center border-t border-gray-light pt-4">
            <select className={inputStyle} value={addAttrId} onChange={(e) => setAddAttrId(e.target.value)}>
              <option value="">Add attribute...</option>
              {availableToAdd.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
            <button className={btnPrimary} onClick={addLibraryAttr}>
              Add
            </button>
          </div>
      </section>

      <section className={card}>
        <h2 className="text-lg font-semibold mb-4 text-navy">Projects</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
            {projects.map(project => (
            <div key={project.id} className="border border-gray-light rounded-lg p-3 bg-champagne">
                <p className="font-semibold">{project.name}</p>
                <p className="text-sm text-navy">{project.startDate?.slice(0, 10)} — {project.endDate ? project.endDate.slice(0, 10) : 'Present'}</p>
                <div className="text-sm mt-1 prose prose-sm max-w-none">
                  <ReactMarkdown>{project.description}</ReactMarkdown>
                </div>
                <p className="text-sm text-navy mt-1">{project.tags.join(', ')}</p>
                <button className="mt-2 text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors" onClick={() => handleDeleteProject(project.id)}>Delete</button>
            </div>
            ))}
        </div>

        <div className="border-t border-gray-light pt-4 flex flex-col gap-2 max-w-md">
            <input
                className={inputStyle}
                placeholder="Project name"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
            />
            <input
                className={inputStyle}
                type="date"
                value={newProjectStart}
                onChange={(e) => setNewProjectStart(e.target.value)}
            />
            <input
                className={inputStyle}
                type="date"
                value={newProjectEnd}
                onChange={(e) => setNewProjectEnd(e.target.value)}
            />
            <textarea
                className={inputStyle}
                placeholder="Description"
                value={newProjectDescription}
                onChange={(e) => setNewProjectDescription(e.target.value)}
            />
            <TagsInput
                className={inputStyle}
                value={newProjectTags}
                onChange={setNewProjectTags}
                name="tags"
                placeHolder="Type a tag and press Enter"
            />
            <button className={btnPrimary} onClick={handleAddProject}>
              Add Project
            </button>
        </div>

        </section>

    </div>
  );
}

export default ProfilePage;

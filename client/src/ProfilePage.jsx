import { useState, useEffect } from "react";
import { fetchWithAuth } from "./lib/api";

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
  const [newProjectDescription, setNewProjectDescription] = useState("");const [newProjectTags, setNewProjectTags] = useState("");

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
        tags: newProjectTags.split(',').map(t => t.trim()).filter(Boolean)
        })
    }).then(() => {
        setNewProjectName("");
        setNewProjectStart("");
        setNewProjectEnd("");
        setNewProjectDescription("");
        setNewProjectTags("");
        loadProjects();
    });
    }

    function handleDeleteProject(projectId) {
    fetchWithAuth(import.meta.env.VITE_API_URL + `/api/projects/${projectId}`, { method: "DELETE" })
        .then(() => loadProjects());
    }


  console.log(projects);

  return (
    <div className="p-8 flex flex-col gap-8 max-w-2xl">
      <h1 className="text-2xl font-bold">Profile</h1>

      <section>
        <h2 className="text-lg font-semibold mb-2">Me</h2>
        <div className="flex flex-col gap-3">
          {builtIn.map(attr => (
            <div key={attr.id} className="flex gap-2 items-center">
              <label className="w-32">{attr.name}</label>
              <input
                className="border p-2 rounded flex-1"
                value={values[attr.id]?.text || ""}
                onChange={(e) => handleTextChange(attr.id, e.target.value)}
              />
              <button onClick={() => saveValue(attr.id)}>Save</button>
              {statusMsg[attr.id] && <span className="text-sm">{statusMsg[attr.id]}</span>}
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-2">Info</h2>
        <div className="flex flex-col gap-3">
          {infoAttrs.map(attr => (
            <div key={attr.id} className="flex gap-2 items-center">
              <label className="w-32">{attr.name}</label>
              <input
                className="border p-2 rounded flex-1"
                value={values[attr.id]?.text || ""}
                onChange={(e) => handleTextChange(attr.id, e.target.value)}
              />
              <button onClick={() => saveValue(attr.id)}>Save</button>
              <button onClick={() => removeValue(attr.id)}>Remove</button>
              {statusMsg[attr.id] && <span className="text-sm">{statusMsg[attr.id]}</span>}
            </div>
          ))}

          <div className="flex gap-2 items-center">
            <select value={addAttrId} onChange={(e) => setAddAttrId(e.target.value)}>
              <option value="">Add attribute...</option>
              {availableToAdd.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
            <button onClick={addLibraryAttr}>Add</button>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-2">Projects</h2>
        <div className="flex flex-col gap-3">
            {projects.map(project => (
            <div key={project.id} className="border p-3 rounded">
                <p className="font-semibold">{project.name}</p>
                <p className="text-sm">{project.startDate?.slice(0, 10)} — {project.endDate ? project.endDate.slice(0, 10) : 'Present'}</p>
                <p>{project.description}</p>
                <p className="text-sm text-navy">{project.tags.join(', ')}</p>
                <button onClick={() => handleDeleteProject(project.id)}>Delete</button>
            </div>
            ))}
        </div>

        <div className="border p-3 rounded flex flex-col gap-2">
            <input
                className="border p-2 rounded"
                placeholder="Project name"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
            />
            <input
                className="border p-2 rounded"
                type="date"
                value={newProjectStart}
                onChange={(e) => setNewProjectStart(e.target.value)}
            />
            <input
                className="border p-2 rounded"
                type="date"
                value={newProjectEnd}
                onChange={(e) => setNewProjectEnd(e.target.value)}
            />
            <textarea
                className="border p-2 rounded"
                placeholder="Description"
                value={newProjectDescription}
                onChange={(e) => setNewProjectDescription(e.target.value)}
            />
            <input
                className="border p-2 rounded"
                placeholder="Tags (comma separated)"
                value={newProjectTags}
                onChange={(e) => setNewProjectTags(e.target.value)}
            />
            <button onClick={handleAddProject}>Add Project</button>
        </div>

        </section>

    </div>
  );
}

export default ProfilePage;

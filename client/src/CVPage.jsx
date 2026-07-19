import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchWithAuth } from './lib/api';
import { jwtDecode } from "jwt-decode";

function CVPage() {
  const { id } = useParams();
  const [cv, setCv] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
        const decoded = jwtDecode(token);
        setUserRole(decoded.role);
    }
  }, []);

  useEffect(() => {
    fetchWithAuth(import.meta.env.VITE_API_URL + `/api/cvs/${id}`)
      .then(data => setCv(data));
  }, [id]);

  

  function handleAttributeChange(attributeId, newValue) {
    setCv(prev => ({
        ...prev,
        profileValues: prev.profileValues.some(v => v.attributeId === attributeId)
        ? prev.profileValues.map(v => v.attributeId === attributeId ? { ...v, value: newValue } : v)
        : [...prev.profileValues, { attributeId, value: newValue, version: 1 }]
    }));
    }

  function saveAttribute(attributeId, version) {
    const pv = cv.profileValues.find(v => v.attributeId === attributeId);
    fetchWithAuth(import.meta.env.VITE_API_URL + "/api/profile/values", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attributeId, value: pv.value, version: version || 1 })
    }).then(data => {
        if (!data.message) {
        setCv(prev => ({
            ...prev,
            profileValues: prev.profileValues.map(v =>
            v.attributeId === attributeId ? { ...v, version: data.version } : v
            )
        }));
        }
    });
  }
  function handlePublish() {
    fetchWithAuth(import.meta.env.VITE_API_URL + `/api/cvs/${id}/publish`, { method: "PUT" })
        .then(data => {
        if (data.message) {
            alert(data.message);
        } else {
            setCv(prev => ({ ...prev, isPublished: true }));
        }
        });
    }

  if (!cv) return <p className="p-4">Loading...</p>;
  if (cv.error) return <p className="p-4 text-red-600">{cv.error}</p>;

  const canEdit = userRole === 'CANDIDATE';

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-4">{cv.position.title}</h1>
      <p className="mb-4">{cv.position.shortDescription}</p>

      <p className={cv.isPublished ? "text-green-600 font-semibold" : "text-gray-500"}>
        {cv.isPublished ? "Published" : "Not Published"}
      </p>  

      <h2 className="text-lg font-semibold mb-2">Attributes</h2>
      <div className="flex flex-col gap-2">
        {cv.position.attributes.map(pa => {
          const pv = cv.profileValues.find(v => v.attributeId === pa.attributeId);
          const value = pv ? pv.value : "";
          const isEmpty = !value.trim();
          return (
            <div key={pa.attributeId} className="flex gap-2 items-center">
              <span className="w-32">{pa.attribute.name}</span>
              {canEdit ? (
                <input
                    className={`border p-1 rounded ${isEmpty ? "border-red-600 text-red-600" : ""}`}
                    value={value}
                    onChange={(e) => handleAttributeChange(pa.attributeId, e.target.value)}
                    onBlur={() => saveAttribute(pa.attributeId, pv?.version)}
                />
                ) : (
                <span className={isEmpty ? "text-red-600" : ""}>
                    {isEmpty ? "(empty)" : value}
                </span>
                )}
            </div>
          );
        })}
      </div>

      <h2 className="text-lg font-semibold mt-4 mb-2">Projects</h2>
      <div className="flex flex-col gap-2">
        {cv.projects.map(project => (
          <div key={project.id} className="border p-2 rounded">
            <p className="font-semibold">{project.name}</p>
            <p>{project.description}</p>
          </div>
        ))}
      </div>


      {canEdit && !cv.isPublished && (
      <button
        className="mt-4 bg-orange text-ink font-semibold px-4 py-2 rounded"
        disabled={cv.position.attributes.some(pa => {
            const pv = cv.profileValues.find(v => v.attributeId === pa.attributeId);
            return !pv || !pv.value.trim();
        })}
        onClick={handlePublish}
        >
        Publish
      </button>
    )}

    </div>
  );
}

export default CVPage;
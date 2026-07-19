import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchWithAuth } from './lib/api';

function HomePage() {
  const [stats, setStats] = useState(null);
  const [latest, setLatest] = useState([]);
  const [popular, setPopular] = useState([]);
  const [tags, setTags] = useState({});

  useEffect(() => {
    fetchWithAuth(import.meta.env.VITE_API_URL + "/api/stats").then(setStats);
    fetchWithAuth(import.meta.env.VITE_API_URL + "/api/positions/latest").then(setLatest);
    fetchWithAuth(import.meta.env.VITE_API_URL + "/api/positions/popular").then(setPopular);
    fetchWithAuth(import.meta.env.VITE_API_URL + "/api/positions/tags").then(setTags);
  }, []);

  return (
    <div className="p-8 flex flex-col gap-8">
      <h1 className="text-3xl font-bold">CareerFlow</h1>

      {stats && (
        <section className="flex gap-6 flex-wrap">
          <div><strong>{stats.totalPositions}</strong> Positions</div>
          <div><strong>{stats.totalCandidates}</strong> Candidates</div>
          <div><strong>{stats.totalRecruiters}</strong> Recruiters</div>
          <div><strong>{stats.totalCVs}</strong> CVs</div>
          <div><strong>{stats.recentCVs}</strong> CVs in last 24h</div>
        </section>
      )}

      <section>
        <h2 className="text-lg font-semibold mb-2">Latest Positions</h2>
        <table className="w-full text-left">
          <thead>
            <tr><th>Title</th><th>Created</th></tr>
          </thead>
          <tbody>
            {latest.map(p => (
              <tr key={p.id}>
                <td><Link to={`/positions`}>{p.title}</Link></td>
                <td>{p.createdAt.slice(0, 10)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-2">Most Popular Positions</h2>
        <table className="w-full text-left">
          <thead>
            <tr><th>Title</th><th>CVs Submitted</th></tr>
          </thead>
          <tbody>
            {popular.map(p => (
              <tr key={p.id}>
                <td><Link to={`/positions`}>{p.title}</Link></td>
                <td>{p._count.cvs}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-2">Tag Cloud</h2>
        <div className="flex gap-3 flex-wrap">
          {Object.entries(tags).map(([tag, count]) => (
            <span
              key={tag}
              style={{ fontSize: `${12 + count * 4}px` }}
              className="text-navy"
            >
              {tag}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}

export default HomePage;
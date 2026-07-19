import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchWithAuth } from './lib/api';
import { btnPrimary, btnSecondary, inputStyle, pageContainer, card } from "./lib/styles";

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
    <div className= {pageContainer}>
      <h1 className="text-3xl font-bold">CareerFlow</h1>

      {stats && (
        <section className="flex gap-4 flex-wrap">
          {[
            ["Positions", stats.totalPositions],
            ["Candidates", stats.totalCandidates],
            ["Recruiters", stats.totalRecruiters],
            ["CVs", stats.totalCVs],
            ["CVs (24h)", stats.recentCVs]
          ].map(([label, value]) => (
            <div key={label} className={`${card} flex-1 min-w-[120px] text-center`}>
              <p className="text-2xl font-bold text-orange">{value}</p>
              <p className="text-sm text-navy">{label}</p>
            </div>
          ))}
        </section>
      )}

      <section className={card}>
        <h2 className="text-lg font-semibold mb-2 text-navy">Latest Positions</h2>
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

      <section className={card}>
        <h2 className="text-lg font-semibold mb-2 text-navy">Most Popular Positions</h2>
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

      <section className={card}>
        <h2 className="text-lg font-semibold mb-2 text-navy">Tag Cloud</h2>
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
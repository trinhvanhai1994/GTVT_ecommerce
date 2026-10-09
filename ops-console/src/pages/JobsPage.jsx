import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchJob, fetchJobs } from "../api.js";

export default function JobsPage() {
  const { id } = useParams();
  const [jobs, setJobs] = useState([]);
  const [job, setJob] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let dead = false;
    const tick = () => {
      fetchJobs()
        .then((list) => {
          if (!dead) setJobs(list);
        })
        .catch((e) => {
          if (!dead) setError(e.message);
        });
      if (id) {
        fetchJob(id)
          .then((j) => {
            if (!dead) setJob(j);
          })
          .catch((e) => {
            if (!dead) setError(e.message);
          });
      } else {
        setJob(null);
      }
    };
    tick();
    const t = setInterval(tick, 2000);
    return () => {
      dead = true;
      clearInterval(t);
    };
  }, [id]);

  return (
    <section>
      <header className="page-head">
        <div>
          <p className="eyebrow">Hàng đợi</p>
          <h1>Jobs</h1>
        </div>
      </header>
      {error && <div className="banner error">{error}</div>}

      <div className="split">
        <ul className="plain jobs">
          {jobs.length === 0 && <li className="muted">Chưa có job</li>}
          {jobs.map((j) => (
            <li key={j.id} className={j.id === id ? "on" : ""}>
              <Link to={`/jobs/${j.id}`}>
                <strong>{j.title}</strong>
                <span className={`pill ${j.status}`}>{j.status}</span>
              </Link>
            </li>
          ))}
        </ul>
        <div>
          {!job && <p className="muted">Chọn một job để xem log.</p>}
          {job && (
            <>
              <h2>
                {job.title} <span className={`pill ${job.status}`}>{job.status}</span>
              </h2>
              <p className="muted tiny">
                {job.command}
                {job.exitCode != null ? ` · exit ${job.exitCode}` : ""}
              </p>
              <pre className="log-view">{job.log || "(đang chờ...)"}</pre>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

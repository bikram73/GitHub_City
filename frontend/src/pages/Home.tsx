import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home: React.FC = () => {
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      navigate(`/city/${username.trim()}`);
    }
  };

  return (
    <div className="home-container">
      <div className="home-backdrop home-backdrop-left" />
      <div className="home-backdrop home-backdrop-right" />

      <section className="home-copy">
        <div className="home-eyebrow">Interactive GitHub Visualization</div>
        <h1>Build a living skyline from your GitHub repositories.</h1>
        <p>
          Explore commits as tower height, stars as glow, and fresh work as animated pulses
          in a cinematic developer city.
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter GitHub Username"
            aria-label="GitHub Username"
          />
          <button type="submit">Generate City</button>
        </form>

        <div className="feature-strip">
          <span>Year filtering</span>
          <span>Neon city lighting</span>
          <span>Repo insights panel</span>
        </div>
      </section>

      <section className="home-preview">
        <div className="preview-card preview-tall">
          <strong>Active Repositories</strong>
          <span>Taller structures reflect stronger commit volume.</span>
        </div>
        <div className="preview-card preview-bright">
          <strong>Popular Projects</strong>
          <span>Brighter facades track stars and developer attention.</span>
        </div>
        <div className="preview-card preview-pulse">
          <strong>Recent Activity</strong>
          <span>Animated rooftop beacons reveal fresh pushes.</span>
        </div>
      </section>
    </div>
  );
};

export default Home;
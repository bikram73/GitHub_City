import React from 'react';
import { Repo } from '../pages/CityView';
import './RepoInfoPanel.css';

interface RepoInfoPanelProps {
  repo: Repo;
  onClose: () => void;
}

const getBuildingPersona = (repo: Repo) => {
  if (repo.commit_count > 120) {
    return 'Skyscraper';
  }
  if (repo.commit_count > 30) {
    return 'Office Tower';
  }
  return 'Dev Hub';
};

const RepoInfoPanel: React.FC<RepoInfoPanelProps> = ({ repo, onClose }) => {
  return (
    <div className="repo-panel">
      <button className="close-btn" onClick={onClose} aria-label="Close repository details">×</button>
      <div className="panel-eyebrow">Repository Details</div>
      <h2>{repo.name}</h2>
      <p className="panel-description">{repo.description || 'No repository description provided.'}</p>

      <div className="repo-tags">
        <span>{getBuildingPersona(repo)}</span>
        <span>{repo.language || 'Unknown Stack'}</span>
        <span>{repo.visibility}</span>
      </div>

      <ul>
        <li><strong>Language:</strong> {repo.language || 'N/A'}</li>
        <li><strong>Stars:</strong> {repo.stars}</li>
        <li><strong>Commits:</strong> {repo.commit_count}</li>
        <li><strong>Activity Score:</strong> {repo.activity_score}</li>
        <li><strong>Repo Size:</strong> {repo.size.toLocaleString()} KB</li>
        <li><strong>Created:</strong> {new Date(repo.created_at).toLocaleDateString()}</li>
        <li><strong>Last Update:</strong> {new Date(repo.last_updated).toLocaleDateString()}</li>
      </ul>
      <a href={repo.url} target="_blank" rel="noopener noreferrer">
        <button className="github-btn">View on GitHub</button>
      </a>
    </div>
  );
};

export default RepoInfoPanel;


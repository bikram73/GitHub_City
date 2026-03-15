import React from 'react';
import { Repo } from '../pages/CityView';
import './RepoInfoPanel.css';

interface RepoInfoPanelProps {
  repo: Repo;
  onClose: () => void;
  theme: 'day' | 'night';
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

const RepoInfoPanel: React.FC<RepoInfoPanelProps> = ({ repo, onClose, theme }) => {
  return (
    <div className="repo-panel" style={{ color: theme === 'day' ? '#ffffff' : undefined }}>
      <button className="close-btn" onClick={onClose} aria-label="Close repository details" style={{ color: 'inherit' }}>×</button>
      <div className="panel-eyebrow">Repository Details</div>
      <h2>{repo.name}</h2>
      <p className="panel-description">{repo.description || 'No repository description provided.'}</p>

      <div className="repo-tags">
        <span>{getBuildingPersona(repo)}</span>
        <span>{repo.language || 'Unknown Stack'}</span>
        <span>{repo.visibility}</span>
      </div>

      <ul>
        <li><strong>Language:</strong> <span>{repo.language || 'N/A'}</span></li>
        <li><strong>Stars:</strong> <span>{repo.stars}</span></li>
        <li><strong>Commits:</strong> <span>{repo.commit_count}</span></li>
        <li><strong>Activity Score:</strong> <span>{repo.activity_score}</span></li>
        <li><strong>Repo Size:</strong> <span>{repo.size.toLocaleString()} KB</span></li>
        <li><strong>Created:</strong> <span>{new Date(repo.created_at).toLocaleDateString()}</span></li>
        <li><strong>Last Update:</strong> <span>{new Date(repo.last_updated).toLocaleDateString()}</span></li>
      </ul>
      <a href={repo.url} target="_blank" rel="noopener noreferrer">
        <button className="github-btn">View on GitHub</button>
      </a>
    </div>
  );
};

export default RepoInfoPanel;

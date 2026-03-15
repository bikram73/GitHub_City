import React, { Suspense, useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Canvas } from '@react-three/fiber';
import CityScene from '../components/CityScene';
import RepoInfoPanel from '../components/RepoInfoPanel';
import YearSelector from '../components/YearSelector';
import './CityView.css';

export interface GitHubUser {
  login: string;
  name: string | null;
  avatar_url: string;
  html_url: string;
  bio: string | null;
  followers: number;
  following: number;
  public_repos: number;
}

export interface Repo {
  id: number;
  name: string;
  url: string;
  description: string | null;
  language: string | null;
  stars: number;
  size: number;
  visibility: string;
  created_at: string;
  last_updated: string;
  pushed_at: string;
  archived: boolean;
  commit_count: number;
  activity_score: number;
  recent_activity_score: number;
}

interface CitySummary {
  totalRepos: number;
  totalCommits: number;
  totalStars: number;
  activeRepos: number;
  archivedRepos: number;
  mostUsedLanguage: string;
}

interface CityResponse {
  user: GitHubUser;
  year: string;
  availableYears: string[];
  summary: CitySummary;
  repos: Repo[];
}

interface NormalizedCityResponse {
  user: GitHubUser | null;
  availableYears: string[];
  summary: CitySummary;
  repos: Repo[];
}

const summaryFallback: CitySummary = {
  totalRepos: 0,
  totalCommits: 0,
  totalStars: 0,
  activeRepos: 0,
  archivedRepos: 0,
  mostUsedLanguage: 'Unknown',
};

const toSafeRepo = (repo: any): Repo => {
  const commitCount = Number(repo?.commit_count ?? 0);
  const stars = Number(repo?.stars ?? 0);
  const pushedAt = typeof repo?.pushed_at === 'string'
    ? repo.pushed_at
    : typeof repo?.last_updated === 'string'
      ? repo.last_updated
      : new Date().toISOString();

  return {
    id: Number(repo?.id ?? Date.now()),
    name: String(repo?.name ?? 'unknown-repo'),
    url: String(repo?.url ?? '#'),
    description: typeof repo?.description === 'string' ? repo.description : null,
    language: typeof repo?.language === 'string' ? repo.language : null,
    stars,
    size: Number(repo?.size ?? 0),
    visibility: typeof repo?.visibility === 'string' ? repo.visibility : 'public',
    created_at: typeof repo?.created_at === 'string' ? repo.created_at : pushedAt,
    last_updated: typeof repo?.last_updated === 'string' ? repo.last_updated : pushedAt,
    pushed_at: pushedAt,
    archived: Boolean(repo?.archived),
    commit_count: commitCount,
    activity_score: Number(repo?.activity_score ?? Math.round(commitCount * 0.65 + stars * 4)),
    recent_activity_score: Number(repo?.recent_activity_score ?? 0),
  };
};

const buildSummaryFromRepos = (repos: Repo[]): CitySummary => {
  const languageCounts = repos.reduce<Record<string, number>>((counts, repo) => {
    const key = repo.language || 'Unknown';
    counts[key] = (counts[key] || 0) + 1;
    return counts;
  }, {});

  const mostUsedLanguage = Object.entries(languageCounts)
    .sort((left, right) => right[1] - left[1])[0]?.[0] || 'Unknown';

  return {
    totalRepos: repos.length,
    totalCommits: repos.reduce((total, repo) => total + repo.commit_count, 0),
    totalStars: repos.reduce((total, repo) => total + repo.stars, 0),
    activeRepos: repos.filter((repo) => repo.commit_count > 0).length,
    archivedRepos: repos.filter((repo) => repo.archived).length,
    mostUsedLanguage,
  };
};

const normalizeCityResponse = (payload: unknown, fallbackYear: string): NormalizedCityResponse => {
  if (Array.isArray(payload)) {
    const repos = payload.map(toSafeRepo);
    return {
      user: null,
      availableYears: [],
      repos,
      summary: buildSummaryFromRepos(repos),
    };
  }

  const objectPayload = (payload && typeof payload === 'object') ? payload as Partial<CityResponse> : {};
  const rawRepos = Array.isArray(objectPayload.repos) ? objectPayload.repos : [];
  const repos = rawRepos.map(toSafeRepo);
  const safeSummary = objectPayload.summary
    ? {
        totalRepos: Number(objectPayload.summary.totalRepos ?? repos.length),
        totalCommits: Number(objectPayload.summary.totalCommits ?? 0),
        totalStars: Number(objectPayload.summary.totalStars ?? 0),
        activeRepos: Number(objectPayload.summary.activeRepos ?? 0),
        archivedRepos: Number(objectPayload.summary.archivedRepos ?? 0),
        mostUsedLanguage: objectPayload.summary.mostUsedLanguage || 'Unknown',
      }
    : buildSummaryFromRepos(repos);

  return {
    user: objectPayload.user || null,
    availableYears: Array.isArray(objectPayload.availableYears)
      ? objectPayload.availableYears
      : fallbackYear === 'all' ? [] : [fallbackYear],
    repos,
    summary: safeSummary,
  };
};

const CityView: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [repos, setRepos] = useState<Repo[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<Repo | null>(null);
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [availableYears, setAvailableYears] = useState<string[]>([]);
  const [summary, setSummary] = useState<CitySummary>(summaryFallback);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<'day' | 'night'>(() => {
    const currentTheme = searchParams.get('theme');
    return currentTheme === 'day' ? 'day' : 'night';
  });
  const [selectedYear, setSelectedYear] = useState<string>(() => searchParams.get('year') || 'all');

  useEffect(() => {
    const fetchRepos = async () => {
      if (!username) {
        return;
      }

      setLoading(true);
      setError(null);
      setSelectedRepo(null);

      try {
        const response = await axios.get<CityResponse>(`/api/github/user/${username}`, {
          params: { year: selectedYear },
        });
        const normalizedResponse = normalizeCityResponse(response.data, selectedYear);
        setRepos(normalizedResponse.repos);
        setUser(normalizedResponse.user);
        setAvailableYears(normalizedResponse.availableYears);
        setSummary(normalizedResponse.summary);
      } catch (err: any) {
        setError(`Failed to fetch data for ${username}. ${err.response?.data?.message || err.message}`);
        setRepos([]);
        setUser(null);
        setAvailableYears([]);
        setSummary(summaryFallback);
      } finally {
        setLoading(false);
      }
    };

    fetchRepos();
  }, [username, selectedYear]);

  useEffect(() => {
    const nextParams: Record<string, string> = {};
    if (selectedYear !== 'all') {
      nextParams.year = selectedYear;
    }
    if (theme !== 'night') {
      nextParams.theme = theme;
    }
    setSearchParams(nextParams, { replace: true });
  }, [selectedYear, setSearchParams, theme]);

  const title = user?.name || user?.login || username || 'Developer';
  const emptyState = selectedYear === 'all'
    ? 'No repositories are available for this GitHub user.'
    : `No repository activity found for ${selectedYear}. Try another year or switch back to All Time.`;

  const handleOpenRepo = (repo: Repo) => {
    window.open(repo.url, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return <div className="status-message">Generating city for {username}...</div>;
  }

  if (error) {
    return <div className="status-message error">{error}</div>;
  }

  return (
    <div className={`city-view-container theme-${theme}`}>
      <div className="city-backdrop" />

      <header className="dashboard-shell city-header">
        <div className="city-hero">
          <div className="city-hero-copy">
            <div className="hero-kicker">GitHub City Dashboard</div>
            <h1>{title}&rsquo;s Repository Metropolis</h1>
            <p>
              Tall buildings represent repository activity, brighter facades reflect stars,
              and animated rooftops reveal recent development energy.
            </p>
          </div>

          {user ? (
            <a className="profile-chip" href={user.html_url} target="_blank" rel="noopener noreferrer">
              <img src={user.avatar_url} alt={user.login} />
              <span>
                <strong>{user.login}</strong>
                <small>{user.followers} followers</small>
              </span>
            </a>
          ) : null}
        </div>

        <div className="dashboard-controls">
          <YearSelector value={selectedYear} years={availableYears} onChange={setSelectedYear} />

          <div className="control-card">
            <span className="control-label">Theme</span>
            <div className="theme-switcher">
              <button className={theme === 'day' ? 'is-active' : ''} onClick={() => setTheme('day')}>
                Day
              </button>
              <button className={theme === 'night' ? 'is-active' : ''} onClick={() => setTheme('night')}>
                Night
              </button>
            </div>
          </div>

          <div className="control-card">
            <span className="control-label">Explore</span>
            <p>Use orbit controls to rotate, zoom, pan, hover, and inspect individual buildings.</p>
          </div>
        </div>

        <section className="summary-grid">
          <article className="summary-card">
            <span>Total Repositories</span>
            <strong>{summary.totalRepos}</strong>
          </article>
          <article className="summary-card">
            <span>Total Commits</span>
            <strong>{summary.totalCommits.toLocaleString()}</strong>
          </article>
          <article className="summary-card">
            <span>Total Stars</span>
            <strong>{summary.totalStars.toLocaleString()}</strong>
          </article>
          <article className="summary-card">
            <span>Most Used Language</span>
            <strong>{summary.mostUsedLanguage}</strong>
          </article>
        </section>
      </header>

      <section className="city-dashboard">
        <div className="city-stage">
          {repos.length ? (
            <Suspense fallback={<div className="status-message">Loading 3D assets...</div>}>
              <Canvas camera={{ position: [0, 68, 130], fov: 48 }} shadows>
                <CityScene repos={repos} onSelectRepo={setSelectedRepo} onOpenRepo={handleOpenRepo} theme={theme} />
              </Canvas>
            </Suspense>
          ) : (
            <div className="empty-state">{emptyState}</div>
          )}
        </div>

        <aside className="insights-panel">
          <div className="insight-card">
            <span className="control-label">City Signals</span>
            <ul>
              <li>Tall towers indicate commit volume for the selected period.</li>
              <li>Brighter facades point to stronger star counts.</li>
              <li>Pulsing rooftop beacons indicate recent updates.</li>
            </ul>
          </div>

          <div className="insight-card">
            <span className="control-label">Stats</span>
            <ul>
              <li>Active repos: {summary.activeRepos}</li>
              <li>Archived repos: {summary.archivedRepos}</li>
              <li>Period: {selectedYear === 'all' ? 'All Time' : selectedYear}</li>
            </ul>
          </div>
        </aside>

      </section>

      {selectedRepo ? <RepoInfoPanel repo={selectedRepo} onClose={() => setSelectedRepo(null)} /> : null}
    </div>
  );
};

export default CityView;

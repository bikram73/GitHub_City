const axios = require('axios');

const GITHUB_API = 'https://api.github.com';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

const CURRENT_YEAR = new Date().getFullYear();

const api = axios.create({
  baseURL: GITHUB_API,
  headers: GITHUB_TOKEN ? { Authorization: `token ${GITHUB_TOKEN}` } : {},
});

const buildYearRange = (year) => {
  if (!year || year === 'all') {
    return null;
  }

  const numericYear = Number.parseInt(year, 10);
  if (Number.isNaN(numericYear) || numericYear < 2008 || numericYear > CURRENT_YEAR) {
    return null;
  }

  return {
    since: `${numericYear}-01-01T00:00:00Z`,
    until: `${numericYear}-12-31T23:59:59Z`,
    value: numericYear,
  };
};

const parseCommitCountFromResponse = (commitsResponse) => {
  const linkHeader = commitsResponse.headers.link;
  if (linkHeader) {
    const lastLink = linkHeader.split(',').find((section) => section.includes('rel="last"'));
    if (lastLink) {
      const lastPageMatch = lastLink.match(/[?&]page=(\d+)/);
      if (lastPageMatch) {
        return Number.parseInt(lastPageMatch[1], 10);
      }
    }
  }

  return commitsResponse.data.length > 0 ? commitsResponse.data.length : 0;
};

const getCommitCount = async (owner, repoName, yearRange) => {
  try {
    const params = { per_page: 1 };
    if (yearRange) {
      params.since = yearRange.since;
      params.until = yearRange.until;
    }

    const commitsResponse = await api.get(`/repos/${owner}/${repoName}/commits`, { params });
    return parseCommitCountFromResponse(commitsResponse);
  } catch (error) {
    if (error.response?.status === 409 || error.response?.status === 422) {
      return 0;
    }

    throw error;
  }
};

const getAvailableYears = (repos) => {
  if (!repos.length) {
    return [CURRENT_YEAR.toString()];
  }

  const oldestRepoYear = repos.reduce((oldest, repo) => {
    const repoYear = new Date(repo.created_at).getFullYear();
    return Number.isFinite(repoYear) ? Math.min(oldest, repoYear) : oldest;
  }, CURRENT_YEAR);

  const years = [];
  for (let year = CURRENT_YEAR; year >= oldestRepoYear; year -= 1) {
    years.push(year.toString());
  }

  return years;
};

const getMostUsedLanguage = (repos) => {
  const usage = repos.reduce((languages, repo) => {
    const language = repo.language || 'Unknown';
    languages[language] = (languages[language] || 0) + 1;
    return languages;
  }, {});

  const sortedLanguages = Object.entries(usage).sort((left, right) => right[1] - left[1]);
  return sortedLanguages.length ? sortedLanguages[0][0] : 'Unknown';
};

const getRepoData = async (req, res) => {
  const { username } = req.params;
  const requestedYear = req.query.year || 'all';

  if (!username) {
    return res.status(400).json({ message: 'GitHub username is required' });
  }

  try {
    const yearRange = buildYearRange(requestedYear);
    if (requestedYear !== 'all' && !yearRange) {
      return res.status(400).json({ message: 'Invalid year filter supplied' });
    }

    const [userResponse, reposResponse] = await Promise.all([
      api.get(`/users/${username}`),
      api.get(`/users/${username}/repos?per_page=100&sort=updated`),
    ]);

    const repos = reposResponse.data.filter((repo) => !repo.fork);
    const repoDataPromises = repos.map(async (repo) => {
      try {
        const owner = repo.owner?.login || username;
        const commitCount = await getCommitCount(owner, repo.name, yearRange);
        const pushedAt = repo.pushed_at ? new Date(repo.pushed_at).getTime() : Date.now();
        const daysSinceUpdate = Math.max(0, Math.floor((Date.now() - pushedAt) / (1000 * 60 * 60 * 24)));
        const recentActivityScore = Math.max(0, 100 - daysSinceUpdate);
        const activityScore = Math.round(commitCount * 0.65 + repo.stargazers_count * 4 + recentActivityScore);

        return {
          id: repo.id,
          name: repo.name,
          url: repo.html_url,
          description: repo.description,
          language: repo.language,
          stars: repo.stargazers_count,
          size: repo.size,
          visibility: repo.visibility,
          created_at: repo.created_at,
          last_updated: repo.updated_at,
          pushed_at: repo.pushed_at,
          archived: repo.archived,
          commit_count: commitCount,
          activity_score: activityScore,
          recent_activity_score: recentActivityScore,
        };
      } catch (error) {
        console.error(`Failed to fetch commits for ${repo.name}:`, error.message);
        return {
          id: repo.id,
          name: repo.name,
          url: repo.html_url,
          description: repo.description,
          language: repo.language,
          stars: repo.stargazers_count,
          size: repo.size,
          visibility: repo.visibility,
          created_at: repo.created_at,
          last_updated: repo.updated_at,
          pushed_at: repo.pushed_at,
          archived: repo.archived,
          commit_count: 0,
          activity_score: repo.stargazers_count * 4,
          recent_activity_score: 0,
        };
      }
    });

    const detailedRepos = await Promise.all(repoDataPromises);
    const filteredRepos = requestedYear === 'all'
      ? detailedRepos
      : detailedRepos.filter((repo) => repo.commit_count > 0);
    const sortedRepos = filteredRepos.sort((left, right) => right.activity_score - left.activity_score);

    const summary = {
      totalRepos: sortedRepos.length,
      totalCommits: sortedRepos.reduce((total, repo) => total + repo.commit_count, 0),
      totalStars: sortedRepos.reduce((total, repo) => total + repo.stars, 0),
      activeRepos: sortedRepos.filter((repo) => repo.commit_count > 0).length,
      archivedRepos: sortedRepos.filter((repo) => repo.archived).length,
      mostUsedLanguage: getMostUsedLanguage(sortedRepos),
    };

    return res.json({
      user: {
        login: userResponse.data.login,
        name: userResponse.data.name,
        avatar_url: userResponse.data.avatar_url,
        html_url: userResponse.data.html_url,
        bio: userResponse.data.bio,
        followers: userResponse.data.followers,
        following: userResponse.data.following,
        public_repos: userResponse.data.public_repos,
      },
      year: yearRange ? yearRange.value.toString() : 'all',
      availableYears: getAvailableYears(repos),
      summary,
      repos: sortedRepos,
    });
  } catch (error) {
    console.error('Error fetching data from GitHub API:', error.message);
    if (error.response) {
      return res.status(error.response.status).json({ message: error.response.data.message });
    }

    return res.status(500).json({ message: 'An internal server error occurred' });
  }
};

module.exports = {
  getRepoData,
};


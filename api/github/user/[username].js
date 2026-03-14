const { getGithubCityData } = require('../../_lib/githubData');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const username = req.query.username;
  const year = req.query.year || 'all';

  if (!username || Array.isArray(username)) {
    return res.status(400).json({ message: 'GitHub username is required' });
  }

  try {
    const payload = await getGithubCityData(username, Array.isArray(year) ? year[0] : year);
    return res.status(200).json(payload);
  } catch (error) {
    const statusCode = error.statusCode || error.response?.status || 500;
    const message = error.response?.data?.message || error.message || 'An internal server error occurred';
    return res.status(statusCode).json({ message });
  }
};

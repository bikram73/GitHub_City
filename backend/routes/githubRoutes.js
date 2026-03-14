const express = require('express');
const router = express.Router();
const { getRepoData } = require('../controllers/githubController');

router.get('/user/:username', getRepoData);

module.exports = router;


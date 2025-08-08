import { Router } from 'express';
import { slackOAuthCallback } from '../controllers/authController.js';

const router = Router();

// Slack OAuth install link
router.get('/slack/install', (req, res) => {
  const clientId = process.env.SLACK_CLIENT_ID;
  const redirectUri = process.env.SLACK_REDIRECT_URI;
  const scope = 'commands,chat:write,channels:read,groups:read,im:read,mpim:read';
  const userScope = 'chat:write';

  const authUrl = `https://slack.com/oauth/v2/authorize?client_id=${clientId}&scope=${scope}&user_scope=${userScope}&redirect_uri=${redirectUri}`;
  res.redirect(authUrl);
});

// Slack OAuth callback
router.get('/slack/oauth_redirect', slackOAuthCallback);

export default router;

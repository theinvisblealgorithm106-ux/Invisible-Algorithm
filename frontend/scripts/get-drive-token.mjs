#!/usr/bin/env node
// One-time script to obtain a long-lived Google OAuth refresh token for the
// Invisible Algorithm Drive account. Run once locally; the printed
// refresh token then goes into .env.local as GOOGLE_OAUTH_REFRESH_TOKEN.
//
// Usage (reads from env, not CLI args, so the secret never lands in shell
// history / process listings):
//   node --env-file=.env.local scripts/get-drive-token.mjs
// with GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET set in .env.local.
//
// Opens (prints) a Google consent URL. Approve it while logged into the
// account that should own the uploaded files, and this script captures
// the resulting refresh token automatically via a local callback server.

import { google } from 'googleapis';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '..', '.env.local');

const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
const REDIRECT_URI = 'http://localhost:8080/oauth2callback';

if (!clientId || !clientSecret) {
  console.error('Set GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET in .env.local, then run:\n  node --env-file=.env.local scripts/get-drive-token.mjs');
  process.exit(1);
}

const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, REDIRECT_URI);

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  prompt: 'consent',
  scope: ['https://www.googleapis.com/auth/drive'],
});

console.log('\nOpen this URL and approve access while logged into the account that should own the files:\n');
console.log(authUrl);
console.log('\nWaiting for you to approve in the browser...\n');

const server = http.createServer(async (req, res) => {
  if (!req.url.startsWith('/oauth2callback')) {
    res.writeHead(404);
    res.end();
    return;
  }
  const url = new URL(req.url, REDIRECT_URI);
  const code = url.searchParams.get('code');
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end('<html><body>Success — you can close this tab and return to the terminal.</body></html>');

  try {
    const { tokens } = await oauth2Client.getToken(code);
    let env = fs.readFileSync(envPath, 'utf8');
    if (/^GOOGLE_OAUTH_REFRESH_TOKEN=/m.test(env)) {
      env = env.replace(/^GOOGLE_OAUTH_REFRESH_TOKEN=.*$/m, `GOOGLE_OAUTH_REFRESH_TOKEN=${tokens.refresh_token}`);
    } else {
      env += `\nGOOGLE_OAUTH_REFRESH_TOKEN=${tokens.refresh_token}\n`;
    }
    fs.writeFileSync(envPath, env);
    console.log('\nRefresh token acquired and written to .env.local. Done — you can close this terminal.\n');
  } catch (err) {
    console.error('Failed to exchange code for tokens:', err.message);
  } finally {
    server.close();
    process.exit(0);
  }
});

server.listen(8080);

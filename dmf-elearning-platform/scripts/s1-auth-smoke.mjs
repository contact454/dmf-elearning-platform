#!/usr/bin/env node

/**
 * Sprint S1 auth smoke test:
 * 1) Supabase sign-up/sign-in (email/password)
 * 2) Protected learning-service API call using returned access token
 *
 * Notes:
 * - Google OAuth callback cannot be fully automated in headless CLI.
 * - Requires valid env vars and a running learning-service instance.
 */

import fs from 'fs';
import path from 'path';

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf-8');
  for (const rawLine of content.split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const equalsIndex = line.indexOf('=');
    if (equalsIndex <= 0) continue;
    const key = line.slice(0, equalsIndex).trim();
    let value = line.slice(equalsIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

const repoRoot = process.cwd();
loadEnvFile(path.join(repoRoot, '.env.local'));
loadEnvFile(path.join(repoRoot, 'apps/web-learner/.env.local'));
loadEnvFile(path.join(repoRoot, 'services/learning-service/.env'));

const requiredEnv = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
];

const missing = requiredEnv.filter((key) => !process.env[key]);
if (missing.length > 0) {
  console.error('[S1 smoke] Missing required environment variables:', missing.join(', '));
  process.exit(2);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const learningServiceUrl =
  process.env.LEARNING_SERVICE_URL ||
  process.env.NEXT_PUBLIC_LEARNING_API_URL?.replace(/\/api$/, '') ||
  'http://localhost:3003';

const randomSuffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const smokeEmailDomain = process.env.S1_SMOKE_EMAIL_DOMAIN || 'gmail.com';
const email = process.env.S1_SMOKE_EMAIL || `s1.smoke.${randomSuffix}@${smokeEmailDomain}`;
const password = `S1Smoke!${Math.random().toString(36).slice(2, 8)}A1`;

async function jsonFetch(url, options = {}) {
  const response = await fetch(url, options);
  const text = await response.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = { raw: text };
  }

  return { ok: response.ok, status: response.status, body };
}

async function run() {
  console.log('[S1 smoke] Registering test user...');
  const signup = await jsonFetch(`${supabaseUrl}/auth/v1/signup`, {
    method: 'POST',
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
      data: { source: 's1-smoke' },
    }),
  });

  if (!signup.ok) {
    console.error('[S1 smoke] Sign-up failed:', signup.status, signup.body);
    process.exit(1);
  }

  console.log('[S1 smoke] Logging in test user...');
  const signin = await jsonFetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  if (!signin.ok || !signin.body?.access_token) {
    console.error('[S1 smoke] Sign-in failed:', signin.status, signin.body);
    process.exit(1);
  }

  const accessToken = signin.body.access_token;
  console.log('[S1 smoke] Calling protected route /api/review/queue...');
  const protectedCall = await jsonFetch(`${learningServiceUrl}/api/review/queue`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!protectedCall.ok) {
    console.error(
      '[S1 smoke] Protected API call failed:',
      protectedCall.status,
      protectedCall.body
    );
    process.exit(1);
  }

  console.log('[S1 smoke] PASS');
  console.log(
    JSON.stringify(
      {
        email,
        protectedStatus: protectedCall.status,
      },
      null,
      2
    )
  );
}

run().catch((error) => {
  console.error('[S1 smoke] Unexpected failure:', error);
  process.exit(1);
});

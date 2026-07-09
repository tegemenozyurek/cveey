const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { getGlobalDefaultAccount, getAccessToken } = require('firebase-tools/lib/auth');
const scopes = require('firebase-tools/lib/scopes');

const BUCKET = 'cveey-a7faa.firebasestorage.app';

async function main() {
  const account = getGlobalDefaultAccount();
  if (!account?.tokens?.refresh_token) {
    throw new Error('Firebase oturumu bulunamadi. Once `npm run firebase:login` calistirin.');
  }

  const tokens = await getAccessToken(account.tokens.refresh_token, [scopes.CLOUD_PLATFORM]);
  const cors = JSON.parse(readFileSync(resolve(__dirname, '..', 'cors.json'), 'utf8'));

  const response = await fetch(`https://storage.googleapis.com/storage/v1/b/${BUCKET}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${tokens.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ cors }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`CORS ayari basarisiz (${response.status}): ${body}`);
  }

  console.log(`CORS ayarlari uygulandi: gs://${BUCKET}`);
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});

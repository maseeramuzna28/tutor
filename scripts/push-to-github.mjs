import git from 'isomorphic-git';
import http from 'isomorphic-git/http/node';
import fs from 'fs';

const token = process.env.GITHUB_TOKEN || process.argv[2];

if (!token) {
  console.error('Error: Please provide a GitHub Personal Access Token:');
  console.error('Usage: GITHUB_TOKEN=ghp_xxx node scripts/push-to-github.mjs');
  process.exit(1);
}

async function pushBranch() {
  console.log('Pushing branch "tuto" to https://github.com/maseeramuzna28/tutor.git ...');
  const pushResponse = await git.push({
    fs,
    http,
    dir: '.',
    remote: 'origin',
    ref: 'tuto',
    onAuth: () => ({ username: token })
  });

  if (pushResponse.ok) {
    console.log('✅ Successfully pushed branch "tuto" to GitHub!');
  } else {
    console.error('Push failed with response:', pushResponse);
  }
}

pushBranch().catch((err) => {
  console.error('❌ Push failed:', err.message);
  process.exit(1);
});

import http from 'http';

async function check() {
  const res = await fetch('http://localhost:3000/studio');
  const html = await res.text();
  const scriptRegex = /src="(\/_next\/[^"]+)"/g;
  let match;
  const urls = [];
  while ((match = scriptRegex.exec(html)) !== null) {
    urls.push(match[1]);
  }
  console.log(`Discovered ${urls.length} scripts in /studio`);
  let fails = 0;
  for (const url of urls) {
    const sRes = await fetch('http://localhost:3000' + url);
    if (sRes.status === 200) {
      console.log(`[200 OK] ${url.slice(0, 50)}...`);
    } else {
      console.error(`[FAIL ${sRes.status}] ${url}`);
      fails++;
    }
  }
  if (fails === 0) {
    console.log('SUCCESS: All script bundles returned 200 OK with zero 404s.');
  } else {
    console.error(`ERROR: ${fails} bundles failed.`);
    process.exit(1);
  }
}

check().catch((e) => {
  console.error(e);
  process.exit(1);
});

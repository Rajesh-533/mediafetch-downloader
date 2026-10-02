const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const https = require('https');

const binDir = path.join(__dirname, '..', 'bin');
const ytdlpPath = path.join(binDir, process.platform === 'win32' ? 'yt-dlp.exe' : 'yt-dlp');

async function downloadWithCurl(url, dest) {
  try {
    console.log(`[setup-bin] Downloading via curl from ${url}...`);
    execSync(`curl.exe -L -o "${dest}" "${url}"`, { stdio: 'inherit' });
    if (fs.existsSync(dest) && fs.statSync(dest).size > 1000000) {
      console.log(`[setup-bin] Downloaded successfully via curl (${(fs.statSync(dest).size / (1024 * 1024)).toFixed(2)} MB).`);
      return true;
    }
  } catch (err) {
    console.warn('[setup-bin] curl download failed, attempting node https fallback...', err.message);
  }
  return false;
}

function downloadWithHttps(url, dest) {
  return new Promise((resolve, reject) => {
    console.log(`[setup-bin] Downloading via node https from ${url}...`);
    const file = fs.createWriteStream(dest);

    const makeRequest = (targetUrl) => {
      https.get(targetUrl, (response) => {
        if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
          return makeRequest(response.headers.location);
        }
        if (response.statusCode !== 200) {
          return reject(new Error(`Failed with status code: ${response.statusCode}`));
        }

        response.pipe(file);
        file.on('finish', () => {
          file.close(() => {
            if (process.platform !== 'win32') {
              fs.chmodSync(dest, 0o755);
            }
            console.log(`[setup-bin] Downloaded successfully via node https.`);
            resolve();
          });
        });
      }).on('error', (err) => {
        fs.unlink(dest, () => {});
        reject(err);
      });
    };

    makeRequest(url);
  });
}

async function setup() {
  if (!fs.existsSync(binDir)) {
    fs.mkdirSync(binDir, { recursive: true });
  }

  if (fs.existsSync(ytdlpPath)) {
    console.log(`[setup-bin] yt-dlp binary already exists at: ${ytdlpPath}`);
  } else {
    console.log('[setup-bin] yt-dlp binary missing. Initiating download...');
    const downloadUrl = process.platform === 'win32'
      ? 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe'
      : 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp';

    const curlSuccess = await downloadWithCurl(downloadUrl, ytdlpPath);
    if (!curlSuccess) {
      await downloadWithHttps(downloadUrl, ytdlpPath);
    }
  }

  if (fs.existsSync(ytdlpPath) && process.platform !== 'win32') {
    fs.chmodSync(ytdlpPath, 0o755);
  }

  console.log('[setup-bin] Setup complete.');
}

setup().catch((err) => {
  console.error('[setup-bin] Setup error:', err);
});

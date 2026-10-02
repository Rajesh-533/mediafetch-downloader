# MediaFetch — Permitted Online Video Downloader & MP3 Converter

<div align="center">
  <img src="public/logo.jpg" alt="MediaFetch Logo" width="180" />
  <h3>Download your permitted media in the best available quality.</h3>
</div>

---

## ⚡ Overview

**MediaFetch** is a modern, high-performance web application built with **Next.js 14**, **React**, **TypeScript**, and **Tailwind CSS**. It enables users to download permitted/public online videos and convert supported videos to MP3 with **real server-side processing** using `yt-dlp` and `FFmpeg`.

### ✨ Key Features
- **YouTube Video Downloader**: Extracts genuine resolutions (360p, 480p, 720p HD, 1080p Full HD, 1440p 2K, 2160p 4K) without fake upscaling.
- **YouTube to MP3 Converter**: Extracts pure audio streams and encodes them using FFmpeg (`libmp3lame`) at true source bitrates.
- **Instagram Video Downloader**: Downloads publicly accessible Instagram Reels and feed video posts.
- **Minimalist & Professional Design**: Clean, distraction-free UI inspired by modern engineering tools, powered by the **Inter** typography stack and full dark/light mode support.
- **Mobile-First Ergonomics**: Designed for smartphones with thumb-friendly touch targets, responsive 16:9 previews, and 2-column resolution selectors.
- **Strict Security & Guardrails**: Built-in SSRF protection against internal/loopback IPs, rate limiting per IP, command injection defenses, and automated temp file cleanup.

---

## 🛠️ Architecture

```
User / Browser
   │
   ├─► POST /api/analyze   ──► Validates URL & extracts real available resolutions via yt-dlp
   ├─► GET  /api/download  ──► Merges video + audio via FFmpeg & streams attachment (MP4)
   ├─► GET  /api/convert   ──► Encodes audio via FFmpeg (libmp3lame) & streams attachment (MP3)
   └─► GET  /api/health    ──► Diagnostics check for yt-dlp & FFmpeg binaries
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v18+ (tested on Node.js 24)
- npm or pnpm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Rajesh-533/mediafetch-downloader.git
   cd mediafetch-downloader
   ```

2. Install dependencies:
   ```bash
   npm install
   ```
   *(The post-install script will automatically provision `yt-dlp` and `ffmpeg` into the local project environment).*

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build
```bash
npm run build
npm start
```

---

## 🔒 Security & Fair Use

- **SSRF Protection**: Blocks access to `localhost`, `127.0.0.1`, loopback, link-local, and private subnets (`10.0.0.0/8`, `192.168.0.0/16`, `172.16.0.0/12`).
- **Domain Whitelisting**: Restricted to supported public endpoints on YouTube and Instagram.
- **Rate Limiting**: In-memory sliding window limiter to prevent Denial-of-Service attacks.
- **Automated Cleanup**: Temporary session directories are deleted immediately following stream completion or process termination.

---

## ⚖️ Legal Disclaimer

> **Notice:** Download only content you own or have explicit permission to download. MediaFetch strictly respects platform terms and copyright laws. MediaFetch does not bypass DRM, access controls, private account protections, or login barriers.

---

## 📄 License
This project is open-source under the MIT License.

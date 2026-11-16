REXY — clean deployment package

Files in this folder must be uploaded together to the ROOT of the GitHub Pages repository:
- index.html
- manifest.webmanifest
- sw.js
- icon-192.png
- icon-512.png

This package aligns icon filenames referenced by index.html, manifest.webmanifest and sw.js.
The service-worker cache name is bumped to rexy-shell-v2 to avoid reusing the previous shell cache.

Important: this corrects a confirmed PWA asset/cache mismatch. It does NOT yet prove the cause of the blank app screen; browser runtime verification is still required.
Do not delete or overwrite the separate original v7 backup.

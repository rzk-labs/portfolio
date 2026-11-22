# Hub Rizka

Situs publik **rizka-portfolio.pages.dev**: Beranda · Cerita · Thoughts · Selera · Karya · Sekarang.

- Tanpa build: HTML statis + `assets/app.js` membaca `content/*.json`.
- **Studio (fase 1)**: edit konten lewat [Pages CMS](https://app.pagescms.org) (config `.pages.yml`). Setiap simpan = commit, lalu Cloudflare Pages auto-deploy.
- Cek konten sebelum push: `node tools/cek-konten.mjs`
- Uji lokal: `node tools/server-lokal.mjs . 4321` → http://localhost:4321
- Repo ini **publik**: jangan isi data rahasia. Entitas bisnis (`jenis: bisnis`) tidak boleh `tampil_di_hub`.

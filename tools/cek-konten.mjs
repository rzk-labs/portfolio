// Validasi file content/*.json. Pakai: node tools/cek-konten.mjs [folder-content]
import { readFileSync } from "node:fs";
import { join } from "node:path";

const dir = process.argv[2] || "content";
const salah = [];
const PLATFORM = ["instagram", "tiktok", "threads", "youtube", "x", "linkedin", "web", "lainnya"];
const KATEGORI = ["musik", "buku", "tontonan", "makanan", "tempat", "barang", "lainnya"];
const JENIS = ["pribadi", "karya", "bisnis"];
const SEGMEN = ["personal", "karya", "tips-jualan"];

function baca(nama) {
  try { return JSON.parse(readFileSync(join(dir, nama + ".json"), "utf8")); }
  catch (e) { salah.push(`${nama}.json: tidak bisa dibaca (${e.message})`); return null; }
}
const urlOk = (u) => !u || /^https?:\/\//i.test(u) || /^\/[^/]/.test(u);
const tglOk = (t) => !t || !isNaN(new Date(t));

const profil = baca("profil");
if (profil && !profil.nama) salah.push("profil.json: nama wajib diisi");
if (profil && !urlOk(profil.foto)) salah.push("profil.json: foto harus link http(s) atau /path");

const ent = baca("entitas");
if (ent) {
  if (!Array.isArray(ent)) salah.push("entitas.json: harus berupa daftar");
  else {
    const ids = new Set();
    ent.forEach((e, i) => {
      const k = `entitas #${i + 1} (${e.id || "?"})`;
      if (!/^[a-z0-9-]+$/.test(e.id || "")) salah.push(`${k}: id wajib huruf kecil/angka/strip`);
      if (ids.has(e.id)) salah.push(`${k}: id dobel`);
      ids.add(e.id);
      if (!e.nama) salah.push(`${k}: nama wajib`);
      if (!JENIS.includes(e.jenis)) salah.push(`${k}: jenis tidak dikenal`);
      if (e.segmen && !SEGMEN.includes(e.segmen)) salah.push(`${k}: segmen tidak dikenal`);
      if (!urlOk(e.url)) salah.push(`${k}: url tidak aman`);
      if (e.jenis === "bisnis" && e.tampil_di_hub) salah.push(`${k}: bisnis tidak boleh tampil di Hub`);
      (e.akun || []).forEach((a, j) => {
        if (!PLATFORM.includes(a.platform)) salah.push(`${k} akun #${j + 1}: platform tidak dikenal`);
        if (!a.url || !/^https?:\/\//i.test(a.url)) salah.push(`${k} akun #${j + 1}: link wajib http(s)`);
      });
    });
    ent.forEach((e) => { if (e.induk && !ids.has(e.induk)) salah.push(`entitas ${e.id}: induk "${e.induk}" tidak ada`); });
    if (!ent.some((e) => e.jenis === "pribadi")) salah.push("entitas.json: wajib ada 1 entitas jenis pribadi");
  }
}

for (const [nama, wajib] of [["cerita", "judul"], ["thoughts", "teks"], ["selera", "judul"]]) {
  const d = baca(nama);
  if (!d) continue;
  if (!Array.isArray(d)) { salah.push(`${nama}.json: harus berupa daftar`); continue; }
  d.forEach((x, i) => {
    if (!x[wajib]) salah.push(`${nama} #${i + 1}: ${wajib} wajib`);
    if (!tglOk(x.tanggal)) salah.push(`${nama} #${i + 1}: tanggal tidak valid`);
    for (const f of ["link", "foto"]) if (!urlOk(x[f])) salah.push(`${nama} #${i + 1}: ${f} tidak aman`);
    if (nama === "selera" && !KATEGORI.includes(x.kategori)) salah.push(`selera #${i + 1}: kategori tidak dikenal`);
  });
}

const skr = baca("sekarang");
if (skr && skr.poin && !Array.isArray(skr.poin)) salah.push("sekarang.json: poin harus daftar");

if (salah.length) { console.log("❌ " + salah.length + " masalah:\n- " + salah.join("\n- ")); process.exit(1); }
console.log("✅ Konten valid (" + (ent ? ent.length : 0) + " entitas)");

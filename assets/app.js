// Hub Rizka — merender halaman dari file content/*.json (diedit lewat Studio / Pages CMS)
(function () {
  "use strict";
  var ikonkan = window.ikonkan || function (h) { return h; }; // ikon gambar sendiri (assets/ikon.js); tanpa itu tetap tampil apa adanya

  var HALAMAN = [
    { id: "beranda", label: "Beranda", url: "/" },
    { id: "cerita", label: "Cerita", url: "/cerita" },
    { id: "thoughts", label: "Thoughts", url: "/thoughts" },
    { id: "selera", label: "Selera", url: "/selera" },
    { id: "karya", label: "Karya", url: "/karya" },
    { id: "sekarang", label: "Sekarang", url: "/sekarang" }
  ];

  var PLATFORM = {
    instagram: "Instagram", tiktok: "TikTok", threads: "Threads", youtube: "YouTube",
    x: "X", linkedin: "LinkedIn", web: "Web", lainnya: "Link"
  };

  var KATEGORI = {
    musik: "🎵 Musik", buku: "📚 Buku", tontonan: "🎬 Tontonan", makanan: "🍜 Makanan",
    tempat: "📍 Tempat", barang: "🛍️ Barang", lainnya: "✨ Lainnya"
  };

  // ---------- util aman ----------
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  // hanya izinkan link http(s) atau path lokal; selain itu dibuang
  function urlAman(u) {
    u = String(u || "").trim();
    if (/^https?:\/\//i.test(u)) return u;
    if (/^\/[^\/]/.test(u)) return u;
    return "";
  }
  function paragraf(teks) {
    return String(teks || "").split(/\n{2,}/).map(function (p) {
      return "<p>" + esc(p).replace(/\n/g, "<br>") + "</p>";
    }).join("");
  }
  function tgl(s) {
    if (!s) return "";
    var d = new Date(s);
    if (isNaN(d)) return esc(s);
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  }
  function urutTerbaru(arr) {
    return arr.slice().sort(function (a, b) { return String(b.tanggal || "").localeCompare(String(a.tanggal || "")); });
  }
  function kosong(judul, isi, doodle) {
    return '<div class="kosong">' + (doodle || "") + "<b>" + esc(judul) + "</b>" + esc(isi) + "</div>";
  }
  function ambil(nama, cadangan) {
    return fetch("/content/" + nama + ".json", { cache: "no-cache" })
      .then(function (r) { return r.ok ? r.json() : cadangan; })
      .catch(function () { return cadangan; });
  }
  function tombolAkun(akun, kelas) {
    return (akun || []).map(function (a) {
      var u = urlAman(a && a.url);
      if (!u) return "";
      var nama = PLATFORM[a.platform] || PLATFORM.lainnya;
      return '<a class="tombol ' + (kelas || "") + '" href="' + esc(u) + '" target="_blank" rel="noopener">' + esc(nama) + "</a>";
    }).join("");
  }

  // ---------- doodle hidup (brand v5) ----------
  var BINTANG = '<path d="M20 2l5 13 13 5-13 5-5 13-5-13-13-5 13-5z"/>';
  var AWAN = '<svg width="64" height="64" viewBox="0 0 64 64" aria-hidden="true" focusable="false"><path class="c" d="M18 48c-7 0-11-5-10-11 1-5 6-8 11-6 1-9 9-14 17-12 7 2 11 8 10 14 6-1 11 3 11 8 0 4-4 7-9 7z" stroke="#e6b9ea" stroke-width="7"/><path class="c" d="M54 11c0-1.4 1.8-1.7 2.4-.4.7 1.7-.8 3.3-2.6 3.1-2.4-.2-3.3-2.8-2.2-4.8 1.3-2.4 4.6-2.8 6.4-1" stroke="#1b1b1b" stroke-width="2.5"/></svg>';
  var IKON = {
    hati: '<path d="M12 20s-7.5-4.6-8.6-9.4C2.6 7.2 5 4.6 7.7 5c1.9.3 3.3 1.8 4.3 3.4 1-1.6 2.4-3.1 4.3-3.4 2.7-.4 5.1 2.2 4.3 5.6C19.5 15.4 12 20 12 20z"/>',
    awan: '<path d="M7 18c-3 0-4.5-2.3-4-4.6.5-2 2.6-3 4.3-2.5.4-3 3-5 6-4.6 2.7.4 4.4 2.6 4.3 5 2.5-.2 4.2 1.6 4 3.6-.2 1.8-1.7 3.1-3.6 3.1z"/>',
    bintang: '<path d="M12 2.5l2.6 6.3 6.6.6-5 4.4 1.5 6.6L12 17l-5.7 3.4 1.5-6.6-5-4.4 6.6-.6z"/>',
    spiral: '<path d="M12 12c0-1 1.5-1.3 2-.3.7 1.4-.6 3-2.2 3-2.2 0-3.4-2.3-2.8-4.3.8-2.6 3.9-3.6 6.2-2.6 3 1.3 3.8 5 2.5 7.8-1.6 3.4-6 4.4-9.2 2.8-3.300-1.600-4.200-6.400-2.400-9.600C8 4.5 13.3 3.5 17 5.5"/>',
    pin: '<path d="M12 21s-6-6.2-6-11a6 6 0 0 1 12 0c0 4.8-6 11-6 11z"/><circle cx="12" cy="10" r="2.3"/>'
  };
  function ikonGaris(n) {
    return '<svg class="c" width="22" height="22" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" aria-hidden="true" focusable="false">' + (IKON[n] || "") + "</svg>";
  }
  function bunga(x, y, w, warna) {
    return '<g class="spin" transform="translate(' + x + ' ' + y + ') scale(' + (w / 60) + ')" fill="' + warna + '">' +
      '<circle cx="0" cy="-16" r="9"/><circle cx="15" cy="-5" r="9"/><circle cx="9" cy="13" r="9"/><circle cx="-9" cy="13" r="9"/><circle cx="-15" cy="-5" r="9"/><circle cx="0" cy="0" r="6" fill="#1b1b1b"/></g>';
  }
  function doodleHero() {
    return '<svg class="doodle" style="left:50%;top:0;transform:translateX(-50%);width:min(100%,520px);height:250px" viewBox="0 0 360 250" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">' +
      '<path class="c draw loop" d="M22 70c8-26 30-30 42-12s-14 34-32 20" stroke="#e8623f" stroke-width="7"/>' +
      '<path class="c draw d1" d="M300 40c12-20 34-16 34 4s-28 22-38 8" stroke="#9cc4ec" stroke-width="7"/>' +
      '<g class="pop" transform="translate(318 150) scale(.9)" fill="#e8623f">' + BINTANG + '</g>' +
      bunga(30, 200, 48, "#9cc4ec") +
      '<path class="c draw d2" d="M250 232c20-14 40 6 60-6" stroke="#1b1b1b" stroke-width="6"/>' +
      '<path class="c draw d3" d="M60 238c20-8 40-8 60 0" stroke="#1b1b1b" stroke-width="2.5"/></svg>';
  }
  function doodleKecil(warna) {
    return '<svg class="doodle" style="right:-6px;top:-14px;width:70px;height:70px" viewBox="0 0 70 70">' +
      '<g class="pop" transform="translate(14 14) scale(.9)" fill="' + (warna || "#c9d64a") + '">' + BINTANG + '</g></svg>';
  }

  // ---------- kerangka ----------
  function kerangka(aktif) {
    var nav = HALAMAN.map(function (h) {
      return '<a href="' + h.url + '"' + (h.id === aktif ? ' aria-current="page"' : "") + ">" + h.label + "</a>";
    }).join("");
    document.getElementById("kepala").innerHTML =
      '<div class="wadah"><a class="merek" href="/">Rizka<span>.</span></a><nav class="nav">' + nav + "</nav></div>";
    document.getElementById("kaki").innerHTML =
      '<div class="wadah">✿ rizka · ' + new Date().getFullYear() + ' · nggak rapi, tapi hidup</div>';
  }

  // ---------- halaman ----------
  var RENDER = {
    beranda: function () {
      return Promise.all([ambil("profil", {}), ambil("entitas", [])]).then(function (h) {
        var p = h[0] || {}, ent = h[1] || [];
        var aku = ent.filter(function (e) { return e.jenis === "pribadi"; })[0] || {};
        var foto = urlAman(p.foto);
        var fotoHtml = '<div class="pol wig">' + (foto ? '<img src="' + esc(foto) + '" alt="Foto ' + esc(p.nama) + '" width="240" height="300">' : '<div class="ph">foto segera nempel di sini</div>') + "<small>aku nih</small></div>";
        var sos = tombolAkun(aku.akun, "pepper");
        var KET = { cerita: ["p4", "hati", "Cerita", "momen hidup"], thoughts: ["p1", "awan", "Thoughts", "pikiran random"], selera: ["p2", "bintang", "Selera", "lagi suka apa"], karya: ["p3", "spiral", "Karya", "app kecil buatanku"], sekarang: ["p5", "pin", "Sekarang", "lagi fokus apa bulan ini"] };
        var pintu = HALAMAN.slice(1).map(function (x) {
          var k = KET[x.id];
          return '<a class="' + k[0] + '" href="' + x.url + '"><b>' + ikonGaris(k[1]) + k[2] + "</b><small>" + k[3] + "</small></a>";
        }).join("");
        var tg = String(p.tagline || "ibu, pembuat app, & pemain padel").trim(), ps = tg.lastIndexOf(" ");
        return '<div class="hero">' + doodleHero() + fotoHtml + "<h1>Hello! Aku " + esc(p.nama || "Rizka") + ',<br><span class="tag">' + esc(tg.slice(0, ps + 1)) + "</span><i>" + esc(tg.slice(ps + 1)) + "</i></h1>" +
          '<p class="sub">' + esc(p.bio) + "</p>" + (sos ? '<div class="tombol-sosmed">' + sos + "</div>" : "") + "</div>" +
          '<div class="pintu">' + pintu + "</div>";
      });
    },

    cerita: function () {
      return ambil("cerita", []).then(function (d) {
        var isi = urutTerbaru(d || []).map(function (c) {
          var foto = urlAman(c.foto), link = urlAman(c.link);
          return '<article class="kartu cerita"><div class="tanggal">' + tgl(c.tanggal) + "</div><h3>" + esc(c.judul) + "</h3>" +
            (foto ? '<img src="' + esc(foto) + '" alt="' + esc(c.judul) + '" loading="lazy">' : "") + paragraf(c.teks) +
            (link ? '<a href="' + esc(link) + '" target="_blank" rel="noopener">Lihat posting →</a>' : "") + "</article>";
        }).join("");
        return doodleKecil("#c9d64a") + "<h1>Cerita</h1><p class=\"sub\">Momen-momen kecil yang pengen aku simpan.</p>" +
          (isi || kosong("Belum ada cerita", "Cerita pertama sedang ditulis ✍️"));
      });
    },

    thoughts: function () {
      return ambil("thoughts", []).then(function (d) {
        var isi = urutTerbaru(d || []).map(function (t) {
          return '<article class="kartu"><div class="thought">' + paragraf(t.teks) + '</div><div class="tanggal">' + tgl(t.tanggal) + "</div></article>";
        }).join("");
        return doodleKecil("#e8623f") + "<h1>Thoughts</h1><p class=\"sub\">Pikiran random dan renungan hidup.</p>" +
          (isi || kosong("Belum ada thought", "Pikiran pertama segera mampir 💭", AWAN) +
            '<p class="kosong-lanjut"><a class="tombol garis" href="/cerita">Lihat Cerita</a><a class="tombol garis" href="/selera">Lihat Selera</a></p>');
      });
    },

    selera: function () {
      return ambil("selera", []).then(function (d) {
        var isi = (d || []).map(function (s) {
          var link = urlAman(s.link);
          return '<article class="kartu"><span class="label">' + esc(KATEGORI[s.kategori] || KATEGORI.lainnya) + "</span><h3>" +
            esc(s.judul) + "</h3>" + paragraf(s.catatan) +
            (link ? '<a href="' + esc(link) + '" target="_blank" rel="noopener">Lihat →</a>' : "") + "</article>";
        }).join("");
        return doodleKecil("#ff8fb1") + "<h1>Selera</h1><p class=\"sub\">Hal-hal yang lagi aku suka sekarang.</p>" +
          (isi ? '<div class="grid-2">' + isi + "</div>" : kosong("Belum ada selera", "Daftar favorit segera diisi ✨"));
      });
    },

    karya: function () {
      return ambil("entitas", []).then(function (d) {
        var isi = (d || []).filter(function (e) { return e.jenis === "karya" && e.tampil_di_hub; }).map(function (k) {
          var u = urlAman(k.url);
          return '<article class="kartu karya-kartu"><div class="karya-kepala"><div class="ikon">' + esc(k.ikon || "🛠️") + "</div><h3>" +
            esc(k.nama) + "</h3></div><p>" + esc(k.deskripsi) + '</p><div class="aksi">' +
            (u ? '<a class="tombol" href="' + esc(u) + '" target="_blank" rel="noopener" aria-label="Coba ' + esc(k.nama) + ' (buka tab baru)">Coba ↗</a>' : "") +
            tombolAkun(k.akun, "garis") + "</div></article>";
        }).join("");
        return doodleKecil("#9cc4ec") + "<h1>Karya</h1><p class=\"sub\">App-app kecil yang aku bikin untuk hidup yang lebih enak.</p>" +
          (isi || kosong("Belum ada karya", "Segera hadir 🛠️"));
      });
    },

    sekarang: function () {
      return ambil("sekarang", {}).then(function (d) {
        d = d || {};
        var poin = (d.poin || []).filter(Boolean).map(function (p) { return "<li>" + esc(p) + "</li>"; }).join("");
        return doodleKecil("#e6b9ea") + "<h1>Sekarang</h1><p class=\"sub\">Lagi fokus apa bulan ini." +
          (d.diperbarui ? " Diperbarui " + tgl(d.diperbarui) + "." : "") + "</p>" +
          (poin ? '<div class="kartu"><ul>' + poin + "</ul></div>" : kosong("Belum diisi", "Fokus bulan ini segera ditulis 📍"));
      });
    }
  };

  var halaman = document.body.getAttribute("data-halaman") || "beranda";
  kerangka(halaman);
  var main = document.getElementById("isi");
  (RENDER[halaman] || RENDER.beranda)().then(function (html) {
    main.innerHTML = ikonkan(html);
  }).catch(function () {
    main.innerHTML = kosong("Ups", "Konten gagal dimuat. Coba muat ulang.");
  });
})();

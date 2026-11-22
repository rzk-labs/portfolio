// Hub Rizka — merender halaman dari file content/*.json (diedit lewat Studio / Pages CMS)
(function () {
  "use strict";

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
  function kosong(judul, isi) {
    return '<div class="kosong"><b>' + esc(judul) + "</b>" + esc(isi) + "</div>";
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

  // ---------- kerangka ----------
  function kerangka(aktif) {
    var nav = HALAMAN.map(function (h) {
      return '<a href="' + h.url + '"' + (h.id === aktif ? ' aria-current="page"' : "") + ">" + h.label + "</a>";
    }).join("");
    document.getElementById("kepala").innerHTML =
      '<div class="wadah"><a class="merek" href="/">Rizka<span>.</span></a><nav class="nav">' + nav + "</nav></div>";
    document.getElementById("kaki").innerHTML =
      '<div class="wadah">© ' + new Date().getFullYear() + " Rizka · dibuat dengan cinta & kopi</div>";
  }

  // ---------- halaman ----------
  var RENDER = {
    beranda: function () {
      return Promise.all([ambil("profil", {}), ambil("entitas", [])]).then(function (h) {
        var p = h[0] || {}, ent = h[1] || [];
        var aku = ent.filter(function (e) { return e.jenis === "pribadi"; })[0] || {};
        var foto = urlAman(p.foto);
        var fotoHtml = foto ? '<img class="foto-profil" src="' + esc(foto) + '" alt="Foto ' + esc(p.nama) + '">'
                            : '<div class="foto-profil" aria-hidden="true">👩</div>';
        var sos = tombolAkun(aku.akun);
        var pintu = HALAMAN.slice(1).map(function (x) {
          var ket = { cerita: "momen sehari-hari", thoughts: "pikiran random", selera: "lagi suka apa",
                      karya: "app yang aku bikin", sekarang: "lagi fokus apa" }[x.id];
          return '<a href="' + x.url + '"><b>' + x.label + "</b><small>" + ket + "</small></a>";
        }).join("");
        return '<div class="hero">' + fotoHtml + "<div><h1>" + esc(p.nama || "Rizka") + '</h1><p class="sub">' +
          esc(p.tagline) + "</p></div></div>" + paragraf(p.bio) +
          (sos ? '<div class="tombol-sosmed">' + sos + "</div>" : "") +
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
        return "<h1>Cerita</h1><p class=\"sub\">Momen-momen kecil yang pengen aku simpan.</p>" +
          (isi || kosong("Belum ada cerita", "Cerita pertama sedang ditulis ✍️"));
      });
    },

    thoughts: function () {
      return ambil("thoughts", []).then(function (d) {
        var isi = urutTerbaru(d || []).map(function (t) {
          return '<article class="kartu"><div class="thought">' + paragraf(t.teks) + '</div><div class="tanggal">' + tgl(t.tanggal) + "</div></article>";
        }).join("");
        return "<h1>Thoughts</h1><p class=\"sub\">Pikiran random dan renungan hidup.</p>" +
          (isi || kosong("Belum ada thought", "Pikiran pertama segera mampir 💭"));
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
        return "<h1>Selera</h1><p class=\"sub\">Hal-hal yang lagi aku suka sekarang.</p>" +
          (isi ? '<div class="grid-2">' + isi + "</div>" : kosong("Belum ada selera", "Daftar favorit segera diisi ✨"));
      });
    },

    karya: function () {
      return ambil("entitas", []).then(function (d) {
        var isi = (d || []).filter(function (e) { return e.jenis === "karya" && e.tampil_di_hub; }).map(function (k) {
          var u = urlAman(k.url);
          return '<article class="kartu"><div class="karya-kepala"><div class="ikon">' + esc(k.ikon || "🛠️") + "</div><h3>" +
            esc(k.nama) + "</h3></div><p>" + esc(k.deskripsi) + '</p><div class="aksi">' +
            (u ? '<a class="tombol" href="' + esc(u) + '" target="_blank" rel="noopener">Coba</a>' : "") +
            tombolAkun(k.akun, "garis") + "</div></article>";
        }).join("");
        return "<h1>Karya</h1><p class=\"sub\">App-app kecil yang aku bikin untuk hidup yang lebih enak.</p>" +
          (isi || kosong("Belum ada karya", "Segera hadir 🛠️"));
      });
    },

    sekarang: function () {
      return ambil("sekarang", {}).then(function (d) {
        d = d || {};
        var poin = (d.poin || []).filter(Boolean).map(function (p) { return "<li>" + esc(p) + "</li>"; }).join("");
        return "<h1>Sekarang</h1><p class=\"sub\">Lagi fokus apa bulan ini." +
          (d.diperbarui ? " Diperbarui " + tgl(d.diperbarui) + "." : "") + "</p>" +
          (poin ? '<div class="kartu"><ul>' + poin + "</ul></div>" : kosong("Belum diisi", "Fokus bulan ini segera ditulis 📍"));
      });
    }
  };

  var halaman = document.body.getAttribute("data-halaman") || "beranda";
  kerangka(halaman);
  var main = document.getElementById("isi");
  (RENDER[halaman] || RENDER.beranda)().then(function (html) {
    main.innerHTML = html;
  }).catch(function () {
    main.innerHTML = kosong("Ups", "Konten gagal dimuat. Coba muat ulang.");
  });
})();

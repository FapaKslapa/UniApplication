(async () => {
  const AY_RE = /Anno Accademico (\d{4})\/(\d{4})/;
  const CINECA_RE =
    /href="https:\/\/unins\.prod\.up\.cineca\.it\/calendarioPubblico\/linkCalendarioId=([a-f0-9]+)"[^>]*>(<[^>]+>)*([^<]+)/gi;
  const LINK_RE =
    /href="(\/formazione\/offerta-formativa\/corsi-di-laurea\/[^"?#]+)"/g;
  const ARABIC_RE = /([1-9])\s*[°º]/;
  const ROMAN_RE = /\b(VI|IV|V|I{1,3})\s*[°º]/i;
  const ROMANS = { I: 1, II: 2, III: 3, IV: 4, V: 5, VI: 6 };
  const CAMPUS_RE = /\b(VARESE|COMO|BUSTO)\b/i;
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const clean = (t) =>
    t
      .replace(/\s+/g, " ")
      .trim()
      .replace(/&amp;/g, "&")
      .replace(/&#039;/g, "'");
  const parseYear = (label) => {
    const a = ARABIC_RE.exec(label);
    if (a) return parseInt(a[1], 10);
    const r = ROMAN_RE.exec(label);
    return r ? ROMANS[r[1].toUpperCase()] || 1 : 1;
  };
  const now = new Date();
  const y = now.getFullYear();
  const currentYear = now.getMonth() >= 8 ? `${y}/${y + 1}` : `${y - 1}/${y}`;

  const ajax = await fetch("/views/ajax", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "X-Requested-With": "XMLHttpRequest",
    },
    body: new URLSearchParams({
      view_name: "corsi_di_laurea_e_post_laurea",
      view_display_id: "block_1",
    }).toString(),
  });
  const commands = await ajax.json();
  const urls = new Set();
  for (const c of commands) {
    if (!c.data || c.data.length < 100) continue;
    for (const m of c.data.matchAll(LINK_RE)) urls.add(m[1]);
  }
  console.log(`Trovate ${urls.size} pagine corso`);

  const pages = [];
  let i = 0;
  for (const url of urls) {
    i++;
    try {
      const html = await (await fetch(url)).text();
      const doc = new DOMParser().parseFromString(html, "text/html");
      const slug = url.split("/").pop() || "";
      const h1 = clean(doc.querySelector("h1")?.textContent || "");
      const ogTitle = clean(
        (
          doc.querySelector('meta[property="og:title"]')?.content ||
          doc.title ||
          ""
        ).split("|")[0],
      );
      const slugName = slug
        .split("-")
        .map((w) => (w.length > 2 ? w[0].toUpperCase() + w.slice(1) : w))
        .join(" ");
      const ay = AY_RE.exec(html);
      const entries = [];
      for (const m of html.matchAll(CINECA_RE)) {
        const label = clean(m[3]);
        const campus = CAMPUS_RE.exec(label);
        entries.push({
          linkId: m[1],
          label,
          year: parseYear(label),
          campus: campus
            ? campus[1][0].toUpperCase() + campus[1].slice(1).toLowerCase()
            : "",
        });
      }
      pages.push({
        name: h1 || ogTitle || slugName,
        h1,
        ogTitle,
        slug,
        academicYear: ay ? `${ay[1]}/${ay[2]}` : currentYear,
        entries,
      });
      console.log(
        `${i}/${urls.size} ${h1 || ogTitle || slugName}: ${entries.length} link`,
      );
    } catch (e) {
      console.error(`Errore su ${url}`, e);
    }
    await sleep(300);
  }

  const blob = new Blob([JSON.stringify(pages, null, 1)], {
    type: "application/json",
  });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "courses-scraped.json";
  a.click();
  console.log(
    `Fatto: ${pages.length} corsi, ${pages.reduce((n, p) => n + p.entries.length, 0)} link. File scaricato.`,
  );
})();

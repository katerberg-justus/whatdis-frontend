import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sourcePath = path.join(__dirname, 'index.html');
const baseUrl = 'https://play.whatdis.app';
const languages = ['en', 'es', 'fr', 'de', 'nl', 'pt'];

const meta = {
  en: {
    title: 'WHATDIS?! - Free AI 20 Questions Game',
    description: 'Play WHATDIS?!, a free AI-powered 20 questions game. Ask yes or no questions, solve daily mystery challenges, collect stickers, and battle friends.',
    ogDescription: 'Ask yes or no questions, crack daily AI mystery challenges, collect stickers, and battle friends in WHATDIS?!',
    h1: 'WHATDIS?! - Free AI 20 Questions Game',
  },
  es: {
    title: 'WHATDIS?! - Juego gratis de 20 preguntas con IA',
    description: 'Juega a WHATDIS?!, un juego gratis de 20 preguntas con IA. Haz preguntas de si o no, resuelve desafios diarios, colecciona pegatinas y reta a tus amigos.',
    ogDescription: 'Haz preguntas de si o no, resuelve misterios diarios con IA, colecciona pegatinas y reta a tus amigos en WHATDIS?!',
    h1: 'WHATDIS?! - Juego gratis de 20 preguntas con IA',
  },
  fr: {
    title: 'WHATDIS?! - Jeu gratuit de 20 questions avec IA',
    description: 'Joue a WHATDIS?!, un jeu gratuit de 20 questions avec IA. Pose des questions oui/non, resols des defis quotidiens, collectionne des stickers et defie tes amis.',
    ogDescription: 'Pose des questions oui/non, trouve les mysteres quotidiens avec IA, collectionne des stickers et defie tes amis dans WHATDIS?!',
    h1: 'WHATDIS?! - Jeu gratuit de 20 questions avec IA',
  },
  de: {
    title: 'WHATDIS?! - Kostenloses KI-Spiel mit 20 Fragen',
    description: 'Spiele WHATDIS?!, ein kostenloses KI-Spiel mit 20 Fragen. Stelle Ja/Nein-Fragen, loese taegliche Raetsel, sammle Sticker und duelliere deine Freunde.',
    ogDescription: 'Stelle Ja/Nein-Fragen, loese taegliche KI-Raetsel, sammle Sticker und duelliere deine Freunde in WHATDIS?!',
    h1: 'WHATDIS?! - Kostenloses KI-Spiel mit 20 Fragen',
  },
  nl: {
    title: 'WHATDIS?! - Gratis AI-spel met 20 vragen',
    description: 'Speel WHATDIS?!, een gratis AI-spel met 20 vragen. Stel ja/nee-vragen, los dagelijkse mysteries op, verzamel stickers en battle je vrienden.',
    ogDescription: 'Stel ja/nee-vragen, kraak dagelijkse AI-mysteries, verzamel stickers en battle je vrienden in WHATDIS?!',
    h1: 'WHATDIS?! - Gratis AI-spel met 20 vragen',
  },
  pt: {
    title: 'WHATDIS?! - Jogo gratis de 20 perguntas com IA',
    description: 'Jogue WHATDIS?!, um jogo gratis de 20 perguntas com IA. Faca perguntas de sim ou nao, resolva desafios diarios, colecione adesivos e desafie seus amigos.',
    ogDescription: 'Faca perguntas de sim ou nao, resolva misterios diarios com IA, colecione adesivos e desafie seus amigos em WHATDIS?!',
    h1: 'WHATDIS?! - Jogo gratis de 20 perguntas com IA',
  },
};

const translations = {
  en: {
    tag: '20 QUESTIONS WITH AI',
    sub: 'Every challenge hides a secret subject. Ask yes/no questions. Crack the answer. Collect stickers. Battle your friends.',
    playFree: 'PLAY FREE',
    howItWorks: 'HOW IT WORKS',
    liveDemo: '// LIVE DEMO',
    q1: 'Is it an animal?',
    q2: 'Is it bigger than a breadbox?',
    q3: 'Does it live indoors?',
    q4: 'Could it be a pet?',
    q5: 'Is it a cat?',
    'a.yes': 'YES',
    'a.no': 'NO',
    'a.partly': 'PARTLY',
    'a.possible': 'POSSIBLE',
    'a.win': 'CORRECT!',
    features: 'FEATURES',
    f1Title: 'DAILY CHALLENGE',
    f1Desc: 'One fresh mystery every day. Free for everyone.',
    f2Title: 'CHALLENGE PACKS',
    f2Desc: 'Themed sets of puzzles, each with stickers to collect.',
    f3Title: 'BATTLES',
    f3Desc: 'Head-to-head guessing duels against players worldwide.',
    f4Title: 'ACHIEVEMENTS',
    f4Desc: 'Unlock secret badges and grow your collection.',
    ctaTitle: 'READY PLAYER ONE?',
    ctaSub: 'Insert coin. No download required.',
    start: 'START »',
    footer: '© WHATDIS?! - PRESS START TO BEGIN',
  },
  es: {
    tag: '20 PREGUNTAS CON IA',
    sub: 'Cada desafio esconde un tema secreto. Haz preguntas de si o no. Descifralo. Colecciona pegatinas. Reta a tus amigos.',
    playFree: 'JUGAR GRATIS',
    howItWorks: 'COMO FUNCIONA',
    liveDemo: '// DEMO EN VIVO',
    q1: 'Es un animal?',
    q2: 'Es mas grande que una panera?',
    q3: 'Vive en interiores?',
    q4: 'Podria ser una mascota?',
    q5: 'Es un gato?',
    'a.yes': 'SI',
    'a.no': 'NO',
    'a.partly': 'EN PARTE',
    'a.possible': 'POSIBLE',
    'a.win': 'CORRECTO!',
    features: 'CARACTERISTICAS',
    f1Title: 'DESAFIO DIARIO',
    f1Desc: 'Un misterio nuevo cada dia. Gratis para todos.',
    f2Title: 'PACKS DE DESAFIOS',
    f2Desc: 'Sets tematicos de puzzles, cada uno con pegatinas que coleccionar.',
    f3Title: 'BATALLAS',
    f3Desc: 'Duelos de adivinanzas mano a mano contra jugadores de todo el mundo.',
    f4Title: 'LOGROS',
    f4Desc: 'Desbloquea insignias secretas y haz crecer tu coleccion.',
    ctaTitle: 'LISTO, JUGADOR?',
    ctaSub: 'Inserta moneda. No requiere descarga.',
    start: 'EMPEZAR »',
    footer: '© WHATDIS?! - PULSA START PARA EMPEZAR',
  },
  fr: {
    tag: '20 QUESTIONS AVEC IA',
    sub: 'Chaque defi cache un sujet secret. Pose des questions oui/non. Trouve la reponse. Collectionne les stickers. Defie tes amis.',
    playFree: 'JOUER GRATUIT',
    howItWorks: 'COMMENT JOUER',
    liveDemo: '// DEMO EN DIRECT',
    q1: 'Est-ce un animal ?',
    q2: 'Est-ce plus grand qu une boite a pain ?',
    q3: 'Vit-il a l interieur ?',
    q4: 'Pourrait-ce etre un animal de compagnie ?',
    q5: 'Est-ce un chat ?',
    'a.yes': 'OUI',
    'a.no': 'NON',
    'a.partly': 'EN PARTIE',
    'a.possible': 'POSSIBLE',
    'a.win': 'CORRECT !',
    features: 'FONCTIONNALITES',
    f1Title: 'DEFI QUOTIDIEN',
    f1Desc: 'Un nouveau mystere chaque jour. Gratuit pour tous.',
    f2Title: 'PACKS DE DEFIS',
    f2Desc: 'Sets de puzzles a theme, chacun avec ses stickers a collectionner.',
    f3Title: 'BATAILLES',
    f3Desc: 'Duels de devinettes en tete-a-tete contre des joueurs du monde entier.',
    f4Title: 'SUCCES',
    f4Desc: 'Debloque des badges secrets et agrandis ta collection.',
    ctaTitle: 'PRET, JOUEUR ?',
    ctaSub: 'Insere une piece. Aucun telechargement requis.',
    start: 'DEMARRER »',
    footer: '© WHATDIS?! - APPUIE SUR START POUR COMMENCER',
  },
  de: {
    tag: '20 FRAGEN MIT KI',
    sub: 'Jede Challenge verbirgt ein geheimes Thema. Stelle Ja/Nein-Fragen. Knack die Antwort. Sammle Sticker. Duelliere deine Freunde.',
    playFree: 'GRATIS SPIELEN',
    howItWorks: 'SO GEHTS',
    liveDemo: '// LIVE-DEMO',
    q1: 'Ist es ein Tier?',
    q2: 'Ist es groesser als ein Brotkasten?',
    q3: 'Lebt es drinnen?',
    q4: 'Koennte es ein Haustier sein?',
    q5: 'Ist es eine Katze?',
    'a.yes': 'JA',
    'a.no': 'NEIN',
    'a.partly': 'TEILWEISE',
    'a.possible': 'MOEGLICH',
    'a.win': 'RICHTIG!',
    features: 'FEATURES',
    f1Title: 'TAEGLICHE CHALLENGE',
    f1Desc: 'Jeden Tag ein neues Raetsel. Fuer alle gratis.',
    f2Title: 'CHALLENGE-PACKS',
    f2Desc: 'Themen-Sets voller Raetsel, jedes mit eigenen Stickern zum Sammeln.',
    f3Title: 'DUELLE',
    f3Desc: 'Rate-Duelle Kopf-an-Kopf gegen Spieler weltweit.',
    f4Title: 'ERFOLGE',
    f4Desc: 'Schalte geheime Abzeichen frei und erweitere deine Sammlung.',
    ctaTitle: 'BEREIT, SPIELER?',
    ctaSub: 'Muenze einwerfen. Kein Download noetig.',
    start: 'START »',
    footer: '© WHATDIS?! - DRUECKE START ZUM BEGINNEN',
  },
  nl: {
    tag: '20 VRAGEN MET AI',
    sub: 'Elke uitdaging verbergt een geheim onderwerp. Stel ja/nee-vragen. Kraak het antwoord. Verzamel stickers. Battle je vrienden.',
    playFree: 'GRATIS SPELEN',
    howItWorks: 'HOE HET WERKT',
    liveDemo: '// LIVE DEMO',
    q1: 'Is het een dier?',
    q2: 'Is het groter dan een broodtrommel?',
    q3: 'Leeft het binnen?',
    q4: 'Zou het een huisdier kunnen zijn?',
    q5: 'Is het een kat?',
    'a.yes': 'JA',
    'a.no': 'NEE',
    'a.partly': 'DEELS',
    'a.possible': 'MOGELIJK',
    'a.win': 'CORRECT!',
    features: 'FUNCTIES',
    f1Title: 'DAGELIJKSE UITDAGING',
    f1Desc: 'Elke dag een nieuw mysterie. Gratis voor iedereen.',
    f2Title: 'UITDAGINGSPAKKETTEN',
    f2Desc: 'Themasets met puzzels, elk met eigen stickers om te verzamelen.',
    f3Title: 'BATTLES',
    f3Desc: 'Een-tegen-een raadduels tegen spelers van over de hele wereld.',
    f4Title: 'PRESTATIES',
    f4Desc: 'Ontgrendel geheime badges en laat je verzameling groeien.',
    ctaTitle: 'KLAAR, SPELER?',
    ctaSub: 'Werp een muntje in. Geen download nodig.',
    start: 'START »',
    footer: '© WHATDIS?! - DRUK OP START OM TE BEGINNEN',
  },
  pt: {
    tag: '20 PERGUNTAS COM IA',
    sub: 'Cada desafio esconde um tema secreto. Faca perguntas de sim ou nao. Descubra a resposta. Colecione adesivos. Desafie seus amigos.',
    playFree: 'JOGAR GRATIS',
    howItWorks: 'COMO FUNCIONA',
    liveDemo: '// DEMO AO VIVO',
    q1: 'E um animal?',
    q2: 'E maior que uma caixa de pao?',
    q3: 'Vive dentro de casa?',
    q4: 'Poderia ser um animal de estimacao?',
    q5: 'E um gato?',
    'a.yes': 'SIM',
    'a.no': 'NAO',
    'a.partly': 'EM PARTE',
    'a.possible': 'POSSIVEL',
    'a.win': 'CORRETO!',
    features: 'RECURSOS',
    f1Title: 'DESAFIO DIARIO',
    f1Desc: 'Um misterio novo todo dia. Gratis para todos.',
    f2Title: 'PACOTES DE DESAFIOS',
    f2Desc: 'Conjuntos tematicos de puzzles, cada um com adesivos para colecionar.',
    f3Title: 'BATALHAS',
    f3Desc: 'Duelos de adivinhacao cara a cara contra jogadores do mundo todo.',
    f4Title: 'CONQUISTAS',
    f4Desc: 'Desbloqueie emblemas secretos e amplie sua colecao.',
    ctaTitle: 'PRONTO, JOGADOR?',
    ctaSub: 'Insira a ficha. Sem download.',
    start: 'COMECAR »',
    footer: '© WHATDIS?! - PRESSIONE START PARA COMECAR',
  },
};

const escapeHtml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;');

const pageUrl = (lang) => `${baseUrl}/${lang}/`;

const alternateLinks = [
  ...languages.map((lang) => `  <link rel="alternate" hreflang="${lang}" href="${pageUrl(lang)}" />`),
  `  <link rel="alternate" hreflang="x-default" href="${baseUrl}/" />`,
].join('\n');

const languageNav = (activeLang) => languages
  .map((lang) => `    <a href="/${lang}/" lang="${lang}" hreflang="${lang}"${lang === activeLang ? ' class="active"' : ''}>${lang.toUpperCase()}</a>`)
  .join('\n');

function upsertMeta(html, selector, tag) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`  <meta ${escaped}[^>]*>\\n?`);
  return pattern.test(html)
    ? html.replace(pattern, `${tag}\n`)
    : html.replace('  <link rel="icon"', `${tag}\n  <link rel="icon"`);
}

function setTextByI18n(html, key, value) {
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`(<[^>]+data-i18n="${escapedKey}"[^>]*>)([\\s\\S]*?)(</[^>]+>)`, 'g');
  return html.replace(pattern, `$1${escapeHtml(value)}$3`);
}

function renderJsonLd(lang, canonical) {
  return `  <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "WHATDIS?!",
      "url": "${canonical}",
      "inLanguage": "${lang}",
      "applicationCategory": "GameApplication",
      "operatingSystem": "Web",
      "description": "${escapeHtml(meta[lang].description)}",
      "genre": ["Puzzle", "Trivia", "Word game"],
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      }
    }
  </script>`;
}

function renderPage(baseHtml, lang, canonical) {
  let html = baseHtml;
  const pageMeta = meta[lang];

  html = html.replace(/<html lang="[^"]*">/, `<html lang="${lang}">`);
  html = html.replace(/  <title>[\s\S]*?<\/title>/, `  <title>${escapeHtml(pageMeta.title)}</title>`);
  html = html.replace(/  <link rel="canonical" href="[^"]*" \/>/, `  <link rel="canonical" href="${canonical}" />`);
  html = html.replace(/<link rel="icon" type="image\/svg\+xml" href="[^"]*" \/>/, '<link rel="icon" type="image/svg+xml" href="/favicon.svg" />');
  html = html.replace(/(?:  <link rel="alternate" hreflang="[^"]+" href="[^"]+" \/>\n?)+/g, '');
  html = html.replace('  <link rel="icon"', `${alternateLinks}\n  <link rel="icon"`);

  html = upsertMeta(html, 'name="description"', `  <meta name="description" content="${escapeHtml(pageMeta.description)}" />`);
  html = upsertMeta(html, 'property="og:title"', `  <meta property="og:title" content="${escapeHtml(pageMeta.title)}" />`);
  html = upsertMeta(html, 'property="og:description"', `  <meta property="og:description" content="${escapeHtml(pageMeta.ogDescription)}" />`);
  html = upsertMeta(html, 'property="og:url"', `  <meta property="og:url" content="${canonical}" />`);
  html = upsertMeta(html, 'name="twitter:title"', `  <meta name="twitter:title" content="${escapeHtml(pageMeta.title)}" />`);
  html = upsertMeta(html, 'name="twitter:description"', `  <meta name="twitter:description" content="${escapeHtml(pageMeta.ogDescription)}" />`);
  html = html.replace(/  <script type="application\/ld\+json">[\s\S]*?<\/script>/, renderJsonLd(lang, canonical));

  html = html.replace(/<nav class="langs" id="langs"[^>]*>[\s\S]*?<\/nav>/, `<nav class="langs" id="langs" aria-label="Language">\n${languageNav(lang)}\n  </nav>`);
  html = html.replace(/<span class="visually-hidden">[\s\S]*?<\/span>/, `<span class="visually-hidden">${escapeHtml(pageMeta.h1)}</span>`);

  for (const [key, value] of Object.entries(translations[lang])) {
    html = setTextByI18n(html, key, value);
  }

  html = html.replace(/\n  <script>\n    const I18N = \{[\s\S]*?applyLang\(saved \|\| \(I18N\[browser\] \? browser : 'en'\)\);\n  <\/script>\n?/, '\n');
  html = html.replace(/\n{3,}/g, '\n\n');

  return html;
}

function writePage(relativeDir, html) {
  const outputDir = path.join(__dirname, relativeDir);
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(path.join(outputDir, 'index.html'), html);
}

function renderSitemap() {
  const alternateXml = [
    ...languages.map((lang) => `    <xhtml:link rel="alternate" hreflang="${lang}" href="${pageUrl(lang)}" />`),
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}/" />`,
  ].join('\n');

  const urls = [
    `${baseUrl}/`,
    ...languages.map(pageUrl),
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.map((url) => `  <url>
    <loc>${url}</loc>
${alternateXml}
  </url>`).join('\n')}
</urlset>
`;
}

function renderRobots() {
  return `User-agent: *
Allow: /

Sitemap: ${baseUrl}/sitemap.xml
`;
}

const baseHtml = fs.readFileSync(sourcePath, 'utf8');
const rootHtml = renderPage(baseHtml, 'en', `${baseUrl}/`);
fs.writeFileSync(sourcePath, rootHtml);

for (const lang of languages) {
  writePage(lang, renderPage(rootHtml, lang, pageUrl(lang)));
}

fs.writeFileSync(path.join(__dirname, 'sitemap.xml'), renderSitemap());
fs.writeFileSync(path.join(__dirname, 'robots.txt'), renderRobots());

console.log(`Generated ${languages.length + 1} localized pages in ${path.relative(process.cwd(), __dirname) || '.'}`);

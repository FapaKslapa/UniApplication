<div align="center">

# 📅 UniOrario — Insubria

**L'orario di tutto l'Ateneo Insubria in un'unica app.**
Visualizza le lezioni, ricevi notifiche sui cambi orario e gestisci il tuo tempo in modo smart — per studenti e docenti.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![tRPC](https://img.shields.io/badge/tRPC-11-blue)](https://trpc.io)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle-ORM-green)](https://orm.drizzle.team)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

</div>

---

## 🗂 Indice

- [Cos'è UniOrario](#cosè-uniorario)
- [Funzionalità principali](#funzionalità-principali)
- [Architettura](#architettura)
- [Setup locale](#setup-locale)
- [Variabili d'ambiente](#variabili-dambiente)
- [Comandi utili](#comandi-utili)
- [Deploy (Docker)](#deploy-docker)
- [Contribuire](#contribuire)

---

## Cos'è UniOrario

UniOrario è una **Progressive Web App (PWA)** open source che aggrega e presenta gli orari delle lezioni dell'**Università degli Studi dell'Insubria** (sedi di Varese e Como). I dati vengono recuperati in tempo reale dalle API pubbliche di **Cineca/ESSE3** e presentati in un'interfaccia moderna, ottimizzata per mobile.

Il progetto nasce da un'esigenza concreta degli studenti: un portale semplice, veloce e sempre aggiornato — senza bisogno di navigare nei sistemi istituzionali.

---

## Funzionalità principali

| Feature | Descrizione |
|---|---|
| 📆 **Vista settimanale** | Scorri i giorni con swipe laterali, vedi tutti gli slot orari della settimana |
| 🗓 **Vista mensile** | Panoramica del mese con evidenziazione dei giorni con lezioni |
| ⚡ **Lezione in corso** | Card sempre visibile con la lezione attiva, l'aula e il docente |
| 🔍 **Vista docente** | I professori possono cercare il proprio nome e vedere il loro orario aggregato su tutti i corsi |
| ➕ **Aggiunta corsi** | Gli studenti possono aggiungere corsi non ancora presenti: vengono revisionati dall'admin e resi disponibili a tutti |
| 🔔 **Notifiche push** | Avvisi automatici su smartphone quando l'orario di un corso cambia (lezione spostata, aula modificata, annullamento) |
| 🎨 **Dark / Light mode** | Tema adattivo con toggle manuale |
| 👤 **Ruolo studente / docente** | Onboarding guidato con scelta del ruolo per personalizzare la UI |
| 🛡 **Pannello admin** | Gestione corsi, analytics utenti e richieste API (accesso protetto da token) |

---

## Architettura

```
UniOrario/
├── app/                    # Next.js App Router
│   ├── page.tsx            # Home: vista principale con orario
│   ├── admin/page.tsx      # Pannello amministrativo
│   └── api/
│       ├── trpc/           # Handler tRPC
│       └── public/orario/  # Endpoint REST pubblici (orario + prossima lezione)
│
├── components/             # Componenti React (UI)
│   ├── DayView             # Vista giornaliera dettagliata
│   ├── MonthlyView         # Vista mensile
│   ├── CalendarView        # Wrapper calendario settimanale
│   ├── NextLessonCard      # Card lezione in corso / prossima
│   ├── WelcomeDialog       # Onboarding a slide
│   ├── SettingsDialog      # Impostazioni corsi, materie, notifiche
│   └── PushNotificationManager
│
├── server/
│   ├── api/
│   │   ├── trpc.ts         # Contesto tRPC, middleware analytics
│   │   ├── root.ts         # Router principale
│   │   └── routers/
│   │       ├── orario.ts   # Fetch + parsing orario da Cineca
│   │       ├── courses.ts  # CRUD corsi (DB)
│   │       ├── notifications.ts  # Gestione subscriptions push
│   │       ├── analytics.ts      # Statistiche utenti e API
│   │       └── admin.ts    # Login admin
│   └── jobs/
│       └── check-updates.ts  # Cron job: diff orario → notifiche push
│
├── lib/
│   ├── db/schema.ts        # Schema DB MySQL con Drizzle ORM
│   ├── courses.ts          # Logica CRUD corsi
│   ├── notifications.ts    # WebPush (VAPID)
│   ├── orario-utils.ts     # Parsing, colori materie, utility
│   └── date-utils.ts       # Gestione timezone Italia (Luxon)
│
└── public/
    └── sw.js               # Service Worker per notifiche push
```

### Stack tecnologico

- **Frontend**: Next.js 16 (App Router) + React 19 + Tailwind CSS v4
- **Backend**: tRPC v11 su Next.js API Routes
- **Database**: MySQL + Drizzle ORM
- **Animazioni**: Framer Motion
- **Notifiche push**: Web Push API + VAPID (libreria `web-push`)
- **Sorgente dati orari**: API pubblica Cineca/ESSE3 (`unins.prod.up.cineca.it`)
- **Containerizzazione**: Docker + Docker Compose
- **Package manager**: pnpm

### Flusso dati orario

```
Client → tRPC (orario.getOrario) → Cineca API → processEvents() → Client
                                                      ↓
                                         Filtro sede (Varese / Como / Tutte)
                                         Filtro docente
                                         Deduplicazione
```

### Cron job notifiche

Il job `check-updates.ts` viene eseguito ogni **20 minuti** (o manualmente via CLI). Per ogni corso con almeno un subscriber:
1. Recupera l'orario mensile corrente
2. Calcola un hash SHA-256 del dataset
3. Confronta con lo snapshot salvato in DB
4. Se ci sono cambi, individua le materie modificate e invia una push notification agli utenti iscritti (rispettando i loro filtri per materia)

---

## Setup locale

### Prerequisiti

- Node.js ≥ 20
- pnpm (`npm install -g pnpm`)
- MySQL (locale o via Docker)

### 1. Clona il repository

```bash
git clone https://github.com/tuo-utente/UniApplication.git
cd UniApplication
pnpm install
```

### 2. Configura le variabili d'ambiente

```bash
cp .env.example .env.local
```

Modifica `.env.local` (vedi sezione [Variabili d'ambiente](#variabili-dambiente)).

### 3. Crea e migra il database

```bash
pnpm db:push
```

### 4. Avvia il server di sviluppo

```bash
pnpm dev
```

Apri [http://localhost:3000](http://localhost:3000).

---

## Variabili d'ambiente

| Variabile | Obbligatoria | Descrizione |
|---|---|---|
| `DATABASE_URL` | ✅ | Connection string MySQL (`mysql://user:pass@host:3306/db`) |
| `ADMIN_PASSWORD` | ✅ | Password per accedere al pannello admin |
| `ADMIN_TOKEN` | ✅ | Token segreto usato dal cron job per le chiamate admin |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | ✅ (per notifiche) | Chiave pubblica VAPID per Web Push |
| `VAPID_PRIVATE_KEY` | ✅ (per notifiche) | Chiave privata VAPID |

Per generare le chiavi VAPID:

```bash
npx web-push generate-vapid-keys
```

---

## Comandi utili

```bash
pnpm dev              # Avvia in sviluppo (Turbopack)
pnpm build            # Build di produzione
pnpm start            # Avvia il server di produzione

pnpm db:push          # Applica lo schema al DB
pnpm db:generate      # Genera le migration Drizzle
pnpm db:studio        # Apre Drizzle Studio (GUI DB)

pnpm lint             # Lint con Biome
pnpm format           # Formatta il codice con Biome

# Cron job notifiche (esecuzione singola)
npx tsx server/jobs/check-updates.ts

# Cron job notifiche (modalità daemon, ogni 20 minuti)
npx tsx server/jobs/check-updates.ts --cron
```

---

## Deploy (Docker)

```bash
docker compose up -d
```

Il `docker-compose.yml` avvia sia il server Next.js che il database MySQL. Per la configurazione completa consulta il file [`Dockerfile`](Dockerfile) e [`docker-compose.yml`](docker-compose.yml).

---

## Contribuire

UniOrario è un progetto **open source e community-driven**. Contributi di ogni tipo sono benvenuti!

### Aggiungere un corso

Se il tuo corso non è presente nell'app, puoi aggiungerlo direttamente dalla sezione **Impostazioni** nell'app. La richiesta verrà revisionata dall'admin e resa disponibile a tutti gli studenti.

### Contribuire al codice

1. **Fork** del repository
2. Crea un branch descrittivo: `git checkout -b feature/nome-feature`
3. Apporta le modifiche e committa: `git commit -m "feat: descrizione"`
4. Apri una **Pull Request** verso `main`

Per segnalare bug o proporre nuove funzionalità, apri una [Issue](../../issues).

---

<div align="center">
  Sviluppato da: Stefanomarocco0@gmail.com · <a href="LICENSE">MIT License</a>
</div>

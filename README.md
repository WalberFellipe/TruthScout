# Truth Scout

> A neural network that calls out which footballers overperformed their own FIFA card in the UCL 21/22 — and which ones were inflated all along.

Truth Scout takes every player's **FIFA 22 attributes** and asks a simple question: *given these stats, how many Champions League goals should this guy have scored?* Then it compares that prediction against **what actually happened on the pitch**. The gap is the story.

| Player | FIFA 22 OVR | Expected goals | Real goals | Δ |
|---|---|---|---|---|
| Karim Benzema | 89 | 9.2 | **15** | **+5.8** |
| Sébastien Haller | 80 | 5.8 | **11** | **+5.2** |
| Christopher Nkunku (MID) | 81 | 0.6 | **7** | **+6.4** |
| Lautaro Martínez | 84 | 2.9 | 1 | −1.9 |
| Bruno Fernandes | 87 | 1.6 | 0 | −1.6 |

The whole thing is a **single-page React app backed by an Express API**, with a **TensorFlow.js regression model** learning the FIFA-to-UCL mapping from real data.

---

## Why this project exists

This is a learning project focused on doing **real machine learning in JavaScript end-to-end** — no Python hand-off, no pre-trained black box. The goal was to prove that TensorFlow.js can handle a complete data pipeline: ingestion, feature engineering, training, evaluation, and inference — all in Node, all transparent, all shipped to a real frontend users can click through.

Football analytics was the domain because:
- **The datasets exist in public form** (FIFA 22 via sofifa on Kaggle, UCL 21/22 match data also on Kaggle)
- **The problem is inherently regression** — goals are a continuous target, clean supervised signal
- **The output is a story** — "this player overperformed their rating by 10.6 goals" is a concrete, shareable insight, not just a number on a dashboard

---

## The ML core

### Problem framing

Given a player's FIFA 22 attribute vector $x \in \mathbb{R}^{33}$, predict their **goals-per-match rate** in the UCL 21/22: $\hat{y} = f(x)$.

We deliberately target the **rate**, not the **total**. A player with 5 goals in 3 matches isn't comparable to one with 5 goals in 13. The rate normalizes for exposure; we multiply by each player's actual match count to reconstruct a tournament-level expected goal count for the UI.

```
expected_goals = f(FIFA_stats) * matches_played
delta          = real_goals − expected_goals
```

### Why TensorFlow.js

Because the entire stack is JavaScript. The same package that trains the model in Node during the pipeline can run inference in the browser later (a natural v2 extension). No Python microservices, no serialization dance between languages, no FastAPI/Flask glue. The model lives in the same monorepo as the UI that renders its predictions.

TF.js in Node (via the pure-JS `@tensorflow/tfjs` package, not the native `tfjs-node` which requires Visual Studio build tools on Windows) trains a ~1.6k parameter model on 173 examples in under 5 seconds. Not a performance bottleneck for this scale.

### Feature engineering

33 raw attributes pulled from each FIFA 22 player:

- **Composite ratings:** `overall`, `pace`, `shooting`, `passing`, `dribbling`, `defending`, `physic`
- **Attacking detail:** `attacking_finishing`, `attacking_heading_accuracy`, `attacking_volleys`, `attacking_short_passing`, `attacking_crossing`
- **Skill detail:** `skill_dribbling`, `skill_curve`, `skill_fk_accuracy`, `skill_long_passing`, `skill_ball_control`
- **Movement:** `movement_acceleration`, `movement_sprint_speed`, `movement_agility`, `movement_reactions`, `movement_balance`
- **Power:** `power_shot_power`, `power_stamina`, `power_strength`, `power_long_shots`, `power_jumping`
- **Mentality:** `mentality_positioning`, `mentality_penalties`, `mentality_composure`, `mentality_vision`, `mentality_aggression`
- **Biographical:** `age`, `potential`

Each feature is **z-score normalized** against the training-set mean and standard deviation. The normalization constants are computed once and applied identically at inference time to avoid the classic data-leakage trap.

### Model architecture

A shallow MLP — the whole point of a small model on a small dataset:

```
Input (33) → Dense(32, ReLU) → Dropout(0.2)
           → Dense(16, ReLU) → Dropout(0.2)
           → Dense(1, linear)

Total params: 1,633
```

- **Loss:** Mean Squared Error (goals-per-match is continuous)
- **Optimizer:** Adam with learning rate 0.003
- **Regularization:** L2 (λ=0.01) on dense kernels + dropout 0.2 between layers
- **Epochs:** 200 with deterministic shuffle
- **Batch size:** 32
- **Split:** 80/20 train/validation

The regularization is aggressive on purpose — 173 training samples is small, and without L2 + dropout the model memorizes the training set within 30 epochs.

See [`scripts/04-train-model.js`](scripts/04-train-model.js) for the whole thing, heavily commented.

### The position-filter trick

**The most important design decision in the ML pipeline.** The first training run included all 562 matched players — defenders, goalkeepers, everyone. The predictions came out compressed and useless: Benzema was expected to score 4 goals, Haller 0.9, top-of-the-range was Lewandowski at 4.6.

Why? The MSE loss drags predictions toward the **mean** of similar examples. When 80% of your training set is defenders and mids who scored 0–2 goals, even strikers with elite attributes get predicted low. The model hadn't learned goal-scoring — it had learned "most footballers don't score much".

Fix: **filter the training cohort to offensive positions only.** FWD roles (ST, CF, LW, RW, LF, RF) + attacking and wide midfielders (CAM, LAM, RAM, LM, RM). Dataset drops from 562 to 216 players, but now the model is learning the distribution of *people who are actually paid to score*. Benzema's expected jumps from 4.4 to 9.2. Haller's from 0.9 to 5.8. The numbers become **believable and the delta stories become honest**.

This is the kind of insight that doesn't come from tuning hyperparameters — it comes from looking at the actual distribution of your target and asking what the model is even trying to learn.

### Metrics

| | |
|---|---|
| Final train MAE | 0.13 goals/match |
| Final **validation** MAE | **0.18 goals/match** |
| Dataset size | 216 players (173 train / 43 val) |
| Features | 33 |
| Training time | ~4 seconds in Node |

MAE of 0.18 goals/match translates to roughly **1 goal of error over a 6-match group stage**. Not production-grade, but enough resolution to surface the genuine outliers — Benzema +5.8, Haller +5.2, Nkunku +6.4 are all multiple MAEs above the noise floor.

---

## Pipeline architecture

Five scripts, runnable end-to-end with `npm run pipeline`:

```
datas/FIFA 22/*.xlsx           datas/UCL-21-22/*.csv
        │                              │
        ▼                              ▼
┌─────────────────┐            ┌─────────────────┐
│ 01-ingest-fifa  │            │ 02-ingest-ucl   │
│ 19,239 players  │            │ 750 players,    │
│ → fifa22_players│            │ 8 CSVs merged   │
└────────┬────────┘            └────────┬────────┘
         │                              │
         └──────────────┬───────────────┘
                        ▼
            ┌─────────────────────────┐
            │ 03-match-players        │
            │ Fuzzy matching:         │
            │ club tokens + last name │
            │ + Levenshtein similarity│
            │ → 662/750 = 88% match   │
            └───────────┬─────────────┘
                        ▼
            ┌─────────────────────────┐
            │ 04-train-model          │
            │ Filter → offensive only │
            │ Train MLP on 33 feats   │
            │ Predict goals/match     │
            │ → predictions table     │
            └───────────┬─────────────┘
                        ▼
            ┌─────────────────────────┐
            │  SQLite: predictions    │
            │  216 rows with deltas   │
            └───────────┬─────────────┘
                        ▼
            ┌─────────────────────────┐
            │ Express API + React UI  │
            │ /api/players/over       │
            │ /api/players/under      │
            │ /api/players/stats      │
            └─────────────────────────┘
```

### Name matching

The UCL dataset calls him "Benzema". The FIFA dataset calls him "Karim Benzema" (long) or "K. Benzema" (short). Their clubs disagree too — "Real Madrid" vs "Real Madrid CF", "Bayern" vs "FC Bayern München", "Dortmund" vs "Borussia Dortmund".

The match script normalizes both sides (strip accents, lowercase, remove punctuation), builds an index of FIFA players keyed by **every meaningful token of their club name** crossed with their **last name**, then looks up each UCL player against that index. For the survivors, it scores them by Levenshtein similarity on the full name and picks the best. Result: **88% auto-match rate**, 0 ambiguous edge cases left unresolved.

The 12% that don't match are mostly mid-season transfers (Luis Díaz went Porto → Liverpool in January 2022 — he shows as Porto in FIFA 22 but Liverpool in UCL stats), clubs missing from the FIFA dataset (Zenit), and transliteration edge cases.

---

## Stack

- **Model & pipeline:** `@tensorflow/tfjs` (pure-JS, runs in any Node without native bindings)
- **Data:** `better-sqlite3`, `xlsx`, `csv-parser`, `fastest-levenshtein`
- **Backend:** Express on port 3001, static routes, no ORM
- **Frontend:** React 18 + Vite 6, no heavy framework, handwritten CSS with design tokens
- **i18n:** 3 languages (PT-BR / EN-US / ES) via a flat translations object
- **Dev UX:** `concurrently` runs Vite + Express in parallel, `nodemon` restarts the API on changes

---

## Getting started

```bash
# Install deps (pure JS, no build tools needed)
npm install

# Run the full pipeline: ingest → match → train → predict
# Takes ~15 seconds total
npm run pipeline

# Dev mode: Vite (5173) + Express (3001) in one terminal
npm run dev:all
```

Open `http://localhost:5173`.

### Running individual steps

```bash
npm run ingest:fifa   # xlsx → SQLite
npm run ingest:ucl    # 8 CSVs → SQLite
npm run match         # fuzzy join
npm run train         # TF.js + predictions
npm run server        # API only (no frontend)
npm run dev           # frontend only (no API)
```

---

## Deploy (Vercel)

Truth Scout runs as a **100% static site** in production. The pipeline pre-computes every prediction offline, dumps them into `public/api/players.json` + `public/api/stats.json`, and the React app fetches those directly — no backend, no database, no cold starts, no ongoing cost.

```
Local                                       Vercel
-----                                       ------
npm run pipeline                            git push
  ↓                                           ↓
  ├─ ingest FIFA + UCL → SQLite             Vercel runs npm run build
  ├─ fuzzy match                              ↓
  ├─ train TF.js MLP                        Serves dist/ as static site
  └─ export:json → public/api/*.json        (including /api/*.json)
  ↓
git commit public/api/*.json
```

### Steps

1. **Run the pipeline locally** — produces the prediction JSONs:
   ```bash
   npm run pipeline
   ```
2. **Commit the generated JSONs** (they're the deployment artifact):
   ```bash
   git add public/api/players.json public/api/stats.json
   git commit -m "regenerate predictions"
   ```
3. **Connect the repo to Vercel** — `https://vercel.com/new`, import the GitHub repo. Vercel auto-detects Vite, runs `npm install && npm run build`, and serves `dist/`. No `vercel.json` needed.
4. **Done.** Every future push redeploys. To update predictions, re-run the pipeline locally and commit the new JSONs.

### Environment detection

The [API client](src/api/client.js) transparently switches between the two worlds:

- **`npm run dev:all`** — hits the live Express API at `localhost:3001` (via Vite proxy). Useful for backend iteration.
- **`npm run build && npm run preview`** — simulates production locally, serves static JSONs from `dist/api/`.
- **Vercel deploy** — identical to preview, just on a real URL.

`import.meta.env.DEV` picks the right path automatically. No build flags to flip.

### Why static over serverless functions

The predictions are **immutable outputs of an offline pipeline**. The Express server never re-trains, never regenerates — it just reads rows and returns JSON. Collapsing that into a pre-baked JSON file removes an entire tier of infrastructure without losing anything. The app is full-stack in **development** (Vite + Express + SQLite + TF.js all coexisting for easy iteration) and a single static bundle in **production**.

---

## Repo layout

```
Truth Scout/
├── src/                       Frontend React (Vite)
│   ├── App.jsx
│   ├── components/            Header, Hero, PlayerCard, DetailModal, etc.
│   ├── hooks/                 usePlayers, useStats, useCountUp
│   ├── utils/                 transformPlayer (API shape mapping)
│   ├── api/                   fetch client
│   ├── i18n/                  3-language translations
│   └── styles/ + theme/
├── server/                    Express API
│   ├── index.js               Entry
│   ├── routes/players.js      /api/players/{over,under,stats,:id}
│   ├── services/              SQL queries
│   └── db/connection.js       better-sqlite3 singleton
├── scripts/                   Pipeline (run once, idempotent)
│   ├── 01-ingest-fifa22.js
│   ├── 02-ingest-ucl.js
│   ├── 03-match-players.js
│   ├── 04-train-model.js
│   └── _lib/normalize.js      Shared name utilities
├── datas/
│   ├── FIFA 22/               sofifa Career Mode xlsx
│   └── UCL-21-22/             8 UEFA match CSVs
├── db/                        SQLite output (gitignored)
└── ml/model/                  Reserved for exported TF.js model (gitignored)
```

---

## Limitations (honest)

- **Small dataset.** 216 offensive players after filters. Predictions for uncommon profiles (e.g., a defender who suddenly plays striker) will be noisy.
- **Imperfect matching.** ~12% of UCL players never matched a FIFA entry due to mid-season transfers, missing clubs, or transliteration. Those players are excluded from predictions entirely.
- **MSE bias.** The loss function systematically underpredicts outliers. Even with the position filter, a 15-goal striker is still partially compressed toward the cohort mean. Using Poisson regression would handle this better statistically; a v2 candidate.
- **No contextual awareness.** Injuries, suspensions, squad rotation, and knockout-round format aren't visible to the model. If a player scored 8 goals in the group stage but was injured before knockouts, the model doesn't know.
- **Point-in-time mismatch risk.** FIFA 22 attributes reflect player ability at dataset publication; UCL 21/22 stats accumulate over the whole season. A player who grew dramatically mid-season (Vinícius Jr.) is attributed the pre-growth FIFA card.

None of these are blockers for the project's purpose — they're the honest caveats of doing applied ML on imperfect public data.

---

## Design & UI

The UI is a single-page dashboard. Every card shows:

- Player photo (sofifa CDN, referrer-policy workaround for hotlink protection)
- Club logo + flag
- Delta chip (tournament total) with color coding — green for over, coral for under
- Dual-representation bars: expected / real in **both totals and per-match rates**
- Click-through to a detailed modal with a 6-attribute radar (player vs position average), goal breakdown by foot/header/area/penalty, and a generated explanation of why the delta is what it is

Three-language support: Portuguese, English, Spanish. Light + dark themes. Zero external UI libraries — every component handwritten to match the project's aesthetic.

---

## Credits

- **FIFA 22 player attributes:** [EA Sports FIFA 22 Career Mode dataset (sofifa)](https://www.kaggle.com/datasets/stefanoleone992/fifa-22-complete-player-dataset) via Kaggle
- **UCL 21/22 match statistics:** UEFA Champions League 2021/22 official match data via Kaggle

**Disclaimer:** This project is for educational and research purposes. Not affiliated with UEFA or EA Sports. All trademarks belong to their respective owners.

---

## License

MIT — do whatever you want with the code. Attribution appreciated but not required.

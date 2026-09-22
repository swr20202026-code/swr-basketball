# Self-editing (CMS) plan — South West Rise Basketball

Goal: let Khalid update the site himself (fixtures, photos, key text) without touching
code, while Simon keeps control of the build.

## The approach: a Git-based CMS on Netlify
The site lives in a Git repo and deploys on Netlify. A Git-based CMS adds an admin screen
at `yourdomain.com/admin` where Khalid logs in and edits content through simple forms.
When he saves, the CMS commits the change to the repo, Netlify redeploys automatically,
and the live site updates a minute or two later. No servers or database to run, and it
stays free.

Two mature options:
- **Decap CMS** — the established, stable choice (formerly Netlify CMS).
- **Sveltia CMS** — a newer, lighter, faster drop-in replacement with a nicer editing UI;
  actively developed (beta but widely used). Moving between the two is roughly a one-line change.

Recommendation: start with Decap for stability; Sveltia is an easy swap later for a slicker editor.

## Logging in (auth)
Khalid needs a way to sign into `/admin`:
- **Netlify Identity + Git Gateway** — simplest for a non-technical editor: email/password
  login, no GitHub account needed. Netlify briefly announced deprecating Identity, then
  confirmed in February 2026 that it is staying as a supported option, so this path is safe again.
- **GitHub login (OAuth)** — Khalid would need a GitHub account with repo access.
- **Auth0 extension** — Netlify's newer managed auth; more than this site needs.

Recommendation: Netlify Identity + Git Gateway, so Khalid just gets an email invite and sets a password.

## What Khalid would be able to edit
- **Fixtures:** add / edit / remove games (date, teams, home or away, competition, time).
- **Photos:** upload or replace scrimmage and team photos.
- **Text:** the about / club blurbs, contact email, social links.
Bookings stay in SimplyBook.me (managed there), so the site's booking panel is the embedded
widget and does not need CMS editing.

## How the content reaches the page — two ways
The CMS saves content as small files (JSON / Markdown). The site needs to read them.

**Option A — no build step (simplest to stand up)**
The page loads the content files (e.g. `fixtures.json`) with a little JavaScript and renders
them in the browser. Keeps the current static site almost unchanged; nothing to compile.
Trade-off: those bits aren't in the initial HTML source (marginal SEO impact for fixtures).

**Option B — tiny build with Eleventy (more robust)**
A lightweight static-site generator turns the content files into finished HTML at deploy time.
Fixtures then live in the page source (better SEO and reliability). Adds a build step, but
Netlify runs it automatically — Khalid never sees it; Simon sets it up once.

Recommendation: Option A to get self-editing live quickly with minimal change; move to
Option B if you want fixtures in the HTML for SEO. Khalid's experience is identical either way.

## Rough setup effort (one-off, for Simon)
1. Put the repo on GitHub and connect it to Netlify (deploys on push).
2. Add an `/admin` folder with the CMS and a config file describing the fields (fixtures, photos, text).
3. Turn on Netlify Identity + Git Gateway and invite Khalid by email.
4. Wire the chosen rendering (Option A: a small JS loader; Option B: Eleventy templates).

Around half a day for someone comfortable with Netlify and Git. After that, Khalid self-serves.

## Cost
Free on Netlify's starter tier; the CMS is open-source. Ongoing costs are just the domain
(already sorted) and the SimplyBook / SumUp fees on bookings.

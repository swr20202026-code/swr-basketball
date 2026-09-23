# South West Rise Basketball — website

Static site covering **South West Rise** (the club) and **South West Runs** (the scrimmage).
One page, two sections, ready to deploy to Netlify.

## Structure
```
swr-basketball/
├── index.html                 # the page
├── css/styles.css             # all styling
├── js/main.js                 # small nav-menu script
├── images/                    # logos + photos (webp)
│   ├── logo-rise.webp             # Rise logo, black background (used site-wide)
│   ├── logo-rise-transparent.webp # transparent version, spare
│   ├── logo-runs.webp             # South West Runs badge
│   └── scrimmage-1..3.webp        # session photos
├── favicon.png
├── netlify.toml               # Netlify config (static, no build step)
├── README.md
└── CMS-PLAN.md                # how to let Khalid self-edit
```

## Deploy to Netlify
Two ways:
- **Drag-and-drop:** Netlify → Add new site → Deploy manually → drag this folder in. Live in seconds with free HTTPS.
- **Git-connected (recommended):** push this folder to a GitHub repo, then Netlify → Add new site → Import from Git. Every push then auto-deploys. This is also what the CMS needs.

## Custom domain (swrbasketball.com)
Netlify → Domain settings → Add a custom domain → enter `swrbasketball.com`, then point the domain's DNS at Netlify (either move DNS to Netlify, or add the A / CNAME records Netlify shows you) at the current registrar. Netlify issues the HTTPS certificate automatically. You'll need the registrar login, or Khalid to add the records.

## Editing before the CMS is added
- **Photos:** replace files in `images/` (keep the same names), or add new ones and update the `src` in `index.html`.
- **Text / fixtures:** edit `index.html` directly.
- **Booking:** the Runs "Book your spot" panel is a placeholder — swap it for the SimplyBook.me embed code once the booking account is live.

## Letting Khalid edit it himself
See `CMS-PLAN.md`.

## Notes
- Self-contained except Google Fonts.
- Placeholder content (to replace with real details): fixtures, price, venue, and the club (new-kit) team photos. Email and Instagram are the real club ones.

# Setting up Decap CMS (so Khalid can self-edit)

The site is already wired for Decap CMS:
- `admin/index.html` + `admin/config.yml` — the CMS itself.
- `content/fixtures.json`, `content/gallery.json`, `content/settings.json` — the editable content.
- The homepage reads those files at load and renders them, so anything edited in the CMS shows on the site after the next deploy.

You just need to host it and switch on the login.

## 1. Put the site on GitHub
Create a new repository at github.com (e.g. `swr-basketball`), default branch `main`, then push this folder. From a terminal in the unzipped folder:
```
git init
git add .
git commit -m "SWR Basketball site + Decap CMS"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/swr-basketball.git
git push -u origin main
```
(Or use GitHub's "Add file -> Upload files" in the browser and drag everything in.)

## 2. Connect it to Netlify
- Netlify -> Add new site -> Import an existing project -> GitHub -> pick the repo.
- Build command: leave empty. Publish directory: `.` (the root). Deploy.
- Check the temporary `something.netlify.app` address loads.

## 3. Turn on the login (Netlify Identity)
- In the site's settings, find Identity and Enable Identity.
- Set Registration to **Invite only**.
- Under Identity -> Services, click **Enable Git Gateway**.

## 4. Invite editors
- Identity -> Invite users -> add your own email first (to test), then Khalid's.
- Each person gets an email, clicks the link, lands on the site, sets a password, and is sent to `/admin`.

## 5. Use it
- Go to `your-site/admin/` and log in.
- Edit **Fixtures**, **Scrimmage photos** or **Contact details**, then Publish.
- Saving commits to GitHub, Netlify redeploys, and the change is live in a minute or two.

## Custom domain (when ready)
Netlify -> Domain settings -> add `swrbasketball.com`, then point its DNS at Netlify (registrar login needed). HTTPS is automatic.

## Notes
- `admin/config.yml` assumes the branch is `main`. If your repo uses `master`, change it there.
- Uploaded photos are saved to `images/uploads/`.
- Bookings are handled in SimplyBook.me, not the CMS.
- Netlify flagged Netlify Identity for deprecation and then confirmed (Feb 2026) it is staying supported, so this login route is safe. The alternative is a GitHub login (`backend: github` in `config.yml`), which needs each editor to have a GitHub account.
- The CMS reads/writes files by fetch, so it only works on the hosted site (Netlify), not by opening `index.html` from disk.

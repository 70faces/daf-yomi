# Daf Yomi Hub — Demo

A redesigned hub page for My Jewish Learning's Daf Yomi project. Static HTML/CSS/JS, no build step.

## Deploy to Vercel (first time)

You'll need Node.js installed. If `node --version` works in Terminal, you're set.

1. Open Terminal and `cd` into this folder:
   ```
   cd ~/path/to/daf-yomi-hub
   ```

2. Run:
   ```
   npx vercel
   ```

3. Vercel CLI asks 4 questions:
   - **Set up and deploy?** → `Y`
   - **Which scope?** → pick `joshua-jaffes-projects`
   - **Link to existing project?** → `N`
   - **Project name?** → `daf-yomi-hub` (or whatever you want)
   - **In which directory is your code?** → `./` (just press enter)

4. It deploys. You get a URL like `daf-yomi-hub-xyz.vercel.app`.

## Redeploy after edits

Just run `npx vercel --prod` in this folder. Done in 10 seconds.

## What's dynamic

- Today's daf, day count, and progress bar all compute from the actual date.
- "Get Started" countdown auto-shows when a new tractate is within 30 days.
- Bookshelf state (current / next / done / upcoming) updates daily.
- The page never goes stale.

## What's placeholder

- **Teacher avatars** are initial-letter circles. Real photos go in `script.js` → `TEACHERS` array.
- **Sage avatars** are Hebrew letter circles. Replace if/when illustrated.
- **Teacher names** are best-guess. Rachel B should confirm the real Daily Dose roster.
- **Reference library URLs** point to existing MJL articles where I could find them. Some need confirmation.
- **Adobe Fonts**: currently using Lora + Montserrat as fallbacks. Replace with MJL's Adobe Fonts kit later.

## Enable comments for Rachel/Grace feedback

After first deploy, in Vercel dashboard:
1. Go to project settings → Comments
2. Toggle Comments on
3. Add Rachel and Grace as commenters by email
4. They click anywhere on the live page to leave pinned feedback

## File map

- `index.html` — page structure
- `styles.css` — all styling, MJL palette
- `script.js` — Daf Yomi schedule + dynamic rendering
- `vercel.json` — clean URL config

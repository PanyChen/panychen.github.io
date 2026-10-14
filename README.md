# Pengxu (Vincent) Chen PhD

A five-page CV companion with interactive scenes for problem-solving, repeatable workflows and clear communication.

This repository is ready for GitHub Pages. Publish the default branch from the root folder. The `.nojekyll` file serves the HTML, CSS, JavaScript and assets directly.

## Update the website

- Edit `index.html`, `styles.css` or `app.js`, then commit the changes. GitHub Pages publishes commits to the configured branch automatically.
- Replace `assets/profile.jpg` to update the portrait. Change the `v` value in the image URL in `app.js` to ensure browsers fetch the replacement.
- Replace `assets/cv.pdf` to update the downloadable CV while keeping its link stable.

## Local preview

Run `python3 -m http.server 4173 --bind 127.0.0.1` in this folder and open `http://127.0.0.1:4173`.

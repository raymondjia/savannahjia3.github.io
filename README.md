# Savannah Jia portfolio

Live site: https://savannahjia.com/

## Savannah's first setup

Sign in to GitHub with your own account. You need collaborator write access to
`raymondjia/savannahjia3.github.io`; repository ownership is not required.
Open **Code → Codespaces → Create codespace on main**. Wait for setup to finish.
If you already have a Codespace, pull the latest changes and use **Codespaces:
Rebuild Container** from the command palette to apply this configuration.

## Add artwork

1. In the Codespaces file explorer, open `uploads`, then `paintings`,
   `works-on-paper`, or `sculpture`. Right-click the folder and choose **Upload**.
   JPEG, PNG, WebP and TIFF are supported. Convert HEIC photos to JPEG first.
2. Give each file a unique lowercase name with hyphens, for example
   `morning-light.jpg`. The name without its extension is the artwork's **slug**.
   Do not upload two different formats with the same slug in one folder.
3. Add an entry to the appropriate section in `metadata.yaml`. For example:

   ```yaml
   paintings:
     - slug: morning-light
       title: Morning Light
       year: 2026
       medium: Oil on canvas
       dimensions: 18 × 24 in
   ```

   Append to the existing list; do not repeat its section heading. For the first
   sculpture, replace `sculpture: []` with `sculpture:` and an indented list.
   Use `works_on_paper` (underscores) for the metadata section, even though its
   upload folder is `works-on-paper`. Quote titles containing a colon, such as
   `title: "Study: Morning Light"`. Use `year: null` if the year is unknown.
4. In the terminal run:

   ```sh
   npm run prepare-content
   npm run preview
   ```

   Open the **Portfolio preview** on port 8080 in the Ports panel. Keep the port
   private. Check the artwork, title and details. After another edit, stop the
   preview with Ctrl+C and run these commands again. Nothing is published yet.
5. Open **Source Control**, inspect the changes, stage the files, enter a short
   message such as `Add Morning Light`, choose **Commit**, then **Sync Changes**
   (or **Push**). Pushing to `main` publishes the site. Check the repository's
   **Actions** tab for a successful **Deploy to GitHub Pages** run.

## Edit existing content

For titles, dates, materials or dimensions, edit `metadata.yaml`, then run
`npm run build` and preview. For a replacement photo, upload it with the same
slug into the same medium folder and run `npm run prepare-content`.
To remove artwork, remove its metadata entry; unused image files can be removed
separately. Biography and contact text are in `index.html`.

## Image handling and backups

`npm run images` processes all supported files currently in `uploads/`.
It creates JPEG thumbnails fitting within 600 × 600 pixels and viewing images
fitting within 2400 × 2400 pixels, preserves proportions, applies photo
orientation, never enlarges small images, and puts transparency on white.
Generated images go to `images/<medium>/thumbs/` and `images/<medium>/web/`.
Existing matching outputs are replaced. Originals are not changed.

`uploads/` is ignored by Git and excluded from the published site. Keep a backup
of originals on your own computer or storage; deleting a Codespace deletes its
uncommitted uploads. Remove processed originals from `uploads/` when you no
longer want them regenerated. Generated photos are public after publishing.

## Publishing and access

Deployment installs dependencies, validates metadata and referenced images,
builds `js/data.js`, and publishes only the public files staged in `dist/`.
A validation error stops deployment and leaves the last successful site live.
Do not edit `js/data.js` by hand. No separate bot commit is needed for metadata.

Raymond manages repository access and Pages/domain settings. Savannah manages
content through her own GitHub account. Codespaces usage is subject to the
account's allowance and billing configuration; stop it when finished.

For a local setup with Node.js 22: run `npm ci`, then the same commands above.

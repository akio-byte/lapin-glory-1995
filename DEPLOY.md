# Deploy on Cloudflare Pages

This project is a Vite + React single page app. To deploy on Cloudflare Pages:

1. Connect this GitHub repository in Cloudflare Pages.
2. Set the build options:
   - **Build command:** `npm run build`
   - **Output directory:** `dist`
   - **Node version:** use the default (LTS) runtime.
3. Deploy the project.

## Running locally

```
npm install
npm run dev
npm run build
npm run preview
```

## Custom domains

To use a custom domain such as `game.laplandailab.fi`, create a CNAME in Cloudflare DNS pointing to the Pages project and add the domain in the Pages custom domain settings.

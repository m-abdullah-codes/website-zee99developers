import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  // The brochure is not deployed on its own. It builds into the main Next.js
  // site's public/ folder and is served from a sub-path of zee99developers.com,
  // so that a WhatsApp link is a link to the company's own domain rather than
  // to somewhere a buyer has no reason to trust. `site` + `base` are what make
  // the emitted URLs match where the files actually land — see
  // scripts/build-brochure.mjs in the repo root.
  site: 'https://zee99developers.com',
  base: '/zee99lifestyle-e-brochure',
  build: { inlineStylesheets: 'always' },
  compressHTML: true,
  // 'attribute' (the default) writes data-astro-cid-XXXXXXXX onto ~2,000
  // elements — 47KB of this page. 'class' folds into existing class attributes
  // for the same isolation at roughly a third of the bytes.
  scopedStyleStrategy: 'class',
  devToolbar: { enabled: false },
  vite: {
    build: {
      cssCodeSplit: false,
      assetsInlineLimit: 2048,
    },
  },
});

# Imageworks

A Next.js 16 landing page template for an AI image
generation product built for creative teams. Fictional brand, real
engineering: a Three.js ribbon of renders in the hero, a helix of renders
closing the page, pinned scroll sequences, an animated benchmark chart,
accessible interactive components, Lenis smooth scrolling behind a feature
flag, light and dark themes, and full SEO wiring.

## Features

- **Next.js 16 (App Router) + React 19 + TypeScript strict**
- **Tailwind CSS v4** (CSS-first, `@theme inline`, class-based dark mode)
- **Motion** (`motion/react`) for entrances, the pinned brief and
  variations sequences, the nav, tabs, pricing digit roll, FAQ accordion
  and the benchmark chart, all with reduced-motion branches
- **Two Three.js scenes** built on the same rounded-card shader:
  `image-arc.tsx` streams renders outward along an arc through the hero
  copy, `image-helix.tsx` winds a strand of renders over the closing CTA.
  Both are DPR-capped, pause offscreen and when the tab is hidden, honour
  reduced motion with a still frame, and dispose all GL resources
- **Dot field** (`dot-field.tsx`) behind the hero and CTA copy, sized to
  a stage element, with Gaussian falloff and edge fades
- **Floating nav** that condenses to a mark as the page scrolls, with a
  sliding highlight, in-view section marker and an animated mobile sheet
- **Lenis smooth scroll**, feature-flagged in `lib/config.ts` and
  automatically disabled for reduced motion
- **SEO**: metadata factory, OpenGraph image, JSON-LD (Organization,
  SoftwareApplication, FAQPage), `robots.ts`, `sitemap.ts`, web manifest,
  SVG and PNG icons
- **Accessibility**: skip link, visible focus rings, keyboard-navigable
  tabs and segmented controls, `aria` wiring on the accordion, menu and
  billing toggle

## Requirements

- Node.js 20.9 or later and npm
- Network access during installation and the first build for packages and Google Fonts

## Getting Started

```bash
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). To choose a different port,
run `npm run dev -- --port 3004`.

For production, run `npm run build`, then `npm run start`. The template uses
Next.js image optimization and expects a Node.js host or a compatible Next.js
platform. It is not configured as a static HTML export.

## Scripts

| Command                | Description                  |
| ---------------------- | ---------------------------- |
| `npm run dev`          | Start development server     |
| `npm run build`        | Build for production         |
| `npm run start`        | Start production server      |
| `npm run lint`         | Run ESLint                   |
| `npm run lint:fix`     | Fix ESLint errors            |
| `npm run format`       | Format code with Prettier    |
| `npm run format:check` | Check code formatting        |
| `npm run typecheck`    | Run TypeScript type checking |

## Project Structure

```
├── app/
│   ├── globals.css          # Design tokens & base styles
│   ├── layout.tsx           # Root layout, fonts, providers, theme switch
│   ├── page.tsx             # Landing page assembly
│   ├── robots.ts            # robots.txt
│   ├── sitemap.ts           # sitemap.xml
│   ├── favicon.ico / icon.svg / apple-icon.png
├── components/
│   ├── benchmarks.tsx       # Animated line/bar charts and comparison timeline
│   ├── brief.tsx            # Pinned sequence: a brief becomes a render
│   ├── dot-field.tsx        # Canvas dot grid behind hero and CTA copy
│   ├── faq.tsx              # Accordion (animated height, aria)
│   ├── final-cta.tsx        # Closing copy over the dot field and helix
│   ├── footer.tsx           # Link columns, legal bar, rising brand
│   ├── formats.tsx          # One take laid out at every delivery size
│   ├── hero.tsx             # Headline, copy and the ribbon stage
│   ├── image-arc.tsx        # Three.js ribbon of renders (hero)
│   ├── image-helix.tsx      # Three.js helix of renders (CTA)
│   ├── logo.tsx             # Imageworks mark + folding wordmark
│   ├── nav.tsx              # Condensing nav, section marker, mobile sheet
│   ├── pricing.tsx          # Billing toggle with digit roll, tiers, enterprise
│   ├── providers.tsx        # Theme, reduced-motion and smooth-scroll providers
│   ├── reveal.tsx           # Motion entrance wrapper (mount or in-view)
│   ├── section-heading.tsx  # Serif section opener
│   ├── skip-to-content.tsx  # Skip link
│   ├── smooth-scroll.tsx    # Lenis instance + anchor handling
│   ├── structured-data.tsx  # JSON-LD
│   ├── testimonials.tsx     # Autoplaying stories with tabs
│   ├── theme-switch.tsx     # Floating theme switcher (bottom right)
│   └── variations.tsx       # Pinned sequence: twelve grades, one kept
├── lib/
│   ├── config.ts            # Feature flags (smooth scroll)
│   ├── faqs.ts              # FAQ content (shared with JSON-LD)
│   ├── metadata.ts          # siteConfig + createMetadata()
│   ├── motion.tsx           # Easing constants + reduced-motion provider
│   ├── photos.ts            # Shared Unsplash render pool + URL helpers
│   └── spectrum.ts          # Seamless brand gradient
└── public/
    ├── icon-*.png           # Manifest icons (192, 512, maskable)
    ├── brand-mask.svg       # Footer logo mask
    ├── og-image.png         # 1200×630 OpenGraph image
    └── site.webmanifest
```

## Customization

### Brand

Edit `lib/metadata.ts` for the name, description, canonical URL, creator
handle and keywords used by metadata and JSON-LD. The footer also derives
company and legal links from this URL. Update the static
`public/site.webmanifest`, visible logo text in `components/logo.tsx`,
footer wordmark, social links, and application URLs separately.

Replace `public/og-image.png` (1200×630), `app/favicon.ico`, `app/icon.svg`,
`app/apple-icon.png` (180×180), and `public/icon-*.png` (192 or 512 square).
The mark is `LogoMark` in `components/logo.tsx`; keep
`public/brand-mask.svg` in sync with it. The manifest supplies application
identity and icons; no service worker or offline cache is included.

### Copy and data

Each section keeps its content in typed constants at the top of the file:
`LINKS` (nav), `BRIEF` (brief), `VARIATIONS` (variations), `FIRST_RENDER`
/ `VOLUME` (benchmarks), `FRAMES` (formats), `STORIES` (testimonials),
`TIERS` / `ENTERPRISE` (pricing), `FAQS` (`lib/faqs.ts`), `COLUMNS` /
`LEGAL` (footer).

### Images

All imagery comes from one pool in `lib/photos.ts`, hot-linked from
Unsplash through `photoUrl()` / `photoSrc()`. The hero ribbon and the CTA
helix cycle through the whole pool; other sections pick by index. Replace
the IDs with your own renders (or point the helpers at your CDN) and update
`images.remotePatterns` in `next.config.ts`.

### Feature flags

`lib/config.ts`:

```ts
export const features = {
  smoothScroll: true,
} as const;
```

With `smoothScroll` off, no Lenis instance is created and anchor links use
the browser's own scrolling. Lenis is also skipped when reduced motion is
enabled at page load. Reload after changing that preference to reinitialize
the smooth-scroll provider.

### Design tokens

Component styling uses Tailwind v4 utilities, including literal photo-grade and layout presets. The shared spectrum utility lives in `lib/spectrum.ts`; `public/brand-mask.svg` supplies the footer mask. Motion values and measured chart positions remain runtime styles.

`app/globals.css` defines `--background`, `--foreground`, `--muted`,
`--muted-foreground`, `--border` and `--ring` for both themes. The
spectrum accent used by the pricing highlight and footer wordmark lives in
`lib/spectrum.ts`. The dot field uses the foreground token. Section rhythm is `py-24 sm:py-32` inside a
`max-w-[1440px]` column with `px-4 sm:px-6`.

### Typography

`app/layout.tsx` loads Geist, Geist Mono, and Instrument Serif through
`next/font/google`. Font files are fetched during the build and served locally.
Tailwind maps them to `font-sans`, `font-mono`, and `font-serif`; update both
the font imports and tokens when replacing a family.

### Scene knobs

- `image-arc.tsx`: `SEAM_HEIGHT`, `SEAM_MAX`, `EXIT_HEIGHT`, `EXIT_WIDTH`,
  `PERIOD` (travel duration in seconds), `TILT` (radians), `BEND`,
  `EMERGE_DELAY`, and `EMERGE_S`. The stage height establishes the scene
  layout unit; size constants are proportional limits rather than pixels
- `image-helix.tsx`: `CARD_SHARE`, `PITCH`, `AMP_SHARE`, `TURN`, `OVERLAP`,
  `FADE_ABOVE`, `FADE_INTO`, `TURN_S`, and intro timing
- `dot-field.tsx`: `SPACING`, `DOT_R`, `FIELD_R`, `EDGE_FADE`, and the
  `alpha` prop per instance
- `smooth-scroll.tsx`: `LENIS_OPTIONS` (duration, easing, multipliers)

## Accessibility

The template includes a skip link, Tailwind `focus-visible:` outlines,
real buttons and links, Left/Right arrow navigation for story tabs, and
`aria-expanded`/`aria-controls` on the accordion and menu. Billing buttons
use Tab to move focus and Enter or Space to select a period.
The mobile sheet locks body scrolling and closes with Escape.

Reduced motion selects static scene layouts and disables story autoplay.
The two Three.js scenes cap DPR at 2 and cancel rendering while offscreen
or when the tab is hidden. Reduced-motion scenes redraw while images
arrive and after resizing instead of running a continuous animation.
The story carousel advances every seven seconds until the pointer enters
the stories or the reader selects a tab. Verify keyboard behavior, contrast, and reduced motion again after
customizing components; these features are not an accessibility certification.

## Image credits

Renders are from Unsplash's [3D Renders](https://unsplash.com/t/3d-renders)
topic and are free to use under the
[Unsplash License](https://unsplash.com/license). Swap in your own before
launch.

- [nemo](https://unsplash.com/@nemo765)
- [Max Petrunin](https://unsplash.com/@mvogulov)
- [Milad Fakurian](https://unsplash.com/@fakurian) (four renders)
- [Łukasz Łada](https://unsplash.com/@lukaszlada)
- [carlhauser](https://unsplash.com/@carlhauser)
- [Micke Lindström](https://unsplash.com/@misterlindstrom)
- [Puscas Adryan](https://unsplash.com/@adryan_studio)

## Demonstration boundaries

Imageworks is a fictional product. Pricing, performance figures, customer
names, testimonials, image-generation claims, and plan allowances are
illustrative content. There is no AI generation service, authentication,
payment processing, or backend in this template.

The billing control switches displayed prices locally. Story tabs and FAQs
update local React state. The newsletter validates an email in the browser
and displays a confirmation, but does not send or persist the address.
Connect an email service and replace the confirmation copy before launch.
Remote photographs are fetched from Unsplash; Three.js textures request
images directly and need a CORS-enabled replacement host.

## Notes

- The local nav/footer anchors target sections on this page. Company and
  legal links use `imageworks.example.com`; application links use
  `app.imageworks.example.com`. Social links and the sales email also need
  replacement before launch. These destinations are not implemented routes.
- `next dev` writes `AGENTS.md`/`CLAUDE.md` (Next.js guidance for AI coding
  agents) into the project root; they're git-ignored.
- Update the `sameAs` social URLs in `components/structured-data.tsx` and
  the placeholder `siteConfig.url` before deploying.

## Verification

Run `npm run typecheck`, `npm run lint`, `npm run format:check`, and
`npm run build` after changes. Review both themes and responsive layouts,
then test the menu, billing control, story tabs, FAQ, and newsletter.
Keep `node_modules`, `.next`, `tsconfig.tsbuildinfo`, and generated
`next-env.d.ts`, `AGENTS.md`, and `CLAUDE.md` out of distributed source archives.
Next.js recreates its required type references automatically.

## License

Commercial license. See [LICENSE](./LICENSE).

# Partner marks — placeholders

**These are stand-ins. Every file here is replaced by the real roster once the
client confirms who is actually sponsoring the 2026 cycle.**

The brand deck has no partners page. The only place partner marks appear in any
supplied material is the press-wall photograph
(`resources/images/20_jury-group-press-wall-mockup.png`), which is a mockup and
shows a different set again — Adobe, Amazon, WhitePawns, blackeels, EVENT PL,
NAS STOCK, Tahrir Cultural Center. So there was nothing to extract, and this set
was assembled to give the wall real marks to be designed against: real logos
vary in proportion, weight and colour in ways invented ones do not, and a layout
that has never met one is a layout that has not been tested.

Nothing here implies a relationship. None of these organisations has agreed to
anything, and shipping the site in this state would state otherwise.

| File | Organisation | Source |
|---|---|---|
| `adobe.svg` | Adobe | Wikimedia Commons, *Adobe logo and wordmark (2017).svg* |
| `amazon.svg` | Amazon | Wikimedia Commons, *Amazon logo.svg* |
| `dubai-design-district.svg` | Dubai Design District | dubaidesigndistrict.com |
| `american-university-of-sharjah.png` | American University of Sharjah | aus.edu |
| `behance.svg` | Behance | simple-icons |
| `figma.svg` | Figma | simple-icons |
| `canva.svg` | Canva | simple-icons |
| `dribbble.svg` | Dribbble | simple-icons |
| `pinterest.svg` | Pinterest | simple-icons |
| `sketch.svg` | Sketch | simple-icons |
| `framer.svg` | Framer | simple-icons |
| `webflow.svg` | Webflow | simple-icons |
| `wetransfer.svg` | WeTransfer | simple-icons |
| `vimeo.svg` | Vimeo | simple-icons |

Each mark is a registered trademark of its owner.

## Replacing them

Drop the real file in, point `logoUrl` at it in `src/lib/fixtures/content.ts`,
and set `logoScale` by eye. Scale is the one thing that cannot be computed: the
wall caps every mark at its tier's height, so a wide wordmark and a bare symbol
capped identically carry very different amounts of ink, and the symbol reads
small. 1 is the cap; the symbols here sit near 1.2 and the wordmarks near 0.8.

SVG with transparency is preferred. The band knocks every mark out to white with
`brightness(0) invert(1)`, which reads the alpha channel and ignores colour, so
anything with a baked-in background arrives as a solid white block. PNG works if
it has a real alpha channel; supply it at roughly 3× the row's cap height so it
holds up on a retina screen.

Roster size matters here in a way it did not in a grid. Each row has to be wider
than the widest viewport it will be seen on, or the loop seam opens as a gap,
and a row short enough to repeat inside one screen shows the same logo twice at
once. Thirteen marks across two rows is what it took; below about five per row,
raise the repeat count in `partners-strip.tsx` and expect visible repetition.

# Chat Handoff Notes

## Requests for Chat 1
- Privacy page states there are no tracking cookies and no analytics; update it if analytics are ever added.
- Please create `css/base.css` and `css/home.css`. Chat 2 is working around missing `css/base.css` by importing `../style.css` in `css/pages.css` and `css/catalogue.css` until `css/base.css` is in place.

## Requests for Chat 2
- Nav and footer are shared via `layout.js` and now link to `story.html`, `help.html` (anchors: `#how-to-order`, `#personalization`, `#shipping`, `#returns`, `#faqs`, `#contact`) and `privacy.html`; create these pages; `data-page` values are `story`, `help`, and `privacy`.
- Shared header `<header id="site-header"></header>` and footer `<footer id="site-footer"></footer>` are populated by `layout.js` on DOM load.
- Shared styles are located in `css/base.css`.
- Ensure script tags follow the page contract order: `config`, `products`, `icons`, `slider`, `layout`, `cart`, `product-ui`, `nav`, `saved`, followed by the page-specific script.

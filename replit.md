# Knowledge Hub CMS/LMS

A lightweight, portable knowledge-sharing CMS/LMS built with vanilla HTML/CSS/JavaScript. No build step required. Deployable to GitHub Pages. UI in Brazilian Portuguese.

## Architecture

- **Frontend**: Vanilla HTML/CSS/JS with hash-based routing (`#/topic/chapter/item`)
- **Backend**: Express.js server for development (serves static files + API for admin CRUD)
- **Content Storage**: JSON files (`public/data/content.json`, `public/data/site.json`)
- **Markdown Rendering**: CDN-hosted Marked.js + DOMPurify for XSS protection
- **Progress Tracking**: localStorage
- **SEO**: Semantic HTML, meta tags, JSON-LD structured data, Schema.org markup
- **YouTube**: Auto-detects YouTube URLs in video/audio items and renders as responsive embeds

## Content Structure

Topics -> Chapters -> Items (hierarchical, like an online course)
- **Topics**: Top-level categories (each with a selectable icon)
- **Chapters**: Sections within a topic
- **Items**: Individual content pieces (text/markdown, video, audio, image)

## File Structure

```
index.html                 # Main SPA entry point (root for GitHub Pages)
public/
  css/styles.css           # All styles with CSS custom properties + dark mode
  js/
    app.js                 # Router, page rendering, theme toggle, icon system
    content.js             # Content loading/management
    progress.js            # localStorage progress tracking
    seo.js                 # JSON-LD, meta tags, breadcrumbs
    admin.js               # Admin CRUD interface
  data/
    site.json              # Site configuration
    content.json           # All content (topics, chapters, items)
  media/                   # Media files directory

server/                    # Express server (dev/Replit only)
  index.ts                 # Server entry point, serves root + public/ as static
  routes.ts                # API routes (/api/content, /api/site)
```

## Routes (Hash-based)

- `#/` - Home page (lists all topics)
- `#/{topic-slug}` - Topic page (lists chapters and items)
- `#/{topic}/{chapter}/{item}` - Item content page
- `#/admin` - Admin panel (hidden from nav, access via URL)

## API Endpoints

- `GET /api/content` - Get all content
- `PUT /api/content` - Update content (admin)
- `GET /api/site` - Get site config
- `PUT /api/site` - Update site config (admin)

## Key Features

- Dark/light theme toggle with system preference detection
- Progress tracking with visual progress bars
- Previous/next navigation between items
- Breadcrumb navigation with Schema.org markup
- Admin panel with CRUD for topics, chapters, items (hidden URL)
- 15 selectable icons for topics
- YouTube URL auto-embedding for video/audio items
- Import/export content as JSON
- Responsive design
- Accessible (skip links, ARIA roles, semantic HTML)
- UI language: Brazilian Portuguese

## GitHub Pages Deployment

The repo root contains `index.html` which references assets in `public/`. Push the entire repo to GitHub and enable GitHub Pages from the root — no build step needed.

## Dependencies

- Express.js (server only, not needed for static deployment)
- CDN: Marked.js, DOMPurify (loaded in browser)

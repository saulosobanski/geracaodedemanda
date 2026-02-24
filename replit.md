# Knowledge Hub CMS/LMS

A lightweight, portable knowledge-sharing CMS/LMS built with vanilla HTML/CSS/JavaScript. No build step required. Deployable to GitHub Pages.

## Architecture

- **Frontend**: Vanilla HTML/CSS/JS with hash-based routing (`#/topic/chapter/item`)
- **Backend**: Express.js server for development (serves static files + API for admin CRUD)
- **Content Storage**: JSON files (`public/data/content.json`, `public/data/site.json`)
- **Markdown Rendering**: CDN-hosted Marked.js + DOMPurify for XSS protection
- **Progress Tracking**: localStorage
- **SEO**: Semantic HTML, meta tags, JSON-LD structured data, Schema.org markup

## Content Structure

Topics -> Chapters -> Items (hierarchical, like an online course)
- **Topics**: Top-level categories
- **Chapters**: Sections within a topic
- **Items**: Individual content pieces (text/markdown, video, audio, image)

## File Structure

```
public/                    # Static CMS (deployable to GitHub Pages as-is)
  index.html              # Main SPA entry point
  css/styles.css          # All styles with CSS custom properties + dark mode
  js/
    app.js                # Router, page rendering, theme toggle
    content.js            # Content loading/management
    progress.js           # localStorage progress tracking
    seo.js                # JSON-LD, meta tags, breadcrumbs
    admin.js              # Admin CRUD interface
  data/
    site.json             # Site configuration
    content.json          # All content (topics, chapters, items)
  media/                  # Media files directory

server/                   # Express server (dev/Replit only)
  index.ts                # Server entry point, static file serving
  routes.ts               # API routes (/api/content, /api/site)
```

## Routes (Hash-based)

- `#/` - Home page (lists all topics)
- `#/{topic-slug}` - Topic page (lists chapters and items)
- `#/{topic}/{chapter}/{item}` - Item content page
- `#/admin` - Admin panel

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
- Admin panel with CRUD for topics, chapters, items
- Import/export content as JSON
- Responsive design
- Accessible (skip links, ARIA roles, semantic HTML)

## GitHub Pages Deployment

The `public/` directory can be deployed directly to GitHub Pages with no build step.

## Dependencies

- Express.js (server only, not needed for static deployment)
- CDN: Marked.js, DOMPurify (loaded in browser)

var App = (function () {
    var root = null;

    function init() {
        root = document.getElementById('app-root');
        document.getElementById('footer-year').textContent = new Date().getFullYear();

        initTheme();

        window.addEventListener('hashchange', function () { render(); });

        ContentManager.loadData().then(function () {
            render();
        }).catch(function (err) {
            root.innerHTML = '<div class="empty-state"><h2>Error loading content</h2><p>' + err.message + '</p></div>';
        });
    }

    function initTheme() {
        var saved = localStorage.getItem('knowledgehub_theme');
        if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.setAttribute('data-theme', 'dark');
        }
        document.getElementById('theme-toggle').addEventListener('click', function () {
            var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            if (isDark) {
                document.documentElement.removeAttribute('data-theme');
                localStorage.setItem('knowledgehub_theme', 'light');
            } else {
                document.documentElement.setAttribute('data-theme', 'dark');
                localStorage.setItem('knowledgehub_theme', 'dark');
            }
        });
    }

    function getRoute() {
        var hash = window.location.hash || '#/';
        var path = hash.replace(/^#\/?/, '');
        var parts = path.split('/').filter(function (p) { return p.length > 0; });
        return parts;
    }

    function render() {
        var parts = getRoute();

        updateActiveNav();

        if (parts[0] === 'admin') {
            renderAdminPage();
        } else if (parts.length === 0) {
            renderHomePage();
        } else if (parts.length === 1) {
            renderTopicPage(parts[0]);
        } else if (parts.length === 2) {
            renderTopicPage(parts[0], parts[1]);
        } else if (parts.length >= 3) {
            renderItemPage(parts[0], parts[1], parts[2]);
        }

        window.scrollTo(0, 0);
    }

    function updateActiveNav() {
        var parts = getRoute();
        var links = document.querySelectorAll('.nav-link');
        for (var i = 0; i < links.length; i++) {
            var href = links[i].getAttribute('href');
            if (parts[0] === 'admin' && href === '#/admin') {
                links[i].classList.add('active');
            } else if (parts.length === 0 && href === '#/') {
                links[i].classList.add('active');
            } else {
                links[i].classList.remove('active');
            }
        }
    }

    function renderHomePage() {
        var site = ContentManager.getSiteConfig();
        var topics = ContentManager.getTopics();

        SEO.setHomePage(site, topics);
        SEO.updateBreadcrumb(null);

        var overall = Progress.getOverallProgress(topics);

        var html = '<section class="page-header">';
        html += '<h1>' + escapeHtml(site.title) + '</h1>';
        html += '<p>' + escapeHtml(site.description) + '</p>';
        if (overall > 0) {
            html += '<div class="progress-summary">Overall progress: ' + overall + '% complete</div>';
            html += '<div class="progress-bar"><div class="progress-bar-fill" style="width:' + overall + '%"></div></div>';
        }
        html += '</section>';

        html += '<section class="topic-grid" role="list">';
        for (var i = 0; i < topics.length; i++) {
            var topic = topics[i];
            var itemCount = ContentManager.countTotalItems(topic);
            var progress = Progress.getTopicProgress(topic);
            var chapterCount = topic.chapters ? topic.chapters.length : 0;

            html += '<a href="#/' + topic.slug + '" class="card" role="listitem">';
            html += '<div class="card-icon">';
            html += '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>';
            html += '</div>';
            html += '<h2>' + escapeHtml(topic.title) + '</h2>';
            html += '<p>' + escapeHtml(topic.description) + '</p>';
            html += '<div class="card-meta">';
            html += '<span>' + chapterCount + ' chapter' + (chapterCount !== 1 ? 's' : '') + ' &middot; ' + itemCount + ' item' + (itemCount !== 1 ? 's' : '') + '</span>';
            if (progress > 0) html += '<span>' + progress + '%</span>';
            html += '</div>';
            if (progress > 0) {
                html += '<div class="progress-bar"><div class="progress-bar-fill" style="width:' + progress + '%"></div></div>';
            }
            html += '</a>';
        }
        html += '</section>';

        if (topics.length === 0) {
            html += '<div class="empty-state">';
            html += '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>';
            html += '<h2>No topics yet</h2>';
            html += '<p>Head to the <a href="#/admin">admin panel</a> to create your first topic.</p>';
            html += '</div>';
        }

        root.innerHTML = html;
    }

    function renderTopicPage(topicSlug, scrollToChapter) {
        var site = ContentManager.getSiteConfig();
        var topic = ContentManager.getTopicBySlug(topicSlug);

        if (!topic) {
            render404();
            return;
        }

        SEO.setTopicPage(site, topic);
        SEO.updateBreadcrumb([
            { label: 'Home', href: '#/' },
            { label: topic.title, href: null }
        ]);

        var progress = Progress.getTopicProgress(topic);
        var chapters = (topic.chapters || []).slice().sort(function (a, b) { return a.order - b.order; });

        var html = '<section class="page-header">';
        html += '<h1>' + escapeHtml(topic.title) + '</h1>';
        html += '<p>' + escapeHtml(topic.description) + '</p>';
        if (progress > 0) {
            html += '<div class="progress-summary">Progress: ' + progress + '% complete</div>';
            html += '<div class="progress-bar"><div class="progress-bar-fill" style="width:' + progress + '%"></div></div>';
        }
        html += '</section>';

        html += '<section class="chapter-list">';
        for (var c = 0; c < chapters.length; c++) {
            var ch = chapters[c];
            var items = (ch.items || []).slice().sort(function (a, b) { return a.order - b.order; });
            var chProgress = Progress.getChapterProgress(ch);

            html += '<article class="chapter-card" id="ch-' + ch.slug + '">';
            html += '<div class="chapter-header">';
            html += '<div style="display:flex;justify-content:space-between;align-items:center">';
            html += '<div>';
            html += '<h2>' + escapeHtml(ch.title) + '</h2>';
            html += '<p>' + escapeHtml(ch.description) + '</p>';
            html += '</div>';
            if (chProgress > 0) {
                html += '<span style="font-size:0.85rem;color:hsl(var(--color-success));font-weight:600">' + chProgress + '%</span>';
            }
            html += '</div>';
            if (chProgress > 0) {
                html += '<div class="progress-bar" style="margin-top:12px"><div class="progress-bar-fill" style="width:' + chProgress + '%"></div></div>';
            }
            html += '</div>';

            if (items.length > 0) {
                html += '<div class="item-list" role="list">';
                for (var i = 0; i < items.length; i++) {
                    var item = items[i];
                    var completed = Progress.isCompleted(item.id);
                    html += '<a href="#/' + topicSlug + '/' + ch.slug + '/' + item.slug + '" class="item-link" role="listitem">';
                    html += '<div class="item-check' + (completed ? ' completed' : '') + '"></div>';
                    html += '<div class="item-info">';
                    html += '<div class="item-title">' + escapeHtml(item.title) + '</div>';
                    html += '<div class="item-type">' + item.type + '</div>';
                    html += '</div>';
                    html += '<div class="item-arrow">&rarr;</div>';
                    html += '</a>';
                }
                html += '</div>';
            }

            html += '</article>';
        }
        html += '</section>';

        if (chapters.length === 0) {
            html += '<div class="empty-state"><h2>No chapters yet</h2><p>This topic has no chapters.</p></div>';
        }

        root.innerHTML = html;

        if (scrollToChapter) {
            var el = document.getElementById('ch-' + scrollToChapter);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    function renderItemPage(topicSlug, chapterSlug, itemSlug) {
        var site = ContentManager.getSiteConfig();
        var topic = ContentManager.getTopicBySlug(topicSlug);
        if (!topic) { render404(); return; }

        var chapter = ContentManager.getChapterBySlug(topic, chapterSlug);
        if (!chapter) { render404(); return; }

        var item = ContentManager.getItemBySlug(chapter, itemSlug);
        if (!item) { render404(); return; }

        SEO.setItemPage(site, topic, chapter, item);
        SEO.updateBreadcrumb([
            { label: 'Home', href: '#/' },
            { label: topic.title, href: '#/' + topicSlug },
            { label: chapter.title, href: '#/' + topicSlug + '#ch-' + chapterSlug },
            { label: item.title, href: null }
        ]);

        var completed = Progress.isCompleted(item.id);
        var adj = ContentManager.getAdjacentItems(topicSlug, chapterSlug, itemSlug);

        var html = '<article class="content-view" itemscope itemtype="https://schema.org/LearningResource">';
        html += '<header class="content-header">';
        html += '<h1 itemprop="name">' + escapeHtml(item.title) + '</h1>';
        html += '<div class="content-meta">';
        html += '<span itemprop="isPartOf">' + escapeHtml(chapter.title) + '</span>';
        html += ' &middot; <span itemprop="learningResourceType">' + item.type + '</span>';
        html += '</div>';
        html += '</header>';

        html += '<div class="content-body" itemprop="text">';
        html += renderContent(item);
        html += '</div>';

        html += '<button class="mark-complete-btn' + (completed ? ' completed' : '') + '" onclick="App.toggleItemComplete(\'' + item.id + '\')">';
        html += completed ? '&#10003; Completed' : 'Mark as Complete';
        html += '</button>';

        html += '<nav class="content-nav" aria-label="Item navigation">';
        if (adj.prev) {
            html += '<a href="#/' + adj.prev.topic + '/' + adj.prev.chapter + '/' + adj.prev.item.slug + '">';
            html += '<span class="nav-label">&larr; Previous</span>';
            html += '<span class="nav-title">' + escapeHtml(adj.prev.item.title) + '</span>';
            html += '</a>';
        } else {
            html += '<span></span>';
        }
        if (adj.next) {
            html += '<a href="#/' + adj.next.topic + '/' + adj.next.chapter + '/' + adj.next.item.slug + '" style="text-align:right;margin-left:auto">';
            html += '<span class="nav-label">Next &rarr;</span>';
            html += '<span class="nav-title">' + escapeHtml(adj.next.item.title) + '</span>';
            html += '</a>';
        }
        html += '</nav>';

        html += '</article>';

        root.innerHTML = html;
    }

    function renderContent(item) {
        switch (item.type) {
            case 'text':
                return ContentManager.renderMarkdown(item.content);
            case 'video':
                return '<div class="media-container"><video controls preload="metadata"><source src="' + escapeAttr(item.content) + '">Your browser does not support video.</video></div>';
            case 'audio':
                return '<div class="media-container"><audio controls preload="metadata"><source src="' + escapeAttr(item.content) + '">Your browser does not support audio.</audio></div>';
            case 'image':
                return '<div class="media-container"><img src="' + escapeAttr(item.content) + '" alt="' + escapeAttr(item.title) + '" loading="lazy"></div>';
            default:
                return ContentManager.renderMarkdown(item.content);
        }
    }

    function renderAdminPage() {
        var site = ContentManager.getSiteConfig();
        SEO.updateMeta('Admin - ' + site.title, 'Content administration');
        SEO.updateBreadcrumb([
            { label: 'Home', href: '#/' },
            { label: 'Admin', href: null }
        ]);

        Admin.renderAdmin(root);
    }

    function render404() {
        SEO.updateBreadcrumb(null);
        root.innerHTML = '<div class="empty-state">' +
            '<h2>Page Not Found</h2>' +
            '<p>The page you are looking for does not exist.</p>' +
            '<a href="#/" class="btn btn-primary" style="margin-top:16px">Go Home</a>' +
            '</div>';
    }

    function toggleItemComplete(itemId) {
        var nowComplete = Progress.toggleComplete(itemId);
        render();
    }

    function escapeHtml(str) {
        var div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function escapeAttr(str) {
        return String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    document.addEventListener('DOMContentLoaded', init);

    return {
        render: render,
        toggleItemComplete: toggleItemComplete
    };
})();

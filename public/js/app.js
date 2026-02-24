var App = (function () {
    var root = null;

    var TOPIC_ICONS = {
        book: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>',
        code: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',
        globe: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
        star: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
        rocket: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>',
        lightbulb: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/></svg>',
        heart: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
        trophy: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>',
        music: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>',
        camera: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>',
        palette: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="13.5" cy="6.5" r="0.5" fill="currentColor"/><circle cx="17.5" cy="10.5" r="0.5" fill="currentColor"/><circle cx="8.5" cy="7.5" r="0.5" fill="currentColor"/><circle cx="6.5" cy="12.5" r="0.5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>',
        puzzle: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19.439 7.85c-.049.322.059.648.289.878l1.568 1.568c.47.47.706 1.087.706 1.704s-.235 1.233-.706 1.704l-1.611 1.611a.98.98 0 0 1-.837.276c-.47-.07-.802-.48-.968-.925a2.501 2.501 0 1 0-3.214 3.214c.446.166.855.497.925.968a.979.979 0 0 1-.276.837l-1.61 1.61a2.404 2.404 0 0 1-1.705.707 2.402 2.402 0 0 1-1.704-.706l-1.568-1.568a1.026 1.026 0 0 0-.877-.29c-.493.074-.84.504-1.02.968a2.5 2.5 0 1 1-3.237-3.237c.464-.18.894-.527.967-1.02a1.026 1.026 0 0 0-.289-.877l-1.568-1.568A2.402 2.402 0 0 1 1.998 12c0-.617.236-1.234.706-1.704L4.315 8.685a.98.98 0 0 1 .837-.276c.47.07.802.48.968.925a2.501 2.501 0 1 0 3.214-3.214c-.446-.166-.855-.497-.925-.968a.979.979 0 0 1 .276-.837l1.61-1.61a2.404 2.404 0 0 1 1.705-.707c.617 0 1.234.236 1.704.706l1.568 1.568c.23.23.556.338.877.29.493-.074.84-.504 1.02-.968a2.5 2.5 0 1 1 3.237 3.237c-.464.18-.894.527-.967 1.02z"/></svg>',
        flask: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 3h6"/><path d="M10 9V3"/><path d="M14 9V3"/><path d="M10 9l-5.4 8.1A2 2 0 0 0 6.27 20h11.46a2 2 0 0 0 1.67-2.9L14 9"/><path d="M7.5 15h9"/></svg>',
        graduation: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>',
        wrench: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>'
    };

    function getIconSvg(iconName) {
        return TOPIC_ICONS[iconName] || TOPIC_ICONS.book;
    }

    function init() {
        root = document.getElementById('app-root');
        document.getElementById('footer-year').textContent = new Date().getFullYear();

        initTheme();

        window.addEventListener('hashchange', function () { render(); });

        ContentManager.loadData().then(function () {
            render();
        }).catch(function (err) {
            root.innerHTML = '<div class="empty-state"><h2>Erro ao carregar conteudo</h2><p>' + err.message + '</p></div>';
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
            if (parts.length === 0 && href === '#/') {
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
            html += '<div class="progress-summary">Progresso geral: ' + overall + '% concluido</div>';
            html += '<div class="progress-bar"><div class="progress-bar-fill" style="width:' + overall + '%"></div></div>';
        }
        html += '</section>';

        html += '<section class="topic-grid" role="list">';
        for (var i = 0; i < topics.length; i++) {
            var topic = topics[i];
            var itemCount = ContentManager.countTotalItems(topic);
            var progress = Progress.getTopicProgress(topic);
            var chapterCount = topic.chapters ? topic.chapters.length : 0;
            var iconName = topic.icon || 'book';

            html += '<a href="#/' + topic.slug + '" class="card" role="listitem">';
            html += '<div class="card-icon">';
            html += getIconSvg(iconName);
            html += '</div>';
            html += '<h2>' + escapeHtml(topic.title) + '</h2>';
            html += '<p>' + escapeHtml(topic.description) + '</p>';
            html += '<div class="card-meta">';
            html += '<span>' + chapterCount + ' capitulo' + (chapterCount !== 1 ? 's' : '') + ' &middot; ' + itemCount + ' ite' + (itemCount !== 1 ? 'ns' : 'm') + '</span>';
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
            html += '<h2>Nenhum topico ainda</h2>';
            html += '<p>Acesse o <a href="#/admin">painel administrativo</a> para criar seu primeiro topico.</p>';
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
            { label: 'Inicio', href: '#/' },
            { label: topic.title, href: null }
        ]);

        var progress = Progress.getTopicProgress(topic);
        var chapters = (topic.chapters || []).slice().sort(function (a, b) { return a.order - b.order; });

        var html = '<section class="page-header">';
        html += '<h1>' + escapeHtml(topic.title) + '</h1>';
        html += '<p>' + escapeHtml(topic.description) + '</p>';
        if (progress > 0) {
            html += '<div class="progress-summary">Progresso: ' + progress + '% concluido</div>';
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
                    var typeLabel = getTypeLabel(item.type);
                    html += '<a href="#/' + topicSlug + '/' + ch.slug + '/' + item.slug + '" class="item-link" role="listitem">';
                    html += '<div class="item-check' + (completed ? ' completed' : '') + '"></div>';
                    html += '<div class="item-info">';
                    html += '<div class="item-title">' + escapeHtml(item.title) + '</div>';
                    html += '<div class="item-type">' + typeLabel + '</div>';
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
            html += '<div class="empty-state"><h2>Nenhum capitulo ainda</h2><p>Este topico nao possui capitulos.</p></div>';
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
            { label: 'Inicio', href: '#/' },
            { label: topic.title, href: '#/' + topicSlug },
            { label: chapter.title, href: '#/' + topicSlug + '#ch-' + chapterSlug },
            { label: item.title, href: null }
        ]);

        var completed = Progress.isCompleted(item.id);
        var adj = ContentManager.getAdjacentItems(topicSlug, chapterSlug, itemSlug);
        var typeLabel = getTypeLabel(item.type);

        var html = '<article class="content-view" itemscope itemtype="https://schema.org/LearningResource">';
        html += '<header class="content-header">';
        html += '<h1 itemprop="name">' + escapeHtml(item.title) + '</h1>';
        html += '<div class="content-meta">';
        html += '<span itemprop="isPartOf">' + escapeHtml(chapter.title) + '</span>';
        html += ' &middot; <span itemprop="learningResourceType">' + typeLabel + '</span>';
        html += '</div>';
        html += '</header>';

        html += '<div class="content-body" itemprop="text">';
        html += renderContent(item);
        html += '</div>';

        html += '<button class="mark-complete-btn' + (completed ? ' completed' : '') + '" onclick="App.toggleItemComplete(\'' + item.id + '\')">';
        html += completed ? '&#10003; Concluido' : 'Marcar como Concluido';
        html += '</button>';

        html += '<nav class="content-nav" aria-label="Navegacao de itens">';
        if (adj.prev) {
            html += '<a href="#/' + adj.prev.topic + '/' + adj.prev.chapter + '/' + adj.prev.item.slug + '">';
            html += '<span class="nav-label">&larr; Anterior</span>';
            html += '<span class="nav-title">' + escapeHtml(adj.prev.item.title) + '</span>';
            html += '</a>';
        } else {
            html += '<span></span>';
        }
        if (adj.next) {
            html += '<a href="#/' + adj.next.topic + '/' + adj.next.chapter + '/' + adj.next.item.slug + '" style="text-align:right;margin-left:auto">';
            html += '<span class="nav-label">Proximo &rarr;</span>';
            html += '<span class="nav-title">' + escapeHtml(adj.next.item.title) + '</span>';
            html += '</a>';
        }
        html += '</nav>';

        html += '</article>';

        root.innerHTML = html;
    }

    function getYouTubeId(url) {
        if (!url) return null;
        var match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
        return match ? match[1] : null;
    }

    function renderContent(item) {
        var ytId;
        switch (item.type) {
            case 'text':
                return ContentManager.renderMarkdown(item.content);
            case 'video':
                ytId = getYouTubeId(item.content);
                if (ytId) {
                    return '<div class="media-container youtube-embed"><iframe src="https://www.youtube.com/embed/' + ytId + '" title="' + escapeAttr(item.title) + '" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div>';
                }
                return '<div class="media-container"><video controls preload="metadata"><source src="' + escapeAttr(item.content) + '">Seu navegador nao suporta video.</video></div>';
            case 'audio':
                ytId = getYouTubeId(item.content);
                if (ytId) {
                    return '<div class="media-container youtube-embed"><iframe src="https://www.youtube.com/embed/' + ytId + '" title="' + escapeAttr(item.title) + '" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div>';
                }
                return '<div class="media-container"><audio controls preload="metadata"><source src="' + escapeAttr(item.content) + '">Seu navegador nao suporta audio.</audio></div>';
            case 'image':
                return '<div class="media-container"><img src="' + escapeAttr(item.content) + '" alt="' + escapeAttr(item.title) + '" loading="lazy"></div>';
            default:
                return ContentManager.renderMarkdown(item.content);
        }
    }

    function getTypeLabel(type) {
        var labels = {
            text: 'Texto',
            video: 'Video',
            audio: 'Audio',
            image: 'Imagem'
        };
        return labels[type] || type;
    }

    function renderAdminPage() {
        var site = ContentManager.getSiteConfig();
        SEO.updateMeta('Admin - ' + site.title, 'Administracao de conteudo');
        SEO.updateBreadcrumb([
            { label: 'Inicio', href: '#/' },
            { label: 'Admin', href: null }
        ]);

        Admin.renderAdmin(root);
    }

    function render404() {
        SEO.updateBreadcrumb(null);
        root.innerHTML = '<div class="empty-state">' +
            '<h2>Pagina Nao Encontrada</h2>' +
            '<p>A pagina que voce procura nao existe.</p>' +
            '<a href="#/" class="btn btn-primary" style="margin-top:16px">Voltar ao Inicio</a>' +
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
        toggleItemComplete: toggleItemComplete,
        TOPIC_ICONS: TOPIC_ICONS,
        getIconSvg: getIconSvg
    };
})();

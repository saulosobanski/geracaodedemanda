var SEO = (function () {
    function updateMeta(title, description) {
        document.title = title;
        var metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.setAttribute('content', description);
        var ogTitle = document.querySelector('meta[property="og:title"]');
        if (ogTitle) ogTitle.setAttribute('content', title);
        var ogDesc = document.querySelector('meta[property="og:description"]');
        if (ogDesc) ogDesc.setAttribute('content', description);
    }

    function setJsonLd(data) {
        var el = document.getElementById('jsonld-data');
        if (el) el.textContent = JSON.stringify(data);
    }

    function setHomePage(siteConfig, topics) {
        updateMeta(
            siteConfig.title,
            siteConfig.description
        );
        setJsonLd({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            'name': siteConfig.title,
            'description': siteConfig.description,
            'author': {
                '@type': 'Organization',
                'name': siteConfig.author
            },
            'hasPart': topics.map(function (t) {
                return {
                    '@type': 'Course',
                    'name': t.title,
                    'description': t.description
                };
            })
        });
    }

    function setTopicPage(siteConfig, topic) {
        var title = topic.title + ' - ' + siteConfig.title;
        updateMeta(title, topic.description);
        setJsonLd({
            '@context': 'https://schema.org',
            '@type': 'Course',
            'name': topic.title,
            'description': topic.description,
            'provider': {
                '@type': 'Organization',
                'name': siteConfig.author
            },
            'hasCourseInstance': topic.chapters.map(function (ch) {
                return {
                    '@type': 'CourseInstance',
                    'name': ch.title,
                    'description': ch.description
                };
            })
        });
    }

    function setChapterPage(siteConfig, topic, chapter) {
        var title = chapter.title + ' - ' + topic.title + ' - ' + siteConfig.title;
        updateMeta(title, chapter.description);
        setJsonLd({
            '@context': 'https://schema.org',
            '@type': 'CourseInstance',
            'name': chapter.title,
            'description': chapter.description,
            'isPartOf': {
                '@type': 'Course',
                'name': topic.title
            },
            'hasPart': chapter.items.map(function (item) {
                return {
                    '@type': 'LearningResource',
                    'name': item.title,
                    'learningResourceType': item.type
                };
            })
        });
    }

    function setItemPage(siteConfig, topic, chapter, item) {
        var title = item.title + ' - ' + chapter.title + ' - ' + siteConfig.title;
        var description = item.content ? item.content.substring(0, 160).replace(/[#*_`\n]/g, '') : item.title;
        updateMeta(title, description);
        setJsonLd({
            '@context': 'https://schema.org',
            '@type': 'LearningResource',
            'name': item.title,
            'description': description,
            'learningResourceType': item.type,
            'isPartOf': {
                '@type': 'CourseInstance',
                'name': chapter.title,
                'isPartOf': {
                    '@type': 'Course',
                    'name': topic.title
                }
            },
            'provider': {
                '@type': 'Organization',
                'name': siteConfig.author
            }
        });
    }

    function updateBreadcrumb(crumbs) {
        var nav = document.getElementById('breadcrumb-nav');
        var ol = document.getElementById('breadcrumb');
        if (!nav || !ol) return;

        if (!crumbs || crumbs.length === 0) {
            nav.hidden = true;
            ol.innerHTML = '';
            return;
        }

        nav.hidden = false;
        var html = '';
        for (var i = 0; i < crumbs.length; i++) {
            var crumb = crumbs[i];
            var position = i + 1;
            html += '<li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">';
            if (crumb.href) {
                html += '<a itemprop="item" href="' + crumb.href + '"><span itemprop="name">' + escapeHtml(crumb.label) + '</span></a>';
            } else {
                html += '<span class="current" itemprop="name">' + escapeHtml(crumb.label) + '</span>';
            }
            html += '<meta itemprop="position" content="' + position + '">';
            html += '</li>';
        }
        ol.innerHTML = html;
    }

    function escapeHtml(str) {
        var div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    return {
        setHomePage: setHomePage,
        setTopicPage: setTopicPage,
        setChapterPage: setChapterPage,
        setItemPage: setItemPage,
        updateBreadcrumb: updateBreadcrumb,
        updateMeta: updateMeta
    };
})();

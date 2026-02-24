var ContentManager = (function () {
    var _siteConfig = null;
    var _content = null;
    var _loaded = false;

    function loadData() {
        if (_loaded) return Promise.resolve({ site: _siteConfig, content: _content });

        return Promise.all([
            fetch('data/site.json').then(function (r) { return r.json(); }),
            fetch('data/content.json').then(function (r) { return r.json(); })
        ]).then(function (results) {
            _siteConfig = results[0];
            _content = results[1];
            _loaded = true;
            return { site: _siteConfig, content: _content };
        });
    }

    function getSiteConfig() {
        return _siteConfig;
    }

    function getTopics() {
        if (!_content) return [];
        return _content.topics.slice().sort(function (a, b) { return a.order - b.order; });
    }

    function getTopicBySlug(slug) {
        if (!_content) return null;
        for (var i = 0; i < _content.topics.length; i++) {
            if (_content.topics[i].slug === slug) return _content.topics[i];
        }
        return null;
    }

    function getChapterBySlug(topic, chapterSlug) {
        if (!topic || !topic.chapters) return null;
        for (var i = 0; i < topic.chapters.length; i++) {
            if (topic.chapters[i].slug === chapterSlug) return topic.chapters[i];
        }
        return null;
    }

    function getItemBySlug(chapter, itemSlug) {
        if (!chapter || !chapter.items) return null;
        for (var i = 0; i < chapter.items.length; i++) {
            if (chapter.items[i].slug === itemSlug) return chapter.items[i];
        }
        return null;
    }

    function getAdjacentItems(topicSlug, chapterSlug, itemSlug) {
        var topic = getTopicBySlug(topicSlug);
        if (!topic) return { prev: null, next: null };

        var allItems = [];
        var chapters = topic.chapters.slice().sort(function (a, b) { return a.order - b.order; });
        for (var c = 0; c < chapters.length; c++) {
            var ch = chapters[c];
            var items = (ch.items || []).slice().sort(function (a, b) { return a.order - b.order; });
            for (var i = 0; i < items.length; i++) {
                allItems.push({ topic: topicSlug, chapter: ch.slug, item: items[i] });
            }
        }

        var currentIdx = -1;
        for (var j = 0; j < allItems.length; j++) {
            if (allItems[j].chapter === chapterSlug && allItems[j].item.slug === itemSlug) {
                currentIdx = j;
                break;
            }
        }

        return {
            prev: currentIdx > 0 ? allItems[currentIdx - 1] : null,
            next: currentIdx < allItems.length - 1 ? allItems[currentIdx + 1] : null
        };
    }

    function renderMarkdown(text) {
        if (!text) return '';
        if (typeof marked !== 'undefined' && typeof DOMPurify !== 'undefined') {
            var html = marked.parse(text);
            return DOMPurify.sanitize(html);
        }
        return '<p>' + text.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>') + '</p>';
    }

    function countTotalItems(topic) {
        if (!topic || !topic.chapters) return 0;
        var count = 0;
        for (var i = 0; i < topic.chapters.length; i++) {
            if (topic.chapters[i].items) count += topic.chapters[i].items.length;
        }
        return count;
    }

    function refreshData() {
        _loaded = false;
        return loadData();
    }

    function setContent(content) {
        _content = content;
    }

    function getContent() {
        return _content;
    }

    return {
        loadData: loadData,
        getSiteConfig: getSiteConfig,
        getTopics: getTopics,
        getTopicBySlug: getTopicBySlug,
        getChapterBySlug: getChapterBySlug,
        getItemBySlug: getItemBySlug,
        getAdjacentItems: getAdjacentItems,
        renderMarkdown: renderMarkdown,
        countTotalItems: countTotalItems,
        refreshData: refreshData,
        setContent: setContent,
        getContent: getContent
    };
})();

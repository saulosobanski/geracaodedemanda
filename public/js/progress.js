var Progress = (function () {
    var STORAGE_KEY = 'knowledgehub_progress';

    function getAll() {
        try {
            var data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : {};
        } catch (e) {
            return {};
        }
    }

    function saveAll(data) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (e) {}
    }

    function isCompleted(itemId) {
        var data = getAll();
        return data[itemId] === true;
    }

    function markComplete(itemId) {
        var data = getAll();
        data[itemId] = true;
        saveAll(data);
    }

    function markIncomplete(itemId) {
        var data = getAll();
        delete data[itemId];
        saveAll(data);
    }

    function toggleComplete(itemId) {
        if (isCompleted(itemId)) {
            markIncomplete(itemId);
            return false;
        } else {
            markComplete(itemId);
            return true;
        }
    }

    function getChapterProgress(chapter) {
        if (!chapter || !chapter.items || chapter.items.length === 0) return 0;
        var completed = 0;
        for (var i = 0; i < chapter.items.length; i++) {
            if (isCompleted(chapter.items[i].id)) completed++;
        }
        return Math.round((completed / chapter.items.length) * 100);
    }

    function getTopicProgress(topic) {
        if (!topic || !topic.chapters) return 0;
        var totalItems = 0;
        var completedItems = 0;
        for (var i = 0; i < topic.chapters.length; i++) {
            var ch = topic.chapters[i];
            if (ch.items) {
                totalItems += ch.items.length;
                for (var j = 0; j < ch.items.length; j++) {
                    if (isCompleted(ch.items[j].id)) completedItems++;
                }
            }
        }
        return totalItems === 0 ? 0 : Math.round((completedItems / totalItems) * 100);
    }

    function getOverallProgress(topics) {
        if (!topics || topics.length === 0) return 0;
        var totalItems = 0;
        var completedItems = 0;
        for (var t = 0; t < topics.length; t++) {
            var topic = topics[t];
            if (topic.chapters) {
                for (var c = 0; c < topic.chapters.length; c++) {
                    var ch = topic.chapters[c];
                    if (ch.items) {
                        totalItems += ch.items.length;
                        for (var i = 0; i < ch.items.length; i++) {
                            if (isCompleted(ch.items[i].id)) completedItems++;
                        }
                    }
                }
            }
        }
        return totalItems === 0 ? 0 : Math.round((completedItems / totalItems) * 100);
    }

    function resetAll() {
        localStorage.removeItem(STORAGE_KEY);
    }

    return {
        isCompleted: isCompleted,
        markComplete: markComplete,
        markIncomplete: markIncomplete,
        toggleComplete: toggleComplete,
        getChapterProgress: getChapterProgress,
        getTopicProgress: getTopicProgress,
        getOverallProgress: getOverallProgress,
        resetAll: resetAll
    };
})();

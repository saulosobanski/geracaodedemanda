var Admin = (function () {
    function generateId() {
        return 'id_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 6);
    }

    function slugify(text) {
        return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }

    function renderAdmin(root) {
        var content = ContentManager.getContent();
        if (!content) {
            root.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
            return;
        }

        var topics = content.topics.slice().sort(function (a, b) { return a.order - b.order; });

        var html = '<div class="admin-container">';
        html += '<div class="admin-header">';
        html += '<h1>Content Administration</h1>';
        html += '<div style="display:flex;gap:8px">';
        html += '<button class="btn btn-secondary" onclick="Admin.exportData()">Export JSON</button>';
        html += '<label class="btn btn-secondary" style="cursor:pointer">Import JSON<input type="file" accept=".json" onchange="Admin.importData(event)" hidden></label>';
        html += '<button class="btn btn-primary" onclick="Admin.addTopic()">+ Add Topic</button>';
        html += '</div>';
        html += '</div>';

        if (topics.length === 0) {
            html += '<div class="empty-state">';
            html += '<h2>No topics yet</h2>';
            html += '<p>Create your first topic to get started.</p>';
            html += '</div>';
        } else {
            for (var t = 0; t < topics.length; t++) {
                var topic = topics[t];
                html += renderTopicAdmin(topic);
            }
        }

        html += '</div>';
        root.innerHTML = html;
    }

    function renderTopicAdmin(topic) {
        var html = '<div class="chapter-card" style="margin-bottom:16px">';
        html += '<div class="chapter-header" style="display:flex;justify-content:space-between;align-items:flex-start">';
        html += '<div>';
        html += '<h2>' + escapeHtml(topic.title) + '</h2>';
        html += '<p>' + escapeHtml(topic.description) + '</p>';
        html += '<span style="font-size:0.8rem;color:hsl(var(--color-text-muted))">Slug: ' + topic.slug + ' &middot; Order: ' + topic.order + '</span>';
        html += '</div>';
        html += '<div class="item-actions">';
        html += '<button class="btn btn-sm btn-secondary" onclick="Admin.editTopic(\'' + topic.id + '\')">Edit</button>';
        html += '<button class="btn btn-sm btn-primary" onclick="Admin.addChapter(\'' + topic.id + '\')">+ Chapter</button>';
        html += '<button class="btn btn-sm btn-danger" onclick="Admin.deleteTopic(\'' + topic.id + '\')">Delete</button>';
        html += '</div>';
        html += '</div>';

        var chapters = (topic.chapters || []).slice().sort(function (a, b) { return a.order - b.order; });
        if (chapters.length > 0) {
            html += '<div class="item-list">';
            for (var c = 0; c < chapters.length; c++) {
                var ch = chapters[c];
                html += '<div style="border-bottom:1px solid hsl(var(--color-border))">';
                html += '<div class="item-link" style="cursor:default;background:hsl(var(--color-bg-secondary))">';
                html += '<div class="item-info">';
                html += '<div class="item-title" style="font-weight:700">' + escapeHtml(ch.title) + '</div>';
                html += '<div class="item-type">' + escapeHtml(ch.description) + ' &middot; ' + (ch.items ? ch.items.length : 0) + ' items</div>';
                html += '</div>';
                html += '<div class="item-actions">';
                html += '<button class="btn btn-sm btn-secondary" onclick="Admin.editChapter(\'' + topic.id + '\',\'' + ch.id + '\')">Edit</button>';
                html += '<button class="btn btn-sm btn-primary" onclick="Admin.addItem(\'' + topic.id + '\',\'' + ch.id + '\')">+ Item</button>';
                html += '<button class="btn btn-sm btn-danger" onclick="Admin.deleteChapter(\'' + topic.id + '\',\'' + ch.id + '\')">Delete</button>';
                html += '</div>';
                html += '</div>';

                var items = (ch.items || []).slice().sort(function (a, b) { return a.order - b.order; });
                for (var i = 0; i < items.length; i++) {
                    var item = items[i];
                    html += '<div class="item-link" style="padding-left:48px;cursor:default">';
                    html += '<div class="item-info">';
                    html += '<div class="item-title">' + escapeHtml(item.title) + '</div>';
                    html += '<div class="item-type">' + item.type + ' &middot; Order: ' + item.order + '</div>';
                    html += '</div>';
                    html += '<div class="item-actions">';
                    html += '<button class="btn btn-sm btn-secondary" onclick="Admin.editItem(\'' + topic.id + '\',\'' + ch.id + '\',\'' + item.id + '\')">Edit</button>';
                    html += '<button class="btn btn-sm btn-danger" onclick="Admin.deleteItem(\'' + topic.id + '\',\'' + ch.id + '\',\'' + item.id + '\')">Delete</button>';
                    html += '</div>';
                    html += '</div>';
                }
                html += '</div>';
            }
            html += '</div>';
        }

        html += '</div>';
        return html;
    }

    function showModal(title, formHtml, onSave) {
        var overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.innerHTML = '<div class="modal"><h2>' + escapeHtml(title) + '</h2>' +
            '<form id="admin-modal-form">' + formHtml +
            '<div class="form-actions">' +
            '<button type="submit" class="btn btn-primary">Save</button>' +
            '<button type="button" class="btn btn-secondary" onclick="Admin.closeModal()">Cancel</button>' +
            '</div></form></div>';

        document.body.appendChild(overlay);
        overlay.querySelector('.modal').addEventListener('click', function (e) { e.stopPropagation(); });
        overlay.addEventListener('click', function () { Admin.closeModal(); });

        var form = document.getElementById('admin-modal-form');
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            var formData = new FormData(form);
            var data = {};
            formData.forEach(function (value, key) { data[key] = value; });
            onSave(data);
            Admin.closeModal();
        });

        var firstInput = form.querySelector('input, textarea, select');
        if (firstInput) firstInput.focus();
    }

    function closeModal() {
        var overlay = document.querySelector('.modal-overlay');
        if (overlay) overlay.remove();
    }

    function saveAndRefresh() {
        var content = ContentManager.getContent();
        return fetch('/api/content', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(content)
        }).then(function (res) {
            if (!res.ok) throw new Error('Save failed');
            showToast('Saved successfully');
            return ContentManager.refreshData();
        }).then(function () {
            App.render();
        }).catch(function (err) {
            showToast('Error: ' + err.message, true);
        });
    }

    function addTopic() {
        var content = ContentManager.getContent();
        var maxOrder = 0;
        for (var i = 0; i < content.topics.length; i++) {
            if (content.topics[i].order > maxOrder) maxOrder = content.topics[i].order;
        }
        showModal('Add Topic',
            formField('Title', 'title', 'text', '') +
            formField('Description', 'description', 'textarea', '') +
            formField('Image URL (optional)', 'image', 'text', '') +
            formField('Order', 'order', 'number', maxOrder + 1),
            function (data) {
                content.topics.push({
                    id: generateId(),
                    slug: slugify(data.title),
                    title: data.title,
                    description: data.description,
                    image: data.image || '',
                    order: parseInt(data.order) || maxOrder + 1,
                    chapters: []
                });
                ContentManager.setContent(content);
                saveAndRefresh();
            }
        );
    }

    function editTopic(topicId) {
        var content = ContentManager.getContent();
        var topic = findById(content.topics, topicId);
        if (!topic) return;

        showModal('Edit Topic',
            formField('Title', 'title', 'text', topic.title) +
            formField('Slug', 'slug', 'text', topic.slug) +
            formField('Description', 'description', 'textarea', topic.description) +
            formField('Image URL', 'image', 'text', topic.image) +
            formField('Order', 'order', 'number', topic.order),
            function (data) {
                topic.title = data.title;
                topic.slug = data.slug || slugify(data.title);
                topic.description = data.description;
                topic.image = data.image || '';
                topic.order = parseInt(data.order) || 1;
                ContentManager.setContent(content);
                saveAndRefresh();
            }
        );
    }

    function deleteTopic(topicId) {
        if (!confirm('Delete this topic and all its chapters and items?')) return;
        var content = ContentManager.getContent();
        content.topics = content.topics.filter(function (t) { return t.id !== topicId; });
        ContentManager.setContent(content);
        saveAndRefresh();
    }

    function addChapter(topicId) {
        var content = ContentManager.getContent();
        var topic = findById(content.topics, topicId);
        if (!topic) return;
        if (!topic.chapters) topic.chapters = [];

        var maxOrder = 0;
        for (var i = 0; i < topic.chapters.length; i++) {
            if (topic.chapters[i].order > maxOrder) maxOrder = topic.chapters[i].order;
        }

        showModal('Add Chapter to "' + topic.title + '"',
            formField('Title', 'title', 'text', '') +
            formField('Description', 'description', 'textarea', '') +
            formField('Order', 'order', 'number', maxOrder + 1),
            function (data) {
                topic.chapters.push({
                    id: generateId(),
                    slug: slugify(data.title),
                    title: data.title,
                    description: data.description,
                    order: parseInt(data.order) || maxOrder + 1,
                    items: []
                });
                ContentManager.setContent(content);
                saveAndRefresh();
            }
        );
    }

    function editChapter(topicId, chapterId) {
        var content = ContentManager.getContent();
        var topic = findById(content.topics, topicId);
        if (!topic) return;
        var chapter = findById(topic.chapters, chapterId);
        if (!chapter) return;

        showModal('Edit Chapter',
            formField('Title', 'title', 'text', chapter.title) +
            formField('Slug', 'slug', 'text', chapter.slug) +
            formField('Description', 'description', 'textarea', chapter.description) +
            formField('Order', 'order', 'number', chapter.order),
            function (data) {
                chapter.title = data.title;
                chapter.slug = data.slug || slugify(data.title);
                chapter.description = data.description;
                chapter.order = parseInt(data.order) || 1;
                ContentManager.setContent(content);
                saveAndRefresh();
            }
        );
    }

    function deleteChapter(topicId, chapterId) {
        if (!confirm('Delete this chapter and all its items?')) return;
        var content = ContentManager.getContent();
        var topic = findById(content.topics, topicId);
        if (!topic) return;
        topic.chapters = topic.chapters.filter(function (c) { return c.id !== chapterId; });
        ContentManager.setContent(content);
        saveAndRefresh();
    }

    function addItem(topicId, chapterId) {
        var content = ContentManager.getContent();
        var topic = findById(content.topics, topicId);
        if (!topic) return;
        var chapter = findById(topic.chapters, chapterId);
        if (!chapter) return;
        if (!chapter.items) chapter.items = [];

        var maxOrder = 0;
        for (var i = 0; i < chapter.items.length; i++) {
            if (chapter.items[i].order > maxOrder) maxOrder = chapter.items[i].order;
        }

        showModal('Add Item to "' + chapter.title + '"',
            formField('Title', 'title', 'text', '') +
            '<div class="form-group"><label>Type</label><select name="type">' +
            '<option value="text">Text (Markdown)</option>' +
            '<option value="video">Video</option>' +
            '<option value="audio">Audio</option>' +
            '<option value="image">Image</option>' +
            '</select></div>' +
            formField('Content (Markdown for text, URL for media)', 'content', 'textarea', '') +
            formField('Order', 'order', 'number', maxOrder + 1),
            function (data) {
                chapter.items.push({
                    id: generateId(),
                    slug: slugify(data.title),
                    title: data.title,
                    type: data.type,
                    content: data.content,
                    order: parseInt(data.order) || maxOrder + 1
                });
                ContentManager.setContent(content);
                saveAndRefresh();
            }
        );
    }

    function editItem(topicId, chapterId, itemId) {
        var content = ContentManager.getContent();
        var topic = findById(content.topics, topicId);
        if (!topic) return;
        var chapter = findById(topic.chapters, chapterId);
        if (!chapter) return;
        var item = findById(chapter.items, itemId);
        if (!item) return;

        showModal('Edit Item',
            formField('Title', 'title', 'text', item.title) +
            formField('Slug', 'slug', 'text', item.slug) +
            '<div class="form-group"><label>Type</label><select name="type">' +
            '<option value="text"' + (item.type === 'text' ? ' selected' : '') + '>Text (Markdown)</option>' +
            '<option value="video"' + (item.type === 'video' ? ' selected' : '') + '>Video</option>' +
            '<option value="audio"' + (item.type === 'audio' ? ' selected' : '') + '>Audio</option>' +
            '<option value="image"' + (item.type === 'image' ? ' selected' : '') + '>Image</option>' +
            '</select></div>' +
            formField('Content', 'content', 'textarea', item.content) +
            formField('Order', 'order', 'number', item.order),
            function (data) {
                item.title = data.title;
                item.slug = data.slug || slugify(data.title);
                item.type = data.type;
                item.content = data.content;
                item.order = parseInt(data.order) || 1;
                ContentManager.setContent(content);
                saveAndRefresh();
            }
        );
    }

    function deleteItem(topicId, chapterId, itemId) {
        if (!confirm('Delete this item?')) return;
        var content = ContentManager.getContent();
        var topic = findById(content.topics, topicId);
        if (!topic) return;
        var chapter = findById(topic.chapters, chapterId);
        if (!chapter) return;
        chapter.items = chapter.items.filter(function (i) { return i.id !== itemId; });
        ContentManager.setContent(content);
        saveAndRefresh();
    }

    function exportData() {
        var content = ContentManager.getContent();
        var blob = new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'content.json';
        a.click();
        URL.revokeObjectURL(url);
        showToast('Content exported');
    }

    function importData(event) {
        var file = event.target.files[0];
        if (!file) return;

        var reader = new FileReader();
        reader.onload = function (e) {
            try {
                var data = JSON.parse(e.target.result);
                if (!data.topics || !Array.isArray(data.topics)) {
                    throw new Error('Invalid content format');
                }
                ContentManager.setContent(data);
                saveAndRefresh();
                showToast('Content imported successfully');
            } catch (err) {
                showToast('Import error: ' + err.message, true);
            }
        };
        reader.readAsText(file);
        event.target.value = '';
    }

    function formField(label, name, type, value) {
        var val = value !== undefined && value !== null ? value : '';
        if (type === 'textarea') {
            return '<div class="form-group"><label>' + escapeHtml(label) + '</label>' +
                '<textarea name="' + name + '">' + escapeHtml(String(val)) + '</textarea></div>';
        }
        return '<div class="form-group"><label>' + escapeHtml(label) + '</label>' +
            '<input type="' + type + '" name="' + name + '" value="' + escapeAttr(String(val)) + '"></div>';
    }

    function findById(arr, id) {
        if (!arr) return null;
        for (var i = 0; i < arr.length; i++) {
            if (arr[i].id === id) return arr[i];
        }
        return null;
    }

    function escapeHtml(str) {
        var div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function escapeAttr(str) {
        return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function showToast(message, isError) {
        var existing = document.querySelector('.toast');
        if (existing) existing.remove();

        var toast = document.createElement('div');
        toast.className = 'toast' + (isError ? ' error' : '');
        toast.textContent = message;
        document.body.appendChild(toast);

        requestAnimationFrame(function () {
            toast.classList.add('show');
        });

        setTimeout(function () {
            toast.classList.remove('show');
            setTimeout(function () { toast.remove(); }, 300);
        }, 3000);
    }

    return {
        renderAdmin: renderAdmin,
        addTopic: addTopic,
        editTopic: editTopic,
        deleteTopic: deleteTopic,
        addChapter: addChapter,
        editChapter: editChapter,
        deleteChapter: deleteChapter,
        addItem: addItem,
        editItem: editItem,
        deleteItem: deleteItem,
        exportData: exportData,
        importData: importData,
        closeModal: closeModal
    };
})();

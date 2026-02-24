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
        html += '<h1>Administracao de Conteudo</h1>';
        html += '<div style="display:flex;gap:8px;flex-wrap:wrap">';
        html += '<button class="btn btn-secondary" onclick="Admin.exportData()">Exportar JSON</button>';
        html += '<label class="btn btn-secondary" style="cursor:pointer">Importar JSON<input type="file" accept=".json" onchange="Admin.importData(event)" hidden></label>';
        html += '<button class="btn btn-primary" onclick="Admin.addTopic()">+ Novo Topico</button>';
        html += '</div>';
        html += '</div>';

        if (topics.length === 0) {
            html += '<div class="empty-state">';
            html += '<h2>Nenhum topico ainda</h2>';
            html += '<p>Crie seu primeiro topico para comecar.</p>';
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
        var iconName = topic.icon || 'book';
        var html = '<div class="chapter-card" style="margin-bottom:16px">';
        html += '<div class="chapter-header" style="display:flex;justify-content:space-between;align-items:flex-start">';
        html += '<div style="display:flex;gap:12px;align-items:flex-start">';
        html += '<div class="card-icon" style="flex-shrink:0;margin-bottom:0">' + App.getIconSvg(iconName) + '</div>';
        html += '<div>';
        html += '<h2>' + escapeHtml(topic.title) + '</h2>';
        html += '<p>' + escapeHtml(topic.description) + '</p>';
        html += '<span style="font-size:0.8rem;color:hsl(var(--color-text-muted))">Slug: ' + topic.slug + ' &middot; Ordem: ' + topic.order + ' &middot; Icone: ' + iconName + '</span>';
        html += '</div>';
        html += '</div>';
        html += '<div class="item-actions">';
        html += '<button class="btn btn-sm btn-secondary" onclick="Admin.editTopic(\'' + topic.id + '\')">Editar</button>';
        html += '<button class="btn btn-sm btn-primary" onclick="Admin.addChapter(\'' + topic.id + '\')">+ Capitulo</button>';
        html += '<button class="btn btn-sm btn-danger" onclick="Admin.deleteTopic(\'' + topic.id + '\')">Excluir</button>';
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
                html += '<div class="item-type">' + escapeHtml(ch.description) + ' &middot; ' + (ch.items ? ch.items.length : 0) + ' ite' + ((ch.items ? ch.items.length : 0) !== 1 ? 'ns' : 'm') + '</div>';
                html += '</div>';
                html += '<div class="item-actions">';
                html += '<button class="btn btn-sm btn-secondary" onclick="Admin.editChapter(\'' + topic.id + '\',\'' + ch.id + '\')">Editar</button>';
                html += '<button class="btn btn-sm btn-primary" onclick="Admin.addItem(\'' + topic.id + '\',\'' + ch.id + '\')">+ Item</button>';
                html += '<button class="btn btn-sm btn-danger" onclick="Admin.deleteChapter(\'' + topic.id + '\',\'' + ch.id + '\')">Excluir</button>';
                html += '</div>';
                html += '</div>';

                var items = (ch.items || []).slice().sort(function (a, b) { return a.order - b.order; });
                for (var i = 0; i < items.length; i++) {
                    var item = items[i];
                    var typeLabel = { text: 'Texto', video: 'Video', audio: 'Audio', image: 'Imagem' }[item.type] || item.type;
                    html += '<div class="item-link" style="padding-left:48px;cursor:default">';
                    html += '<div class="item-info">';
                    html += '<div class="item-title">' + escapeHtml(item.title) + '</div>';
                    html += '<div class="item-type">' + typeLabel + ' &middot; Ordem: ' + item.order + '</div>';
                    html += '</div>';
                    html += '<div class="item-actions">';
                    html += '<button class="btn btn-sm btn-secondary" onclick="Admin.editItem(\'' + topic.id + '\',\'' + ch.id + '\',\'' + item.id + '\')">Editar</button>';
                    html += '<button class="btn btn-sm btn-danger" onclick="Admin.deleteItem(\'' + topic.id + '\',\'' + ch.id + '\',\'' + item.id + '\')">Excluir</button>';
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
            '<button type="submit" class="btn btn-primary">Salvar</button>' +
            '<button type="button" class="btn btn-secondary" onclick="Admin.closeModal()">Cancelar</button>' +
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
            if (!res.ok) throw new Error('Falha ao salvar');
            showToast('Salvo com sucesso');
            return ContentManager.refreshData();
        }).then(function () {
            App.render();
        }).catch(function (err) {
            showToast('Erro: ' + err.message, true);
        });
    }

    function buildIconPicker(selectedIcon) {
        var icons = Object.keys(App.TOPIC_ICONS);
        var html = '<div class="form-group"><label>Icone</label>';
        html += '<div class="icon-picker">';
        for (var i = 0; i < icons.length; i++) {
            var name = icons[i];
            var isSelected = name === (selectedIcon || 'book');
            html += '<label class="icon-option' + (isSelected ? ' selected' : '') + '">';
            html += '<input type="radio" name="icon" value="' + name + '"' + (isSelected ? ' checked' : '') + '>';
            html += '<div class="icon-option-inner" title="' + name + '">' + App.getIconSvg(name) + '</div>';
            html += '</label>';
        }
        html += '</div></div>';
        return html;
    }

    function addTopic() {
        var content = ContentManager.getContent();
        var maxOrder = 0;
        for (var i = 0; i < content.topics.length; i++) {
            if (content.topics[i].order > maxOrder) maxOrder = content.topics[i].order;
        }
        showModal('Novo Topico',
            formField('Titulo', 'title', 'text', '') +
            formField('Descricao', 'description', 'textarea', '') +
            buildIconPicker('book') +
            formField('URL da Imagem (opcional)', 'image', 'text', '') +
            formField('Ordem', 'order', 'number', maxOrder + 1),
            function (data) {
                content.topics.push({
                    id: generateId(),
                    slug: slugify(data.title),
                    title: data.title,
                    description: data.description,
                    icon: data.icon || 'book',
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

        showModal('Editar Topico',
            formField('Titulo', 'title', 'text', topic.title) +
            formField('Slug', 'slug', 'text', topic.slug) +
            formField('Descricao', 'description', 'textarea', topic.description) +
            buildIconPicker(topic.icon || 'book') +
            formField('URL da Imagem', 'image', 'text', topic.image) +
            formField('Ordem', 'order', 'number', topic.order),
            function (data) {
                topic.title = data.title;
                topic.slug = data.slug || slugify(data.title);
                topic.description = data.description;
                topic.icon = data.icon || 'book';
                topic.image = data.image || '';
                topic.order = parseInt(data.order) || 1;
                ContentManager.setContent(content);
                saveAndRefresh();
            }
        );
    }

    function deleteTopic(topicId) {
        if (!confirm('Excluir este topico e todos os seus capitulos e itens?')) return;
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

        showModal('Novo Capitulo em "' + topic.title + '"',
            formField('Titulo', 'title', 'text', '') +
            formField('Descricao', 'description', 'textarea', '') +
            formField('Ordem', 'order', 'number', maxOrder + 1),
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

        showModal('Editar Capitulo',
            formField('Titulo', 'title', 'text', chapter.title) +
            formField('Slug', 'slug', 'text', chapter.slug) +
            formField('Descricao', 'description', 'textarea', chapter.description) +
            formField('Ordem', 'order', 'number', chapter.order),
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
        if (!confirm('Excluir este capitulo e todos os seus itens?')) return;
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

        showModal('Novo Item em "' + chapter.title + '"',
            formField('Titulo', 'title', 'text', '') +
            '<div class="form-group"><label>Tipo</label><select name="type">' +
            '<option value="text">Texto (Markdown)</option>' +
            '<option value="video">Video (URL ou YouTube)</option>' +
            '<option value="audio">Audio (URL ou YouTube)</option>' +
            '<option value="image">Imagem</option>' +
            '</select></div>' +
            formField('Conteudo (Markdown para texto, URL para midia)', 'content', 'textarea', '') +
            formField('Ordem', 'order', 'number', maxOrder + 1),
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

        showModal('Editar Item',
            formField('Titulo', 'title', 'text', item.title) +
            formField('Slug', 'slug', 'text', item.slug) +
            '<div class="form-group"><label>Tipo</label><select name="type">' +
            '<option value="text"' + (item.type === 'text' ? ' selected' : '') + '>Texto (Markdown)</option>' +
            '<option value="video"' + (item.type === 'video' ? ' selected' : '') + '>Video (URL ou YouTube)</option>' +
            '<option value="audio"' + (item.type === 'audio' ? ' selected' : '') + '>Audio (URL ou YouTube)</option>' +
            '<option value="image"' + (item.type === 'image' ? ' selected' : '') + '>Imagem</option>' +
            '</select></div>' +
            formField('Conteudo', 'content', 'textarea', item.content) +
            formField('Ordem', 'order', 'number', item.order),
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
        if (!confirm('Excluir este item?')) return;
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
        showToast('Conteudo exportado');
    }

    function importData(event) {
        var file = event.target.files[0];
        if (!file) return;

        var reader = new FileReader();
        reader.onload = function (e) {
            try {
                var data = JSON.parse(e.target.result);
                if (!data.topics || !Array.isArray(data.topics)) {
                    throw new Error('Formato de conteudo invalido');
                }
                ContentManager.setContent(data);
                saveAndRefresh();
                showToast('Conteudo importado com sucesso');
            } catch (err) {
                showToast('Erro na importacao: ' + err.message, true);
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

/**
 * Design Ideas 页面脚本
 */

class DesignIdeasManager {
    constructor() {
        this.gamesStorageKey = 'design-games';
        this.ideasStorageKey = 'design-ideas';
        this.gamesOrderKey = 'design-games-order';
        this.ideasOrderKey = 'design-ideas-order';
        this.games = [];
        this.ideas = [];
        this.currentGameId = this.getGameIdFromURL();
        this.filteredIdeas = [];
        this.currentFilter = {
            tag: '',
            search: ''
        };
        this.isLoading = false;

        this.init();
    }

    async init() {
        this.initEventListeners();
        await this.loadAllData();
        this.updateGameSelects();
        await this.render();
        this.updateUIForAuth();
    }

    // 从URL获取游戏ID
    getGameIdFromURL() {
        const params = new URLSearchParams(window.location.search);
        return params.get('game') || '';
    }

    // 更新URL
    updateURL(gameId = '') {
        const url = new URL(window.location);
        if (gameId) {
            url.searchParams.set('game', gameId);
        } else {
            url.searchParams.delete('game');
        }
        window.history.pushState({ gameId }, '', url);
    }

    // 加载所有数据（优先从 GitHub 读取）
    async loadAllData() {
        this.isLoading = true;
        try {
            // 尝试从 GitHub 读取
            if (window.githubAPI) {
                const [games, ideas] = await Promise.all([
                    window.githubAPI.loadGames(),
                    window.githubAPI.loadIdeas()
                ]);
                
                if (games !== null) {
                    this.games = games;
                } else {
                    // GitHub 没有数据，从 localStorage 读取
                    this.games = this.loadGamesFromLocal();
                }
                
                if (ideas !== null) {
                    this.ideas = ideas;
                } else {
                    // GitHub 没有数据，从 localStorage 读取
                    this.ideas = this.loadIdeasFromLocal();
                }
            } else {
                // 如果没有 GitHub API，从 localStorage 读取
                this.games = this.loadGamesFromLocal();
                this.ideas = this.loadIdeasFromLocal();
            }
        } catch (error) {
            console.error('加载数据失败，使用本地数据:', error);
            // 失败时使用本地数据
            this.games = this.loadGamesFromLocal();
            this.ideas = this.loadIdeasFromLocal();
        } finally {
            this.isLoading = false;
        }
    }

    // 从 localStorage 加载游戏数据
    loadGamesFromLocal() {
        try {
            const data = localStorage.getItem(this.gamesStorageKey);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('加载本地游戏数据失败:', error);
            return [];
        }
    }

    // 从 localStorage 加载想法数据
    loadIdeasFromLocal() {
        try {
            const data = localStorage.getItem(this.ideasStorageKey);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('加载本地想法数据失败:', error);
            return [];
        }
    }

    // 保存游戏数据
    async saveGames() {
        const isLoggedIn = window.authManager?.isLoggedIn();
        const hasToken = window.authManager?.hasGitHubToken();
        
        if (isLoggedIn && hasToken && window.githubAPI) {
            // 登录且有 token，保存到 GitHub
            try {
                await window.githubAPI.saveGames(this.games);
                // 同时保存到本地作为备份
                this.saveGamesToLocal();
                return true;
            } catch (error) {
                console.error('保存到 GitHub 失败:', error);
                alert('保存到服务器失败，已保存到本地。请检查 GitHub Token 是否正确。');
                // 失败时保存到本地
                this.saveGamesToLocal();
                return false;
            }
        } else {
            // 未登录或没有 token，只保存到本地
            this.saveGamesToLocal();
            if (!isLoggedIn) {
                alert('您未登录，数据仅保存在本地。登录后可同步到服务器。');
            } else if (!hasToken) {
                alert('未配置 GitHub Token，数据仅保存在本地。请在设置中配置 Token。');
            }
            return false;
        }
    }

    // 保存到本地
    saveGamesToLocal() {
        try {
            localStorage.setItem(this.gamesStorageKey, JSON.stringify(this.games));
        } catch (error) {
            console.error('保存本地游戏数据失败:', error);
            alert('保存失败，请检查浏览器存储空间');
        }
    }

    // 保存想法数据
    async saveIdeas() {
        const isLoggedIn = window.authManager?.isLoggedIn();
        const hasToken = window.authManager?.hasGitHubToken();
        
        if (isLoggedIn && hasToken && window.githubAPI) {
            // 登录且有 token，保存到 GitHub
            try {
                await window.githubAPI.saveIdeas(this.ideas);
                // 同时保存到本地作为备份
                this.saveIdeasToLocal();
                return true;
            } catch (error) {
                console.error('保存到 GitHub 失败:', error);
                alert('保存到服务器失败，已保存到本地。请检查 GitHub Token 是否正确。');
                // 失败时保存到本地
                this.saveIdeasToLocal();
                return false;
            }
        } else {
            // 未登录或没有 token，只保存到本地
            this.saveIdeasToLocal();
            if (!isLoggedIn) {
                alert('您未登录，数据仅保存在本地。登录后可同步到服务器。');
            } else if (!hasToken) {
                alert('未配置 GitHub Token，数据仅保存在本地。请在设置中配置 Token。');
            }
            return false;
        }
    }

    // 保存到本地
    saveIdeasToLocal() {
        try {
            localStorage.setItem(this.ideasStorageKey, JSON.stringify(this.ideas));
        } catch (error) {
            console.error('保存本地想法数据失败:', error);
            alert('保存失败，请检查浏览器存储空间');
        }
    }

    // 获取游戏名称（通过ID）
    getGameName(gameId) {
        if (!gameId) return '未分类';
        const game = this.games.find(g => g.id === gameId);
        return game ? game.name : '未分类';
    }

    // 获取游戏想法数量
    getGameIdeasCount(gameId) {
        return this.ideas.filter(i => i.gameId === gameId).length;
    }

    // 更新游戏下拉选择框
    updateGameSelects() {
        const gameSelect = document.getElementById('idea-game');
        if (!gameSelect) return;
        
        const currentGameId = gameSelect.value || this.currentGameId;
        gameSelect.innerHTML = '<option value="">请选择游戏</option>';
        this.games.forEach(game => {
            const option = document.createElement('option');
            option.value = game.id;
            option.textContent = game.name;
            gameSelect.appendChild(option);
        });
        if (currentGameId) {
            gameSelect.value = currentGameId;
        }
    }

    // 渲染主视图
    async render() {
        if (this.currentGameId) {
            await this.showGameView();
        } else {
            await this.showGamesView();
        }
    }

    // 显示游戏列表视图
    async showGamesView() {
        document.getElementById('games-view').style.display = 'block';
        document.getElementById('game-view').style.display = 'none';
        await this.renderGames();
    }

    // 显示游戏详情视图
    showGameView() {
        document.getElementById('games-view').style.display = 'none';
        document.getElementById('game-view').style.display = 'block';
        
        const game = this.games.find(g => g.id === this.currentGameId);
        if (game) {
            document.getElementById('game-title').textContent = game.name;
        }
        
        this.initFilters();
        this.applyFilters();
    }

    // 更新 UI 权限控制
    updateUIForAuth() {
        const isLoggedIn = window.authManager?.isLoggedIn() || false;
        
        // 控制编辑按钮显示
        const newGameBtn = document.getElementById('new-game-btn');
        const newIdeaBtn = document.getElementById('new-idea-btn');
        const editButtons = document.querySelectorAll('.game-card-action-btn');
        
        if (isLoggedIn) {
            // 已登录，显示所有编辑功能
            if (newGameBtn) newGameBtn.style.display = 'inline-block';
            if (newIdeaBtn) newIdeaBtn.style.display = 'inline-block';
            editButtons.forEach(btn => btn.style.display = 'flex');
        } else {
            // 未登录，隐藏编辑功能
            if (newGameBtn) newGameBtn.style.display = 'none';
            if (newIdeaBtn) newIdeaBtn.style.display = 'none';
            editButtons.forEach(btn => btn.style.display = 'none');
        }
        
        // 更新登录状态显示
        this.updateLoginStatus();
    }

    // 更新登录状态显示（已移至首页，此方法保留用于兼容）
    updateLoginStatus() {
        // 登录功能已移至首页，此方法不再需要
    }

    // 渲染游戏列表
    async renderGames() {
        const container = document.getElementById('games-container');
        
        if (this.games.length === 0) {
            container.innerHTML = '<div class="empty-state">暂无游戏，点击"新游戏"开始创建吧！</div>';
            return;
        }

        // 按保存的顺序排序
        const orderedGames = await this.getOrderedGames();

        let html = '';
        orderedGames.forEach(game => {
            const ideasCount = this.getGameIdeasCount(game.id);
            html += `
                <div class="game-card" draggable="true" data-game-id="${game.id}">
                    <div class="game-card-actions">
                        <button class="game-card-action-btn edit-btn" data-action="edit" data-game-id="${game.id}" title="编辑游戏">✏️</button>
                        <button class="game-card-action-btn delete-btn" data-action="delete" data-game-id="${game.id}" title="删除游戏">🗑️</button>
                    </div>
                    <h3 class="game-card-name">${this.escapeHtml(game.name)}</h3>
                    <div class="game-card-description">${this.escapeHtml(game.description || '暂无描述')}</div>
                    <div class="game-card-footer">
                        <span class="game-card-ideas-count">${ideasCount} 个想法</span>
                        <span>${this.formatDate(game.createdAt)}</span>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;

        // 添加卡片点击事件
        container.querySelectorAll('.game-card').forEach(card => {
            card.addEventListener('click', (e) => {
                // 如果点击的是操作按钮，不触发导航
                if (e.target.closest('.game-card-actions')) {
                    return;
                }
                const gameId = card.dataset.gameId;
                this.navigateToGame(gameId);
            });
        });

        // 添加编辑和删除按钮事件
        container.querySelectorAll('.game-card-action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = btn.dataset.action;
                const gameId = btn.dataset.gameId;
                
                if (action === 'edit') {
                    this.openGameModal(gameId);
                } else if (action === 'delete') {
                    const game = this.games.find(g => g.id === gameId);
                    const ideasCount = this.getGameIdeasCount(gameId);
                    if (confirm(`确定要删除游戏"${game.name}"吗？\n删除后该游戏下的 ${ideasCount} 个想法也将被删除！`)) {
                        await this.deleteGameById(gameId);
                    }
                }
            });
        });

        // 初始化拖动排序
        this.initGamesDragSort();
    }

    // 获取有序的游戏列表
    async getOrderedGames() {
        const savedOrder = await this.loadGamesOrder();
        if (!savedOrder || savedOrder.length === 0) {
            return [...this.games];
        }

        // 按保存的顺序排序
        const ordered = savedOrder.map(id => 
            this.games.find(g => g.id === id)
        ).filter(Boolean);

        // 添加新游戏（不在顺序中的）
        this.games.forEach(game => {
            if (!savedOrder.includes(game.id)) {
                ordered.push(game);
            }
        });

        return ordered;
    }

    // 初始化游戏拖动排序
    initGamesDragSort() {
        const container = document.getElementById('games-container');
        if (!container) return;

        const cards = container.querySelectorAll('.game-card');
        let draggedElement = null;

        cards.forEach(card => {
            card.addEventListener('dragstart', (e) => {
                draggedElement = card;
                card.style.opacity = '0.5';
                e.dataTransfer.effectAllowed = 'move';
            });

            card.addEventListener('dragend', () => {
                card.style.opacity = '1';
                container.querySelectorAll('.game-card').forEach(c => {
                    c.classList.remove('drag-over');
                });
            });

            card.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                
                if (draggedElement && draggedElement !== card) {
                    const rect = card.getBoundingClientRect();
                    const next = (e.clientY - rect.top) / (rect.bottom - rect.top) > 0.5;
                    
                    container.querySelectorAll('.game-card').forEach(c => {
                        c.classList.remove('drag-over');
                    });
                    card.classList.add('drag-over');
                }
            });

            card.addEventListener('dragenter', (e) => {
                e.preventDefault();
                if (draggedElement && draggedElement !== card) {
                    card.classList.add('drag-over');
                }
            });

            card.addEventListener('dragleave', () => {
                card.classList.remove('drag-over');
            });

            card.addEventListener('drop', (e) => {
                e.preventDefault();
                card.classList.remove('drag-over');

                if (draggedElement && draggedElement !== card) {
                    const rect = card.getBoundingClientRect();
                    const next = (e.clientY - rect.top) / (rect.bottom - rect.top) > 0.5;
                    
                    if (next) {
                        container.insertBefore(draggedElement, card.nextSibling);
                    } else {
                        container.insertBefore(draggedElement, card);
                    }
                    
                    this.saveGamesOrder();
                }
            });
        });
    }

    // 保存游戏顺序
    async saveGamesOrder() {
        const container = document.getElementById('games-container');
        if (!container) return;

        const order = Array.from(container.querySelectorAll('.game-card')).map(
            card => card.dataset.gameId
        );
        
        // 保存到本地
        localStorage.setItem(this.gamesOrderKey, JSON.stringify(order));
        
        // 如果登录且有 token，保存到 GitHub
        const isLoggedIn = window.authManager?.isLoggedIn();
        const hasToken = window.authManager?.hasGitHubToken();
        if (isLoggedIn && hasToken && window.githubAPI) {
            try {
                await window.githubAPI.saveGamesOrder(order);
            } catch (error) {
                console.error('保存游戏顺序到 GitHub 失败:', error);
            }
        }
    }

    // 加载游戏顺序
    async loadGamesOrder() {
        // 优先从 GitHub 读取
        if (window.githubAPI) {
            try {
                const order = await window.githubAPI.loadGamesOrder();
                if (order !== null) {
                    return order;
                }
            } catch (error) {
                console.error('从 GitHub 加载游戏顺序失败:', error);
            }
        }
        
        // 从本地读取
        try {
            const order = localStorage.getItem(this.gamesOrderKey);
            return order ? JSON.parse(order) : null;
        } catch (error) {
            console.error('加载本地游戏顺序失败:', error);
            return null;
        }
    }

    // 导航到游戏页面
    async navigateToGame(gameId) {
        this.currentGameId = gameId;
        this.updateURL(gameId);
        await this.render();
    }

    // 返回游戏列表
    async goBack() {
        this.currentGameId = '';
        this.updateURL('');
        await this.render();
    }

    // 初始化事件监听
    initEventListeners() {
        // 新游戏按钮
        const newGameBtn = document.getElementById('new-game-btn');
        if (newGameBtn) {
            newGameBtn.addEventListener('click', () => {
                if (!window.authManager?.isLoggedIn()) {
                    alert('请先登录以编辑内容。请返回首页进行登录。');
                    return;
                }
                this.openGameModal();
            });
        }

        // 返回按钮
        const backBtn = document.getElementById('back-btn');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                this.goBack();
            });
        }

        // 新灵感按钮
        const newIdeaBtn = document.getElementById('new-idea-btn');
        if (newIdeaBtn) {
            newIdeaBtn.addEventListener('click', () => {
                if (!window.authManager?.isLoggedIn()) {
                    alert('请先登录以编辑内容。请返回首页进行登录。');
                    return;
                }
                if (this.games.length === 0) {
                    alert('请先创建游戏项目！');
                    this.openGameModal();
                    return;
                }
                this.openIdeaModal();
            });
        }

        // 搜索
        const searchInput = document.getElementById('search-input');
        const searchButton = document.getElementById('search-button');
        
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                this.currentFilter.search = searchInput.value.toLowerCase();
                this.applyFilters();
            });

            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.currentFilter.search = searchInput.value.toLowerCase();
                    this.applyFilters();
                }
            });
        }

        if (searchButton) {
            searchButton.addEventListener('click', () => {
                if (searchInput) {
                    this.currentFilter.search = searchInput.value.toLowerCase();
                    this.applyFilters();
                }
            });
        }

        // 标签筛选
        const tagFilter = document.getElementById('tag-filter');
        if (tagFilter) {
            tagFilter.addEventListener('change', (e) => {
                this.currentFilter.tag = e.target.value;
                this.applyFilters();
            });
        }

        // 游戏弹窗
        const gameModalClose = document.getElementById('game-modal-close');
        if (gameModalClose) {
            gameModalClose.addEventListener('click', () => {
                this.closeGameModal();
            });
        }

        const gameModalCancel = document.getElementById('game-modal-cancel');
        if (gameModalCancel) {
            gameModalCancel.addEventListener('click', () => {
                this.closeGameModal();
            });
        }

        const gameModalSave = document.getElementById('game-modal-save');
        if (gameModalSave) {
            gameModalSave.addEventListener('click', async () => {
                await this.saveGame();
            });
        }

        const gameModalDelete = document.getElementById('game-modal-delete');
        if (gameModalDelete) {
            gameModalDelete.addEventListener('click', async () => {
                if (confirm('确定要删除这个游戏吗？删除后该游戏下的所有想法也将被删除！')) {
                    await this.deleteGame();
                }
            });
        }

        const gameModal = document.getElementById('game-modal');
        if (gameModal) {
            gameModal.addEventListener('click', (e) => {
                if (e.target.id === 'game-modal') {
                    this.closeGameModal();
                }
            });
        }

        // 想法弹窗
        const modalClose = document.getElementById('modal-close');
        if (modalClose) {
            modalClose.addEventListener('click', () => {
                this.closeIdeaModal();
            });
        }

        const modalCancel = document.getElementById('modal-cancel');
        if (modalCancel) {
            modalCancel.addEventListener('click', () => {
                this.closeIdeaModal();
            });
        }

        const modalSave = document.getElementById('modal-save');
        if (modalSave) {
            modalSave.addEventListener('click', async () => {
                await this.saveIdea();
            });
        }

        const modalDelete = document.getElementById('modal-delete');
        if (modalDelete) {
            modalDelete.addEventListener('click', async () => {
                if (confirm('确定要删除这个想法吗？')) {
                    await this.deleteIdea();
                }
            });
        }

        const editModal = document.getElementById('edit-modal');
        if (editModal) {
            editModal.addEventListener('click', (e) => {
                if (e.target.id === 'edit-modal') {
                    this.closeIdeaModal();
                }
            });
        }

        // 浏览器前进后退
        window.addEventListener('popstate', async (e) => {
            this.currentGameId = this.getGameIdFromURL();
            await this.render();
        });

    }


    // 初始化筛选器选项
    initFilters() {
        if (!this.currentGameId) return;

        const tags = new Set();
        const gameIdeas = this.ideas.filter(i => i.gameId === this.currentGameId);

        gameIdeas.forEach(idea => {
            if (idea.tags && idea.tags.length > 0) {
                idea.tags.forEach(tag => tags.add(tag));
            }
        });

        const tagFilter = document.getElementById('tag-filter');
        if (tagFilter) {
            const currentTag = tagFilter.value;
            tagFilter.innerHTML = '<option value="">所有标签</option>';
            Array.from(tags).sort().forEach(tag => {
                const option = document.createElement('option');
                option.value = tag;
                option.textContent = tag;
                tagFilter.appendChild(option);
            });
            tagFilter.value = currentTag;
        }
    }

    // 应用筛选
    applyFilters() {
        if (!this.currentGameId) return;

        this.filteredIdeas = this.ideas.filter(idea => {
            // 只显示当前游戏的想法
            if (idea.gameId !== this.currentGameId) {
                return false;
            }

            // 标签筛选
            if (this.currentFilter.tag) {
                if (!idea.tags || !idea.tags.includes(this.currentFilter.tag)) {
                    return false;
                }
            }

            // 搜索筛选
            if (this.currentFilter.search) {
                const searchText = this.currentFilter.search;
                const searchableText = [
                    idea.title,
                    idea.content,
                    ...(idea.tags || [])
                ].join(' ').toLowerCase();

                if (!searchableText.includes(searchText)) {
                    return false;
                }
            }

            return true;
        });

        this.renderIdeas();
    }

    // 渲染想法卡片
    async renderIdeas() {
        const container = document.getElementById('ideas-container');
        if (!container) return;
        
        if (this.filteredIdeas.length === 0) {
            container.innerHTML = '<div class="empty-state">暂无想法，点击"新灵感"开始记录吧！</div>';
            return;
        }

        // 按保存的顺序排序
        const orderedIdeas = await this.getOrderedIdeas();

        let html = '';
        orderedIdeas.forEach(idea => {
            html += this.renderIdeaCard(idea);
        });

        container.innerHTML = html;

        // 添加卡片点击事件
        container.querySelectorAll('.idea-card').forEach(card => {
            card.addEventListener('click', () => {
                const ideaId = card.dataset.ideaId;
                this.openIdeaModal(ideaId);
            });
        });

        // 初始化拖动排序
        this.initIdeasDragSort();
    }

    // 获取有序的想法列表
    async getOrderedIdeas() {
        const savedOrder = await this.loadIdeasOrder();
        if (!savedOrder || savedOrder.length === 0) {
            return [...this.filteredIdeas];
        }

        // 按保存的顺序排序
        const ordered = savedOrder.map(id => 
            this.filteredIdeas.find(i => i.id === id)
        ).filter(Boolean);

        // 添加新想法（不在顺序中的）
        this.filteredIdeas.forEach(idea => {
            if (!savedOrder.includes(idea.id)) {
                ordered.push(idea);
            }
        });

        return ordered;
    }

    // 初始化想法拖动排序
    initIdeasDragSort() {
        const container = document.getElementById('ideas-container');
        if (!container) return;

        const cards = container.querySelectorAll('.idea-card');
        let draggedElement = null;

        cards.forEach(card => {
            card.setAttribute('draggable', 'true');
            
            card.addEventListener('dragstart', (e) => {
                draggedElement = card;
                card.style.opacity = '0.5';
                e.dataTransfer.effectAllowed = 'move';
            });

            card.addEventListener('dragend', () => {
                card.style.opacity = '1';
                container.querySelectorAll('.idea-card').forEach(c => {
                    c.classList.remove('drag-over');
                });
            });

            card.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                
                if (draggedElement && draggedElement !== card) {
                    const rect = card.getBoundingClientRect();
                    const next = (e.clientY - rect.top) / (rect.bottom - rect.top) > 0.5;
                    
                    container.querySelectorAll('.idea-card').forEach(c => {
                        c.classList.remove('drag-over');
                    });
                    card.classList.add('drag-over');
                }
            });

            card.addEventListener('dragenter', (e) => {
                e.preventDefault();
                if (draggedElement && draggedElement !== card) {
                    card.classList.add('drag-over');
                }
            });

            card.addEventListener('dragleave', () => {
                card.classList.remove('drag-over');
            });

            card.addEventListener('drop', (e) => {
                e.preventDefault();
                card.classList.remove('drag-over');

                if (draggedElement && draggedElement !== card) {
                    const rect = card.getBoundingClientRect();
                    const next = (e.clientY - rect.top) / (rect.bottom - rect.top) > 0.5;
                    
                    if (next) {
                        container.insertBefore(draggedElement, card.nextSibling);
                    } else {
                        container.insertBefore(draggedElement, card);
                    }
                    
                    this.saveIdeasOrder();
                }
            });
        });
    }

    // 保存想法顺序
    async saveIdeasOrder() {
        const container = document.getElementById('ideas-container');
        if (!container) return;

        const order = Array.from(container.querySelectorAll('.idea-card')).map(
            card => card.dataset.ideaId
        );
        
        // 保存到本地
        const key = `${this.ideasOrderKey}-${this.currentGameId}`;
        localStorage.setItem(key, JSON.stringify(order));
        
        // 如果登录且有 token，保存到 GitHub
        const isLoggedIn = window.authManager?.isLoggedIn();
        const hasToken = window.authManager?.hasGitHubToken();
        if (isLoggedIn && hasToken && window.githubAPI && this.currentGameId) {
            try {
                await window.githubAPI.saveIdeasOrder(this.currentGameId, order);
            } catch (error) {
                console.error('保存想法顺序到 GitHub 失败:', error);
            }
        }
    }

    // 加载想法顺序
    async loadIdeasOrder() {
        // 优先从 GitHub 读取
        if (window.githubAPI && this.currentGameId) {
            try {
                const order = await window.githubAPI.loadIdeasOrder(this.currentGameId);
                if (order !== null) {
                    return order;
                }
            } catch (error) {
                console.error('从 GitHub 加载想法顺序失败:', error);
            }
        }
        
        // 从本地读取
        try {
            const key = `${this.ideasOrderKey}-${this.currentGameId}`;
            const order = localStorage.getItem(key);
            return order ? JSON.parse(order) : null;
        } catch (error) {
            console.error('加载本地想法顺序失败:', error);
            return null;
        }
    }

    // 渲染单个想法卡片
    renderIdeaCard(idea) {
        const tags = idea.tags && idea.tags.length > 0
            ? idea.tags.map(tag => `<span class="idea-tag">${this.escapeHtml(tag)}</span>`).join('')
            : '';

        return `
            <div class="idea-card" data-idea-id="${idea.id}">
                <div class="idea-card-header">
                    <h3 class="idea-title">${this.escapeHtml(idea.title)}</h3>
                </div>
                <div class="idea-content">${this.escapeHtml(idea.content || '')}</div>
                ${tags ? `<div class="idea-tags">${tags}</div>` : ''}
                <div class="idea-footer">
                    <span class="idea-status ${idea.status || '草稿'}">${idea.status || '草稿'}</span>
                    <span class="idea-priority ${idea.priority || '中'}">${idea.priority || '中'}</span>
                    <span>${this.formatDate(idea.createdAt)}</span>
                </div>
            </div>
        `;
    }

    // ========== 游戏管理 ==========

    // 打开游戏编辑弹窗
    openGameModal(gameId = null) {
        const modal = document.getElementById('game-modal');
        const form = document.getElementById('game-form');
        const deleteBtn = document.getElementById('game-modal-delete');
        const title = document.getElementById('game-modal-title');

        if (gameId) {
            // 编辑模式
            const game = this.games.find(g => g.id === gameId);
            if (!game) return;

            document.getElementById('game-id').value = game.id;
            document.getElementById('game-name').value = game.name || '';
            document.getElementById('game-description').value = game.description || '';

            title.textContent = '编辑游戏';
            deleteBtn.style.display = 'inline-block';
        } else {
            // 新建模式
            form.reset();
            document.getElementById('game-id').value = '';

            title.textContent = '新游戏';
            deleteBtn.style.display = 'none';
        }

        modal.classList.add('active');
    }

    // 关闭游戏弹窗
    closeGameModal() {
        const modal = document.getElementById('game-modal');
        modal.classList.remove('active');
    }

    // 保存游戏
    async saveGame() {
        const form = document.getElementById('game-form');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const gameId = document.getElementById('game-id').value;
        const gameName = document.getElementById('game-name').value.trim();

        // 检查重名
        if (!gameId) {
            const existingGame = this.games.find(g => g.name === gameName);
            if (existingGame) {
                alert('游戏名称已存在！');
                return;
            }
        }

        const game = {
            id: gameId || this.generateGameId(),
            name: gameName,
            description: document.getElementById('game-description').value.trim(),
            createdAt: gameId ? this.games.find(g => g.id === gameId)?.createdAt || new Date().toISOString() : new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        if (gameId) {
            // 更新
            const index = this.games.findIndex(g => g.id === gameId);
            if (index !== -1) {
                this.games[index] = game;
            }
        } else {
            // 新建
            this.games.push(game);
        }

        await this.saveGames();
        await this.saveGamesOrder(); // 更新顺序
        this.updateGameSelects();
        await this.render();
        this.closeGameModal();
    }

    // 删除游戏（从弹窗）
    async deleteGame() {
        const gameId = document.getElementById('game-id').value;
        if (!gameId) return;
        this.deleteGameById(gameId);
        this.closeGameModal();
    }

    // 删除游戏（通过ID）
    async deleteGameById(gameId) {
        if (!gameId) return;

        // 删除游戏下的所有想法
        this.ideas = this.ideas.filter(i => i.gameId !== gameId);
        await this.saveIdeas();

        // 删除游戏
        this.games = this.games.filter(g => g.id !== gameId);
        await this.saveGames();
        await this.saveGamesOrder(); // 更新顺序

        // 如果删除的是当前查看的游戏，返回列表
        if (this.currentGameId === gameId) {
            this.goBack();
        } else {
            this.updateGameSelects();
            await this.render();
        }
    }

    // ========== 想法管理 ==========

    // 打开想法编辑弹窗
    openIdeaModal(ideaId = null) {
        const modal = document.getElementById('edit-modal');
        const form = document.getElementById('idea-form');
        const deleteBtn = document.getElementById('modal-delete');
        const title = document.getElementById('modal-title');

        // 更新游戏下拉选择
        this.updateGameSelects();

        if (ideaId) {
            // 编辑模式
            const idea = this.ideas.find(i => i.id === ideaId);
            if (!idea) return;

            document.getElementById('idea-id').value = idea.id;
            document.getElementById('idea-game').value = idea.gameId || '';
            document.getElementById('idea-title').value = idea.title || '';
            document.getElementById('idea-content').value = idea.content || '';
            document.getElementById('idea-tags').value = (idea.tags || []).join(', ');
            document.getElementById('idea-status').value = idea.status || '草稿';
            document.getElementById('idea-priority').value = idea.priority || '中';

            title.textContent = '编辑灵感';
            deleteBtn.style.display = 'inline-block';
        } else {
            // 新建模式
            form.reset();
            document.getElementById('idea-id').value = '';
            // 如果在游戏页面，自动选择当前游戏
            if (this.currentGameId) {
                document.getElementById('idea-game').value = this.currentGameId;
            } else {
                document.getElementById('idea-game').value = '';
            }
            document.getElementById('idea-status').value = '草稿';
            document.getElementById('idea-priority').value = '中';

            title.textContent = '新灵感';
            deleteBtn.style.display = 'none';
        }

        modal.classList.add('active');
    }

    // 关闭想法弹窗
    closeIdeaModal() {
        const modal = document.getElementById('edit-modal');
        modal.classList.remove('active');
    }

    // 保存想法
    async saveIdea() {
        const form = document.getElementById('idea-form');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const ideaId = document.getElementById('idea-id').value;
        const gameId = document.getElementById('idea-game').value;
        const tags = document.getElementById('idea-tags').value
            .split(',')
            .map(t => t.trim())
            .filter(t => t.length > 0);

        if (!gameId) {
            alert('请选择游戏项目！');
            return;
        }

        const idea = {
            id: ideaId || this.generateIdeaId(),
            gameId: gameId,
            title: document.getElementById('idea-title').value.trim(),
            content: document.getElementById('idea-content').value.trim(),
            tags: tags,
            status: document.getElementById('idea-status').value,
            priority: document.getElementById('idea-priority').value,
            createdAt: ideaId ? this.ideas.find(i => i.id === ideaId)?.createdAt || new Date().toISOString() : new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        if (ideaId) {
            // 更新
            const index = this.ideas.findIndex(i => i.id === ideaId);
            if (index !== -1) {
                this.ideas[index] = idea;
            }
        } else {
            // 新建
            this.ideas.push(idea);
        }

        this.saveIdeas();
        this.saveIdeasOrder(); // 更新顺序
        this.initFilters();
        this.applyFilters();
        this.closeIdeaModal();
    }

    // 删除想法
    async deleteIdea() {
        const ideaId = document.getElementById('idea-id').value;
        if (!ideaId) return;

        this.ideas = this.ideas.filter(i => i.id !== ideaId);
        await this.saveIdeas();
        await this.saveIdeasOrder(); // 更新顺序
        this.initFilters();
        this.applyFilters();
        this.closeIdeaModal();
    }

    // 生成唯一ID
    generateGameId() {
        return 'game-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }

    generateIdeaId() {
        return 'idea-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }

    // HTML 转义
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // 格式化日期
    formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) return '今天';
        if (days === 1) return '昨天';
        if (days < 7) return `${days}天前`;
        if (days < 30) return `${Math.floor(days / 7)}周前`;
        if (days < 365) return `${Math.floor(days / 30)}个月前`;

        return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
    }
}


// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 初始化全局认证和 GitHub API 对象（如果尚未初始化）
    if (!window.authManager && typeof AuthManager !== 'undefined') {
        window.authManager = new AuthManager();
    }
    if (!window.githubAPI && typeof GitHubAPI !== 'undefined') {
        window.githubAPI = new GitHubAPI();
    }
    
    window.designIdeasManager = new DesignIdeasManager();
});

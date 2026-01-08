/**
 * 首页专用脚本
 */

// 功能入口配置
const featuresConfig = {
    games: { icon: '🎮', title: 'Games', desc: '游戏项目展示', href: './games/' },
    blogs: { icon: '📝', title: 'Blogs', desc: '博客文章', href: './blogs/' },
    design: { icon: '💡', title: 'Design', desc: '游戏设计灵感', href: './design/' }
};

// 初始化首页的天数计数器
document.addEventListener('DOMContentLoaded', () => {
    // 初始化全局认证和 GitHub API 对象
    if (typeof AuthManager !== 'undefined') {
        window.authManager = new AuthManager();
    }
    if (typeof GitHubAPI !== 'undefined') {
        window.githubAPI = new GitHubAPI();
    }

    initDayCounters([
        {
            id: 'days-counter-1',
            targetDate: '2025-03-15',
            displayText: '2025年3月15日'
        },
        {
            id: 'days-counter-2',
            targetDate: '2025-01-23',
            displayText: '2025年1月23日'
        }
    ]);

    // 初始化功能入口拖动排序
    initFeaturesDragSort();

    // 初始化登录系统
    initAuthSystem();
});

// 初始化登录系统
function initAuthSystem() {
    // 更新登录状态显示
    updateLoginStatus();

    // 登录状态按钮
    const loginStatusBtn = document.getElementById('login-status-btn');
    if (loginStatusBtn) {
        loginStatusBtn.addEventListener('click', () => {
            if (window.authManager?.isLoggedIn()) {
                window.authManager.logout();
                updateLoginStatus();
                alert('已登出');
            } else {
                openLoginModal();
            }
        });
    }

    // 设置按钮
    const settingsBtn = document.getElementById('settings-btn');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            openSettingsModal();
        });
    }

    // 登录弹窗事件
    const loginModal = document.getElementById('login-modal');
    const loginModalClose = document.getElementById('login-modal-close');
    const loginModalCancel = document.getElementById('login-modal-cancel');
    const loginModalSubmit = document.getElementById('login-modal-submit');

    if (loginModalClose) {
        loginModalClose.addEventListener('click', () => {
            closeLoginModal();
        });
    }

    if (loginModalCancel) {
        loginModalCancel.addEventListener('click', () => {
            closeLoginModal();
        });
    }

    if (loginModalSubmit) {
        loginModalSubmit.addEventListener('click', async () => {
            await handleLogin();
        });
    }

    if (loginModal) {
        loginModal.addEventListener('click', (e) => {
            if (e.target.id === 'login-modal') {
                closeLoginModal();
            }
        });
    }

    // 设置弹窗事件
    const settingsModal = document.getElementById('settings-modal');
    const settingsModalClose = document.getElementById('settings-modal-close');
    const settingsModalCancel = document.getElementById('settings-modal-cancel');
    const settingsModalSave = document.getElementById('settings-modal-save');

    if (settingsModalClose) {
        settingsModalClose.addEventListener('click', () => {
            closeSettingsModal();
        });
    }

    if (settingsModalCancel) {
        settingsModalCancel.addEventListener('click', () => {
            closeSettingsModal();
        });
    }

    if (settingsModalSave) {
        settingsModalSave.addEventListener('click', () => {
            saveSettings();
        });
    }

    if (settingsModal) {
        settingsModal.addEventListener('click', (e) => {
            if (e.target.id === 'settings-modal') {
                closeSettingsModal();
            }
        });
    }
}

// 更新登录状态显示
function updateLoginStatus() {
    const loginStatusBtn = document.getElementById('login-status-btn');
    if (loginStatusBtn) {
        const isLoggedIn = window.authManager?.isLoggedIn() || false;
        if (isLoggedIn) {
            loginStatusBtn.textContent = '已登录 | 登出';
        } else {
            loginStatusBtn.textContent = '登录';
        }
    }
}

// 打开登录弹窗
function openLoginModal() {
    const modal = document.getElementById('login-modal');
    if (modal) {
        document.getElementById('login-password').value = '';
        document.getElementById('github-token').value = window.authManager?.getGitHubToken() || '';
        modal.classList.add('active');
    }
}

// 关闭登录弹窗
function closeLoginModal() {
    const modal = document.getElementById('login-modal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// 处理登录
async function handleLogin() {
    const password = document.getElementById('login-password').value;
    const token = document.getElementById('github-token').value.trim();

    if (!password) {
        alert('请输入密码');
        return;
    }

    const isValid = await window.authManager.login(password);
    if (isValid) {
        // 保存 GitHub Token
        if (token) {
            window.authManager.setGitHubToken(token);
        }
        
        closeLoginModal();
        updateLoginStatus();
        alert('登录成功！');
    } else {
        alert('密码错误');
    }
}

// 打开设置弹窗
function openSettingsModal() {
    const modal = document.getElementById('settings-modal');
    if (modal) {
        const isLoggedIn = window.authManager?.isLoggedIn() || false;
        document.getElementById('settings-login-status').textContent = isLoggedIn ? '已登录' : '未登录';
        document.getElementById('settings-github-token').value = window.authManager?.getGitHubToken() || '';
        
        // 加载 GitHub 仓库配置
        if (window.githubAPI) {
            document.getElementById('settings-github-owner').value = window.githubAPI.owner || '';
            document.getElementById('settings-github-repo').value = window.githubAPI.repo || '';
            document.getElementById('settings-github-branch').value = window.githubAPI.branch || '';
        }
        
        modal.classList.add('active');
    }
}

// 关闭设置弹窗
function closeSettingsModal() {
    const modal = document.getElementById('settings-modal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// 保存设置
function saveSettings() {
    const token = document.getElementById('settings-github-token').value.trim();
    window.authManager.setGitHubToken(token);
    
    // 保存 GitHub 仓库配置
    if (window.githubAPI) {
        const config = {
            owner: document.getElementById('settings-github-owner').value.trim(),
            repo: document.getElementById('settings-github-repo').value.trim(),
            branch: document.getElementById('settings-github-branch').value.trim()
        };
        
        if (config.owner && config.repo && config.branch) {
            window.githubAPI.saveConfig(config);
        }
    }
    
    closeSettingsModal();
    alert('设置已保存，请刷新页面使配置生效');
}

// 全局函数：供其他页面调用
window.openLoginModal = openLoginModal;
window.updateLoginStatus = updateLoginStatus;

// 初始化功能入口拖动排序
function initFeaturesDragSort() {
    const grid = document.getElementById('features-grid');
    if (!grid) return;

    // 加载保存的顺序
    const savedOrder = loadFeaturesOrder();
    if (savedOrder && savedOrder.length > 0) {
        reorderFeatures(savedOrder);
    }

    const cards = grid.querySelectorAll('.feature-card');
    let draggedElement = null;

    cards.forEach(card => {
        // 拖动开始
        card.addEventListener('dragstart', (e) => {
            draggedElement = card;
            card.style.opacity = '0.5';
            e.dataTransfer.effectAllowed = 'move';
        });

        // 拖动结束
        card.addEventListener('dragend', () => {
            card.style.opacity = '1';
            grid.querySelectorAll('.feature-card').forEach(c => {
                c.classList.remove('drag-over');
            });
        });

        // 拖动经过
        card.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            
            if (draggedElement && draggedElement !== card) {
                const rect = card.getBoundingClientRect();
                const next = (e.clientY - rect.top) / (rect.bottom - rect.top) > 0.5;
                
                grid.querySelectorAll('.feature-card').forEach(c => {
                    c.classList.remove('drag-over');
                });
                card.classList.add('drag-over');
            }
        });

        // 拖动进入
        card.addEventListener('dragenter', (e) => {
            e.preventDefault();
            if (draggedElement && draggedElement !== card) {
                card.classList.add('drag-over');
            }
        });

        // 拖动离开
        card.addEventListener('dragleave', () => {
            card.classList.remove('drag-over');
        });

        // 放置
        card.addEventListener('drop', (e) => {
            e.preventDefault();
            card.classList.remove('drag-over');

            if (draggedElement && draggedElement !== card) {
                const rect = card.getBoundingClientRect();
                const next = (e.clientY - rect.top) / (rect.bottom - rect.top) > 0.5;
                
                if (next) {
                    grid.insertBefore(draggedElement, card.nextSibling);
                } else {
                    grid.insertBefore(draggedElement, card);
                }
                
                saveFeaturesOrder();
            }
        });
    });
}

// 重新排序功能入口
function reorderFeatures(order) {
    const grid = document.getElementById('features-grid');
    if (!grid) return;

    const cards = Array.from(grid.querySelectorAll('.feature-card'));
    const orderedCards = order.map(feature => 
        cards.find(card => card.dataset.feature === feature)
    ).filter(Boolean);

    // 移除所有卡片
    cards.forEach(card => card.remove());
    
    // 按顺序添加
    orderedCards.forEach(card => grid.appendChild(card));
    
    // 重新初始化拖动事件
    initFeaturesDragSort();
}

// 保存功能入口顺序
function saveFeaturesOrder() {
    const grid = document.getElementById('features-grid');
    if (!grid) return;

    const order = Array.from(grid.querySelectorAll('.feature-card')).map(
        card => card.dataset.feature
    );
    localStorage.setItem('features-order', JSON.stringify(order));
}

// 加载功能入口顺序
function loadFeaturesOrder() {
    try {
        const order = localStorage.getItem('features-order');
        return order ? JSON.parse(order) : null;
    } catch (error) {
        console.error('加载功能顺序失败:', error);
        return null;
    }
}


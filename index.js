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

// 初始化设置系统
function initAuthSystem() {
    // 设置按钮
    const settingsBtn = document.getElementById('settings-btn');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            openSettingsModal();
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

    // 导出配置
    const exportConfigBtn = document.getElementById('export-config-btn');
    if (exportConfigBtn) {
        exportConfigBtn.addEventListener('click', () => {
            exportConfig();
        });
    }

    // 导入配置
    const importConfigBtn = document.getElementById('import-config-btn');
    const importConfigFile = document.getElementById('import-config-file');
    if (importConfigBtn) {
        importConfigBtn.addEventListener('click', () => {
            importConfigFile.click();
        });
    }
    if (importConfigFile) {
        importConfigFile.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                importConfig(file);
            }
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


// 打开设置弹窗
function openSettingsModal() {
    const modal = document.getElementById('settings-modal');
    if (modal) {
        const hasToken = window.authManager?.hasToken() || false;
        document.getElementById('settings-token-status').textContent = hasToken ? '已配置' : '未配置';
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
    
    // 保存或移除 Token
    if (token) {
        window.authManager.setGitHubToken(token);
    } else {
        if (window.authManager?.hasToken() && confirm('确定要移除 Token 吗？移除后将无法编辑内容。')) {
            window.authManager.removeToken();
        } else {
            return; // 用户取消
        }
    }
    
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
    if (token) {
        alert('设置已保存！现在可以编辑内容了。');
    } else {
        alert('Token 已移除。');
    }
}

// 导出配置
function exportConfig() {
    try {
        const config = {
            githubToken: window.authManager?.getGitHubToken() || '',
            githubOwner: window.githubAPI?.owner || '',
            githubRepo: window.githubAPI?.repo || '',
            githubBranch: window.githubAPI?.branch || '',
            exportDate: new Date().toISOString(),
            version: '1.0'
        };

        const dataStr = JSON.stringify(config, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `kisdews-config-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        alert('配置已导出！请妥善保管此文件，不要分享给他人。');
    } catch (error) {
        console.error('导出配置失败:', error);
        alert('导出配置失败：' + error.message);
    }
}

// 导入配置
function importConfig(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const config = JSON.parse(e.target.result);
            
            // 验证配置格式
            if (!config.version) {
                throw new Error('配置文件格式不正确');
            }

            // 导入配置
            if (config.githubToken) {
                window.authManager.setGitHubToken(config.githubToken);
            }
            
            if (window.githubAPI && (config.githubOwner || config.githubRepo || config.githubBranch)) {
                const githubConfig = {};
                if (config.githubOwner) githubConfig.owner = config.githubOwner;
                if (config.githubRepo) githubConfig.repo = config.githubRepo;
                if (config.githubBranch) githubConfig.branch = config.githubBranch;
                window.githubAPI.saveConfig(githubConfig);
            }

            // 更新设置弹窗中的值
            document.getElementById('settings-github-token').value = config.githubToken || '';
            if (window.githubAPI) {
                document.getElementById('settings-github-owner').value = config.githubOwner || window.githubAPI.owner || '';
                document.getElementById('settings-github-repo').value = config.githubRepo || window.githubAPI.repo || '';
                document.getElementById('settings-github-branch').value = config.githubBranch || window.githubAPI.branch || '';
            }

            alert('配置已导入！请刷新页面使配置生效。');
        } catch (error) {
            console.error('导入配置失败:', error);
            alert('导入配置失败：' + error.message);
        }
    };
    reader.readAsText(file);
}

// 全局函数：供其他页面调用
window.openSettingsModal = openSettingsModal;

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


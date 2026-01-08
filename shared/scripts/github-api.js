/**
 * GitHub API 工具
 * 用于读写 GitHub 仓库中的数据文件
 */

class GitHubAPI {
    constructor() {
        // 仓库信息（需要根据实际情况修改）
        // 可以从 localStorage 读取配置，如果没有则使用默认值
        const config = this.loadConfig();
        this.owner = config.owner || 'Kisdews';
        this.repo = config.repo || 'kisdews.github.io';
        this.branch = config.branch || 'master'; // 默认分支，可在设置中修改
        this.dataPath = 'data'; // 数据文件目录
        
        this.baseURL = `https://api.github.com/repos/${this.owner}/${this.repo}`;
        this.rawURL = `https://raw.githubusercontent.com/${this.owner}/${this.repo}/${this.branch}`;
    }

    // 加载配置
    loadConfig() {
        try {
            const config = localStorage.getItem('github-repo-config');
            return config ? JSON.parse(config) : {};
        } catch (error) {
            console.error('加载 GitHub 配置失败:', error);
            return {};
        }
    }

    // 保存配置
    saveConfig(config) {
        try {
            localStorage.setItem('github-repo-config', JSON.stringify(config));
            // 重新初始化
            const newConfig = { ...this.loadConfig(), ...config };
            this.owner = newConfig.owner || this.owner;
            this.repo = newConfig.repo || this.repo;
            this.branch = newConfig.branch || this.branch;
            this.baseURL = `https://api.github.com/repos/${this.owner}/${this.repo}`;
            this.rawURL = `https://raw.githubusercontent.com/${this.owner}/${this.repo}/${this.branch}`;
        } catch (error) {
            console.error('保存 GitHub 配置失败:', error);
        }
    }

    // 获取请求头
    getHeaders() {
        const token = window.authManager?.getGitHubToken();
        const headers = {
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
        };
        
        if (token) {
            headers['Authorization'] = `token ${token}`;
        }
        
        return headers;
    }

    // 读取文件内容
    async readFile(filePath) {
        try {
            const url = `${this.rawURL}/${filePath}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                if (response.status === 404) {
                    // 文件不存在，这是正常情况（新文件还未创建），静默返回 null
                    return null;
                }
                // 其他错误才记录日志
                console.warn(`读取 GitHub 文件失败 (${response.status}): ${filePath}`);
                throw new Error(`读取文件失败: ${response.status}`);
            }
            
            const text = await response.text();
            return text ? JSON.parse(text) : null;
        } catch (error) {
            // 404 错误是预期的，不需要记录
            if (error.message && !error.message.includes('404')) {
                console.error('读取 GitHub 文件失败:', error);
            }
            return null;
        }
    }

    // 获取文件 SHA（用于更新文件）
    async getFileSHA(filePath) {
        try {
            const url = `${this.baseURL}/contents/${filePath}`;
            const response = await fetch(url, {
                headers: this.getHeaders()
            });
            
            if (!response.ok) {
                if (response.status === 404) {
                    return null; // 文件不存在
                }
                throw new Error(`获取文件信息失败: ${response.status}`);
            }
            
            const data = await response.json();
            return data.sha;
        } catch (error) {
            console.error('获取文件 SHA 失败:', error);
            return null;
        }
    }

    // 将字符串转换为 Base64（支持 Unicode）
    encodeToBase64(str) {
        // 使用 encodeURIComponent + btoa 来支持 Unicode 字符
        try {
            return btoa(unescape(encodeURIComponent(str)));
        } catch (error) {
            console.error('Base64 编码失败:', error);
            throw new Error('编码失败：包含不支持的字符');
        }
    }

    // 保存文件内容
    async saveFile(filePath, content, message = 'Update data', retryCount = 0, maxRetries = 3) {
        const token = window.authManager?.getGitHubToken();
        if (!token) {
            throw new Error('需要 GitHub Token 才能保存文件');
        }

        try {
            // 每次保存前都重新获取最新的 SHA，避免并发冲突
            const sha = await this.getFileSHA(filePath);
            const url = `${this.baseURL}/contents/${filePath}`;
            
            // 将内容转换为 JSON 字符串，然后进行 Base64 编码（支持中文）
            const jsonString = JSON.stringify(content, null, 2);
            const base64Content = this.encodeToBase64(jsonString);
            
            const body = {
                message: message,
                content: base64Content,
                branch: this.branch
            };
            
            if (sha) {
                body.sha = sha; // 更新现有文件
            }
            
            const response = await fetch(url, {
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify(body)
            });
            
            if (!response.ok) {
                // 如果是 409 冲突错误，尝试重新获取 SHA 后重试
                if (response.status === 409 && retryCount < maxRetries) {
                    console.warn(`检测到文件冲突 (${retryCount + 1}/${maxRetries})，重新获取最新 SHA 后重试...`);
                    // 等待时间递增：500ms, 1000ms, 1500ms
                    const waitTime = 500 * (retryCount + 1);
                    await new Promise(resolve => setTimeout(resolve, waitTime));
                    return await this.saveFile(filePath, content, message, retryCount + 1, maxRetries);
                }
                
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.message || `HTTP ${response.status}`;
                
                if (response.status === 409) {
                    throw new Error(`保存文件失败：文件已被其他设备修改。请刷新页面获取最新数据后重试。`);
                }
                
                throw new Error(`保存文件失败 (${response.status}): ${errorMessage}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('保存 GitHub 文件失败:', error);
            throw error;
        }
    }

    // 读取游戏数据
    async loadGames() {
        return await this.readFile(`${this.dataPath}/games.json`);
    }

    // 保存游戏数据
    async saveGames(games) {
        return await this.saveFile(`${this.dataPath}/games.json`, games, 'Update games data');
    }

    // 读取想法数据
    async loadIdeas() {
        return await this.readFile(`${this.dataPath}/ideas.json`);
    }

    // 保存想法数据
    async saveIdeas(ideas) {
        return await this.saveFile(`${this.dataPath}/ideas.json`, ideas, 'Update ideas data');
    }

    // 读取游戏顺序
    async loadGamesOrder() {
        return await this.readFile(`${this.dataPath}/games-order.json`);
    }

    // 保存游戏顺序
    async saveGamesOrder(order) {
        return await this.saveFile(`${this.dataPath}/games-order.json`, order, 'Update games order');
    }

    // 读取想法顺序（按游戏）
    async loadIdeasOrder(gameId) {
        return await this.readFile(`${this.dataPath}/ideas-order-${gameId}.json`);
    }

    // 保存想法顺序（按游戏）
    async saveIdeasOrder(gameId, order) {
        return await this.saveFile(`${this.dataPath}/ideas-order-${gameId}.json`, order, `Update ideas order for game ${gameId}`);
    }

    // ========== 批量提交方法（一次同步创建一个 commit） ==========

    // 获取分支的最新 commit SHA
    async getBranchCommitSHA() {
        try {
            const url = `${this.baseURL}/git/ref/heads/${this.branch}`;
            const response = await fetch(url, {
                headers: this.getHeaders()
            });
            
            if (!response.ok) {
                throw new Error(`获取分支信息失败: ${response.status}`);
            }
            
            const data = await response.json();
            return data.object.sha;
        } catch (error) {
            console.error('获取分支 commit SHA 失败:', error);
            throw error;
        }
    }

    // 获取 commit 的 tree SHA
    async getCommitTreeSHA(commitSHA) {
        try {
            const url = `${this.baseURL}/git/commits/${commitSHA}`;
            const response = await fetch(url, {
                headers: this.getHeaders()
            });
            
            if (!response.ok) {
                throw new Error(`获取 commit 信息失败: ${response.status}`);
            }
            
            const data = await response.json();
            return data.tree.sha;
        } catch (error) {
            console.error('获取 commit tree SHA 失败:', error);
            throw error;
        }
    }

    // 创建 blob（文件内容）
    async createBlob(content) {
        try {
            const jsonString = JSON.stringify(content, null, 2);
            const base64Content = this.encodeToBase64(jsonString);
            
            const url = `${this.baseURL}/git/blobs`;
            const response = await fetch(url, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({
                    content: base64Content,
                    encoding: 'base64'
                })
            });
            
            if (!response.ok) {
                throw new Error(`创建 blob 失败: ${response.status}`);
            }
            
            const data = await response.json();
            return data.sha;
        } catch (error) {
            console.error('创建 blob 失败:', error);
            throw error;
        }
    }

    // 获取当前 tree 的所有文件（递归获取）
    async getTreeRecursive(treeSHA, path = '') {
        try {
            const url = `${this.baseURL}/git/trees/${treeSHA}?recursive=1`;
            const response = await fetch(url, {
                headers: this.getHeaders()
            });
            
            if (!response.ok) {
                throw new Error(`获取 tree 失败: ${response.status}`);
            }
            
            const data = await response.json();
            return data.tree || [];
        } catch (error) {
            console.error('获取 tree 失败:', error);
            throw error;
        }
    }

    // 创建新的 tree（包含所有要更新的文件）
    async createTree(baseTreeSHA, files) {
        try {
            // 获取当前 tree 的所有文件
            const currentTree = await this.getTreeRecursive(baseTreeSHA);
            
            // 创建文件路径到 SHA 的映射（排除要更新的文件）
            const fileMap = new Map();
            currentTree.forEach(item => {
                if (item.type === 'blob' && !item.path.startsWith(this.dataPath + '/')) {
                    // 保留非 data 目录的文件
                    fileMap.set(item.path, {
                        path: item.path,
                        mode: item.mode,
                        type: item.type,
                        sha: item.sha
                    });
                }
            });
            
            // 添加或更新要保存的文件
            for (const file of files) {
                const blobSHA = await this.createBlob(file.content);
                fileMap.set(file.path, {
                    path: file.path,
                    mode: '100644', // 普通文件
                    type: 'blob',
                    sha: blobSHA
                });
            }
            
            // 构建 tree 数组
            const tree = Array.from(fileMap.values());
            
            const url = `${this.baseURL}/git/trees`;
            const response = await fetch(url, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({
                    base_tree: baseTreeSHA,
                    tree: tree
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`创建 tree 失败: ${response.status} - ${errorData.message || ''}`);
            }
            
            const data = await response.json();
            return data.sha;
        } catch (error) {
            console.error('创建 tree 失败:', error);
            throw error;
        }
    }

    // 创建 commit
    async createCommit(treeSHA, parentCommitSHA, message) {
        try {
            const url = `${this.baseURL}/git/commits`;
            const response = await fetch(url, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({
                    message: message,
                    tree: treeSHA,
                    parents: [parentCommitSHA]
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`创建 commit 失败: ${response.status} - ${errorData.message || ''}`);
            }
            
            const data = await response.json();
            return data.sha;
        } catch (error) {
            console.error('创建 commit 失败:', error);
            throw error;
        }
    }

    // 更新分支引用
    async updateBranchRef(commitSHA) {
        try {
            const url = `${this.baseURL}/git/refs/heads/${this.branch}`;
            const response = await fetch(url, {
                method: 'PATCH',
                headers: this.getHeaders(),
                body: JSON.stringify({
                    sha: commitSHA
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`更新分支失败: ${response.status} - ${errorData.message || ''}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('更新分支失败:', error);
            throw error;
        }
    }

    // 批量保存多个文件（创建一个 commit）
    async saveFilesBatch(files, message = 'Update data files') {
        const token = window.authManager?.getGitHubToken();
        if (!token) {
            throw new Error('需要 GitHub Token 才能保存文件');
        }

        try {
            // 1. 获取当前分支的最新 commit SHA
            const branchCommitSHA = await this.getBranchCommitSHA();
            
            // 2. 获取当前 commit 的 tree SHA
            const baseTreeSHA = await this.getCommitTreeSHA(branchCommitSHA);
            
            // 3. 创建新的 tree（包含所有要更新的文件）
            const newTreeSHA = await this.createTree(baseTreeSHA, files);
            
            // 4. 创建新的 commit
            const newCommitSHA = await this.createCommit(newTreeSHA, branchCommitSHA, message);
            
            // 5. 更新分支引用
            await this.updateBranchRef(newCommitSHA);
            
            console.log(`批量保存成功，创建了 1 个 commit，更新了 ${files.length} 个文件`);
            return { commitSHA: newCommitSHA, filesCount: files.length };
        } catch (error) {
            console.error('批量保存失败:', error);
            throw error;
        }
    }
}

// 全局 GitHub API 实例
window.githubAPI = new GitHubAPI();


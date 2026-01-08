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
                    // 文件不存在，返回 null
                    return null;
                }
                throw new Error(`读取文件失败: ${response.status}`);
            }
            
            const text = await response.text();
            return text ? JSON.parse(text) : null;
        } catch (error) {
            console.error('读取 GitHub 文件失败:', error);
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
    async saveFile(filePath, content, message = 'Update data') {
        const token = window.authManager?.getGitHubToken();
        if (!token) {
            throw new Error('需要 GitHub Token 才能保存文件');
        }

        try {
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
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.message || `HTTP ${response.status}`;
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
}

// 全局 GitHub API 实例
window.githubAPI = new GitHubAPI();


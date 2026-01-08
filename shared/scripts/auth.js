/**
 * 认证系统
 * 简单的密码验证登录
 */

class AuthManager {
    constructor() {
        this.loginKey = 'auth-login-status';
        this.loginExpiryKey = 'auth-login-expiry';
        this.tokenKey = 'auth-github-token';
        this.expiryDays = 7; // 登录有效期7天
        
        // 管理员密码（使用 SHA-256 哈希存储，实际使用时需要配置）
        // 默认密码哈希，实际使用时应该从环境变量或配置文件读取
        this.adminPasswordHash = this.getPasswordHash();
    }

    // 获取密码哈希（实际应该从配置读取）
    getPasswordHash() {
        // 这里使用一个默认的哈希值，实际使用时应该：
        // 1. 从环境变量读取
        // 2. 或从配置文件读取（不提交到 Git）
        // 3. 或使用更安全的方案
        
        // 临时方案：从 localStorage 读取配置的密码哈希
        const savedHash = localStorage.getItem('admin-password-hash');
        if (savedHash) {
            return savedHash;
        }
        
        // 如果没有配置，返回空（需要首次配置）
        return null;
    }

    // 设置管理员密码（首次配置时使用）
    async setAdminPassword(password) {
        const hash = await this.hashPassword(password);
        localStorage.setItem('admin-password-hash', hash);
        this.adminPasswordHash = hash;
    }

    // 密码哈希（SHA-256）
    async hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    // 验证密码
    async verifyPassword(password) {
        if (!this.adminPasswordHash) {
            // 如果没有配置密码，首次登录时设置
            await this.setAdminPassword(password);
            return true;
        }
        
        const hash = await this.hashPassword(password);
        return hash === this.adminPasswordHash;
    }

    // 登录
    async login(password) {
        const isValid = await this.verifyPassword(password);
        if (isValid) {
            const expiry = new Date();
            expiry.setDate(expiry.getDate() + this.expiryDays);
            
            localStorage.setItem(this.loginKey, 'true');
            localStorage.setItem(this.loginExpiryKey, expiry.toISOString());
            return true;
        }
        return false;
    }

    // 登出
    logout() {
        localStorage.removeItem(this.loginKey);
        localStorage.removeItem(this.loginExpiryKey);
    }

    // 检查是否已登录
    isLoggedIn() {
        const loginStatus = localStorage.getItem(this.loginKey);
        if (loginStatus !== 'true') {
            return false;
        }

        // 检查是否过期
        const expiry = localStorage.getItem(this.loginExpiryKey);
        if (!expiry) {
            return false;
        }

        const expiryDate = new Date(expiry);
        if (new Date() > expiryDate) {
            // 已过期，清除登录状态
            this.logout();
            return false;
        }

        return true;
    }

    // 设置 GitHub Token
    setGitHubToken(token) {
        if (token) {
            localStorage.setItem(this.tokenKey, token);
        } else {
            localStorage.removeItem(this.tokenKey);
        }
    }

    // 获取 GitHub Token
    getGitHubToken() {
        return localStorage.getItem(this.tokenKey);
    }

    // 检查是否有 GitHub Token
    hasGitHubToken() {
        return !!this.getGitHubToken();
    }
}

// 全局认证管理器实例
window.authManager = new AuthManager();


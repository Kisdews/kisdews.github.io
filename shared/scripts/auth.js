/**
 * 认证系统（简化版）
 * 使用 GitHub Token 控制编辑权限
 * 有 Token = 可以编辑，没有 Token = 只能查看
 */

class AuthManager {
    constructor() {
        this.tokenKey = 'auth-github-token';
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

    // 检查是否有 Token（即是否有编辑权限）
    hasToken() {
        return !!this.getGitHubToken();
    }

    // 移除 Token（登出）
    removeToken() {
        localStorage.removeItem(this.tokenKey);
    }

    // 兼容旧代码的方法名
    isLoggedIn() {
        return this.hasToken();
    }
}

/**
 * Games 页面专用脚本
 */

document.addEventListener('DOMContentLoaded', () => {
    // 初始化游戏列表
    initGamesList();
});

function initGamesList() {
    const gamesList = document.getElementById('games-list');
    
    // 示例：这里可以从 API 或配置文件加载游戏列表
    const games = [
        // 示例游戏数据
        // {
        //     title: '游戏名称',
        //     description: '游戏描述',
        //     link: '/games/game-name'
        // }
    ];
    
    if (games.length === 0) {
        gamesList.innerHTML = '<p>暂无游戏</p>';
        return;
    }
    
    // 渲染游戏列表
    gamesList.innerHTML = games.map(game => `
        <div class="game-item">
            <h3>${game.title}</h3>
            <p>${game.description}</p>
            <a href="${game.link}">查看详情</a>
        </div>
    `).join('');
}


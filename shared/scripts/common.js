/**
 * 通用工具函数
 */

/**
 * 创建天数计数器函数
 * @param {Date} targetDate - 目标日期
 * @param {string} displayText - 显示文本
 * @returns {Function} 返回计算天数的函数
 */
function createDayCounter(targetDate, displayText) {
    return function() {
        const today = new Date();
        const timeDiff = targetDate - today;
        const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        
        if(daysDiff > 0) {
            return `距离${displayText}还有 ${daysDiff} 天`;
        } else if(daysDiff === 0) {
            return `今天是${displayText}！`;
        } else {
            return `${displayText}已经过去 ${Math.abs(daysDiff)} 天`;
        }
    }
}

/**
 * 初始化天数计数器
 * @param {Array} counters - 计数器配置数组，每个元素包含 {id, targetDate, displayText}
 */
function initDayCounters(counters) {
    const counterFunctions = counters.map(config => ({
        elementId: config.id,
        counter: createDayCounter(new Date(config.targetDate), config.displayText)
    }));

    function updateCounters() {
        counterFunctions.forEach(({elementId, counter}) => {
            const element = document.getElementById(elementId);
            if (element) {
                element.textContent = counter();
            }
        });
    }

    // 页面加载时计算
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', updateCounters);
    } else {
        updateCounters();
    }

    // 每天更新一次（86400000 毫秒 = 1天）
    setInterval(updateCounters, 86400000);
}


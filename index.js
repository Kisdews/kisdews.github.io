/**
 * 首页专用脚本
 */

// 初始化首页的天数计数器
document.addEventListener('DOMContentLoaded', () => {
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
});


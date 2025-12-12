/**
 * 游戏配置对象
 * 包含金币类型、价格、积分价值等常量
 */
export const GameConfig = {
    // 金币类型定义
    CoinTypes: {
        SILVER: 'silver',
        GOLD: 'gold',
        DIAMOND: 'diamond'
    },

    // 购买价格 (消耗积分)
    Prices: {
        silver: 100,
        gold: 300,
        diamond: 1000
    },

    // 跳跃获得的积分
    Values: {
        silver: 1,
        gold: 3,
        diamond: 10
    },

    // 初始化积分 (用于测试)
    InitialScore: 200,

    // 桌面颜色
    TableColor: 0x4488FF // 亮一点的蓝色
};

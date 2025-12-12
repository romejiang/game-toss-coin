import { GameConfig } from '../GameConfig.js';

export class Start extends Phaser.Scene {
    constructor() {
        super('Start');
    }

    preload() {
        // 加载金币图片资源
        this.load.image('tail', 'assets/tail.png'); // 加载背景瓦块

        // 加载金币动画序列帧 (428x428)
        this.load.spritesheet('sprite_silver', 'assets/coin1.webp', { frameWidth: 428, frameHeight: 428 });
        this.load.spritesheet('sprite_gold', 'assets/coin2.webp', { frameWidth: 428, frameHeight: 428 });
        this.load.spritesheet('sprite_diamond', 'assets/coin3.webp', { frameWidth: 428, frameHeight: 428 });


        // 加载音效
        this.load.audio('coin_sfx', 'assets/coin.wav');
        this.load.audio('drop_sfx', 'assets/drop.wav');
    }

    create() {
        // 1. 设置瓦块背景
        // this.cameras.main.setBackgroundColor(GameConfig.TableColor); // 移除纯色背景

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        this.background = this.add.tileSprite(width / 2, height / 2, width, height, 'tail');
        this.background.setDepth(-100); // 确保背景在最底层

        // 初始化游戏状态
        this.score = GameConfig.InitialScore; // 当前积分
        this.coins = []; // 存储桌面上的金币对象

        // 2. 创建UI层
        this.createUI();

        // 监听 resize 事件
        this.scale.on('resize', this.resize, this);

        // 3. 设置桌面点击交互 (点击任意位置触发金币跳跃)
        this.input.on('pointerdown', (pointer) => {
            // 如果点击的是底部UI区域，不触发跳跃 (通过判断Y坐标)
            // 如果点击的是底部UI区域，不触发跳跃 (通过判断Y坐标)
            if (pointer.y < this.cameras.main.height - 100) {
                this.jumpCoins();
            }
        });

        // 创建金币动画
        this.anims.create({
            key: 'anim_silver',
            frames: this.anims.generateFrameNumbers('sprite_silver', { start: 0, end: 7 }),
            frameRate: 16,
            repeat: -1
        });
        this.anims.create({
            key: 'anim_gold',
            frames: this.anims.generateFrameNumbers('sprite_gold', { start: 0, end: 7 }),
            frameRate: 16,
            repeat: -1
        });
        this.anims.create({
            key: 'anim_diamond',
            frames: this.anims.generateFrameNumbers('sprite_diamond', { start: 0, end: 7 }),
            frameRate: 16,
            repeat: -1
        });

        // 1. 默认开局生成一个银币 (不消耗积分)
        this.spawnCoin(GameConfig.CoinTypes.SILVER, 'sprite_silver', true);
    }

    /**
     * 处理屏幕尺寸变化
     * @param {Phaser.Structs.Size} gameSize 
     */
    resize(gameSize) {
        const width = gameSize.width;
        const height = gameSize.height;

        this.cameras.main.setViewport(0, 0, width, height);

        // 更新背景大小和位置
        if (this.background) {
            this.background.setSize(width, height);
            this.background.setPosition(width / 2, height / 2);
        }

        // 更新UI位置
        if (this.barBg) {
            this.barBg.clear();
            this.barBg.fillStyle(0x333333, 0); // 透明背景
            this.barBg.fillRect(0, height - 100, width, 100);
        }

        if (this.shopItems && this.shopItems.length === 3) {
            this.shopItems[0].setPosition(width * 0.2, height - 50);
            this.shopItems[1].setPosition(width * 0.5, height - 50);
            this.shopItems[2].setPosition(width * 0.8, height - 50);
        }
    }

    /**
     * 创建游戏UI，包括分数显示和底部商店
     */
    createUI() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // 显示当前积分
        this.scoreText = this.add.text(20, 20, `积分: ${this.score}`, {
            fontSize: '16px',
            fill: '#ffffff',
            fontStyle: 'bold'
        });

        // 底部物品栏背景
        const barHeight = 100;
        const barY = height - barHeight;

        this.barBg = this.add.graphics();
        this.barBg.fillStyle(0x333333, 0); // 透明背景
        this.barBg.fillRect(0, barY, width, barHeight);

        this.shopItems = [];
        // 创建商店按钮 (银币, 金币, 钻石币)
        this.shopItems.push(this.createShopItem(width * 0.2, height - 50, GameConfig.CoinTypes.SILVER, 'sprite_silver'));
        this.shopItems.push(this.createShopItem(width * 0.5, height - 50, GameConfig.CoinTypes.GOLD, 'sprite_gold'));
        this.shopItems.push(this.createShopItem(width * 0.8, height - 50, GameConfig.CoinTypes.DIAMOND, 'sprite_diamond'));
    }

    /**
     * 创建单个商店物品
     * @param {number} x X坐标
     * @param {number} y Y坐标
     * @param {string} type 金币类型
     * @param {string} texture 图片纹理名
     */
    createShopItem(x, y, type, texture) {
        const price = GameConfig.Prices[type];

        // 容器用于组合图标和文字
        const container = this.add.container(x, y);

        // 金币图标 (点击购买)
        // 使用 sprite 而不是 image，并显示第一帧
        const icon = this.add.sprite(0, -10, texture, 0).setInteractive({ cursor: 'pointer' });
        icon.setDisplaySize(30, 30); // 缩小 50% (原 60x60 -> 30x30)

        // 点击事件
        icon.on('pointerdown', () => {
            this.buyCoin(type, texture);
        });

        // 价格文字
        const priceText = this.add.text(0, 30, `${price} 积分`, {
            fontSize: '10px',
            fill: '#ffffff'
        }).setOrigin(0.5);

        container.add([icon, priceText]);

        return container;
    }

    /**
     * 购买金币逻辑
     * @param {string} type 金币类型
     * @param {string} texture 图片纹理
     */
    buyCoin(type, texture) {
        const price = GameConfig.Prices[type];

        // 检查积分是否足够
        if (this.score >= price) {
            // 扣除积分
            this.updateScore(-price);

            // 生成金币
            this.spawnCoin(type, texture);
        } else {
            console.log('积分不足！');
            // 这里可以加一个简单的提示动画，比如文字闪烁
            this.cameras.main.shake(200, 0.01);
        }
    }

    /**
     * 更新积分显示
     * @param {number} delta 变化量
     */
    updateScore(delta) {
        this.score += delta;
        this.scoreText.setText(`积分: ${this.score}`);
    }

    /**
     * 在桌面随机位置生成金币
     * @param {string} type 金币类型
     * @param {string} texture 纹理
     * @param {boolean} isInitial 是否是初始生成的 (不播放掉落音效)
     */
    spawnCoin(type, texture, isInitial = false) {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const barHeight = 100;

        // 随机位置 (预留边距，不生成在底部栏)
        // 尝试多次生成不重叠的坐标
        let x, y;
        let overlaps = true;
        let attempts = 0;
        const radius = 40; // 金币半径(30) + 边距(10)

        while (overlaps && attempts < 50) {
            x = Phaser.Math.Between(50, width - 50);
            y = Phaser.Math.Between(100, height - barHeight - 50);

            overlaps = false;
            for (const existingCoin of this.coins) {
                if (Phaser.Math.Distance.Between(x, y, existingCoin.x, existingCoin.y) < radius * 2) {
                    overlaps = true;
                    break;
                }
            }
            attempts++;
        }

        if (overlaps) {
            console.log("无法生成金币，空间不足");
            // 4. 空间不足时，轻微抖动屏幕
            this.cameras.main.shake(200, 0.005);

            // 返还积分 (如果是初始生成则不需要)
            if (!isInitial) {
                this.updateScore(GameConfig.Prices[type]);
            }
            return;
        }

        // 创建金币精灵
        // 创建金币精灵 (根据类型选择对应的sprite sheet)
        let spriteKey;
        if (type === GameConfig.CoinTypes.SILVER) spriteKey = 'sprite_silver';
        else if (type === GameConfig.CoinTypes.GOLD) spriteKey = 'sprite_gold';
        else spriteKey = 'sprite_diamond';

        const coin = this.add.sprite(x, y, spriteKey);
        coin.setDisplaySize(60, 60); // 统一设置大小为 60x60

        // 存储金币数据，方便后续计算
        coin.coinType = type;
        coin.coinValue = GameConfig.Values[type];

        this.coins.push(coin);

        // 3. 播放掉落音效 (非初始生成)
        if (!isInitial) {
            this.sound.play('drop_sfx');
        }
    }

    /**
     * 所有金币跳跃并获得积分
     */
    jumpCoins() {
        if (this.coins.length === 0) return;

        let totalGain = 0;

        this.coins.forEach(coin => {
            // 只有未在跳跃中的金币才跳跃 (防止连点鬼畜)
            if (!coin.isJumping) {
                coin.isJumping = true;

                // 跳跃动画
                // 跳跃动画
                this.tweens.add({
                    targets: coin,
                    y: coin.y - 100, // 向上跳100像素
                    duration: 300,
                    yoyo: true, // 自动返回
                    ease: 'Quad.easeOut',
                    onComplete: () => {
                        coin.isJumping = false;
                        coin.stop(); // 停止播放动画
                        coin.setFrame(0); // 重置为第一帧
                    }
                });

                // 播放对应的旋转动画
                if (coin.coinType === GameConfig.CoinTypes.SILVER) coin.play('anim_silver');
                else if (coin.coinType === GameConfig.CoinTypes.GOLD) coin.play('anim_gold');
                else coin.play('anim_diamond');

                // 累加积分
                totalGain += coin.coinValue;

                // 显示单个金币的积分飘字
                this.showScorePopup(coin.x, coin.y - 30, coin.coinValue);
            }
        });

        // 更新总积分
        if (totalGain > 0) {
            this.updateScore(totalGain);

            // 播放音效
            this.sound.play('coin_sfx');
        }
    }

    /**
     * 显示获得积分的飘字动画
     * @param {number} x X坐标
     * @param {number} y Y坐标
     * @param {number} amount 获得的积分
     */
    showScorePopup(x, y, amount) {
        const text = this.add.text(x, y, `+${amount}`, {
            fontSize: '24px',
            fill: '#FFFF00',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        this.tweens.add({
            targets: text,
            y: text.y - 40,
            alpha: 0,
            duration: 800,
            onComplete: () => {
                text.destroy();
            }
        });
    }
}

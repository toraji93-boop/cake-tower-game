// ============================================
// 🍰 ケーキタワー・チャレンジ
// Phaser.js ハイパーカジュアルゲーム [Enhanced Visual Edition]
// ============================================

// ゲーム設定
const GAME_WIDTH = 720;
const GAME_HEIGHT = 1280;
const CAKE_HEIGHT = 60;
const INITIAL_CAKE_WIDTH = 400;
const MIN_CAKE_WIDTH = 30;
const SWING_SPEED_INITIAL = 4;
const SWING_SPEED_INCREMENT = 0.15;
const DROP_SPEED = 800;

// 強化カラーパレット
const COLORS = {
    background: {
        top: 0xFFF0F5,
        bottom: 0xFFB6C1
    },
    cakeColors: [
        { main: 0xFFB5C5, shadow: 0xE8A0B0, cream: 0xFFFDD0 },
        { main: 0xFFD1DC, shadow: 0xE8BAC5, cream: 0xFFFFE0 },
        { main: 0xFFC4D6, shadow: 0xE8ADBF, cream: 0xFFF8DC },
        { main: 0xE8B4CB, shadow: 0xD19FB5, cream: 0xFFFACD },
        { main: 0xF4A7B9, shadow: 0xDD92A4, cream: 0xFFEFD5 },
        { main: 0xFFAEC9, shadow: 0xE899B4, cream: 0xFFF5EE },
        { main: 0xDDA0DD, shadow: 0xC68BC6, cream: 0xE6E6FA },
        { main: 0x98D8C8, shadow: 0x82C3B3, cream: 0xF0FFF0 }
    ],
    gold: 0xFFD700,
    silver: 0xC0C0C0,
    text: 0xE75480,
    textDark: 0xC14679,
    white: 0xFFFFFF,
    sparkle: [0xFFD700, 0xFFFFFF, 0xFF69B4, 0x87CEEB]
};

// ボイスメッセージ（ElevenLabs用テキスト）
const VOICE_MESSAGES = {
    perfect: ['パーフェクト！', '完璧！', '美しい！', 'すごい！', 'ブラボー！'],
    perfectCombo: ['天才パティシエ！', '神業だね！', 'もはや芸術！', '伝説確定！'],
    milestone10: ['すごいタワーになってきた！', '10段達成！', 'いい調子！'],
    milestone20: ['ギネス級だよ！', '20段突破！', '圧巻のタワー！'],
    milestone30: ['伝説のパティシエ！', '30段！信じられない！', '神の領域！'],
    gameOver: ['あらら…でも美味しそう！', 'ドンマイ！', 'また挑戦してね！'],
    newRecord: ['やったね！最高記録更新！', '新記録おめでとう！', '歴史に残る！']
};

// ============================================
// BootScene - 初期ロード
// ============================================
class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // 豪華なローディング画面
        this.createLoadingScreen(width, height);

        // アセット生成
        this.createGameAssets();

        // BGMロード（存在する場合）
        this.load.audio('bgm', ['assets/bgm.mp3']);

        // ボイスファイルをロード
        this.load.audio('voice_start', ['assets/start.mp3']);
        this.load.audio('voice_combo', ['assets/combo.mp3']);
        this.load.audio('voice_gameover', ['assets/gameover.mp3']);

        this.load.on('loaderror', (file) => {
            console.log(`Audio not found: ${file.key}, continuing without it`);
        });
    }

    createLoadingScreen(width, height) {
        // グラデーション背景
        const bg = this.add.graphics();
        bg.fillGradientStyle(COLORS.background.top, COLORS.background.top, COLORS.background.bottom, COLORS.background.bottom, 1);
        bg.fillRect(0, 0, width, height);

        // ケーキアイコン
        const loadingCake = this.add.text(width / 2, height / 2 - 80, '🍰', {
            fontSize: '80px'
        }).setOrigin(0.5);

        this.tweens.add({
            targets: loadingCake,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // プログレスバー背景
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0xE75480, 0.2);
        progressBox.fillRoundedRect(width / 2 - 160, height / 2 + 20, 320, 30, 15);

        // プログレスバー
        const progressBar = this.add.graphics();

        // ローディングテキスト
        const loadingText = this.add.text(width / 2, height / 2 + 70, 'Loading...', {
            fontFamily: 'M PLUS Rounded 1c',
            fontSize: '24px',
            color: '#E75480'
        }).setOrigin(0.5);

        this.load.on('progress', (value) => {
            progressBar.clear();
            progressBar.fillStyle(0xE75480, 1);
            progressBar.fillRoundedRect(width / 2 - 155, height / 2 + 25, 310 * value, 20, 10);
        });

        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
            loadingCake.destroy();
        });
    }

    createGameAssets() {
        const graphics = this.make.graphics({ x: 0, y: 0, add: false });

        // Enhanced ケーキテクスチャ
        COLORS.cakeColors.forEach((colors, index) => {
            graphics.clear();

            // 影
            graphics.fillStyle(colors.shadow, 0.5);
            graphics.fillRoundedRect(4, 4, INITIAL_CAKE_WIDTH, CAKE_HEIGHT, 12);

            // メインボディ
            graphics.fillStyle(colors.main, 1);
            graphics.fillRoundedRect(0, 0, INITIAL_CAKE_WIDTH, CAKE_HEIGHT, 12);

            // グラデーション風ハイライト
            graphics.fillStyle(0xFFFFFF, 0.3);
            graphics.fillRoundedRect(5, 5, INITIAL_CAKE_WIDTH - 10, 20, 8);

            // クリーム装飾（複数の丸）
            graphics.fillStyle(colors.cream, 1);
            for (let i = 0; i < 7; i++) {
                const x = 25 + i * 60;
                graphics.fillCircle(x, 12, 10);
                graphics.fillCircle(x, 12, 8);
            }

            // チェリー/いちご
            if (index % 2 === 0) {
                graphics.fillStyle(0xFF6B6B, 1);
                graphics.fillCircle(INITIAL_CAKE_WIDTH / 2, 8, 8);
                graphics.fillStyle(0x228B22, 1);
                graphics.fillTriangle(INITIAL_CAKE_WIDTH / 2, 0, INITIAL_CAKE_WIDTH / 2 - 4, 6, INITIAL_CAKE_WIDTH / 2 + 4, 6);
            }

            graphics.generateTexture(`cake_${index}`, INITIAL_CAKE_WIDTH + 8, CAKE_HEIGHT + 8);
        });

        // 豪華なベースプレート
        graphics.clear();
        // プレート影
        graphics.fillStyle(0x8B7355, 0.5);
        graphics.fillRoundedRect(8, 8, 480, 50, 15);
        // プレート本体
        graphics.fillStyle(0xDEB887, 1);
        graphics.fillRoundedRect(0, 0, 480, 50, 15);
        // ハイライト
        graphics.fillStyle(0xFFFFFF, 0.3);
        graphics.fillRoundedRect(10, 5, 460, 15, 8);
        // 縁取り
        graphics.lineStyle(3, 0xCD853F, 1);
        graphics.strokeRoundedRect(0, 0, 480, 50, 15);
        graphics.generateTexture('plate', 488, 58);

        // 複数のパーティクル
        // 標準パーティクル
        graphics.clear();
        graphics.fillStyle(0xFFFFFF, 1);
        graphics.fillCircle(8, 8, 8);
        graphics.generateTexture('particle', 16, 16);

        // 星パーティクル
        graphics.clear();
        graphics.fillStyle(0xFFD700, 1);
        this.drawStar(graphics, 20, 20, 5, 20, 10);
        graphics.generateTexture('star', 40, 40);

        // ハートパーティクル
        graphics.clear();
        graphics.fillStyle(0xFF69B4, 1);
        this.drawHeart(graphics, 16, 16, 12);
        graphics.generateTexture('heart', 32, 32);

        // キラキラパーティクル
        graphics.clear();
        graphics.fillStyle(0xFFFFFF, 1);
        graphics.fillCircle(6, 6, 6);
        graphics.fillStyle(0xFFFFFF, 0.5);
        graphics.fillCircle(6, 6, 10);
        graphics.generateTexture('sparkle', 20, 20);

        graphics.destroy();
    }

    drawStar(graphics, cx, cy, spikes, outerRadius, innerRadius) {
        let rot = Math.PI / 2 * 3;
        let step = Math.PI / spikes;

        graphics.beginPath();
        graphics.moveTo(cx, cy - outerRadius);

        for (let i = 0; i < spikes; i++) {
            graphics.lineTo(cx + Math.cos(rot) * outerRadius, cy + Math.sin(rot) * outerRadius);
            rot += step;
            graphics.lineTo(cx + Math.cos(rot) * innerRadius, cy + Math.sin(rot) * innerRadius);
            rot += step;
        }

        graphics.closePath();
        graphics.fillPath();
    }

    drawHeart(graphics, cx, cy, size) {
        graphics.beginPath();
        graphics.moveTo(cx, cy + size * 0.3);
        graphics.bezierCurveTo(cx, cy, cx - size, cy, cx - size, cy - size * 0.3);
        graphics.bezierCurveTo(cx - size, cy - size * 0.9, cx, cy - size * 0.9, cx, cy - size * 0.5);
        graphics.bezierCurveTo(cx, cy - size * 0.9, cx + size, cy - size * 0.9, cx + size, cy - size * 0.3);
        graphics.bezierCurveTo(cx + size, cy, cx, cy, cx, cy + size * 0.3);
        graphics.closePath();
        graphics.fillPath();
    }

    create() {
        this.scene.start('TitleScene');
    }
}

// ============================================
// TitleScene - 豪華タイトル画面
// ============================================
class TitleScene extends Phaser.Scene {
    constructor() {
        super({ key: 'TitleScene' });
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // アニメーション付きグラデーション背景
        this.createAnimatedBackground(width, height);

        // 浮遊装飾
        this.createFloatingDecorations(width, height);

        // ケーキアイコン（複数）
        this.createCakeDisplay(width, height);

        // タイトルテキスト（豪華エフェクト付き）
        this.createTitle(width, height);

        // スタートボタン
        this.createStartButton(width, height);

        // 操作説明
        this.createInstructions(width, height);

        // BGM再生
        this.playBGM();
    }

    playBGM() {
        try {
            if (this.sound.get('bgm')) {
                const bgm = this.sound.add('bgm', { loop: true, volume: 0.5 });
                bgm.play();
            }
        } catch (e) {
            console.log('BGM not available');
        }
    }

    createAnimatedBackground(width, height) {
        const bg = this.add.graphics();
        bg.fillGradientStyle(
            COLORS.background.top, COLORS.background.top,
            COLORS.background.bottom, COLORS.background.bottom, 1
        );
        bg.fillRect(0, 0, width, height);

        // 動く波模様
        for (let i = 0; i < 3; i++) {
            const wave = this.add.graphics();
            wave.fillStyle(0xFFFFFF, 0.08);
            wave.fillEllipse(width / 2, height + 200 + i * 100, width * 2, 400);

            this.tweens.add({
                targets: wave,
                y: -50,
                duration: 8000 + i * 2000,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }
    }

    createFloatingDecorations(width, height) {
        const decorations = ['💗', '⭐', '✨', '🌸', '💕', '🎀', '💖', '🌟'];

        for (let i = 0; i < 25; i++) {
            const deco = this.add.text(
                Phaser.Math.Between(30, width - 30),
                Phaser.Math.Between(50, height - 50),
                Phaser.Utils.Array.GetRandom(decorations),
                { fontSize: `${Phaser.Math.Between(18, 36)}px` }
            ).setAlpha(Phaser.Math.FloatBetween(0.2, 0.5));

            // 浮遊アニメーション
            this.tweens.add({
                targets: deco,
                y: deco.y - Phaser.Math.Between(30, 80),
                x: deco.x + Phaser.Math.Between(-30, 30),
                alpha: { from: deco.alpha, to: deco.alpha + 0.2 },
                rotation: Phaser.Math.FloatBetween(-0.3, 0.3),
                duration: Phaser.Math.Between(3000, 6000),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut',
                delay: Phaser.Math.Between(0, 2000)
            });
        }
    }

    createCakeDisplay(width, height) {
        // メインケーキ
        const mainCake = this.add.text(width / 2, height * 0.2, '🍰', {
            fontSize: '140px'
        }).setOrigin(0.5);

        // 光のリング
        const ring = this.add.graphics();
        ring.lineStyle(4, 0xFFD700, 0.5);
        ring.strokeCircle(width / 2, height * 0.2, 100);

        this.tweens.add({
            targets: ring,
            scaleX: 1.3,
            scaleY: 1.3,
            alpha: 0,
            duration: 1500,
            repeat: -1
        });

        // ケーキの浮遊
        this.tweens.add({
            targets: mainCake,
            y: mainCake.y - 25,
            duration: 1800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // 回転するキラキラ
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const sparkle = this.add.text(
                width / 2 + Math.cos(angle) * 90,
                height * 0.2 + Math.sin(angle) * 90,
                '✨',
                { fontSize: '24px' }
            ).setOrigin(0.5);

            this.tweens.add({
                targets: sparkle,
                angle: 360,
                duration: 6000,
                repeat: -1
            });
        }
    }

    createTitle(width, height) {
        // 影テキスト
        this.add.text(width / 2 + 4, height * 0.36 + 4, 'ケーキタワー', {
            fontFamily: 'M PLUS Rounded 1c',
            fontSize: '76px',
            fontStyle: 'bold',
            color: '#C14679'
        }).setOrigin(0.5).setAlpha(0.3);

        // メインタイトル
        const title = this.add.text(width / 2, height * 0.36, 'ケーキタワー', {
            fontFamily: 'M PLUS Rounded 1c',
            fontSize: '76px',
            fontStyle: 'bold',
            color: '#E75480',
            stroke: '#FFFFFF',
            strokeThickness: 10,
            shadow: { offsetX: 0, offsetY: 0, color: '#FFB5C5', blur: 20, fill: true }
        }).setOrigin(0.5);

        // 虹色グラデーションアニメーション
        this.tweens.add({
            targets: title,
            scaleX: 1.02,
            scaleY: 1.02,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // サブタイトル
        const subtitle = this.add.text(width / 2, height * 0.44, '✨ チャレンジ ✨', {
            fontFamily: 'M PLUS Rounded 1c',
            fontSize: '52px',
            fontStyle: 'bold',
            color: '#FFD700',
            stroke: '#FFFFFF',
            strokeThickness: 6,
            shadow: { offsetX: 2, offsetY: 2, color: '#E75480', blur: 10, fill: true }
        }).setOrigin(0.5);

        // ハイスコア
        const highScore = localStorage.getItem('cakeTowerHighScore') || 0;
        const scoreContainer = this.add.container(width / 2, height * 0.53);

        const scoreBg = this.add.graphics();
        scoreBg.fillStyle(0xFFFFFF, 0.8);
        scoreBg.fillRoundedRect(-120, -25, 240, 50, 25);
        scoreBg.lineStyle(3, 0xFFD700, 1);
        scoreBg.strokeRoundedRect(-120, -25, 240, 50, 25);

        const scoreText = this.add.text(0, 0, `🏆 ベスト: ${highScore}段`, {
            fontFamily: 'M PLUS Rounded 1c',
            fontSize: '28px',
            fontStyle: 'bold',
            color: '#E75480'
        }).setOrigin(0.5);

        scoreContainer.add([scoreBg, scoreText]);
    }

    createStartButton(width, height) {
        const startBtn = this.add.container(width / 2, height * 0.68);

        // ボタン光彩
        const glow = this.add.graphics();
        glow.fillStyle(0xE75480, 0.3);
        glow.fillRoundedRect(-160, -50, 320, 100, 50);

        this.tweens.add({
            targets: glow,
            scaleX: 1.1,
            scaleY: 1.1,
            alpha: 0.5,
            duration: 1000,
            yoyo: true,
            repeat: -1
        });

        // ボタン背景
        const btnBg = this.add.graphics();
        btnBg.fillStyle(0xE75480, 1);
        btnBg.fillRoundedRect(-145, -45, 290, 90, 45);
        // グラデーション風ハイライト
        btnBg.fillStyle(0xFFFFFF, 0.3);
        btnBg.fillRoundedRect(-140, -42, 280, 35, 20);
        // 縁取り
        btnBg.lineStyle(4, 0xC14679, 1);
        btnBg.strokeRoundedRect(-145, -45, 290, 90, 45);

        const btnText = this.add.text(0, 0, '🎮 スタート', {
            fontFamily: 'M PLUS Rounded 1c',
            fontSize: '40px',
            fontStyle: 'bold',
            color: '#FFFFFF',
            shadow: { offsetX: 2, offsetY: 2, color: '#C14679', blur: 4, fill: true }
        }).setOrigin(0.5);

        startBtn.add([glow, btnBg, btnText]);
        startBtn.setSize(290, 90);
        startBtn.setInteractive({ useHandCursor: true });

        // ホバーエフェクト
        startBtn.on('pointerover', () => {
            this.tweens.add({
                targets: startBtn,
                scaleX: 1.08,
                scaleY: 1.08,
                duration: 150,
                ease: 'Back.easeOut'
            });
        });

        startBtn.on('pointerout', () => {
            this.tweens.add({
                targets: startBtn,
                scaleX: 1,
                scaleY: 1,
                duration: 150
            });
        });

        startBtn.on('pointerdown', () => {
            // クリックエフェクト
            this.cameras.main.flash(200, 255, 200, 220);

            // パーティクル爆発
            const particles = this.add.particles(width / 2, height * 0.68, 'star', {
                speed: { min: 200, max: 400 },
                scale: { start: 0.6, end: 0 },
                lifespan: 600,
                quantity: 20,
                emitting: false
            });
            particles.explode();

            this.time.delayedCall(300, () => {
                this.scene.start('GameScene');
            });
        });
    }

    createInstructions(width, height) {
        // 操作説明カード
        const card = this.add.container(width / 2, height * 0.84);

        const cardBg = this.add.graphics();
        cardBg.fillStyle(0xFFFFFF, 0.7);
        cardBg.fillRoundedRect(-200, -50, 400, 100, 20);
        cardBg.lineStyle(2, 0xE75480, 0.5);
        cardBg.strokeRoundedRect(-200, -50, 400, 100, 20);

        const inst1 = this.add.text(0, -20, '👆 タップでケーキを落とそう！', {
            fontFamily: 'M PLUS Rounded 1c',
            fontSize: '22px',
            fontStyle: 'bold',
            color: '#E75480'
        }).setOrigin(0.5);

        const inst2 = this.add.text(0, 15, '🎯 ピッタリ重ねてハイスコアを目指せ！', {
            fontFamily: 'M PLUS Rounded 1c',
            fontSize: '18px',
            color: '#C14679'
        }).setOrigin(0.5);

        card.add([cardBg, inst1, inst2]);
    }
}

// ============================================
// GameScene - Enhanced メインゲーム
// ============================================
class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    init() {
        this.score = 0;
        this.perfectCombo = 0;
        this.cakeStack = [];
        this.currentCakeWidth = INITIAL_CAKE_WIDTH;
        this.swingSpeed = SWING_SPEED_INITIAL;
        this.swingDirection = 1;
        this.isDropping = false;
        this.gameOver = false;
        this.cakeColorIndex = 0;
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // 背景
        this.createBackground(width, height);

        // ベースプレート
        this.baseY = height - 150;
        this.createPlate(width);

        // ケーキスタックコンテナ
        this.cakeContainer = this.add.container(0, 0);

        // 最初のケーキ
        this.createBaseCake();

        // 揺れるケーキ
        this.createSwingingCake();

        // UI
        this.createUI();

        // パーティクル
        this.createParticleSystems();

        // 入力
        this.input.on('pointerdown', this.onTap, this);

        // スタートボイス再生
        this.playVoice('voice_start');
    }

    playVoice(key) {
        try {
            if (this.cache.audio.exists(key)) {
                this.sound.play(key, { volume: 0.8 });
            }
        } catch (e) {
            console.log(`Voice ${key} not available`);
        }
    }

    createBackground(width, height) {
        const bg = this.add.graphics();
        bg.fillGradientStyle(
            COLORS.background.top, COLORS.background.top,
            COLORS.background.bottom, COLORS.background.bottom, 1
        );
        bg.fillRect(0, 0, width, height);

        // 雲装飾
        for (let i = 0; i < 5; i++) {
            const cloud = this.add.graphics();
            cloud.fillStyle(0xFFFFFF, 0.4);
            cloud.fillEllipse(0, 0, Phaser.Math.Between(80, 150), Phaser.Math.Between(40, 60));
            cloud.x = Phaser.Math.Between(0, width);
            cloud.y = Phaser.Math.Between(50, 200);

            this.tweens.add({
                targets: cloud,
                x: cloud.x + Phaser.Math.Between(-50, 50),
                duration: Phaser.Math.Between(5000, 10000),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }
    }

    createPlate(width) {
        // ベースプレート（豪華版）
        this.plate = this.add.container(width / 2, this.baseY);

        const plateBg = this.add.graphics();
        // 影
        plateBg.fillStyle(0x8B7355, 0.4);
        plateBg.fillRoundedRect(-225, 8, 450, 45, 15);
        // プレート本体
        plateBg.fillStyle(0xDEB887, 1);
        plateBg.fillRoundedRect(-220, 0, 440, 40, 15);
        // ハイライト
        plateBg.fillStyle(0xFFFFFF, 0.4);
        plateBg.fillRoundedRect(-210, 5, 420, 12, 8);
        // 縁取り
        plateBg.lineStyle(3, 0xCD853F, 1);
        plateBg.strokeRoundedRect(-220, 0, 440, 40, 15);

        // 装飾ドット
        for (let i = 0; i < 11; i++) {
            plateBg.fillStyle(0xFFD700, 0.6);
            plateBg.fillCircle(-200 + i * 40, 30, 5);
        }

        this.plate.add(plateBg);
    }

    createParticleSystems() {
        // パーフェクトパーティクル
        this.perfectParticles = this.add.particles(0, 0, 'star', {
            speed: { min: 150, max: 350 },
            scale: { start: 0.7, end: 0 },
            lifespan: 1000,
            gravityY: 150,
            rotate: { min: 0, max: 360 },
            emitting: false
        });

        // コンボパーティクル
        this.comboParticles = this.add.particles(0, 0, 'heart', {
            speed: { min: 100, max: 250 },
            scale: { start: 0.5, end: 0 },
            lifespan: 800,
            gravityY: -50,
            emitting: false
        });

        // キラキラ常時エフェクト
        this.sparkleEmitter = this.add.particles(0, 0, 'sparkle', {
            x: { min: 50, max: this.cameras.main.width - 50 },
            y: { min: 100, max: 300 },
            speed: { min: 10, max: 30 },
            scale: { start: 0.3, end: 0 },
            lifespan: 2000,
            frequency: 500,
            alpha: { start: 0.8, end: 0 }
        });
    }

    createUI() {
        const width = this.cameras.main.width;

        // スコア背景
        const scoreBg = this.add.graphics();
        scoreBg.fillStyle(0xFFFFFF, 0.8);
        scoreBg.fillRoundedRect(width / 2 - 100, 50, 200, 80, 20);
        scoreBg.lineStyle(3, 0xE75480, 0.5);
        scoreBg.strokeRoundedRect(width / 2 - 100, 50, 200, 80, 20);

        // スコアテキスト
        this.scoreText = this.add.text(width / 2, 90, '0段', {
            fontFamily: 'M PLUS Rounded 1c',
            fontSize: '56px',
            fontStyle: 'bold',
            color: '#E75480',
            stroke: '#FFFFFF',
            strokeThickness: 4
        }).setOrigin(0.5);

        // コンボ表示
        this.comboText = this.add.text(width / 2, 150, '', {
            fontFamily: 'M PLUS Rounded 1c',
            fontSize: '32px',
            fontStyle: 'bold',
            color: '#FFD700',
            stroke: '#FFFFFF',
            strokeThickness: 5,
            shadow: { offsetX: 2, offsetY: 2, color: '#E75480', blur: 8, fill: true }
        }).setOrigin(0.5).setAlpha(0);

        // ボイスメッセージ
        this.voiceText = this.add.text(width / 2, 220, '', {
            fontFamily: 'M PLUS Rounded 1c',
            fontSize: '40px',
            fontStyle: 'bold',
            color: '#FFFFFF',
            stroke: '#E75480',
            strokeThickness: 8,
            shadow: { offsetX: 3, offsetY: 3, color: '#C14679', blur: 12, fill: true }
        }).setOrigin(0.5).setAlpha(0);
    }

    createBaseCake() {
        const width = this.cameras.main.width;

        const baseCake = this.add.graphics();
        this.drawEnhancedCake(baseCake, INITIAL_CAKE_WIDTH, 0);
        baseCake.x = width / 2;
        baseCake.y = this.baseY;

        this.cakeContainer.add(baseCake);
        this.cakeStack.push({
            graphics: baseCake,
            x: width / 2,
            width: INITIAL_CAKE_WIDTH
        });
    }

    drawEnhancedCake(graphics, cakeWidth, colorIndex) {
        const colors = COLORS.cakeColors[colorIndex % COLORS.cakeColors.length];

        graphics.clear();

        // 影
        graphics.fillStyle(colors.shadow, 0.5);
        graphics.fillRoundedRect(-cakeWidth / 2 + 3, -CAKE_HEIGHT + 3, cakeWidth, CAKE_HEIGHT, 10);

        // メインボディ
        graphics.fillStyle(colors.main, 1);
        graphics.fillRoundedRect(-cakeWidth / 2, -CAKE_HEIGHT, cakeWidth, CAKE_HEIGHT, 10);

        // ハイライト
        graphics.fillStyle(0xFFFFFF, 0.3);
        graphics.fillRoundedRect(-cakeWidth / 2 + 5, -CAKE_HEIGHT + 5, cakeWidth - 10, 15, 6);

        // クリーム装飾
        graphics.fillStyle(colors.cream, 1);
        const creamCount = Math.max(2, Math.floor(cakeWidth / 70));
        const spacing = cakeWidth / (creamCount + 1);
        for (let i = 1; i <= creamCount; i++) {
            const x = -cakeWidth / 2 + spacing * i;
            graphics.fillCircle(x, -CAKE_HEIGHT + 12, 9);
            graphics.fillCircle(x, -CAKE_HEIGHT + 12, 6);
        }
    }

    createSwingingCake() {
        const width = this.cameras.main.width;

        this.cakeColorIndex = (this.cakeColorIndex + 1) % COLORS.cakeColors.length;

        this.swingingCake = this.add.graphics();
        this.updateSwingingCakeGraphics();
        this.swingingCake.x = width / 2;
        this.swingingCake.y = 300;

        // 揺れるエフェクト
        this.tweens.add({
            targets: this.swingingCake,
            scaleY: 0.95,
            duration: 200,
            yoyo: true,
            repeat: -1
        });
    }

    updateSwingingCakeGraphics() {
        this.drawEnhancedCake(this.swingingCake, this.currentCakeWidth, this.cakeColorIndex);
    }

    update() {
        if (this.gameOver || this.isDropping) return;

        const width = this.cameras.main.width;

        this.swingingCake.x += this.swingSpeed * this.swingDirection;

        if (this.swingingCake.x > width - this.currentCakeWidth / 2 - 30) {
            this.swingDirection = -1;
        } else if (this.swingingCake.x < this.currentCakeWidth / 2 + 30) {
            this.swingDirection = 1;
        }
    }

    onTap() {
        if (this.gameOver || this.isDropping) return;

        this.isDropping = true;

        const topCake = this.cakeStack[this.cakeStack.length - 1];
        const targetY = topCake.graphics.y - CAKE_HEIGHT;

        // 落下SE的エフェクト
        this.cameras.main.shake(50, 0.002);

        this.tweens.add({
            targets: this.swingingCake,
            y: targetY,
            duration: 120,
            ease: 'Bounce.easeOut',
            onComplete: () => this.checkLanding()
        });
    }

    checkLanding() {
        const topCake = this.cakeStack[this.cakeStack.length - 1];

        const dropX = this.swingingCake.x;
        const topX = topCake.x;
        const overlap = this.currentCakeWidth / 2 + topCake.width / 2 - Math.abs(dropX - topX);

        if (overlap <= 0) {
            this.triggerGameOver();
            return;
        }

        const isPerfect = Math.abs(dropX - topX) < 12;

        if (isPerfect) {
            this.handlePerfect(dropX, topCake);
        } else {
            this.handlePartialLanding(dropX, topCake, overlap);
        }
    }

    handlePerfect(dropX, topCake) {
        this.perfectCombo++;
        this.score++;

        // パーフェクトエフェクト
        this.perfectParticles.setPosition(dropX, this.swingingCake.y);
        this.perfectParticles.explode(20);

        // 画面振動
        this.cameras.main.shake(120, 0.008);

        // フラッシュ
        this.cameras.main.flash(100, 255, 215, 0, true);

        // コンボ表示
        if (this.perfectCombo >= 2) {
            this.comboText.setText(`🔥 ${this.perfectCombo} COMBO!`);
            this.comboText.setAlpha(1);
            this.tweens.add({
                targets: this.comboText,
                scaleX: 1.4,
                scaleY: 1.4,
                duration: 150,
                yoyo: true
            });

            // コンボパーティクル
            if (this.perfectCombo >= 5) {
                this.comboParticles.setPosition(dropX, this.swingingCake.y);
                this.comboParticles.explode(10);
                // コンボボイス再生
                this.playVoice('voice_combo');
            }
        }

        // ボイスメッセージ
        this.showVoiceMessage(this.getPerfectMessage());

        this.addCakeToStack(topCake.x, this.currentCakeWidth);
        this.prepareNextCake();
    }

    handlePartialLanding(dropX, topCake, overlap) {
        this.perfectCombo = 0;
        this.score++;
        this.comboText.setAlpha(0);

        const newWidth = Math.max(MIN_CAKE_WIDTH, overlap);

        if (newWidth <= MIN_CAKE_WIDTH) {
            this.triggerGameOver();
            return;
        }

        this.animateCutPiece(dropX, topCake, overlap);

        const newX = dropX > topCake.x
            ? topCake.x + topCake.width / 2 - overlap / 2
            : topCake.x - topCake.width / 2 + overlap / 2;

        this.currentCakeWidth = newWidth;

        this.addCakeToStack(newX, newWidth);
        this.prepareNextCake();
    }

    animateCutPiece(dropX, topCake, overlap) {
        const cutWidth = this.currentCakeWidth - overlap;
        if (cutWidth <= 5) return;

        const colors = COLORS.cakeColors[this.cakeColorIndex];
        const cutPiece = this.add.graphics();
        cutPiece.fillStyle(colors.main, 1);
        cutPiece.fillRoundedRect(-cutWidth / 2, -CAKE_HEIGHT / 2, cutWidth, CAKE_HEIGHT, 6);

        if (dropX > topCake.x) {
            cutPiece.x = dropX + this.currentCakeWidth / 2 - cutWidth / 2;
        } else {
            cutPiece.x = dropX - this.currentCakeWidth / 2 + cutWidth / 2;
        }
        cutPiece.y = this.swingingCake.y;

        this.tweens.add({
            targets: cutPiece,
            y: this.cameras.main.height + 100,
            x: cutPiece.x + (dropX > topCake.x ? 150 : -150),
            rotation: dropX > topCake.x ? 3 : -3,
            alpha: 0,
            duration: 900,
            ease: 'Quad.easeIn',
            onComplete: () => cutPiece.destroy()
        });
    }

    addCakeToStack(x, width) {
        const landedCake = this.add.graphics();
        this.drawEnhancedCake(landedCake, width, this.cakeColorIndex);

        landedCake.x = x;
        landedCake.y = this.swingingCake.y + CAKE_HEIGHT / 2;

        this.cakeContainer.add(landedCake);
        this.cakeStack.push({
            graphics: landedCake,
            x: x,
            width: width
        });

        this.swingingCake.destroy();
        this.checkMilestones();
    }

    prepareNextCake() {
        if (this.score > 5) {
            const scrollAmount = CAKE_HEIGHT;
            this.tweens.add({
                targets: [this.cakeContainer, this.plate],
                y: '+=' + scrollAmount,
                duration: 200,
                ease: 'Quad.easeOut'
            });
        }

        this.swingSpeed = Math.min(14, SWING_SPEED_INITIAL + this.score * SWING_SPEED_INCREMENT);

        this.scoreText.setText(`${this.score}段`);
        this.tweens.add({
            targets: this.scoreText,
            scaleX: 1.3,
            scaleY: 1.3,
            duration: 100,
            yoyo: true
        });

        this.isDropping = false;
        this.createSwingingCake();
    }

    checkMilestones() {
        let message = null;

        if (this.score === 10) {
            message = Phaser.Utils.Array.GetRandom(VOICE_MESSAGES.milestone10);
            this.cameras.main.flash(300, 255, 215, 0, true);
        } else if (this.score === 20) {
            message = Phaser.Utils.Array.GetRandom(VOICE_MESSAGES.milestone20);
            this.cameras.main.flash(300, 255, 215, 0, true);
        } else if (this.score === 30) {
            message = Phaser.Utils.Array.GetRandom(VOICE_MESSAGES.milestone30);
            this.cameras.main.flash(500, 255, 215, 0, true);
        }

        if (message) {
            this.showVoiceMessage(message);
        }
    }

    getPerfectMessage() {
        if (this.perfectCombo >= 5) {
            return Phaser.Utils.Array.GetRandom(VOICE_MESSAGES.perfectCombo);
        }
        return Phaser.Utils.Array.GetRandom(VOICE_MESSAGES.perfect);
    }

    showVoiceMessage(message) {
        this.voiceText.setText(message);
        this.voiceText.setAlpha(1);
        this.voiceText.setScale(0.3);
        this.voiceText.y = 220;

        this.tweens.add({
            targets: this.voiceText,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 200,
            ease: 'Back.easeOut',
            onComplete: () => {
                this.tweens.add({
                    targets: this.voiceText,
                    scaleX: 1,
                    scaleY: 1,
                    duration: 100
                });
            }
        });

        this.tweens.add({
            targets: this.voiceText,
            alpha: 0,
            y: this.voiceText.y - 40,
            duration: 600,
            delay: 1200
        });
    }

    triggerGameOver() {
        this.gameOver = true;

        this.showVoiceMessage(Phaser.Utils.Array.GetRandom(VOICE_MESSAGES.gameOver));

        // ゲームオーバーボイス再生
        this.playVoice('voice_gameover');

        // 崩壊アニメーション
        this.cakeStack.forEach((cake, index) => {
            this.tweens.add({
                targets: cake.graphics,
                x: cake.graphics.x + Phaser.Math.Between(-250, 250),
                y: this.cameras.main.height + 200,
                rotation: Phaser.Math.Between(-4, 4),
                alpha: 0,
                duration: 1200,
                delay: index * 40,
                ease: 'Quad.easeIn'
            });
        });

        if (this.swingingCake) {
            this.tweens.add({
                targets: this.swingingCake,
                y: this.cameras.main.height + 200,
                rotation: 3,
                alpha: 0,
                duration: 800,
                ease: 'Quad.easeIn'
            });
        }

        const highScore = parseInt(localStorage.getItem('cakeTowerHighScore') || '0');
        const isNewRecord = this.score > highScore;

        if (isNewRecord) {
            localStorage.setItem('cakeTowerHighScore', this.score.toString());
        }

        this.time.delayedCall(1500, () => {
            this.scene.start('ResultScene', {
                score: this.score,
                isNewRecord: isNewRecord,
                highScore: Math.max(this.score, highScore)
            });
        });
    }
}

// ============================================
// ResultScene - 豪華リザルト画面
// ============================================
class ResultScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ResultScene' });
    }

    init(data) {
        this.finalScore = data.score || 0;
        this.isNewRecord = data.isNewRecord || false;
        this.highScore = data.highScore || 0;
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // 背景
        const bg = this.add.graphics();
        bg.fillGradientStyle(
            COLORS.background.top, COLORS.background.top,
            COLORS.background.bottom, COLORS.background.bottom, 1
        );
        bg.fillRect(0, 0, width, height);

        if (this.isNewRecord) {
            this.createCelebration(width, height);
        }

        // 結果カード
        this.createResultCard(width, height);

        // ボタン
        this.createButtons(width, height);
    }

    createCelebration(width, height) {
        // 紙吹雪
        const confettiEmojis = ['🎉', '🎊', '⭐', '✨', '💗', '🌟', '💖', '🎀'];

        for (let i = 0; i < 30; i++) {
            const confetti = this.add.text(
                Phaser.Math.Between(0, width),
                -60,
                Phaser.Utils.Array.GetRandom(confettiEmojis),
                { fontSize: `${Phaser.Math.Between(28, 48)}px` }
            );

            this.tweens.add({
                targets: confetti,
                y: height + 60,
                x: confetti.x + Phaser.Math.Between(-120, 120),
                rotation: Phaser.Math.Between(-5, 5),
                duration: Phaser.Math.Between(2500, 5000),
                delay: Phaser.Math.Between(0, 1500),
                repeat: -1,
                onRepeat: () => {
                    confetti.x = Phaser.Math.Between(0, width);
                    confetti.y = -60;
                }
            });
        }

        // ゴールドリング
        for (let i = 0; i < 3; i++) {
            const ring = this.add.graphics();
            ring.lineStyle(4, 0xFFD700, 0.6 - i * 0.15);
            ring.strokeCircle(width / 2, height * 0.35, 120 + i * 30);

            this.tweens.add({
                targets: ring,
                scaleX: 1.5,
                scaleY: 1.5,
                alpha: 0,
                duration: 2000,
                delay: i * 400,
                repeat: -1
            });
        }
    }

    createResultCard(width, height) {
        // カード背景
        const card = this.add.graphics();
        card.fillStyle(0xFFFFFF, 0.9);
        card.fillRoundedRect(width / 2 - 260, height * 0.15, 520, 450, 30);
        card.lineStyle(4, 0xE75480, 0.8);
        card.strokeRoundedRect(width / 2 - 260, height * 0.15, 520, 450, 30);

        // タイトル
        const titleText = this.isNewRecord ? '🎉 NEW RECORD! 🎉' : '🍰 ゲームオーバー';
        const title = this.add.text(width / 2, height * 0.22, titleText, {
            fontFamily: 'M PLUS Rounded 1c',
            fontSize: this.isNewRecord ? '44px' : '48px',
            fontStyle: 'bold',
            color: this.isNewRecord ? '#FFD700' : '#E75480',
            stroke: '#FFFFFF',
            strokeThickness: 6,
            shadow: { offsetX: 2, offsetY: 2, color: this.isNewRecord ? '#E75480' : '#C14679', blur: 8, fill: true }
        }).setOrigin(0.5);

        if (this.isNewRecord) {
            this.tweens.add({
                targets: title,
                scaleX: 1.08,
                scaleY: 1.08,
                duration: 400,
                yoyo: true,
                repeat: -1
            });
        }

        // ケーキタワー表示
        const cakeDisplay = this.add.container(width / 2, height * 0.35);
        for (let i = 0; i < Math.min(5, this.finalScore); i++) {
            const cake = this.add.text(0, -i * 25, '🍰', { fontSize: '50px' }).setOrigin(0.5);
            cakeDisplay.add(cake);
        }
        if (this.finalScore > 5) {
            const more = this.add.text(0, -130, `+${this.finalScore - 5}`, {
                fontFamily: 'M PLUS Rounded 1c',
                fontSize: '24px',
                color: '#E75480'
            }).setOrigin(0.5);
            cakeDisplay.add(more);
        }

        // スコア
        this.add.text(width / 2, height * 0.47, `${this.finalScore}段`, {
            fontFamily: 'M PLUS Rounded 1c',
            fontSize: '88px',
            fontStyle: 'bold',
            color: '#E75480',
            stroke: '#FFFFFF',
            strokeThickness: 8,
            shadow: { offsetX: 3, offsetY: 3, color: '#FFB5C5', blur: 15, fill: true }
        }).setOrigin(0.5);

        // ベストスコア
        this.add.text(width / 2, height * 0.55, `🏆 ベスト: ${this.highScore}段`, {
            fontFamily: 'M PLUS Rounded 1c',
            fontSize: '28px',
            fontStyle: 'bold',
            color: '#C14679'
        }).setOrigin(0.5);

        // 評価
        const rating = this.getRating();
        this.add.text(width / 2, height * 0.61, rating, {
            fontFamily: 'M PLUS Rounded 1c',
            fontSize: '26px',
            fontStyle: 'bold',
            color: '#FFD700',
            stroke: '#FFFFFF',
            strokeThickness: 3
        }).setOrigin(0.5);
    }

    createButtons(width, height) {
        // リトライボタン
        this.createButton(width / 2, height * 0.74, '🔄 もう一度', 0xE75480, () => {
            this.scene.start('GameScene');
        });

        // タイトルボタン
        this.createButton(width / 2, height * 0.84, '🏠 タイトルへ', 0xFFFFFF, () => {
            this.scene.start('TitleScene');
        }, true);
    }

    createButton(x, y, text, color, callback, isSecondary = false) {
        const btn = this.add.container(x, y);

        const btnBg = this.add.graphics();
        if (isSecondary) {
            btnBg.fillStyle(0xFFFFFF, 1);
            btnBg.fillRoundedRect(-140, -40, 280, 80, 40);
            btnBg.lineStyle(4, 0xE75480, 1);
            btnBg.strokeRoundedRect(-140, -40, 280, 80, 40);
        } else {
            // グラデーション風
            btnBg.fillStyle(0xE75480, 1);
            btnBg.fillRoundedRect(-140, -40, 280, 80, 40);
            btnBg.fillStyle(0xFFFFFF, 0.3);
            btnBg.fillRoundedRect(-135, -37, 270, 30, 20);
        }

        const btnText = this.add.text(0, 0, text, {
            fontFamily: 'M PLUS Rounded 1c',
            fontSize: '32px',
            fontStyle: 'bold',
            color: isSecondary ? '#E75480' : '#FFFFFF',
            shadow: isSecondary ? null : { offsetX: 1, offsetY: 1, color: '#C14679', blur: 2, fill: true }
        }).setOrigin(0.5);

        btn.add([btnBg, btnText]);
        btn.setSize(280, 80);
        btn.setInteractive({ useHandCursor: true });

        btn.on('pointerover', () => {
            this.tweens.add({
                targets: btn,
                scaleX: 1.06,
                scaleY: 1.06,
                duration: 120,
                ease: 'Back.easeOut'
            });
        });

        btn.on('pointerout', () => {
            this.tweens.add({
                targets: btn,
                scaleX: 1,
                scaleY: 1,
                duration: 120
            });
        });

        btn.on('pointerdown', callback);

        return btn;
    }

    getRating() {
        if (this.finalScore >= 30) return '🌟 伝説のパティシエ！ 🌟';
        if (this.finalScore >= 25) return '👑 マスターシェフ！ 👑';
        if (this.finalScore >= 20) return '⭐ 一流パティシエ！ ⭐';
        if (this.finalScore >= 15) return '✨ プロ級！ ✨';
        if (this.finalScore >= 10) return '🎂 上手！';
        if (this.finalScore >= 5) return '🍰 いい感じ！';
        return '💪 練習あるのみ！';
    }
}

// ============================================
// ゲーム初期化
// ============================================
const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: GAME_WIDTH,
        height: GAME_HEIGHT
    },
    backgroundColor: COLORS.background.top,
    scene: [BootScene, TitleScene, GameScene, ResultScene],
    audio: {
        disableWebAudio: false
    }
};

window.addEventListener('load', () => {
    const game = new Phaser.Game(config);
});

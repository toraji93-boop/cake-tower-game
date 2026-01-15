// ============================================
// 🍰 ケーキタワー・チャレンジ
// Phaser.js ハイパーカジュアルゲーム
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

// カラーパレット
const COLORS = {
    background: 0xFFE5EC,
    cakeColors: [0xFFB5C5, 0xFFD1DC, 0xFFC4D6, 0xE8B4CB, 0xF4A7B9, 0xFFAEC9],
    cream: 0xFFFDD0,
    chocolate: 0x8B4513,
    strawberry: 0xFF6B6B,
    perfect: 0xFFD700,
    text: 0xE75480,
    textDark: 0xC14679
};

// ボイスメッセージ（ElevenLabs用テキスト - 将来的に音声ファイルに置き換え可能）
const VOICE_MESSAGES = {
    perfect: ['パーフェクト！', '完璧！', '美しい！', 'すごい！'],
    perfectCombo: ['天才パティシエ！', '神業だね！', 'もはや芸術！'],
    milestone10: ['すごいタワーになってきた！', '10段達成！'],
    milestone20: ['ギネス級だよ！', '20段突破！'],
    milestone30: ['伝説のパティシエ！', '30段！信じられない！'],
    gameOver: ['あらら…でも美味しそう！', 'ドンマイ！', 'また挑戦してね！'],
    newRecord: ['やったね！最高記録更新！', '新記録おめでとう！']
};

// ============================================
// BootScene - 初期ロード
// ============================================
class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        // ローディング表示
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0xE75480, 0.3);
        progressBox.fillRoundedRect(width / 2 - 160, height / 2 - 15, 320, 30, 15);

        this.load.on('progress', (value) => {
            progressBar.clear();
            progressBar.fillStyle(0xE75480, 1);
            progressBar.fillRoundedRect(width / 2 - 155, height / 2 - 10, 310 * value, 20, 10);
        });

        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
        });

        // 動的にアセットを生成（外部ファイル不要）
        this.createGameAssets();
    }

    createGameAssets() {
        // ケーキテクスチャを動的生成
        const graphics = this.make.graphics({ x: 0, y: 0, add: false });

        // ケーキピースを複数色で作成
        COLORS.cakeColors.forEach((color, index) => {
            graphics.clear();
            graphics.fillStyle(color, 1);
            graphics.fillRoundedRect(0, 0, INITIAL_CAKE_WIDTH, CAKE_HEIGHT, 10);
            // クリーム装飾
            graphics.fillStyle(COLORS.cream, 1);
            graphics.fillCircle(30, 15, 12);
            graphics.fillCircle(INITIAL_CAKE_WIDTH - 30, 15, 12);
            graphics.fillCircle(INITIAL_CAKE_WIDTH / 2, 15, 12);
            graphics.generateTexture(`cake_${index}`, INITIAL_CAKE_WIDTH, CAKE_HEIGHT);
        });

        // ベースプレート
        graphics.clear();
        graphics.fillStyle(0xE8D4C4, 1);
        graphics.fillRoundedRect(0, 0, 500, 40, 10);
        graphics.generateTexture('plate', 500, 40);

        // パーティクル用
        graphics.clear();
        graphics.fillStyle(0xFFFFFF, 1);
        graphics.fillCircle(8, 8, 8);
        graphics.generateTexture('particle', 16, 16);

        // 星パーティクル
        graphics.clear();
        graphics.fillStyle(0xFFD700, 1);
        this.drawStar(graphics, 16, 16, 5, 16, 8);
        graphics.generateTexture('star', 32, 32);

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

    create() {
        this.scene.start('TitleScene');
    }
}

// ============================================
// TitleScene - タイトル画面
// ============================================
class TitleScene extends Phaser.Scene {
    constructor() {
        super({ key: 'TitleScene' });
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // 背景グラデーション
        const bg = this.add.graphics();
        bg.fillGradientStyle(0xFFE5EC, 0xFFE5EC, 0xFFC2D1, 0xFFC2D1, 1);
        bg.fillRect(0, 0, width, height);

        // 装飾パーティクル（背景）
        this.createBackgroundDecorations();

        // ケーキアイコン（タイトル上）
        const cakeIcon = this.add.text(width / 2, height * 0.22, '🍰', {
            fontSize: '120px'
        }).setOrigin(0.5);

        this.tweens.add({
            targets: cakeIcon,
            y: cakeIcon.y - 20,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // タイトルテキスト
        const title = this.add.text(width / 2, height * 0.38, 'ケーキタワー', {
            fontFamily: 'M PLUS Rounded 1c',
            fontSize: '72px',
            fontStyle: 'bold',
            color: '#E75480',
            stroke: '#FFFFFF',
            strokeThickness: 8,
            shadow: { offsetX: 3, offsetY: 3, color: '#FFB5C5', blur: 10, fill: true }
        }).setOrigin(0.5);

        const subtitle = this.add.text(width / 2, height * 0.46, 'チャレンジ', {
            fontFamily: 'M PLUS Rounded 1c',
            fontSize: '56px',
            fontStyle: 'bold',
            color: '#C14679',
            stroke: '#FFFFFF',
            strokeThickness: 6
        }).setOrigin(0.5);

        // ハイスコア表示
        const highScore = localStorage.getItem('cakeTowerHighScore') || 0;
        this.add.text(width / 2, height * 0.55, `🏆 ベスト: ${highScore}段`, {
            fontFamily: 'M PLUS Rounded 1c',
            fontSize: '32px',
            color: '#E75480'
        }).setOrigin(0.5);

        // スタートボタン
        const startBtn = this.add.container(width / 2, height * 0.7);

        const btnBg = this.add.graphics();
        btnBg.fillStyle(0xE75480, 1);
        btnBg.fillRoundedRect(-140, -40, 280, 80, 40);
        btnBg.lineStyle(4, 0xC14679, 1);
        btnBg.strokeRoundedRect(-140, -40, 280, 80, 40);

        const btnText = this.add.text(0, 0, '🎮 スタート', {
            fontFamily: 'M PLUS Rounded 1c',
            fontSize: '36px',
            fontStyle: 'bold',
            color: '#FFFFFF'
        }).setOrigin(0.5);

        startBtn.add([btnBg, btnText]);
        startBtn.setSize(280, 80);
        startBtn.setInteractive({ useHandCursor: true });

        // ボタンアニメーション
        this.tweens.add({
            targets: startBtn,
            scaleX: 1.05,
            scaleY: 1.05,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        startBtn.on('pointerover', () => {
            this.tweens.add({
                targets: startBtn,
                scaleX: 1.1,
                scaleY: 1.1,
                duration: 100
            });
        });

        startBtn.on('pointerout', () => {
            this.tweens.add({
                targets: startBtn,
                scaleX: 1,
                scaleY: 1,
                duration: 100
            });
        });

        startBtn.on('pointerdown', () => {
            this.cameras.main.flash(300, 255, 200, 220);
            this.time.delayedCall(200, () => {
                this.scene.start('GameScene');
            });
        });

        // 操作説明
        this.add.text(width / 2, height * 0.85, 'タップでケーキを落とそう！', {
            fontFamily: 'M PLUS Rounded 1c',
            fontSize: '24px',
            color: '#C14679'
        }).setOrigin(0.5);

        this.add.text(width / 2, height * 0.90, 'ピッタリ重ねてハイスコアを目指せ！', {
            fontFamily: 'M PLUS Rounded 1c',
            fontSize: '20px',
            color: '#C14679',
            alpha: 0.8
        }).setOrigin(0.5);
    }

    createBackgroundDecorations() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // ハートや星の装飾
        const decorations = ['💗', '⭐', '✨', '🌸', '💕'];

        for (let i = 0; i < 15; i++) {
            const deco = this.add.text(
                Phaser.Math.Between(50, width - 50),
                Phaser.Math.Between(50, height - 50),
                Phaser.Utils.Array.GetRandom(decorations),
                { fontSize: `${Phaser.Math.Between(20, 40)}px` }
            ).setAlpha(0.3);

            this.tweens.add({
                targets: deco,
                y: deco.y - Phaser.Math.Between(20, 50),
                alpha: { from: 0.3, to: 0.6 },
                duration: Phaser.Math.Between(2000, 4000),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut',
                delay: Phaser.Math.Between(0, 2000)
            });
        }
    }
}

// ============================================
// GameScene - メインゲーム
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
        const bg = this.add.graphics();
        bg.fillGradientStyle(0xFFE5EC, 0xFFE5EC, 0xFFC2D1, 0xFFC2D1, 1);
        bg.fillRect(0, 0, width, height);

        // ベースプレート
        this.baseY = height - 150;
        this.plate = this.add.graphics();
        this.plate.fillStyle(0xE8D4C4, 1);
        this.plate.fillRoundedRect(width / 2 - 220, this.baseY, 440, 30, 10);
        this.plate.lineStyle(3, 0xD4C4B0, 1);
        this.plate.strokeRoundedRect(width / 2 - 220, this.baseY, 440, 30, 10);

        // ケーキスタックコンテナ
        this.cakeContainer = this.add.container(0, 0);

        // 最初のケーキ（ベース）
        this.createBaseCake();

        // 揺れるケーキ
        this.createSwingingCake();

        // UI
        this.createUI();

        // 入力設定
        this.input.on('pointerdown', this.onTap, this);

        // パーティクルエミッター設定
        this.perfectParticles = this.add.particles(0, 0, 'star', {
            speed: { min: 100, max: 300 },
            scale: { start: 0.6, end: 0 },
            lifespan: 800,
            gravityY: 200,
            emitting: false
        });
    }

    createUI() {
        const width = this.cameras.main.width;

        // スコア表示
        this.scoreText = this.add.text(width / 2, 80, '0段', {
            fontFamily: 'M PLUS Rounded 1c',
            fontSize: '64px',
            fontStyle: 'bold',
            color: '#E75480',
            stroke: '#FFFFFF',
            strokeThickness: 6
        }).setOrigin(0.5);

        // コンボ表示
        this.comboText = this.add.text(width / 2, 140, '', {
            fontFamily: 'M PLUS Rounded 1c',
            fontSize: '28px',
            fontStyle: 'bold',
            color: '#FFD700',
            stroke: '#FFFFFF',
            strokeThickness: 4
        }).setOrigin(0.5).setAlpha(0);

        // ボイスメッセージ表示用
        this.voiceText = this.add.text(width / 2, 220, '', {
            fontFamily: 'M PLUS Rounded 1c',
            fontSize: '36px',
            fontStyle: 'bold',
            color: '#FFFFFF',
            stroke: '#E75480',
            strokeThickness: 6,
            shadow: { offsetX: 2, offsetY: 2, color: '#C14679', blur: 8, fill: true }
        }).setOrigin(0.5).setAlpha(0);
    }

    createBaseCake() {
        const width = this.cameras.main.width;

        const baseCake = this.add.graphics();
        baseCake.fillStyle(COLORS.cakeColors[0], 1);
        baseCake.fillRoundedRect(-INITIAL_CAKE_WIDTH / 2, -CAKE_HEIGHT, INITIAL_CAKE_WIDTH, CAKE_HEIGHT, 8);
        // クリーム
        baseCake.fillStyle(COLORS.cream, 1);
        for (let i = 0; i < 5; i++) {
            baseCake.fillCircle(-INITIAL_CAKE_WIDTH / 2 + 40 + i * 80, -CAKE_HEIGHT + 12, 10);
        }
        baseCake.x = width / 2;
        baseCake.y = this.baseY;

        this.cakeContainer.add(baseCake);
        this.cakeStack.push({
            graphics: baseCake,
            x: width / 2,
            width: INITIAL_CAKE_WIDTH
        });
    }

    createSwingingCake() {
        const width = this.cameras.main.width;

        this.cakeColorIndex = (this.cakeColorIndex + 1) % COLORS.cakeColors.length;

        this.swingingCake = this.add.graphics();
        this.updateSwingingCakeGraphics();
        this.swingingCake.x = width / 2;
        this.swingingCake.y = 280;
    }

    updateSwingingCakeGraphics() {
        this.swingingCake.clear();
        this.swingingCake.fillStyle(COLORS.cakeColors[this.cakeColorIndex], 1);
        this.swingingCake.fillRoundedRect(-this.currentCakeWidth / 2, -CAKE_HEIGHT / 2, this.currentCakeWidth, CAKE_HEIGHT, 8);
        // クリーム装飾
        this.swingingCake.fillStyle(COLORS.cream, 1);
        const creamCount = Math.max(2, Math.floor(this.currentCakeWidth / 80));
        const spacing = this.currentCakeWidth / (creamCount + 1);
        for (let i = 1; i <= creamCount; i++) {
            this.swingingCake.fillCircle(-this.currentCakeWidth / 2 + spacing * i, -CAKE_HEIGHT / 2 + 12, 8);
        }
    }

    update() {
        if (this.gameOver || this.isDropping) return;

        const width = this.cameras.main.width;

        // ケーキを左右に揺らす
        this.swingingCake.x += this.swingSpeed * this.swingDirection;

        // 画面端で反転
        if (this.swingingCake.x > width - this.currentCakeWidth / 2 - 20) {
            this.swingDirection = -1;
        } else if (this.swingingCake.x < this.currentCakeWidth / 2 + 20) {
            this.swingDirection = 1;
        }
    }

    onTap() {
        if (this.gameOver || this.isDropping) return;

        this.isDropping = true;

        const topCake = this.cakeStack[this.cakeStack.length - 1];
        const targetY = topCake.graphics.y - CAKE_HEIGHT;

        // ケーキ落下アニメーション
        this.tweens.add({
            targets: this.swingingCake,
            y: targetY,
            duration: 150,
            ease: 'Bounce.easeOut',
            onComplete: () => this.checkLanding()
        });
    }

    checkLanding() {
        const width = this.cameras.main.width;
        const topCake = this.cakeStack[this.cakeStack.length - 1];

        const dropX = this.swingingCake.x;
        const topX = topCake.x;
        const overlap = this.currentCakeWidth / 2 + topCake.width / 2 - Math.abs(dropX - topX);

        if (overlap <= 0) {
            // 完全に外した - ゲームオーバー
            this.triggerGameOver();
            return;
        }

        const isPerfect = Math.abs(dropX - topX) < 15;

        if (isPerfect) {
            // パーフェクト！幅維持
            this.handlePerfect(dropX, topCake);
        } else {
            // 一部カット
            this.handlePartialLanding(dropX, topCake, overlap);
        }
    }

    handlePerfect(dropX, topCake) {
        this.perfectCombo++;
        this.score++;

        // パーフェクトエフェクト
        this.perfectParticles.setPosition(dropX, this.swingingCake.y);
        this.perfectParticles.explode(15);

        // カメラシェイク
        this.cameras.main.shake(100, 0.005);

        // コンボ表示
        if (this.perfectCombo >= 3) {
            this.comboText.setText(`🔥 ${this.perfectCombo} COMBO!`);
            this.comboText.setAlpha(1);
            this.tweens.add({
                targets: this.comboText,
                scaleX: 1.3,
                scaleY: 1.3,
                duration: 100,
                yoyo: true
            });
        }

        // ボイスメッセージ
        this.showVoiceMessage(this.getPerfectMessage());

        // ケーキをスタックに追加
        this.addCakeToStack(topCake.x, this.currentCakeWidth);

        // 次のケーキ準備
        this.prepareNextCake();
    }

    handlePartialLanding(dropX, topCake, overlap) {
        this.perfectCombo = 0;
        this.score++;
        this.comboText.setAlpha(0);

        // 新しい幅を計算
        const newWidth = Math.max(MIN_CAKE_WIDTH, overlap);

        if (newWidth <= MIN_CAKE_WIDTH) {
            // 幅が最小になったらゲームオーバー
            this.triggerGameOver();
            return;
        }

        // カットされた部分を落とすアニメーション
        this.animateCutPiece(dropX, topCake, overlap);

        // 着地位置を計算
        const newX = dropX > topCake.x
            ? topCake.x + topCake.width / 2 - overlap / 2
            : topCake.x - topCake.width / 2 + overlap / 2;

        this.currentCakeWidth = newWidth;

        // ケーキをスタックに追加
        this.addCakeToStack(newX, newWidth);

        // 次のケーキ準備
        this.prepareNextCake();
    }

    animateCutPiece(dropX, topCake, overlap) {
        const cutWidth = this.currentCakeWidth - overlap;
        if (cutWidth <= 5) return;

        const cutPiece = this.add.graphics();
        cutPiece.fillStyle(COLORS.cakeColors[this.cakeColorIndex], 1);
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
            x: cutPiece.x + (dropX > topCake.x ? 100 : -100),
            rotation: dropX > topCake.x ? 2 : -2,
            alpha: 0,
            duration: 800,
            ease: 'Quad.easeIn',
            onComplete: () => cutPiece.destroy()
        });
    }

    addCakeToStack(x, width) {
        const landedCake = this.add.graphics();
        landedCake.fillStyle(COLORS.cakeColors[this.cakeColorIndex], 1);
        landedCake.fillRoundedRect(-width / 2, -CAKE_HEIGHT, width, CAKE_HEIGHT, 8);
        // クリーム
        landedCake.fillStyle(COLORS.cream, 1);
        const creamCount = Math.max(1, Math.floor(width / 100));
        const spacing = width / (creamCount + 1);
        for (let i = 1; i <= creamCount; i++) {
            landedCake.fillCircle(-width / 2 + spacing * i, -CAKE_HEIGHT + 10, 6);
        }

        landedCake.x = x;
        landedCake.y = this.swingingCake.y + CAKE_HEIGHT / 2;

        this.cakeContainer.add(landedCake);
        this.cakeStack.push({
            graphics: landedCake,
            x: x,
            width: width
        });

        // 古いスウィングケーキを削除
        this.swingingCake.destroy();

        // マイルストーンチェック
        this.checkMilestones();
    }

    prepareNextCake() {
        // カメラを上にパン（タワーが高くなったら）
        if (this.score > 5) {
            const scrollAmount = CAKE_HEIGHT;
            this.tweens.add({
                targets: this.cakeContainer,
                y: this.cakeContainer.y + scrollAmount,
                duration: 200,
                ease: 'Quad.easeOut'
            });
            this.tweens.add({
                targets: this.plate,
                y: this.plate.y + scrollAmount,
                duration: 200,
                ease: 'Quad.easeOut'
            });
        }

        // スピードアップ
        this.swingSpeed = Math.min(12, SWING_SPEED_INITIAL + this.score * SWING_SPEED_INCREMENT);

        // スコア更新
        this.scoreText.setText(`${this.score}段`);
        this.tweens.add({
            targets: this.scoreText,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 100,
            yoyo: true
        });

        // 新しいスウィングケーキを作成
        this.isDropping = false;
        this.createSwingingCake();
    }

    checkMilestones() {
        let message = null;

        if (this.score === 10) {
            message = Phaser.Utils.Array.GetRandom(VOICE_MESSAGES.milestone10);
        } else if (this.score === 20) {
            message = Phaser.Utils.Array.GetRandom(VOICE_MESSAGES.milestone20);
        } else if (this.score === 30) {
            message = Phaser.Utils.Array.GetRandom(VOICE_MESSAGES.milestone30);
        }

        if (message) {
            this.showVoiceMessage(message);
            this.cameras.main.flash(300, 255, 215, 0, true);
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
        this.voiceText.setScale(0.5);

        this.tweens.add({
            targets: this.voiceText,
            scaleX: 1,
            scaleY: 1,
            duration: 200,
            ease: 'Back.easeOut'
        });

        this.tweens.add({
            targets: this.voiceText,
            alpha: 0,
            y: this.voiceText.y - 30,
            duration: 500,
            delay: 1000,
            onComplete: () => {
                this.voiceText.y = 220;
            }
        });
    }

    triggerGameOver() {
        this.gameOver = true;

        // ゲームオーバーメッセージ
        this.showVoiceMessage(Phaser.Utils.Array.GetRandom(VOICE_MESSAGES.gameOver));

        // タワー崩壊アニメーション
        this.cakeStack.forEach((cake, index) => {
            this.tweens.add({
                targets: cake.graphics,
                x: cake.graphics.x + Phaser.Math.Between(-200, 200),
                y: this.cameras.main.height + 200,
                rotation: Phaser.Math.Between(-3, 3),
                alpha: 0,
                duration: 1000,
                delay: index * 50,
                ease: 'Quad.easeIn'
            });
        });

        // スウィングケーキも落とす
        if (this.swingingCake) {
            this.tweens.add({
                targets: this.swingingCake,
                y: this.cameras.main.height + 200,
                rotation: 2,
                alpha: 0,
                duration: 800,
                ease: 'Quad.easeIn'
            });
        }

        // ハイスコア更新チェック
        const highScore = parseInt(localStorage.getItem('cakeTowerHighScore') || '0');
        const isNewRecord = this.score > highScore;

        if (isNewRecord) {
            localStorage.setItem('cakeTowerHighScore', this.score.toString());
        }

        // リザルト画面へ
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
// ResultScene - リザルト画面
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
        bg.fillGradientStyle(0xFFE5EC, 0xFFE5EC, 0xFFC2D1, 0xFFC2D1, 1);
        bg.fillRect(0, 0, width, height);

        // 装飾
        this.createCelebration();

        // 結果タイトル
        const titleText = this.isNewRecord ? '🎉 NEW RECORD! 🎉' : 'ゲームオーバー';
        const title = this.add.text(width / 2, height * 0.2, titleText, {
            fontFamily: 'M PLUS Rounded 1c',
            fontSize: this.isNewRecord ? '48px' : '52px',
            fontStyle: 'bold',
            color: this.isNewRecord ? '#FFD700' : '#E75480',
            stroke: '#FFFFFF',
            strokeThickness: 6
        }).setOrigin(0.5);

        if (this.isNewRecord) {
            this.tweens.add({
                targets: title,
                scaleX: 1.1,
                scaleY: 1.1,
                duration: 500,
                yoyo: true,
                repeat: -1
            });
        }

        // ケーキタワーイラスト
        this.add.text(width / 2, height * 0.35, '🍰', {
            fontSize: '100px'
        }).setOrigin(0.5);

        // スコア表示
        this.add.text(width / 2, height * 0.48, `${this.finalScore}段`, {
            fontFamily: 'M PLUS Rounded 1c',
            fontSize: '96px',
            fontStyle: 'bold',
            color: '#E75480',
            stroke: '#FFFFFF',
            strokeThickness: 8,
            shadow: { offsetX: 3, offsetY: 3, color: '#FFB5C5', blur: 10, fill: true }
        }).setOrigin(0.5);

        // ベストスコア
        this.add.text(width / 2, height * 0.58, `🏆 ベスト: ${this.highScore}段`, {
            fontFamily: 'M PLUS Rounded 1c',
            fontSize: '32px',
            color: '#C14679'
        }).setOrigin(0.5);

        // 評価テキスト
        const ratingText = this.getRating();
        this.add.text(width / 2, height * 0.66, ratingText, {
            fontFamily: 'M PLUS Rounded 1c',
            fontSize: '28px',
            color: '#E75480'
        }).setOrigin(0.5);

        // リトライボタン
        const retryBtn = this.createButton(width / 2, height * 0.78, '🔄 もう一度', () => {
            this.scene.start('GameScene');
        });

        // タイトルボタン
        const titleBtn = this.createButton(width / 2, height * 0.88, '🏠 タイトルへ', () => {
            this.scene.start('TitleScene');
        }, true);
    }

    createButton(x, y, text, callback, isSecondary = false) {
        const btn = this.add.container(x, y);

        const btnBg = this.add.graphics();
        if (isSecondary) {
            btnBg.fillStyle(0xFFFFFF, 1);
            btnBg.lineStyle(3, 0xE75480, 1);
        } else {
            btnBg.fillStyle(0xE75480, 1);
        }
        btnBg.fillRoundedRect(-130, -35, 260, 70, 35);
        if (isSecondary) {
            btnBg.strokeRoundedRect(-130, -35, 260, 70, 35);
        }

        const btnText = this.add.text(0, 0, text, {
            fontFamily: 'M PLUS Rounded 1c',
            fontSize: '28px',
            fontStyle: 'bold',
            color: isSecondary ? '#E75480' : '#FFFFFF'
        }).setOrigin(0.5);

        btn.add([btnBg, btnText]);
        btn.setSize(260, 70);
        btn.setInteractive({ useHandCursor: true });

        btn.on('pointerover', () => {
            this.tweens.add({
                targets: btn,
                scaleX: 1.05,
                scaleY: 1.05,
                duration: 100
            });
        });

        btn.on('pointerout', () => {
            this.tweens.add({
                targets: btn,
                scaleX: 1,
                scaleY: 1,
                duration: 100
            });
        });

        btn.on('pointerdown', callback);

        return btn;
    }

    getRating() {
        if (this.finalScore >= 30) return '🌟 伝説のパティシエ！ 🌟';
        if (this.finalScore >= 20) return '⭐ 一流パティシエ！ ⭐';
        if (this.finalScore >= 15) return '✨ プロ級！ ✨';
        if (this.finalScore >= 10) return '🎂 上手！';
        if (this.finalScore >= 5) return '🍰 いい感じ！';
        return '💪 練習あるのみ！';
    }

    createCelebration() {
        if (!this.isNewRecord) return;

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // 紙吹雪エフェクト
        const confettiColors = ['💗', '⭐', '✨', '🎉', '🎊', '💕'];

        for (let i = 0; i < 20; i++) {
            const confetti = this.add.text(
                Phaser.Math.Between(0, width),
                -50,
                Phaser.Utils.Array.GetRandom(confettiColors),
                { fontSize: `${Phaser.Math.Between(24, 40)}px` }
            );

            this.tweens.add({
                targets: confetti,
                y: height + 50,
                x: confetti.x + Phaser.Math.Between(-100, 100),
                rotation: Phaser.Math.Between(0, 6),
                duration: Phaser.Math.Between(2000, 4000),
                delay: Phaser.Math.Between(0, 1000),
                repeat: -1,
                onRepeat: () => {
                    confetti.x = Phaser.Math.Between(0, width);
                    confetti.y = -50;
                }
            });
        }
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
    backgroundColor: 0xFFE5EC,
    scene: [BootScene, TitleScene, GameScene, ResultScene],
    audio: {
        disableWebAudio: false
    }
};

// ゲームインスタンス生成
window.addEventListener('load', () => {
    const game = new Phaser.Game(config);
});

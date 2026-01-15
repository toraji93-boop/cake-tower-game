"""
🎵 Suno.com BGM Generator
browser-use ライブラリを使用してSuno.comからBGMを生成・ダウンロード
"""

import asyncio
import os
import shutil
from pathlib import Path

from browser_use import Agent, Browser
from langchain_openai import ChatOpenAI

# 設定
DOWNLOAD_DIR = Path(__file__).parent / "assets"
BGM_PROMPT = "Fast tempo, 8-bit, excited gaming music"

async def generate_bgm():
    """Suno.comでBGMを生成してダウンロード"""
    
    # ダウンロードディレクトリを確保
    DOWNLOAD_DIR.mkdir(exist_ok=True)
    
    # ブラウザインスタンス（デフォルト設定で起動）
    browser = Browser()
    
    # LLMの設定（環境変数 OPENAI_API_KEY が必要）
    llm = ChatOpenAI(model="gpt-4o", temperature=0)
    
    # タスク定義
    task = f"""
    あなたはSuno.comでBGMを生成するアシスタントです。
    
    以下のステップを実行してください:
    
    1. https://suno.com にアクセスする
    2. もしログインが必要なら、Googleでサインインをクリック
    3. 「Create」ボタンをクリックして作成画面に移動
    4. プロンプト入力欄に「{BGM_PROMPT}」と入力
    5. 「Create」または「Generate」ボタンをクリックして生成開始
    6. 生成が完了するまで待つ（最大3分程度かかる場合がある）
    7. 生成された曲のダウンロードボタン（...メニューまたはダウンロードアイコン）を探す
    8. MP3形式でダウンロードする
    
    完了したら「BGM generation completed」と報告してください。
    """
    
    agent = Agent(
        task=task,
        llm=llm,
        browser=browser,
    )
    
    try:
        print("🎵 Suno.comでBGM生成を開始します...")
        print("💡 ブラウザが開きます。必要に応じてログインしてください。")
        result = await agent.run()
        print(f"✅ 結果: {result}")
        
        # ダウンロードフォルダからmp3を移動
        await move_downloaded_mp3()
        
    except Exception as e:
        print(f"❌ エラー: {e}")
        print("💡 手動でSuno.comからBGMをダウンロードして assets/bgm.mp3 に配置してください")
    finally:
        await browser.close()

async def move_downloaded_mp3():
    """ダウンロードフォルダからmp3を移動"""
    downloads_dir = Path(os.path.expanduser("~")) / "Downloads"
    
    # 最新のmp3ファイルを探す
    mp3_files = list(downloads_dir.glob("*.mp3"))
    if mp3_files:
        # 最新のファイルを取得
        latest_mp3 = max(mp3_files, key=lambda p: p.stat().st_mtime)
        
        # assets/bgm.mp3 に移動
        target = DOWNLOAD_DIR / "bgm.mp3"
        shutil.copy(str(latest_mp3), str(target))
        print(f"✅ BGMを保存: {target}")
    else:
        print("⚠️ ダウンロードフォルダにmp3が見つかりません")
        print("💡 手動でダウンロードして assets/bgm.mp3 に配置してください")

if __name__ == "__main__":
    asyncio.run(generate_bgm())

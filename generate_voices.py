"""
🎤 ElevenLabs Voice Generator for Cake Tower Game
ゲーム内実況ボイスを生成
"""

import os
from pathlib import Path
from dotenv import load_dotenv
from elevenlabs import ElevenLabs

# .envファイルから環境変数を読み込み
load_dotenv()

# 設定
OUTPUT_DIR = Path(__file__).parent / "assets"
VOICE_ID = "21m00Tcm4TlvDq8ikWAM"  # Rachel - clear, friendly voice

# 生成するセリフリスト
VOICE_LINES = [
    {"text": "Ready, Go!", "filename": "start.mp3"},
    {"text": "Unbelievable!", "filename": "combo.mp3"},
    {"text": "Game Over", "filename": "gameover.mp3"},
]

def generate_voices():
    """ElevenLabs APIでボイスを生成"""
    
    # APIキーを取得
    api_key = os.getenv("ELEVENLABS_API_KEY")
    if not api_key:
        print("❌ エラー: ELEVENLABS_API_KEY が .env ファイルに設定されていません")
        print("💡 .env ファイルに以下を追加してください:")
        print("   ELEVENLABS_API_KEY=your_api_key_here")
        return False
    
    # 出力ディレクトリを確保
    OUTPUT_DIR.mkdir(exist_ok=True)
    
    # ElevenLabsクライアントを初期化
    client = ElevenLabs(api_key=api_key)
    
    print("🎤 ボイス生成を開始します...")
    print(f"📁 出力先: {OUTPUT_DIR}")
    print("-" * 40)
    
    success_count = 0
    
    for line in VOICE_LINES:
        text = line["text"]
        filename = line["filename"]
        output_path = OUTPUT_DIR / filename
        
        print(f"\n🔊 生成中: \"{text}\"")
        
        try:
            # 音声を生成
            audio = client.text_to_speech.convert(
                voice_id=VOICE_ID,
                text=text,
                model_id="eleven_multilingual_v2",
                output_format="mp3_44100_128"
            )
            
            # ファイルに保存
            with open(output_path, "wb") as f:
                for chunk in audio:
                    f.write(chunk)
            
            print(f"   ✅ 保存: {filename}")
            success_count += 1
            
        except Exception as e:
            print(f"   ❌ エラー: {e}")
    
    print("\n" + "=" * 40)
    print(f"🎉 完了！ {success_count}/{len(VOICE_LINES)} ファイルを生成しました")
    
    return success_count == len(VOICE_LINES)

if __name__ == "__main__":
    generate_voices()

import asyncio
import json
import sys
import base64
import edge_tts

VOICE_MAP = {
    'alloy': 'en-US-JennyNeural',
    'echo': 'en-US-BrianMultilingualNeural',
    'fable': 'en-US-AndrewMultilingualNeural',
    'nova': 'en-US-AvaMultilingualNeural',
    'onyx': 'en-US-GuyNeural',
    'shimmer': 'en-US-MichelleNeural',
}

async def run(text: str, voice_key: str, rate: str = "+12%"):
    voice = VOICE_MAP.get(voice_key.lower(), voice_key if 'en-US' in voice_key else 'en-US-JennyNeural')
    communicate = edge_tts.Communicate(text, voice, boundary="WordBoundary", rate=rate)

    word_timestamps = []
    audio_data = bytearray()

    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            audio_data.extend(chunk["data"])
        elif chunk["type"] == "WordBoundary":
            start_ms = round(chunk["offset"] / 10000)
            duration_ms = round(chunk["duration"] / 10000)
            end_ms = start_ms + duration_ms
            word = chunk["text"]
            word_timestamps.append({
                "word": word,
                "startMs": start_ms,
                "endMs": end_ms
            })

    # Add 250ms acoustic release buffer so the final word never gets clipped
    total_duration_ms = word_timestamps[-1]["endMs"] + 250 if word_timestamps else 0
    b64_audio = base64.b64encode(audio_data).decode('utf-8')

    result = {
        "success": True,
        "text": text,
        "voice": voice,
        "rate": rate,
        "durationSec": round(total_duration_ms / 1000.0, 2),
        "totalDurationMs": total_duration_ms,
        "wordCount": len(word_timestamps),
        "wordTimestamps": word_timestamps,
        "audioBase64": f"data:audio/mp3;base64,{b64_audio}"
    }

    print(json.dumps(result))

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"success": False, "error": "No text provided"}))
        sys.exit(1)
    
    input_text = sys.argv[1]
    input_voice = sys.argv[2] if len(sys.argv) > 2 else 'alloy'
    input_rate = sys.argv[3] if len(sys.argv) > 3 else '+12%'

    asyncio.run(run(input_text, input_voice, input_rate))

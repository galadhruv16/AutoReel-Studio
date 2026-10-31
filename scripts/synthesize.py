"""
AutoReel Studio - Audio & Word Timestamp Synthesizer
Uses Microsoft Edge Neural TTS ($0.00 cost, zero API keys) to generate:
1. Speech audio (MP3)
2. Millisecond-accurate word boundary timestamps (JSON)
"""

import asyncio
import json
import os
import sys
import edge_tts

async def synthesize(text: str, voice: str, output_audio_path: str, output_json_path: str):
    os.makedirs(os.path.dirname(os.path.abspath(output_audio_path)), exist_ok=True)
    os.makedirs(os.path.dirname(os.path.abspath(output_json_path)), exist_ok=True)

    # Note: boundary="WordBoundary" explicitly instructs Edge TTS to emit word boundaries
    communicate = edge_tts.Communicate(text, voice, boundary="WordBoundary")
    
    word_timestamps = []
    audio_data = bytearray()
    
    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            audio_data.extend(chunk["data"])
        elif chunk["type"] == "WordBoundary":
            # 1 tick = 100 nanoseconds -> offset / 10,000 = milliseconds
            start_ms = round(chunk["offset"] / 10000)
            duration_ms = round(chunk["duration"] / 10000)
            end_ms = start_ms + duration_ms
            word = chunk["text"]
            
            word_timestamps.append({
                "word": word,
                "startMs": start_ms,
                "endMs": end_ms
            })

    # Write MP3 file
    with open(output_audio_path, "wb") as f:
        f.write(audio_data)

    total_duration_ms = word_timestamps[-1]["endMs"] + 200 if word_timestamps else 0

    result = {
        "text": text,
        "voice": voice,
        "audioFile": os.path.basename(output_audio_path),
        "totalDurationMs": total_duration_ms,
        "wordCount": len(word_timestamps),
        "wordTimestamps": word_timestamps
    }

    # Write word alignment JSON
    with open(output_json_path, "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2)

    print(f"SUCCESS: Generated {output_audio_path} ({len(audio_data)} bytes)")
    print(f"SUCCESS: Generated {output_json_path} ({len(word_timestamps)} words, {total_duration_ms}ms total)")
    return result

if __name__ == "__main__":
    test_text = "If you think Kubernetes runs Docker containers directly, you've been lied to."
    test_voice = "en-US-ChristopherNeural"
    
    out_audio = os.path.join("public", "audio", "spike_test.mp3")
    out_json = os.path.join("public", "audio", "spike_test.json")
    
    asyncio.run(synthesize(test_text, test_voice, out_audio, out_json))

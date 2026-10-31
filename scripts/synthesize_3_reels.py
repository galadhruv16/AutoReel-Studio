"""
Synthesize 3 distinct 30-second audio tracks with millisecond word timestamps
for AutoReel Studio's landing page showcase.
"""

import asyncio
import json
import os
import edge_tts

REELS = [
    {
        "id": "reel_genetics",
        "title": "The Pea Plant Miracle: Mendel's F2 Ratio",
        "voice": "en-US-JennyNeural",
        "text": "When Gregor Mendel crossed pure yellow round peas with green wrinkled ones, the entire first generation looked identical. But in the F2 generation, nature unleashed a hidden mathematical miracle: a precise nine to three to three to one ratio. Why? Because seed shape and color alleles sort completely independently during meiosis. Your traits don't blend like paint—they shuffle like cards.",
    },
    {
        "id": "reel_kubernetes",
        "title": "The Kubernetes Container Lie: Why Pods Exist",
        "voice": "en-US-ChristopherNeural",
        "text": "If you think Kubernetes runs Docker containers directly, you've been lied to. Kubernetes has no idea what a Docker container actually is. Instead, it talks to the Container Runtime Interface, which spins up a shared Linux namespace called a Pod. Containers inside that Pod share the exact same network loopback and volume storage. In Kubernetes, the Pod is the atomic unit, not the container.",
    },
    {
        "id": "reel_saraighat",
        "title": "The River Ambush of Saraighat: 1671",
        "voice": "en-IN-PrabhatNeural",
        "fallback_voice": "en-US-GuyNeural",
        "text": "In 1671, the mighty Mughal imperial armada sailed down the Brahmaputra with four thousand war vessels to conquer Assam. Outnumbered tenfold and burning with fever, General Lachit Borphukan refused to surrender. He lured the heavy Mughal warships into the narrow gorge of Saraighat, unleashing lethal guerrilla war-boats from both riverbanks. Against impossible odds, the river became the Mughal empire's graveyard—and Assam remained unconquered.",
    }
]

async def synthesize_track(track):
    voice = track["voice"]
    output_audio = os.path.join("public", "audio", f"{track['id']}.mp3")
    output_json = os.path.join("public", "audio", f"{track['id']}.json")
    
    os.makedirs(os.path.dirname(output_audio), exist_ok=True)
    
    try:
        communicate = edge_tts.Communicate(track["text"], voice, boundary="WordBoundary")
        word_timestamps = []
        audio_data = bytearray()
        
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                audio_data.extend(chunk["data"])
            elif chunk["type"] == "WordBoundary":
                start_ms = round(chunk["offset"] / 10000)
                duration_ms = round(chunk["duration"] / 10000)
                word_timestamps.append({
                    "word": chunk["text"],
                    "startMs": start_ms,
                    "endMs": start_ms + duration_ms
                })
        
        if len(audio_data) == 0:
            raise Exception("No audio generated")
    except Exception as e:
        print(f"Warning with voice {voice}: {e}. Retrying with fallback voice...")
        voice = track.get("fallback_voice", "en-US-GuyNeural")
        communicate = edge_tts.Communicate(track["text"], voice, boundary="WordBoundary")
        word_timestamps = []
        audio_data = bytearray()
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                audio_data.extend(chunk["data"])
            elif chunk["type"] == "WordBoundary":
                start_ms = round(chunk["offset"] / 10000)
                duration_ms = round(chunk["duration"] / 10000)
                word_timestamps.append({
                    "word": chunk["text"],
                    "startMs": start_ms,
                    "endMs": start_ms + duration_ms
                })

    with open(output_audio, "wb") as f:
        f.write(audio_data)

    total_duration_ms = word_timestamps[-1]["endMs"] + 400 if word_timestamps else 0

    result = {
        "id": track["id"],
        "title": track["title"],
        "text": track["text"],
        "voice": voice,
        "audioFile": f"audio/{track['id']}.mp3",
        "totalDurationMs": total_duration_ms,
        "wordCount": len(word_timestamps),
        "wordTimestamps": word_timestamps
    }

    with open(output_json, "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2)

    print(f"DONE: {track['id']} -> {len(word_timestamps)} words, {total_duration_ms/1000:.2f}s ({voice})")
    return result

async def main():
    for track in REELS:
        await synthesize_track(track)
    print("ALL 3 TRACKS SYNTHESIZED SUCCESSFULLY!")

if __name__ == "__main__":
    asyncio.run(main())

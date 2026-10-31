import asyncio
import json
import os
import edge_tts

REELS = [
    {
        "id": "reel_genetics",
        "voice": "en-US-JennyNeural",
        "text": (
            "Why do two yellow round peas produce wrinkled green offspring? "
            "In 1866, Gregor Mendel crossed yellow round peas with green wrinkled ones. "
            "Every first-generation child was yellow and round! "
            "But the green trait didn’t vanish—it was hiding. "
            "In the F2 generation, alleles recombined into a sixteen-cell matrix. "
            "Nine yellow round, three green round, three yellow wrinkled, and one lone green wrinkled pea. "
            "That nine-to-three-to-three-to-one ratio proved genes sort independently."
        )
    },
    {
        "id": "reel_kubernetes",
        "voice": "en-US-BrianMultilingualNeural",
        "text": (
            "Containers do not exist. "
            "There is no tiny virtual machine inside your server. "
            "A container is just a normal Linux process, isolated by cgroups and namespaces. "
            "When two containers must share memory or localhost, single containers fail. "
            "That is why Kubernetes created the Pod. "
            "A Pod wraps containers inside the exact same network namespace, letting them talk at lightspeed over localhost. "
            "Never deploy bare containers. Deploy Pods."
        )
    },
    {
        "id": "reel_saraighat",
        "voice": "en-US-AndrewMultilingualNeural",
        "text": (
            "In 1671, four thousand Mughal warships sailed down the Brahmaputra River to conquer Assam. "
            "On open ground, the imperial army was unbeatable. "
            "So General Lachit Borphukan lured them into the Saraighat gorge, where the river narrows to one kilometer. "
            "As the massive Mughal fleet choked in the rapids, agile Assamese war boats launched a devastating ambush from both banks. "
            "Trapped and helpless, the imperial armada was shattered. "
            "Assam stood free."
        )
    }
]

async def synthesize_reel(reel_info):
    reel_id = reel_info["id"]
    voice = reel_info["voice"]
    text = reel_info["text"]
    
    mp3_path = f"public/audio/{reel_id}.mp3"
    json_path = f"public/audio/{reel_id}.json"
    
    print(f"[*] Synthesizing {reel_id} using {voice}...")
    communicate = edge_tts.Communicate(text, voice, rate="+2%", boundary="WordBoundary")
    
    word_timestamps = []
    current_time_offset = 0
    
    with open(mp3_path, "wb") as f_mp3:
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                f_mp3.write(chunk["data"])
            elif chunk["type"] == "WordBoundary":
                # offset is in 100ns (ticks)
                start_ms = round(chunk["offset"] / 10000)
                duration_ms = round(chunk["duration"] / 10000)
                end_ms = start_ms + duration_ms
                word = chunk["text"]
                word_timestamps.append({
                    "word": word,
                    "startMs": start_ms,
                    "endMs": end_ms
                })
                current_time_offset = max(current_time_offset, end_ms)

    total_duration_ms = word_timestamps[-1]["endMs"] + 400 if word_timestamps else 0
    meta = {
        "id": reel_id,
        "voice": voice,
        "text": text,
        "wordCount": len(word_timestamps),
        "totalDurationMs": total_duration_ms,
        "totalDurationSeconds": round(total_duration_ms / 1000, 2),
        "wordTimestamps": word_timestamps
    }
    
    with open(json_path, "w", encoding="utf-8") as f_json:
        json.dump(meta, f_json, indent=2, ensure_ascii=False)
        
    print(f"[OK] {reel_id}: {meta['totalDurationSeconds']}s, {meta['wordCount']} words saved.")

async def main():
    os.makedirs("public/audio", exist_ok=True)
    for r in REELS:
        await synthesize_reel(r)
    print("\n[SUCCESS] All 3 reels audio synthesized.")

if __name__ == '__main__':
    asyncio.run(main())

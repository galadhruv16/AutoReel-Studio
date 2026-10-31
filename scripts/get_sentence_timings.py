import json

for r in ['reel_genetics', 'reel_kubernetes', 'reel_saraighat']:
    d = json.load(open(f'public/audio/{r}.json', encoding='utf-8'))
    print(f"\n==================== {r} ({d['totalDurationSeconds']}s) ====================")
    words = d['wordTimestamps']
    for i, w in enumerate(words):
        if i % 10 == 0:
            print(f"\n{w['startMs']/1000:5.2f}s | ", end="")
        print(f"{w['word']} ", end="")
    print()

import asyncio
import edge_tts

async def test():
    text = "In 1671, four thousand Mughal warships sailed down the Brahmaputra River to conquer Assam. But General Lachit Borphukan lured them into a narrow gorge at Saraighat."
    comm1 = edge_tts.Communicate(text, "en-US-AndrewMultilingualNeural")
    await comm1.save("out/test_andrew.mp3")
    comm2 = edge_tts.Communicate(text, "en-US-BrianMultilingualNeural")
    await comm2.save("out/test_brian.mp3")
    print("Multilingual done")

if __name__ == '__main__':
    asyncio.run(test())

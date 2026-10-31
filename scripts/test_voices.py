import asyncio
import edge_tts

async def test():
    text = "In 1671, four thousand Mughal warships sailed down the Brahmaputra River to conquer Assam. But General Lachit Borphukan lured them into a narrow gorge at Saraighat."
    comm1 = edge_tts.Communicate(text, "en-IN-NeerjaExpressiveNeural")
    await comm1.save("out/test_neerja.mp3")
    comm2 = edge_tts.Communicate(text, "en-US-GuyNeural")
    await comm2.save("out/test_guy.mp3")
    print("Done")

if __name__ == '__main__':
    asyncio.run(test())

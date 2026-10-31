import asyncio
import edge_tts

async def test():
    try:
        comm = edge_tts.Communicate("Testing words here now.", "en-US-AndrewMultilingualNeural", boundary="WordBoundary")
        async for chunk in comm.stream():
            pass
        print("Andrew succeeded with WordBoundary")
    except Exception as e:
        print("Andrew failed:", e)

    try:
        comm2 = edge_tts.Communicate("Testing words here now.", "en-US-GuyNeural", boundary="WordBoundary")
        async for chunk in comm2.stream():
            pass
        print("Guy succeeded with WordBoundary")
    except Exception as e:
        print("Guy failed:", e)

if __name__ == '__main__':
    asyncio.run(test())

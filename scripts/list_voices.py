import asyncio
import edge_tts

async def main():
    voices = await edge_tts.list_voices()
    for v in voices:
        if v['Locale'].startswith('en-'):
            print(f"{v['ShortName']} | {v['Gender']} | {v['Locale']} | {v.get('FriendlyName','')}")

if __name__ == '__main__':
    asyncio.run(main())

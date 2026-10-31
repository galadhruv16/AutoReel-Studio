import urllib.request
import re

url = "http://localhost:3000"
with urllib.request.urlopen(url) as response:
    html = response.read().decode('utf-8')
    print(f"Page Status: {response.status}")
    print(f"HTML length: {len(html)}")

css_matches = re.findall(r'href="(/_next/static/css/[^"]+)"', html)
print("CSS matches found:", css_matches)

for css_url in css_matches:
    full_url = f"http://localhost:3000{css_url}"
    with urllib.request.urlopen(full_url) as css_res:
        css_data = css_res.read().decode('utf-8')
        print(f"CSS {css_url}: Status {css_res.status}, Length: {len(css_data)} bytes")
        print("CSS snippet:", css_data[:150])

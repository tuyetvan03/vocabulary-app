import sys
import json
import time
import urllib.request
import urllib.parse
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed

# Ensure UTF-8 output on Windows console
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

JSON_PATH = Path("oxford5000.json")
JS_PATH = Path("oxford5000.js")

def translate_word(item):
    word = item.get("word", "")
    # Clean parenthetical notes for translation
    clean_query = word.split('(')[0].strip()
    
    url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&q=' + urllib.parse.quote(clean_query)
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
    
    meaning = ""
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=8) as res:
                data = json.loads(res.read().decode('utf-8'))
                meaning = data[0][0][0]
                break
        except Exception as e:
            time.sleep(0.5)

    item["meaning"] = meaning.strip()
    return item

def main():
    if not JSON_PATH.exists():
        print("Lỗi: Không tìm thấy file oxford5000.json")
        return

    with open(JSON_PATH, "r", encoding="utf-8") as f:
        vocab = json.load(f)

    total = len(vocab)
    print(f"Đang tự động bổ sung nghĩa tiếng Việt cho {total} từ vựng...")

    start_time = time.time()
    completed_count = 0

    with ThreadPoolExecutor(max_workers=15) as executor:
        futures = {executor.submit(translate_word, item): item for item in vocab}
        for future in as_completed(futures):
            completed_count += 1
            if completed_count % 200 == 0 or completed_count == total:
                print(f"Đã hoàn thành: {completed_count}/{total} từ ({(completed_count/total)*100:.1f}%)")

    elapsed = time.time() - start_time
    print(f"Dịch xong {total} từ trong {elapsed:.2f} giây.")

    # Save to JSON
    with open(JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(vocab, f, ensure_ascii=False, indent=2)
    print(f"Đã cập nhật file: {JSON_PATH}")

    # Save to JS
    with open(JS_PATH, "w", encoding="utf-8") as f:
        f.write("window.OXFORD_5000_DATA = ")
        json.dump(vocab, f, ensure_ascii=False, indent=2)
        f.write(";\n")
    print(f"Đã cập nhật file: {JS_PATH}")

if __name__ == "__main__":
    main()

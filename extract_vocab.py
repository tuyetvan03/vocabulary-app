import re
import json
from pathlib import Path
from pypdf import PdfReader

PDF_PATH = Path("The_Oxford_5000.pdf")
JSON_PATH = Path("oxford5000.json")
JS_PATH = Path("oxford5000.js")

def extract_vocabulary(pdf_path: Path):
    reader = PdfReader(pdf_path)
    raw_lines = []
    
    for page in reader.pages:
        text = page.extract_text()
        if not text:
            continue
        for line in text.split('\n'):
            line = line.strip()
            if line:
                raw_lines.append(line)

    # Filter header and metadata text
    cleaned_lines = []
    for l in raw_lines:
        if 'Oxford University Press' in l or 'The Oxford 5000' in l or 'expanded core word list' in l:
            continue
        cleaned_lines.append(l)

    # Handle pypdf line breaks and split artifacts
    i = 0
    fixed_lines = []
    while i < len(cleaned_lines):
        curr = cleaned_lines[i]
        if curr == 's' and i + 1 < len(cleaned_lines) and cleaned_lines[i + 1].startswith('ecular'):
            fixed_lines.append('secular ' + cleaned_lines[i + 1][6:])
            i += 2
        elif curr == 'shaped' and i + 1 < len(cleaned_lines) and cleaned_lines[i + 1].startswith('adj'):
            fixed_lines.append('-shaped ' + cleaned_lines[i + 1])
            i += 2
        elif i + 1 < len(cleaned_lines) and cleaned_lines[i + 1] in ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']:
            fixed_lines.append(curr + ' ' + cleaned_lines[i + 1])
            i += 2
        else:
            fixed_lines.append(curr)
            i += 1

    vocabulary = []
    pattern = re.compile(r'^(.*?)\s*([A-C][12])$', re.IGNORECASE)

    for index, entry in enumerate(fixed_lines, start=1):
        m = pattern.search(entry)
        if not m:
            continue
        
        w_pos = m.group(1).strip()
        level = m.group(2).upper()

        # Extract word vs part-of-speech (n., v., adj., adv., prep., conj., det., pron., exclam., etc.)
        m_pos = re.search(r'^(.*?)\s+((?:(?:n|v|adj|adv|prep|conj|det|pron|exclam|num|number)\.?(?:,\s*|/|\s+)?)+)$', w_pos, re.IGNORECASE)
        if m_pos:
            word = m_pos.group(1).strip()
            pos = m_pos.group(2).strip()
        else:
            word = w_pos
            pos = ''

        vocabulary.append({
            "id": index,
            "word": word,
            "pos": pos,
            "level": level,
            "full_entry": entry
        })

    return vocabulary

def main():
    print(f"Reading {PDF_PATH}...")
    vocab = extract_vocabulary(PDF_PATH)
    print(f"Successfully extracted {len(vocab)} vocabulary items.")

    # Save to JSON
    with open(JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(vocab, f, ensure_ascii=False, indent=2)
    print(f"Saved dataset to {JSON_PATH}")

    # Save to JS for standalone browser usage
    with open(JS_PATH, "w", encoding="utf-8") as f:
        f.write("window.OXFORD_5000_DATA = ")
        json.dump(vocab, f, ensure_ascii=False, indent=2)
        f.write(";\n")
    print(f"Saved JS dataset to {JS_PATH}")

if __name__ == "__main__":
    main()

import sys
import json
import random
import argparse
from pathlib import Path
from typing import List, Dict, Optional

# Ensure UTF-8 output on Windows console
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

JSON_PATH = Path("oxford5000.json")
PDF_PATH = Path("The_Oxford_5000.pdf")

def load_vocabulary() -> List[Dict]:
    """Loads vocabulary from JSON file or user_folders.json. If missing, attempts PDF extraction."""
    if JSON_PATH.exists():
        with open(JSON_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    
    user_folders_path = Path("user_folders.json")
    if user_folders_path.exists():
        try:
            with open(user_folders_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                folders = data.get("folders", [])
                words = []
                seen = set()
                for folder in folders:
                    for lesson in folder.get("lessons", []):
                        for w in lesson.get("words", []):
                            key = (w.get("word") or "").lower().strip()
                            if key and key not in seen:
                                seen.add(key)
                                words.append(w)
                if words:
                    return words
        except Exception as e:
            print(f"Lỗi đọc user_folders.json: {e}")

    if PDF_PATH.exists():
        print("Đang khởi tạo dữ liệu từ file PDF The_Oxford_5000.pdf...")
        import extract_vocab
        return extract_vocab.extract_vocabulary(PDF_PATH)
    else:
        print("Lỗi: Không tìm thấy file dữ liệu từ vựng!")
        sys.exit(1)

def get_random_words(dataset: List[Dict], count: int, level_filter: Optional[str] = None) -> List[Dict]:
    """Returns 'count' random words from dataset, optionally filtered by CEFR level."""
    filtered = dataset
    if level_filter and level_filter.upper() in ["B2", "C1"]:
        target_level = level_filter.upper()
        filtered = [item for item in dataset if item.get("level") == target_level]
        if not filtered:
            print(f"Cảnh báo: Không có từ vựng nào thuộc cấp độ {target_level}.")
            return []

    actual_count = min(count, len(filtered))
    return random.sample(filtered, actual_count)

def print_vocabulary_table(words: List[Dict], title: str = "DANH SÁCH TỪ VỰNG NGẪU NHIÊN"):
    """Displays words in a clean formatted ASCII table with Vietnamese meanings."""
    if not words:
        print("Danh sách trống.")
        return

    print("\n" + "=" * 90)
    print(f" {title} (Tổng số: {len(words)} từ)")
    print("=" * 90)
    print(f"{'STT':<5} | {'Từ vựng (Word)':<22} | {'Loại từ':<10} | {'Cấp độ':<8} | {'Nghĩa tiếng Việt':<30}")
    print("-" * 90)

    for idx, item in enumerate(words, start=1):
        word = item.get("word", "")
        pos = item.get("pos", "")
        level = item.get("level", "")
        meaning = item.get("meaning", "")
        print(f"{idx:<5} | {word:<22} | {pos:<10} | {level:<8} | {meaning:<30}")

    print("=" * 90 + "\n")

def export_words(words: List[Dict], filename: str = "random_vocab.txt"):
    """Exports generated words to a text file."""
    filepath = Path(filename)
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(f"DANH SÁCH {len(words)} TỪ VỰNG NGẪU NHIÊN - OXFORD 5000\n")
        f.write("=" * 60 + "\n\n")
        for idx, item in enumerate(words, start=1):
            meaning_str = f" : {item['meaning']}" if item.get('meaning') else ""
            f.write(f"{idx:2d}. {item['word']} ({item['pos']}) [{item['level']}]{meaning_str}\n")
    print(f"✔ Đã xuất {len(words)} từ vựng ra file: {filepath.resolve()}")

def run_quiz_mode(dataset: List[Dict], count: int = 5):
    """Runs an interactive multiple-choice quiz in the terminal."""
    if len(dataset) < 4:
        print("Cần ít nhất 4 từ vựng để tạo bài test.")
        return

    questions = random.sample(dataset, min(count, len(dataset)))
    score = 0

    print("\n" + "📝" * 40)
    print(f" BÀI KIỂM TRA TRẮC NGHIỆM ({len(questions)} CÂU HỎI)")
    print("📝" * 40)

    for q_idx, q_item in enumerate(questions, start=1):
        # Pick 3 distractors
        distractors = [w for w in dataset if w['id'] != q_item['id']]
        shuffled_distractors = random.sample(distractors, 3)
        options = [q_item] + shuffled_distractors
        random.shuffle(options)

        correct_opt_idx = options.index(q_item)

        print(f"\nCâu {q_idx}/{len(questions)}: Từ '{q_item['word']}' ({q_item['pos']} - [{q_item['level']}]) có nghĩa là gì?")
        for opt_idx, opt in enumerate(options):
            letter = chr(65 + opt_idx) # A, B, C, D
            print(f"  {letter}. {opt.get('meaning', opt['word'])}")

        while True:
            ans = input("👉 Đáp án của bạn (A/B/C/D): ").strip().upper()
            if ans in ['A', 'B', 'C', 'D']:
                user_opt_idx = ord(ans) - 65
                if user_opt_idx == correct_opt_idx:
                    print("  🎉 CHÍNH XÁC!")
                    score += 1
                else:
                    correct_letter = chr(65 + correct_opt_idx)
                    correct_meaning = q_item.get('meaning', q_item['word'])
                    print(f"  ❌ SAI RỒI! Đáp án đúng là {correct_letter}: {correct_meaning}")
                break
            else:
                print("⚠️ Vui lòng nhập A, B, C hoặc D.")

    print("\n" + "=" * 50)
    pct = round((score / len(questions)) * 100)
    print(f" KẾT QUẢ BÀI KIỂM TRA: {score}/{len(questions)} câu đúng ({pct}%)")
    print("=" * 50 + "\n")

def search_vocabulary(dataset: List[Dict]):
    """Searches dataset by English word or Vietnamese meaning."""
    query = input("\n🔍 Nhập từ tiếng Anh hoặc nghĩa tiếng Việt để tìm: ").strip().lower()
    if not query:
        return

    results = []
    for item in dataset:
        w_match = query in item.get('word', '').lower()
        m_match = query in item.get('meaning', '').lower()
        if w_match or m_match:
            results.append(item)

    print_vocabulary_table(results, title=f"KẾT QUẢ TÌM KIẾM TỪ KHÓA '{query}'")

def interactive_mode(dataset: List[Dict]):
    """Interactive CLI menu for continuous use."""
    total_count = len(dataset)
    b2_count = sum(1 for w in dataset if w.get("level") == "B2")
    c1_count = sum(1 for w in dataset if w.get("level") == "C1")

    print("\n" + "★" * 65)
    print(" CHƯƠNG TRÌNH LẤY TỪ VỰNG NGẪU NHIÊN - THE OXFORD 5000")
    print(f" (Dữ liệu: {total_count} từ | B2: {b2_count} từ | C1: {c1_count} từ)")
    print("★" * 65)

    while True:
        try:
            print("\n--- MENU CHÍNH ---")
            print("1. Lấy n từ vựng ngẫu nhiên")
            print("2. Làm bài kiểm tra trắc nghiệm (Quiz)")
            print("3. Tìm kiếm từ vựng (Anh / Việt)")
            print("q. Thoát chương trình")
            
            choice = input("👉 Lựa chọn của bạn: ").strip().lower()
            if choice in ['q', 'quit', 'exit']:
                print("Cảm ơn bạn đã sử dụng chương trình. Tạm biệt!")
                break
            elif choice == '3':
                search_vocabulary(dataset)
            elif choice == '2':
                q_input = input("Nhập số lượng câu hỏi (ví dụ: 5, 10) [Mặc định=5]: ").strip()
                n_q = int(q_input) if q_input.isdigit() and int(q_input) > 0 else 5
                run_quiz_mode(dataset, n_q)
            elif choice == '1' or choice.isdigit():
                if choice == '1':
                    user_input = input("Nhập số lượng từ vựng cần lấy (n): ").strip()
                else:
                    user_input = choice

                if not user_input.isdigit():
                    print("⚠️ Vui lòng nhập một số tự nhiên hợp lệ!")
                    continue

                n = int(user_input)
                if n <= 0:
                    print("⚠️ Số n phải lớn hơn 0!")
                    continue

                print("\nChọn cấp độ từ vựng:")
                print("  1. Tất cả cấp độ (B2 + C1)")
                print("  2. Chỉ cấp độ B2")
                print("  3. Chỉ cấp độ C1")
                lvl_choice = input("Lựa chọn của bạn [1/2/3, Mặc định=1]: ").strip()

                level_filter = None
                if lvl_choice == '2':
                    level_filter = 'B2'
                elif lvl_choice == '3':
                    level_filter = 'C1'

                selected_words = get_random_words(dataset, n, level_filter)
                print_vocabulary_table(selected_words, title=f"TỪ VỰNG NGẪU NHIÊN (n = {len(selected_words)})")

                export_choice = input("Bạn có muốn xuất danh sách này ra file txt? (y/N): ").strip().lower()
                if export_choice in ['y', 'yes']:
                    export_words(selected_words)
            else:
                print("⚠️ Lựa chọn không hợp lệ, vui lòng chọn lại.")

        except KeyboardInterrupt:
            print("\n\nĐã thoát chương trình.")
            break
        except Exception as e:
            print(f"Lỗi không xác định: {e}")

def main():
    parser = argparse.ArgumentParser(description="Chương trình lấy từ vựng ngẫu nhiên từ The Oxford 5000 PDF")
    parser.add_argument("n", type=int, nargs="?", help="Số lượng từ vựng cần lấy ngẫu nhiên")
    parser.add_argument("-l", "--level", choices=["B2", "C1", "b2", "c1"], help="Lọc theo cấp độ B2 hoặc C1")
    parser.add_argument("-o", "--output", help="Xuất danh sách ra file chỉ định (ví dụ: result.txt)")
    parser.add_argument("--quiz", type=int, nargs="?", const=5, help="Bắt đầu bài kiểm tra trắc nghiệm với N câu hỏi")

    args = parser.parse_args()
    dataset = load_vocabulary()

    if args.quiz is not None:
        run_quiz_mode(dataset, args.quiz)
    elif args.n is not None:
        if args.n <= 0:
            print("⚠️ Số n phải là số tự nhiên lớn hơn 0.")
            sys.exit(1)
        
        words = get_random_words(dataset, args.n, args.level)
        print_vocabulary_table(words, title=f"TỪ VỰNG NGẪU NHIÊN (n = {len(words)})")
        
        if args.output:
            export_words(words, args.output)
    else:
        interactive_mode(dataset)

if __name__ == "__main__":
    main()

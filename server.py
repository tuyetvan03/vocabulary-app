import os
import sys
import json
from http.server import HTTPServer, SimpleHTTPRequestHandler
from pathlib import Path

# Ensure UTF-8 output on Windows console
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

PORT = 8000
BOOKMARKS_FILE = Path("bookmarks.json")
FOLDERS_FILE = Path("user_folders.json")
NOTES_FILE = Path("notes.json")

class VocabularyRequestHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        # Allow CORS and no-cache for local dev
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        if self.path == '/api/load-folders':
            try:
                if FOLDERS_FILE.exists():
                    with open(FOLDERS_FILE, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                else:
                    data = {"folders": []}
                
                self.send_response(200)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.end_headers()
                self.wfile.write(json.dumps(data, ensure_ascii=False).encode('utf-8'))
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'error': str(e)}).encode('utf-8'))
        elif self.path == '/api/load-notes':
            try:
                if NOTES_FILE.exists():
                    with open(NOTES_FILE, 'r', encoding='utf-8') as f:
                        notes_data = json.load(f)
                else:
                    notes_data = {}
                self.send_response(200)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.end_headers()
                self.wfile.write(json.dumps({'notes': notes_data}, ensure_ascii=False).encode('utf-8'))
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'error': str(e)}).encode('utf-8'))
        else:
            super().do_GET()

    def do_POST(self):
        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length)

        if self.path == '/api/save-bookmarks':
            try:
                data = json.loads(post_data.decode('utf-8'))
                word_ids = data.get('bookmarks', [])
                
                # Save to bookmarks.json on physical disk
                with open(BOOKMARKS_FILE, 'w', encoding='utf-8') as f:
                    json.dump(word_ids, f, ensure_ascii=False, indent=2)

                self.send_response(200)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.end_headers()
                response = json.dumps({'status': 'ok', 'count': len(word_ids)}).encode('utf-8')
                self.wfile.write(response)
                print(f"✔ Đã lưu {len(word_ids)} từ khó vào file {BOOKMARKS_FILE.resolve()}")
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'error': str(e)}).encode('utf-8'))

        elif self.path == '/api/save-folders':
            try:
                data = json.loads(post_data.decode('utf-8'))
                with open(FOLDERS_FILE, 'w', encoding='utf-8') as f:
                    json.dump(data, f, ensure_ascii=False, indent=2)

                self.send_response(200)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.end_headers()
                self.wfile.write(json.dumps({'status': 'ok'}).encode('utf-8'))
                print(f"✔ Đã lưu cấu trúc Thư mục & Bài học vào file {FOLDERS_FILE.resolve()}")
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'error': str(e)}).encode('utf-8'))

        elif self.path == '/api/save-notes':
            try:
                data = json.loads(post_data.decode('utf-8'))
                notes_dict = data.get('notes', {})
                with open(NOTES_FILE, 'w', encoding='utf-8') as f:
                    json.dump(notes_dict, f, ensure_ascii=False, indent=2)

                self.send_response(200)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.end_headers()
                self.wfile.write(json.dumps({'status': 'ok'}).encode('utf-8'))
                print(f"✔ Đã lưu Ghi chú cá nhân vào file {NOTES_FILE.resolve()}")
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'error': str(e)}).encode('utf-8'))
        else:
            self.send_response(404)
            self.end_headers()

import socket

def get_local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"

def main():
    os.chdir(Path(__file__).parent)
    server_address = ('', PORT)
    httpd = HTTPServer(server_address, VocabularyRequestHandler)
    local_ip = get_local_ip()
    print("=" * 60)
    print(f"🚀 SERVER VOCABULARY ĐÃ SẴN SÀNG:")
    print(f"   💻 Trên Máy tính (Local):    http://localhost:{PORT}")
    print(f"   📱 Trên Điện thoại / iPad:  http://{local_ip}:{PORT}")
    print(f"   📁 Tự động đồng bộ file:     {FOLDERS_FILE.resolve()}")
    print("=" * 60)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nĐã dừng server.")

if __name__ == "__main__":
    main()

"""Preview static staging pages with the Cloudflare header configuration."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

site = Path(__file__).resolve().parent.parent / 'site'
headers = dict(line.strip().split(': ', 1) for line in (site / '_headers').read_text().splitlines()[1:])

class StagingHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(site), **kwargs)

    def end_headers(self):
        for name, value in headers.items():
            self.send_header(name, value)
        super().end_headers()

ThreadingHTTPServer(('127.0.0.1', 8765), StagingHandler).serve_forever()

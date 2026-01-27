import json
from pathlib import Path
from http.server import BaseHTTPRequestHandler

from server_backend.data_service import get_available_profiles  # type: ignore


DATA_DIR = Path(__file__).resolve().parents[1] / "data"


class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            profiles = get_available_profiles(DATA_DIR)
            body = json.dumps({"profiles": profiles}).encode("utf-8")

            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
        except Exception as exc:  # pragma: no cover - defensive
            error = {"error": "Internal server error", "details": str(exc)}
            body = json.dumps(error).encode("utf-8")
            self.send_response(500)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)


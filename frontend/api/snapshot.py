import json
from pathlib import Path
from http.server import BaseHTTPRequestHandler

from server_backend.data_service import load_time_series, load_expenses  # type: ignore
from server_backend.finance_engine import build_snapshot  # type: ignore
from server_backend.summary_engine import build_summary  # type: ignore


DATA_DIR = Path(__file__).resolve().parents[1] / "data"


class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            length = int(self.headers.get("content-length", "0"))
            raw_body = self.rfile.read(length) if length > 0 else b"{}"
            payload = json.loads(raw_body.decode("utf-8") or "{}")

            period = payload.get("period", "6M")
            question = payload.get("question", "")
            profile_id = payload.get("profile", "james_thompson")

            ts = load_time_series(DATA_DIR, profile_id)
            expenses_cfg = load_expenses(DATA_DIR, profile_id)
            snap = build_snapshot(period, ts, expenses_cfg)
            summary = build_summary(snap, question)

            body = json.dumps({"snapshot": snap, "summary": summary}).encode("utf-8")
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


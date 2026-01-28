import json
import os
from pathlib import Path
from http.server import BaseHTTPRequestHandler

from server_backend.data_service import load_time_series, load_expenses  # type: ignore
from server_backend.finance_engine import build_snapshot  # type: ignore
from server_backend.llm_service import llm_simulation  # type: ignore


DATA_DIR = Path(__file__).resolve().parents[1] / "data"


class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
    
    def do_POST(self):
        try:
            length = int(self.headers.get("content-length", "0"))
            raw_body = self.rfile.read(length) if length > 0 else b"{}"
            payload = json.loads(raw_body.decode("utf-8") or "{}")

            period = payload.get("period", "6M")
            question = (payload.get("question") or "").strip()
            profile_id = payload.get("profile", "james_thompson")

            if not question:
                body = json.dumps({
                    "heading": "",
                    "lines": ["Type a scenario question first (e.g. 'retire at 65')."],
                    "enabled": True
                }).encode("utf-8")
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
                self.send_header("Access-Control-Allow-Headers", "Content-Type")
                self.send_header("Content-Length", str(len(body)))
                self.end_headers()
                self.wfile.write(body)
                return

            ts = load_time_series(DATA_DIR, profile_id)
            expenses_cfg = load_expenses(DATA_DIR, profile_id)
            snap = build_snapshot(period, ts, expenses_cfg)

            facts = {
                "period": snap["period"],
                "salary_monthly": snap["salary_monthly"],
                "expenses_monthly": snap["monthly_expense_total"],
                "savings_monthly": snap["savings_est_monthly"],
                "resilience_pct": snap["resilience"],
                "liquidity_pct": snap["liquidity"],
                "top_expenses": [{"label": e["label"], "monthly": e["monthly"]} for e in snap["expenses"][:5]],
            }

            text = llm_simulation(question, facts)

            if not text:
                key_exists = bool(os.getenv("OPENAI_API_KEY"))
                if key_exists:
                    result = {
                        "heading": "Simulation (LLM call failed)",
                        "lines": [
                            "Key is present, but the LLM call did not return a response (timeout/network).",
                            "Try again, or check your internet connection."
                        ],
                        "enabled": False
                    }
                else:
                    result = {
                        "heading": "Simulation (LLM not enabled)",
                        "lines": [
                            "No key found. Set OPENAI_API_KEY in your Vercel project settings."
                        ],
                        "enabled": False
                    }
            else:
                lines = [ln.strip() for ln in text.splitlines() if ln.strip()]
                heading = lines[0] if lines else "Simulation result"
                body_lines = lines[1:] if len(lines) > 1 else ["No details returned."]
                result = {"heading": heading, "lines": body_lines, "enabled": True}

            body = json.dumps(result).encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
            self.send_header("Access-Control-Allow-Headers", "Content-Type")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
        except Exception as exc:  # pragma: no cover - defensive
            error = {"heading": "Error", "lines": [str(exc)], "enabled": False}
            body = json.dumps(error).encode("utf-8")
            self.send_response(500)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
            self.send_header("Access-Control-Allow-Headers", "Content-Type")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)


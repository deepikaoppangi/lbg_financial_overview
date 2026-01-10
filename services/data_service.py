import json
from pathlib import Path

def load_json(path: Path):
    with open(path, "r") as f:
        return json.load(f)

def load_time_series(data_dir: Path):
    return load_json(data_dir / "time_series.json")

def load_expenses(data_dir: Path):
    return load_json(data_dir / "expenses.json")

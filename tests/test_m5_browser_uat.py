"""Drive real Windows API start, stop and restart for the M5 Chrome UAT."""

from __future__ import annotations

import datetime
import http.client
import json
import signal
import socket
import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
HOST, PORT = "127.0.0.1", 8765


def record(event, **fields):
    print(json.dumps({"type": event, "time": datetime.datetime.now().astimezone().isoformat(), **fields}), flush=True)


def port_closed():
    with socket.socket() as probe:
        probe.settimeout(4)
        result = probe.connect_ex((HOST, PORT))
    record("port_probe", host=HOST, port=PORT, connect_ex=result)
    if result != 10061:
        raise RuntimeError("Expected Windows loopback connection refusal on 8765")


class ApiProcess:
    def __init__(self):
        self.child = None
        self.instance = 0

    def start(self):
        if self.child is not None:
            raise RuntimeError("API already started by this supervisor")
        port_closed()
        self.instance += 1
        self.child = subprocess.Popen([sys.executable, "-B", "-m", "web.api", "--port", str(PORT)],
                                      cwd=ROOT, creationflags=subprocess.CREATE_NEW_PROCESS_GROUP,
                                      stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        line = self.child.stdout.readline().strip()
        record("api_start", instance=self.instance, pid=self.child.pid, command="python -B -m web.api --port 8765", stdout=line)
        if line != "FD001 API listening on http://127.0.0.1:8765 (ready)":
            raise RuntimeError("API startup did not reach ready")
        connection = http.client.HTTPConnection(HOST, PORT, timeout=5)
        try:
            connection.request("GET", "/api/health")
            response = connection.getresponse()
            body = json.load(response)
            if (response.status != 200 or body["data"]["readiness"] != "ready"
                    or not all(source["hash_verified"] for source in body["data"]["sources"].values())):
                raise RuntimeError("API health check did not verify trusted sources")
            record("health", instance=self.instance, url=f"http://{HOST}:{PORT}/api/health", http=response.status, body=body)
        finally:
            connection.close()

    def stop(self):
        if self.child is None:
            raise RuntimeError("No owned API process is running")
        child, self.child = self.child, None
        if child.poll() is None:
            child.send_signal(signal.CTRL_BREAK_EVENT)
        try:
            stdout, stderr = child.communicate(timeout=10)
        except subprocess.TimeoutExpired:
            child.kill()
            stdout, stderr = child.communicate()
        record("api_stop", instance=self.instance, pid=child.pid, command="Windows CTRL_BREAK_EVENT",
               stdout=stdout.strip(), stderr=stderr.strip(), exit_code=child.returncode)
        if child.returncode != 0 or stdout.strip() != "FD001 API stopped" or stderr:
            raise RuntimeError("API did not stop cleanly")
        port_closed()


def run():
    api = ApiProcess()
    try:
        api.start()
        with subprocess.Popen(["node", "tests/test_m5_browser_uat.mjs", "--supervised"], cwd=ROOT,
                              stdin=subprocess.PIPE, stdout=subprocess.PIPE, text=True, encoding="utf-8") as driver:
            for line in driver.stdout:
                try:
                    event = json.loads(line)
                except ValueError:
                    print(line, end="", flush=True)
                    continue
                if event.get("type") != "control":
                    print(line, end="", flush=True)
                    continue
                command = event.get("command")
                try:
                    {"start": api.start, "stop": api.stop}[command]()
                except (KeyError, OSError, RuntimeError) as exc:
                    reply = {"ok": False, "error": str(exc)}
                else:
                    reply = {"ok": True, "pid": api.child.pid if api.child else None}
                driver.stdin.write(json.dumps(reply) + "\n")
                driver.stdin.flush()
            code = driver.wait()
            record("driver_exit", exit_code=code)
            return code
    finally:
        if api.child is not None:
            api.stop()


if __name__ == "__main__":
    raise SystemExit(run())

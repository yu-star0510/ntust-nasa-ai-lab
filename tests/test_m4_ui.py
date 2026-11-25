from __future__ import annotations

import http.client
import json
import threading
import unittest
from contextlib import contextmanager
from html.parser import HTMLParser
from unittest.mock import patch

from web import api


def get(port, route, method="GET", headers=None):
    with_http = http.client.HTTPConnection("127.0.0.1", port, timeout=10)
    try:
        with_http.request(method, route, headers=headers or {})
        response = with_http.getresponse()
        return response.status, dict(response.getheaders()), response.read()
    finally:
        with_http.close()


@contextmanager
def serve(service):
    with api.FD001Server(0, service) as server:
        thread = threading.Thread(target=server.serve_forever, kwargs={"poll_interval": 0.01})
        thread.start()
        try:
            yield server.server_port
        finally:
            server.shutdown()
            thread.join()


class PageMarkup(HTMLParser):
    def __init__(self):
        super().__init__()
        self.tags = []

    def handle_starttag(self, tag, attrs):
        self.tags.append((tag, dict(attrs)))


class TestM4UI(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.service = api.FD001API()
        context = serve(cls.service)
        cls.port = context.__enter__()
        cls.addClassCleanup(context.__exit__, None, None, None)

    def test_static_assets_exact_media_types_and_safety_headers(self):
        for path, media in (("/", "text/html"), ("/ui.js", "text/javascript"), ("/style.css", "text/css")):
            with self.subTest(path=path):
                status, headers, body = get(self.port, path)
                self.assertEqual(status, 200)
                self.assertEqual(headers["Content-Type"], f"{media}; charset=utf-8")
                self.assertEqual(headers["X-Content-Type-Options"], "nosniff")
                self.assertEqual(headers["Cache-Control"], "no-store")
                self.assertEqual(int(headers["Content-Length"]), len(body))
                policy = headers["Content-Security-Policy"]
                for clause in ("default-src 'none'", "script-src 'self'", "connect-src 'self'", "frame-ancestors 'none'"):
                    self.assertIn(clause, policy)
                self.assertNotIn("Access-Control-Allow-Origin", headers)

    def test_page_has_same_origin_assets_and_labels(self):
        parser = PageMarkup()
        parser.feed(get(self.port, "/")[2].decode("utf-8"))
        controls = {attrs["id"] for tag, attrs in parser.tags if tag in {"select", "input"}}
        labels = {attrs["for"] for tag, attrs in parser.tags if tag == "label"}
        self.assertEqual(controls, {"split", "unit", "sensor", "start", "end"})
        self.assertLessEqual(controls, labels)
        self.assertEqual([attrs["src"] for tag, attrs in parser.tags if tag == "script"], ["/ui.js"])
        self.assertEqual([attrs["href"] for tag, attrs in parser.tags if tag == "link"], ["data:,", "/style.css"])
        self.assertFalse(any(name.startswith("on") for _, attrs in parser.tags for name in attrs))
        self.assertNotIn(b"innerHTML", get(self.port, "/ui.js")[2])

    def test_static_allowlist_rejects_raw_download_paths_and_queries(self):
        for path in ("/index.html", "/web/ui.js", "/FD001/train_FD001.txt", "/api/../FD001/test_FD001.txt",
                     "/%2e%2e/FD001/RUL_FD001.txt", "/ui.js?file=../FD001/train_FD001.txt", "/.git/config", "/%75i.js"):
            with self.subTest(path=path):
                status, _, body = get(self.port, path)
                self.assertEqual(status, 404)
                self.assertEqual(json.loads(body)["error"]["code"], "UNKNOWN_ENDPOINT")

    def test_static_routes_preserve_http_method_and_host_restrictions(self):
        for method in ("POST", "PUT", "OPTIONS", "HEAD"):
            status, headers, body = get(self.port, "/", method)
            self.assertEqual(status, 405)
            self.assertEqual(headers["Allow"], "GET")
            if method != "HEAD":
                self.assertEqual(json.loads(body)["error"]["code"], "METHOD_NOT_ALLOWED")
        self.assertEqual(get(self.port, "/", headers={"Host": "other.invalid"})[0], 400)

    def test_ui_shell_can_report_api_unavailable(self):
        failure = api.APIError(503, "DATA_NOT_READY", "SYNTHETIC source fault injection")
        with patch.object(api, "verify_sources", side_effect=failure):
            self.assertEqual(get(self.port, "/")[0], 200)
            for path in ("/api/health", "/api/catalog", "/api/units?split=train",
                         "/api/history?split=train&unit=1&sensor=7&start=1&end=20"):
                status, _, body = get(self.port, path)
                self.assertEqual(status, 503)
                self.assertEqual(json.loads(body)["error"]["code"], "DATA_NOT_READY")

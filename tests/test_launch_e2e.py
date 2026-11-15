"""Browser-level launch checks at the rendered-site and local-publish seams.

These tests observe the built site's routes, layout, and keyboard behavior,
then drive the local authoring page against a disposable Git repository. They
do not verify screen-reader output or the remote Sveltia service.
"""

from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import importlib.util
import json
from pathlib import Path
import shutil
import socket
import subprocess
import tempfile
import threading
import time
import unittest
from urllib.error import URLError
from urllib.request import Request, urlopen


ROOT = Path(__file__).parents[1]
SITE = ROOT / "_site"
LOCAL_SITE = SITE / "local-preview"
AUTHORING_SERVER = ROOT / "scripts" / "local_authoring.py"
PROJECTS = (
    "McFuzzy Agent Forge",
    "Skill Loom",
    "Skill Forge",
    "Squirrels Toolbox",
    "Study Detective",
    "Engineering Journey System",
    "Knowledge Dungeon",
    "Stalwart Tailnet Mail",
)
REPOSITORIES = (
    "https://github.com/McFuzzySquirrel/mcfuzzy-agent-forge",
    "https://github.com/McFuzzySquirrel/skill-loom",
    "https://github.com/McFuzzySquirrel/skill-forge",
    "https://github.com/McFuzzySquirrel/squirrels-toolbox",
    "https://github.com/McFuzzySquirrel/study-detective",
    "https://github.com/McFuzzySquirrel/Engineering-Journey-System",
    "https://github.com/McFuzzySquirrel/knowledge-dungeon",
    "https://github.com/Untethered-Explorers/stalwart-tailnet-mail",
)
POST_URLS = (
    "/personal/project/2026/10/06/reflecting-on-myforge.html",
    "/personal/project/2026/08/10/the-unexpected-journey.html",
    "/personal/project/2026/05/30/knowledge-dungeon-from-notes-to-explorable-world.html",
    "/personal/project/2026/04/18/revisiting-vibn-rocket-game-17-months-later.html",
    "/personal/tools/2026/04/10/complete-story-engineering-journey-system.html",
    "/personal/workflow/2026/03/26/ai-assisted-research.html",
    "/personal/update/2026/03/20/story-of-agent-forge.html",
    "/personal/update/2026/03/17/offline-ai-tutor-ezansiedgeai-ejs.html",
)
STORY_URLS = (
    "/personal/update/2026/03/20/story-of-agent-forge.html",
    "/personal/tools/2026/04/10/complete-story-engineering-journey-system.html",
    "/personal/project/2026/05/30/knowledge-dungeon-from-notes-to-explorable-world.html",
)
NAVIGATION = {
    "Home": "/",
    "Blog": "/blog/",
    "Projects": "/projects/",
    "About": "/about/",
}
PAGE_HEADINGS = {
    "Home": "McFuzzySquirrel's Playground",
    "Blog": "Blog",
    "Projects": "Projects",
    "About": "About",
}


def available_port():
    with socket.socket() as listener:
        listener.bind(("127.0.0.1", 0))
        return listener.getsockname()[1]


def git(repository, *arguments):
    return subprocess.run(
        ["git", "-C", str(repository), *arguments],
        check=True,
        capture_output=True,
        text=True,
    )


class QuietFiles(SimpleHTTPRequestHandler):
    def log_message(self, _format, *_args):
        pass


class Firefox:
    def __init__(self):
        if not shutil.which("firefox") or not shutil.which("geckodriver"):
            raise RuntimeError("Firefox and geckodriver are required for browser checks.")
        self.port = available_port()
        self.service = subprocess.Popen(
            ["geckodriver", "--host", "127.0.0.1", "--port", str(self.port)],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
        self.endpoint = f"http://127.0.0.1:{self.port}"
        self.session = None
        try:
            self._wait_for_service()
            result = self.request(
                "POST",
                "/session",
                {
                    "capabilities": {
                        "alwaysMatch": {
                            "browserName": "firefox",
                            "moz:firefoxOptions": {"args": ["-headless"]},
                        }
                    }
                },
            )
            self.session = result["value"]["sessionId"]
        except Exception:
            self.service.terminate()
            self.service.wait(timeout=5)
            raise

    def _wait_for_service(self):
        for _ in range(100):
            if self.service.poll() is not None:
                raise RuntimeError("geckodriver exited before accepting browser commands.")
            try:
                self.request("GET", "/status")
                return
            except URLError:
                time.sleep(0.05)
        raise RuntimeError("geckodriver did not become ready.")

    def request(self, method, path, body=None):
        data = None if body is None else json.dumps(body).encode()
        request = Request(
            self.endpoint + path,
            data=data,
            headers={} if data is None else {"Content-Type": "application/json"},
            method=method,
        )
        with urlopen(request, timeout=15) as response:
            content = response.read()
        return json.loads(content) if content else {}

    def command(self, method, path, body=None):
        return self.request(method, f"/session/{self.session}{path}", body).get("value")

    def navigate(self, url):
        self.command("POST", "/url", {"url": url})

    def script(self, source, arguments=()):
        return self.command(
            "POST", "/execute/sync", {"script": source, "args": list(arguments)}
        )

    def find(self, selector):
        return self.command(
            "POST", "/element", {"using": "css selector", "value": selector}
        )["element-6066-11e4-a52e-4f735466cecf"]

    def click(self, selector):
        element = self.find(selector)
        self.command("POST", f"/element/{element}/click", {})

    def viewport(self, width, height):
        self.command("POST", "/window/rect", {"width": width, "height": height})

    def tab(self):
        self.key("\ue004")

    def key(self, value):
        self.command(
            "POST",
            "/actions",
            {
                "actions": [
                    {
                        "type": "key",
                        "id": "keyboard",
                        "actions": [
                            {"type": "keyDown", "value": value},
                            {"type": "keyUp", "value": value},
                        ],
                    }
                ]
            },
        )
        self.command("DELETE", "/actions")

    def close(self):
        if self.session:
            try:
                self.request("DELETE", f"/session/{self.session}")
            except URLError:
                pass
        self.service.terminate()
        self.service.wait(timeout=5)


class LaunchSiteBrowserTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        if not (SITE / "index.html").is_file():
            raise RuntimeError(
                "Build the launch site first with `jekyll build`; browser checks need _site."
            )
        cls.browser = Firefox()
        try:
            cls.server = ThreadingHTTPServer(
                ("127.0.0.1", 0),
                partial(QuietFiles, directory=str(SITE)),
            )
            cls.server_thread = threading.Thread(
                target=cls.server.serve_forever, daemon=True
            )
            cls.server_thread.start()
            cls.base_url = f"http://127.0.0.1:{cls.server.server_port}"
        except Exception:
            if hasattr(cls, "server"):
                cls.server.server_close()
            cls.browser.close()
            raise

    @classmethod
    def tearDownClass(cls):
        if hasattr(cls, "browser"):
            cls.browser.close()
        if hasattr(cls, "server"):
            cls.server.shutdown()
            cls.server.server_close()
            cls.server_thread.join(timeout=5)

    def test_primary_pages_and_project_attribution_are_available_in_the_browser(self):
        for label, route in NAVIGATION.items():
            with self.subTest(page=label):
                self.browser.navigate(self.base_url + route)
                result = self.browser.script(
                    """return {
                      title: document.querySelector("main h1")?.textContent.trim(),
                      navigation: Array.from(document.querySelectorAll('nav[aria-label="Primary"] a'))
                        .map(link => [link.textContent.trim(), link.getAttribute("href")]),
                      images: Array.from(document.images).map(image => image.getAttribute("alt"))
                    };"""
                )
                self.assertEqual(result["title"], PAGE_HEADINGS[label])
                self.assertEqual(dict(result["navigation"]), NAVIGATION)
                self.assertTrue(all(alt is not None for alt in result["images"]))

        self.browser.navigate(self.base_url + "/projects/")
        projects = self.browser.script(
            """return Array.from(document.querySelectorAll(".project-card")).map(card => ({
              title: card.querySelector("h2")?.textContent.trim(),
              repository: card.querySelector('a[href*="github.com"]')?.href,
              credit: card.querySelector(".project-credit")?.textContent.trim() || ""
            }));"""
        )
        self.assertEqual([project["title"] for project in projects], list(PROJECTS))
        self.assertEqual([project["repository"] for project in projects], list(REPOSITORIES))
        self.assertIn("Untethered-Explorers collaboration", projects[-1]["credit"])
        self.assertIn("Creator and Maintainer", projects[-1]["credit"])
        project_links = self.browser.script(
            "return Array.from(document.querySelectorAll('a')).map(link => link.getAttribute('href'));"
        )
        self.assertTrue(set(STORY_URLS) <= set(project_links))

        self.browser.navigate(self.base_url + "/")
        home_links = self.browser.script(
            "return Array.from(document.querySelectorAll('a')).map(link => link.getAttribute('href'));"
        )
        self.assertTrue(set(REPOSITORIES) <= set(home_links))
        self.assertTrue(set(POST_URLS[:3]) <= set(home_links))

    def test_blog_filter_rss_and_existing_post_urls_work_in_the_browser(self):
        self.browser.navigate(self.base_url + "/blog/")
        initial_urls = self.browser.script(
            """return Array.from(document.querySelectorAll(".post-list > li .post-link"))
              .map(link => link.getAttribute("href"));"""
        )
        self.assertEqual(initial_urls, list(POST_URLS))
        self.assertTrue(all((SITE / url.lstrip("/")).is_file() for url in POST_URLS))
        self.assertIn("/feed.xml", self.browser.script(
            """return Array.from(document.querySelectorAll("a")).map(link => link.getAttribute("href"));"""
        ))
        with urlopen(self.base_url + "/feed.xml", timeout=5) as response:
            self.assertEqual(response.status, 200)
            feed = response.read()
            self.assertIn(b"<feed", feed)
            self.assertIn(b"<entry>", feed)

        self.browser.click('button[data-filter="agent systems"]')
        filtered = self.browser.script(
            """return {
              visible: Array.from(document.querySelectorAll(".post-list > li"))
                .filter(post => !post.hidden).length,
              selected: document.querySelector('[data-filter="agent systems"]')
                .getAttribute("aria-pressed")
            };"""
        )
        self.assertGreater(filtered["visible"], 0)
        self.assertEqual(filtered["selected"], "true")
        self.browser.click('button[data-filter="all"]')
        self.assertEqual(
            self.browser.script(
                """return Array.from(document.querySelectorAll(".post-list > li"))
                  .filter(post => !post.hidden).length;"""
            ),
            len(POST_URLS),
        )

        for path in POST_URLS:
            with self.subTest(post=path):
                self.browser.navigate(self.base_url + path)
                self.assertEqual(self.browser.script("return location.pathname;"), path)
                result = self.browser.script(
                    """return {
                      title: document.querySelector("main h1")?.textContent.trim(),
                      images: Array.from(document.images).map(image => image.getAttribute("alt"))
                    };"""
                )
                self.assertTrue(result["title"])
                self.assertTrue(all(alt is not None for alt in result["images"]))

    def test_homepage_responsive_order_focus_and_accessibility_relevant_output(self):
        self.browser.navigate(self.base_url + "/")
        self.browser.viewport(1280, 900)
        desktop = self.browser.script(
            """const hero = document.querySelector(".home-introduction");
              const image = hero.querySelector("img").getBoundingClientRect();
              const copy = hero.querySelector("div").getBoundingClientRect();
              return {
                sections: Array.from(
                  document.querySelectorAll("main section[id]")
                ).map(section => section.id),
                sideBySide: image.left > copy.right && image.top < copy.bottom,
                overflow: document.documentElement.scrollWidth > innerWidth
              };"""
        )
        self.assertEqual(
            desktop["sections"],
            ["home-introduction", "featured-project", "project-showcase", "recent-writing"],
        )
        self.assertTrue(desktop["sideBySide"])
        self.assertFalse(desktop["overflow"])
        heading_levels = self.browser.script(
            """return Array.from(document.querySelectorAll("main h1, main h2, main h3"))
              .map(heading => Number(heading.tagName.slice(1)));"""
        )
        self.assertEqual(heading_levels[0], 1)
        self.assertTrue(
            all(next_level <= current_level + 1 for current_level, next_level in zip(
                heading_levels, heading_levels[1:]
            ))
        )

        self.browser.navigate(self.base_url + "/")
        self.browser.viewport(390, 844)
        self.browser.tab()
        self.assertEqual(
            self.browser.script("return document.activeElement.getAttribute('href');"),
            "/",
        )
        self.browser.tab()
        mobile_toggle = self.browser.script(
            """const input = document.activeElement;
              const label = document.querySelector('label[for="nav-trigger"]');
              return {
                id: input.id,
                name: input.getAttribute("aria-label"),
                outline: getComputedStyle(label).outlineStyle,
                outlineWidth: parseFloat(getComputedStyle(label).outlineWidth)
              };"""
        )
        self.assertEqual(mobile_toggle["id"], "nav-trigger")
        self.assertEqual(mobile_toggle["name"], "Toggle site navigation")
        self.assertGreater(mobile_toggle["outlineWidth"], 0)
        self.browser.key("\ue00d")
        self.assertEqual(
            self.browser.script(
                """return [
                  document.querySelector("#nav-trigger").checked,
                  getComputedStyle(document.querySelector(".site-nav .trigger")).display
                ];"""
            ),
            [True, "block"],
        )

        mobile = self.browser.script(
            """const hero = document.querySelector(".home-introduction");
              const image = hero.querySelector("img").getBoundingClientRect();
              const copy = hero.querySelector("div").getBoundingClientRect();
              return {
                stacked: image.top >= copy.bottom,
                overflow: document.documentElement.scrollWidth > innerWidth,
                menuToggleVisible: getComputedStyle(
                  document.querySelector('label[for="nav-trigger"]')
                ).display !== "none"
              };"""
        )
        self.assertTrue(mobile["stacked"])
        self.assertFalse(mobile["overflow"])
        self.assertTrue(mobile["menuToggleVisible"])
        self.browser.click('label[for="nav-trigger"]')
        self.assertEqual(
            self.browser.script(
                "return getComputedStyle(document.querySelector('.site-nav .trigger')).display;"
            ),
            "none",
        )
        self.browser.click('label[for="nav-trigger"]')
        self.assertEqual(
            self.browser.script(
                "return getComputedStyle(document.querySelector('.site-nav .trigger')).display;"
            ),
            "block",
        )

        self.browser.navigate(self.base_url + "/")
        self.browser.tab()
        focus = self.browser.script(
            """const element = document.activeElement;
              const style = getComputedStyle(element);
              return {
                href: element.getAttribute("href"),
                outline: style.outlineStyle,
                outlineWidth: parseFloat(style.outlineWidth),
                boxShadow: style.boxShadow
              };"""
        )
        self.assertEqual(focus["href"], "/")
        self.assertGreater(focus["outlineWidth"], 0)
        self.assertNotEqual(focus["outline"], "none")

        contrast = self.browser.script(
            """function rgb(value) {
                let channels;
                if (value.startsWith("#")) {
                  const hex = value.slice(1);
                  channels = hex.length === 3
                    ? Array.from(hex, digit => parseInt(digit + digit, 16))
                    : [0, 2, 4].map(offset => parseInt(hex.slice(offset, offset + 2), 16));
                } else {
                  channels = value.match(/[\\d.]+/g).slice(0, 3).map(Number);
                }
                return channels.map(channel => channel / 255)
                  .map(channel => channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4);
              }
              function luminance(color) {
                const [r, g, b] = rgb(color);
                return .2126 * r + .7152 * g + .0722 * b;
              }
              function ratio(foreground, background) {
                const values = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
                return (values[0] + .05) / (values[1] + .05);
              }
              const root = getComputedStyle(document.documentElement);
              const body = getComputedStyle(document.body);
              const background = root.getPropertyValue("--bg").trim();
              return [
                ["body text", body.color, background],
                ["link", getComputedStyle(document.querySelector(".home-primary-link")).color, "#39251c"],
                ["hero accent", getComputedStyle(document.querySelector(".home-kicker")).color, "#241813"],
                [
                  "project attribution",
                  getComputedStyle(document.querySelector(".project-credit")).color,
                  "#3a2720"
                ]
              ].map(([name, foreground, backdrop]) => ({
                name, ratio: ratio(foreground, backdrop)
              }));"""
        )
        for sample in contrast:
            with self.subTest(component=sample["name"]):
                self.assertGreaterEqual(sample["ratio"], 4.5)
        self.assertEqual(
            self.browser.script(
                """return document.querySelector(".home-introduction img").getAttribute("alt");"""
            ),
            "Squirrel blacksmith forging in a cozy workshop",
        )


class LocalPublishBrowserTests(unittest.TestCase):
    def test_local_editor_review_decline_and_confirm_publish_only_to_test_remote(self):
        browser = Firefox()
        temporary = tempfile.TemporaryDirectory(prefix=".e2e-publish-", dir=ROOT / "tests")
        server = None
        server_thread = None
        preview_server = None
        preview_thread = None
        try:
            if not (LOCAL_SITE / "index.html").is_file():
                raise RuntimeError(
                    "Build the local preview with `_config.local.yml` before browser checks."
                )
            preview_server = ThreadingHTTPServer(
                ("127.0.0.1", 0),
                partial(QuietFiles, directory=str(LOCAL_SITE)),
            )
            preview_thread = threading.Thread(target=preview_server.serve_forever, daemon=True)
            preview_thread.start()
            preview_url = f"http://127.0.0.1:{preview_server.server_port}/"
            with urlopen(preview_url, timeout=5) as response:
                self.assertIn(b"McFuzzySquirrel", response.read())

            base = Path(temporary.name)
            repository = base / "repository"
            remote = base / "remote.git"
            repository.mkdir()
            subprocess.run(
                ["git", "init", "--quiet", "-b", "gh-pages", str(repository)], check=True
            )
            git(repository, "config", "user.name", "End-to-end Test")
            git(repository, "config", "user.email", "e2e-test@example.invalid")
            (repository / "_posts").mkdir()
            post = repository / "_posts" / "preserved-url.markdown"
            post.write_text("---\ntitle: Existing URL\n---\nBefore review\n")
            git(repository, "add", "_posts/preserved-url.markdown")
            git(repository, "commit", "-m", "Initial content")
            initial_commit = git(repository, "rev-parse", "HEAD").stdout.strip()
            git(repository, "init", "--quiet", "--bare", "--initial-branch=gh-pages", str(remote))
            git(repository, "remote", "add", "origin", str(remote))
            git(repository, "push", "-u", "origin", "gh-pages")
            post.write_text(post.read_text().replace("Before review", "Reviewed content"))

            spec = importlib.util.spec_from_file_location("local_authoring_e2e", AUTHORING_SERVER)
            local_authoring = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(local_authoring)
            server = local_authoring.create_server(
                repository, 0, preview_server.server_port
            )
            server_thread = threading.Thread(target=server.serve_forever, daemon=True)
            server_thread.start()
            base_url = f"http://127.0.0.1:{server.server_port}"
            for _ in range(100):
                try:
                    with urlopen(base_url, timeout=0.2):
                        break
                except OSError:
                    time.sleep(0.05)
            else:
                self.fail("local authoring companion did not become ready")

            browser.navigate(base_url + "/")
            with urlopen(base_url + "/admin/index.html", timeout=5) as response:
                self.assertIn(b"Local Sveltia CMS", response.read())
            for _ in range(100):
                ready = browser.script(
                    """return document.querySelector("#review-ack")?.disabled === false;"""
                )
                if ready:
                    break
                time.sleep(0.05)
            self.assertTrue(ready)
            self.assertIn(
                "Reviewed content",
                browser.script("return document.querySelector('#diff').textContent;"),
            )
            self.assertIn(preview_url, browser.script(
                """return document.querySelector('iframe[title="Local Jekyll preview"]').src;"""
            ))
            self.assertTrue(browser.script("return document.querySelector('#publish').disabled;"))
            browser.click("#review-ack")
            self.assertFalse(browser.script("return document.querySelector('#publish').disabled;"))
            browser.script("window.confirm = () => false;")
            browser.click("#publish")
            self.assertEqual(
                browser.script("return document.querySelector('#message').textContent;"),
                "Ready to publish _posts/preserved-url.markdown to origin/gh-pages.",
            )
            self.assertEqual(
                git(repository, "ls-remote", "--refs", "origin").stdout.split(),
                [initial_commit, "refs/heads/gh-pages"],
            )

            browser.script("window.confirm = () => true;")
            browser.click("#publish")
            for _ in range(100):
                message = browser.script("return document.querySelector('#message').textContent;")
                remote_ref = git(repository, "ls-remote", "--refs", "origin").stdout.split()[0]
                review_disabled = browser.script(
                    "return document.querySelector('#review-ack').disabled;"
                )
                if (
                    remote_ref != initial_commit
                    and review_disabled
                    and message == "Published to origin/gh-pages."
                ):
                    break
                time.sleep(0.05)
            self.assertEqual(message, "Published to origin/gh-pages.")
            self.assertNotEqual(git(repository, "rev-parse", "HEAD").stdout.strip(), initial_commit)
            self.assertEqual(
                git(repository, "diff", "--name-only", "HEAD^", "HEAD").stdout.splitlines(),
                ["_posts/preserved-url.markdown"],
            )
            self.assertEqual(
                git(repository, "show", "origin/gh-pages:_posts/preserved-url.markdown").stdout,
                "---\ntitle: Existing URL\n---\nReviewed content\n",
            )
            remote_refs = {
                line.split()[1]
                for line in git(repository, "ls-remote", "--refs", "origin").stdout.splitlines()
            }
            self.assertEqual(remote_refs, {"refs/heads/gh-pages"})
        finally:
            browser.close()
            if server:
                server.shutdown()
                server.server_close()
                server_thread.join(timeout=5)
            if preview_server:
                preview_server.shutdown()
                preview_server.server_close()
                preview_thread.join(timeout=5)
            temporary.cleanup()


if __name__ == "__main__":
    unittest.main()

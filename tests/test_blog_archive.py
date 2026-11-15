from html.parser import HTMLParser
from pathlib import Path
import shutil
import subprocess
import unittest


SITE = Path(__file__).parents[1] / "_site"
EXPECTED_NAVIGATION = {
    "Home": "/",
    "Blog": "/blog/",
    "Projects": "/projects/",
    "About": "/about/",
}
NEWEST_FIRST_POSTS = (
    "/personal/project/2026/10/06/reflecting-on-myforge.html",
    "/personal/project/2026/08/10/the-unexpected-journey.html",
    "/personal/project/2026/05/30/knowledge-dungeon-from-notes-to-explorable-world.html",
    "/personal/project/2026/04/18/revisiting-vibn-rocket-game-17-months-later.html",
    "/personal/tools/2026/04/10/complete-story-engineering-journey-system.html",
    "/personal/workflow/2026/03/26/ai-assisted-research.html",
    "/personal/update/2026/03/20/story-of-agent-forge.html",
    "/personal/update/2026/03/17/offline-ai-tutor-ezansiedgeai-ejs.html",
)


class PageParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.text = []
        self.links = []
        self.post_links = []
        self.navigation = []
        self.filters = []
        self.input_types = []
        self.scripts = []
        self._navigation_depth = 0
        self._link = None
        self._button = None
        self._in_script = False

    def handle_starttag(self, tag, attrs):
        attributes = dict(attrs)
        if tag == "nav" and attributes.get("aria-label") == "Primary":
            self._navigation_depth += 1
        elif tag == "script":
            self.scripts.append([])
            self._in_script = True
        elif tag == "input":
            self.input_types.append(attributes.get("type", "text"))
        elif tag == "a":
            self._link = {
                "href": attributes.get("href", ""),
                "class": attributes.get("class", "").split(),
                "text": [],
                "navigation": self._navigation_depth > 0,
            }
        elif tag == "button" and "data-filter" in attributes:
            self._button = {"filter": attributes["data-filter"], "text": []}

    def handle_endtag(self, tag):
        if tag == "a" and self._link:
            link = {**self._link, "text": " ".join(" ".join(self._link["text"]).split())}
            self.links.append(link)
            if "post-link" in link["class"]:
                self.post_links.append(link["href"])
            if link["navigation"]:
                self.navigation.append((link["text"], link["href"]))
            self._link = None
        elif tag == "button" and self._button:
            self.filters.append(
                (self._button["filter"], " ".join(" ".join(self._button["text"]).split()))
            )
            self._button = None
        elif tag == "nav" and self._navigation_depth:
            self._navigation_depth -= 1
        elif tag == "script":
            self._in_script = False

    def handle_data(self, data):
        self.text.append(data)
        if self._in_script:
            self.scripts[-1].append(data)
        if self._link:
            self._link["text"].append(data)
        if self._button:
            self._button["text"].append(data)


def parse_page(route):
    parser = PageParser()
    parser.feed((SITE / route).read_text(encoding="utf-8"))
    return parser


class BlogArchiveTests(unittest.TestCase):
    def test_primary_navigation_is_available_from_site_pages_and_posts(self):
        for route in (
            "index.html",
            "blog/index.html",
            "projects/index.html",
            "about/index.html",
            *[path.lstrip("/") for path in NEWEST_FIRST_POSTS[:1]],
        ):
            with self.subTest(route=route):
                parser = parse_page(route)
                self.assertEqual(dict(parser.navigation), EXPECTED_NAVIGATION)

    def test_blog_archive_is_newest_first_and_keeps_tag_filters_and_rss(self):
        parser = parse_page("blog/index.html")
        self.assertEqual(parser.post_links, list(NEWEST_FIRST_POSTS))
        filters = dict(parser.filters)
        self.assertIn("all", filters)
        self.assertIn("All", filters.values())
        self.assertIn("agent systems", filters)
        self.assertIn("/feed.xml", [link["href"] for link in parser.links])
        self.assertTrue((SITE / "feed.xml").is_file())
        self.assertNotIn("search", parser.input_types)
        self.assertFalse(any("search" in label.lower() for _, label in parser.filters))

    @unittest.skipUnless(shutil.which("node"), "Node.js is unavailable")
    def test_selecting_a_tag_filters_posts_and_all_restores_them(self):
        parser = parse_page("blog/index.html")
        script = next(
            "".join(parts)
            for parts in parser.scripts
            if "document.querySelector('.blog-archive')" in "".join(parts)
        )
        harness = r"""
const vm = require("node:vm");
const assert = require("node:assert/strict");
const buttons = ["all", "agent systems"].map((filter) => {
  const attributes = { "data-filter": filter };
  const classes = new Set();
  let clickHandler;
  return {
    attributes,
    classList: { toggle(name, enabled) { enabled ? classes.add(name) : classes.delete(name); } },
    getAttribute(name) { return attributes[name] || null; },
    setAttribute(name, value) { attributes[name] = value; },
    addEventListener(name, handler) { if (name === "click") clickHandler = handler; },
    click() { clickHandler(); }
  };
});
const posts = ["agent systems,frameworks", "AI agents,workflow", "education"].map((tags) => ({
  tags,
  hidden: false,
  getAttribute(name) { return name === "data-tags" ? tags : null; }
}));
const archive = {
  querySelectorAll(selector) {
    return selector === ".post-filter-chip" ? buttons : posts;
  }
};
vm.runInNewContext(require("node:fs").readFileSync(0, "utf8"), {
  document: { querySelector(selector) { return selector === ".blog-archive" ? archive : null; } }
});
buttons[1].click();
assert.deepEqual(posts.map((post) => post.hidden), [false, true, true]);
assert.equal(buttons[1].attributes["aria-pressed"], "true");
buttons[0].click();
assert.deepEqual(posts.map((post) => post.hidden), [false, false, false]);
assert.equal(buttons[0].attributes["aria-pressed"], "true");
"""
        subprocess.run(["node", "-e", harness], input=script, text=True, check=True)

    def test_existing_post_urls_still_render(self):
        for post_url in NEWEST_FIRST_POSTS:
            with self.subTest(post_url=post_url):
                self.assertTrue((SITE / post_url.lstrip("/")).is_file())

    def test_about_page_describes_the_build_in_public_purpose(self):
        page = parse_page("about/index.html")
        text = " ".join(" ".join(page.text).split()).replace("’", "'")
        self.assertIn("McFuzzySquirrel's Playground", text)
        self.assertIn("build in public", text)
        self.assertIn("what worked, what didn't", text)
        self.assertIn("AI agents", text)


if __name__ == "__main__":
    unittest.main()

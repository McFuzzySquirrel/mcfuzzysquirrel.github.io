from html.parser import HTMLParser
from pathlib import Path
import unittest


HOME_PAGE = Path(__file__).parents[1] / "_site" / "index.html"
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
RECENT_STORIES = (
    (
        "/personal/project/2026/10/06/reflecting-on-myforge.html",
        "Reflecting on MyForge: From Agent Forge to the Value Chain",
    ),
    (
        "/personal/project/2026/08/10/the-unexpected-journey.html",
        "The unexpected journey of building Skill Forge",
    ),
    (
        "/personal/project/2026/05/30/knowledge-dungeon-from-notes-to-explorable-world.html",
        "Knowledge Dungeon: Turning Study Notes into an Explorable World",
    ),
)


class HomePageParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.sections = []
        self.links = []
        self.images = []
        self._link = None

    def handle_starttag(self, tag, attrs):
        attributes = dict(attrs)
        if tag == "section" and attributes.get("id"):
            self.sections.append(attributes["id"])
        elif tag == "img":
            self.images.append((attributes.get("src", ""), attributes.get("alt", "")))
        elif tag == "a":
            self._link = {"href": attributes.get("href", ""), "text": []}

    def handle_endtag(self, tag):
        if tag == "a" and self._link:
            text = " ".join(" ".join(self._link["text"]).split())
            self.links.append((self._link["href"], text))
            self._link = None

    def handle_data(self, data):
        if self._link:
            self._link["text"].append(data)


class HomePageTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.parser = HomePageParser()
        cls.parser.feed(HOME_PAGE.read_text(encoding="utf-8"))

    def test_homepage_sections_follow_the_accessible_reading_order(self):
        self.assertEqual(
            self.parser.sections,
            ["home-introduction", "featured-project", "project-showcase", "recent-writing"],
        )

    def test_homepage_features_all_projects_and_recent_build_stories(self):
        project_positions = [
            next(i for i, (_, text) in enumerate(self.parser.links) if name in text)
            for name in PROJECTS
        ]
        self.assertEqual(project_positions, sorted(project_positions))
        self.assertEqual(self.parser.links[project_positions[0]][1], PROJECTS[0])
        for project, repository in zip(PROJECTS, REPOSITORIES):
            with self.subTest(project=project):
                self.assertIn((repository, project), self.parser.links)

        for story_url, title in RECENT_STORIES:
            with self.subTest(story=title):
                self.assertIn((story_url, title), self.parser.links)
                self.assertTrue((HOME_PAGE.parent / story_url.lstrip("/")).is_file())

        for related_story in (
            "/personal/update/2026/03/20/story-of-agent-forge.html",
            "/personal/tools/2026/04/10/complete-story-engineering-journey-system.html",
            "/personal/project/2026/05/30/knowledge-dungeon-from-notes-to-explorable-world.html",
        ):
            with self.subTest(related_story=related_story):
                self.assertIn(related_story, [href for href, _ in self.parser.links])
        self.assertIn(
            "https://github.com/McFuzzySquirrel/study-detective/blob/main/docs/media/demo.gif",
            [href for href, _ in self.parser.links],
        )
        self.assertIn(
            "https://mcfuzzysquirrel.github.io/knowledge-dungeon/",
            [href for href, _ in self.parser.links],
        )
        self.assertIn(("/projects/", "Explore all projects"), self.parser.links)
        self.assertIn(("/blog/", "Read the blog"), self.parser.links)
        self.assertTrue(any("squirrel-blacksmith.jpeg" in src and alt for src, alt in self.parser.images))


if __name__ == "__main__":
    unittest.main()

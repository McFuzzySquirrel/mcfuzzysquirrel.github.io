from html.parser import HTMLParser
from pathlib import Path
import unittest


PROJECT_PAGE = Path(__file__).parents[1] / "_site" / "projects" / "index.html"
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
STORIES = (
    "/personal/update/2026/03/20/story-of-agent-forge.html",
    "/personal/tools/2026/04/10/complete-story-engineering-journey-system.html",
    "/personal/project/2026/05/30/knowledge-dungeon-from-notes-to-explorable-world.html",
)


class PageParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.text = []
        self.links = []

    def handle_starttag(self, tag, attrs):
        if tag == "a":
            self.links.append(dict(attrs).get("href", ""))

    def handle_data(self, data):
        self.text.append(data)


class ProjectsPageTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.parser = PageParser()
        cls.parser.feed(PROJECT_PAGE.read_text())
        cls.page_text = " ".join(cls.parser.text)

    def test_projects_are_present_in_the_agreed_order(self):
        positions = [self.page_text.index(name) for name in PROJECTS]
        self.assertEqual(positions, sorted(positions))

    def test_each_project_links_to_its_repository(self):
        for repository in REPOSITORIES:
            with self.subTest(repository=repository):
                self.assertIn(repository, self.parser.links)

    def test_build_stories_demo_and_collaboration_are_discoverable(self):
        for story in STORIES:
            with self.subTest(story=story):
                self.assertIn(story, self.parser.links)
                self.assertTrue((PROJECT_PAGE.parents[1] / story.lstrip("/")).is_file())
        self.assertIn("https://mcfuzzysquirrel.github.io/knowledge-dungeon/", self.parser.links)
        self.assertIn(
            "https://github.com/McFuzzySquirrel/study-detective/blob/main/docs/media/demo.gif",
            self.parser.links,
        )
        self.assertIn("Untethered-Explorers collaboration", self.page_text)
        self.assertIn("Creator and Maintainer", self.page_text)
        self.assertNotIn("Active", self.page_text)
        self.assertNotIn("Completed", self.page_text)


if __name__ == "__main__":
    unittest.main()

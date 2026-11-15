from pathlib import Path
import re
import unittest

import yaml


ROOT = Path(__file__).parents[1]


def front_matter_keys(path):
    text = path.read_text()
    front_matter = re.search(r"\A---\s*\n(.*?)\n---\s*\n", text, re.DOTALL)
    if not front_matter:
        return set()
    return set(re.findall(r"^([\w-]+):", front_matter.group(1), re.MULTILINE))


class LocalEditorTests(unittest.TestCase):
    def test_public_build_excludes_admin_but_local_preview_includes_it(self):
        public_config = (ROOT / "_config.yml").read_text()
        local_config = (ROOT / "_config.local.yml").read_text()

        excluded_paths = public_config.split("exclude:", 1)[1].split("\n\n", 1)[0]
        for path in ("admin", "scripts", "tests", "docs"):
            with self.subTest(excluded_path=path):
                self.assertRegex(excluded_paths, rf"(?m)^\s+- {path}\s*$")
        self.assertRegex(local_config, r"(?m)^include:\s*\n\s+- admin\s*$")
        self.assertRegex(local_config, r"(?m)^show_drafts:\s*true\s*$")

    def test_editor_covers_existing_posts_and_projects_without_omitting_metadata(self):
        config = (ROOT / "admin" / "config.yml").read_text()
        parsed_config = yaml.safe_load(config)
        collections = {
            collection["name"]: collection for collection in parsed_config["collections"]
        }
        posts = collections["posts"]
        drafts = collections["drafts"]
        projects = collections["projects"]

        self.assertRegex(
            config,
            r"(?m)^backend:\s*\n\s+name: github\s*\n\s+repo: "
            r"McFuzzySquirrel/mcfuzzysquirrel\.github\.io\s*$",
        )
        self.assertNotRegex(config, r"(?im)^\s*(?:local_backend|proxy|access_token|token):")

        post_fields_needed = {"layout", "title", "date", "categories", "tags", "body"}
        self.assertIs(posts["fields"], drafts["fields"])
        self.assertEqual({field["name"] for field in posts["fields"]}, post_fields_needed)
        self.assertEqual({field["name"] for field in drafts["fields"]}, post_fields_needed)
        self.assertEqual(posts["fields"][2]["input_timezone"], "Africa/Johannesburg")
        self.assertFalse(posts["fields"][2]["output_utc"])
        self.assertTrue(posts["create"])
        self.assertTrue(drafts["create"])
        self.assertEqual(posts["slug"], "{{date | date('YYYY-MM-DD')}}-{{slug}}")
        self.assertNotIn("permalink_field", config)

        post_metadata = set().union(*(front_matter_keys(path) for path in (ROOT / "_posts").glob("*")))
        project_metadata = set().union(*(front_matter_keys(path) for path in (ROOT / "_projects").glob("*")))
        post_field_names = {field["name"] for field in posts["fields"]}
        project_field_names = {field["name"] for field in projects["fields"]}
        self.assertTrue(post_metadata <= post_field_names)
        self.assertTrue(project_metadata <= project_field_names)
        for folder in ("_posts", "_drafts", "_projects"):
            self.assertRegex(config, rf"(?s)folder: {folder}\b")


if __name__ == "__main__":
    unittest.main()

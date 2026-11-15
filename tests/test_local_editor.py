from pathlib import Path
import re
import unittest


ROOT = Path(__file__).parents[1]


def field_names(section):
    return set(re.findall(r"^\s+- name: ([\w-]+)$", section, re.MULTILINE))


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
        self.assertRegex(
            config,
            r"(?m)^backend:\s*\n\s+name: github\s*\n\s+repo: "
            r"McFuzzySquirrel/mcfuzzysquirrel\.github\.io\s*$",
        )
        self.assertNotRegex(config, r"(?im)^\s*(?:local_backend|proxy|access_token|token):")

        post_fields = config.split("  - name: posts", 1)[1].split("  - name: drafts", 1)[0]
        draft_fields = config.split("  - name: drafts", 1)[1].split("  - name: projects", 1)[0]
        project_fields = config.split("  - name: projects", 1)[1]
        post_fields_needed = {"layout", "title", "date", "categories", "tags", "body"}
        self.assertTrue(post_fields_needed <= field_names(post_fields))
        self.assertTrue(post_fields_needed <= field_names(draft_fields))
        self.assertIn("input_timezone: Africa/Johannesburg", post_fields)
        self.assertIn("output_utc: false", post_fields)
        self.assertIn("create: true", post_fields)
        self.assertIn("create: true", draft_fields)
        self.assertIn("{{date | date('YYYY-MM-DD')}}-{{slug}}", post_fields)
        self.assertNotIn("permalink_field", config)

        post_metadata = set().union(*(front_matter_keys(path) for path in (ROOT / "_posts").glob("*")))
        project_metadata = set().union(*(front_matter_keys(path) for path in (ROOT / "_projects").glob("*")))
        self.assertTrue(post_metadata <= field_names(post_fields))
        self.assertTrue(project_metadata <= field_names(project_fields))
        for folder in ("_posts", "_drafts", "_projects"):
            self.assertRegex(config, rf"(?s)folder: {folder}\b")


if __name__ == "__main__":
    unittest.main()

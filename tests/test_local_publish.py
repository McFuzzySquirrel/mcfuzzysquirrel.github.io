import json
from pathlib import Path
import socket
import subprocess
import sys
import tempfile
import time
import unittest
from urllib.error import HTTPError
from urllib.request import Request, urlopen


ROOT = Path(__file__).parents[1]
SERVER = ROOT / "scripts" / "local_authoring.py"


def git(repository, *arguments, check=True):
    return subprocess.run(
        ["git", "-C", str(repository), *arguments],
        check=check,
        capture_output=True,
        text=True,
    )


class LocalPublishTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory(
            prefix=".publish-test-", dir=ROOT / "tests"
        )
        self.base = Path(self.temporary.name)
        self.repository = self.base / "repository"
        self.remote = self.base / "remote.git"
        self.repository.mkdir()
        subprocess.run(
            ["git", "init", "--quiet", "-b", "gh-pages", str(self.repository)], check=True
        )
        git(self.repository, "config", "user.name", "Publish Test")
        git(self.repository, "config", "user.email", "publish-test@example.invalid")
        (self.repository / "_posts").mkdir()
        (self.repository / "_projects").mkdir()
        (self.repository / "_posts" / "post.markdown").write_text(
            "---\ntitle: Existing post\n---\nOriginal content\n"
        )
        (self.repository / "_projects" / "project.md").write_text(
            "---\ntitle: Existing project\n---\nOriginal project\n"
        )
        (self.repository / "notes.txt").write_text("Original notes\n")
        git(self.repository, "add", "_posts", "_projects", "notes.txt")
        git(self.repository, "commit", "-m", "Initial content")
        self.initial_commit = git(self.repository, "rev-parse", "HEAD").stdout.strip()
        subprocess.run(
            ["git", "init", "--quiet", "--bare", "--initial-branch=gh-pages", str(self.remote)],
            check=True,
        )
        git(self.repository, "remote", "add", "origin", str(self.remote))
        git(self.repository, "push", "-u", "origin", "gh-pages")

        with socket.socket() as listener:
            listener.bind(("127.0.0.1", 0))
            self.port = listener.getsockname()[1]
        self.base_url = f"http://127.0.0.1:{self.port}"
        self.server = subprocess.Popen(
            [sys.executable, str(SERVER), "--port", str(self.port)],
            cwd=self.repository,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
        self._wait_for_server()

    def tearDown(self):
        if hasattr(self, "server"):
            self.server.terminate()
            try:
                self.server.wait(timeout=5)
            except subprocess.TimeoutExpired:
                self.server.kill()
                self.server.wait(timeout=5)
        self.temporary.cleanup()

    def _wait_for_server(self):
        for _ in range(50):
            if self.server.poll() is not None:
                self.fail("local authoring server exited before becoming ready")
            try:
                with urlopen(self.base_url, timeout=0.2):
                    return
            except OSError:
                time.sleep(0.05)
        self.fail("local authoring server did not become ready")

    def _json(self, path, body=None):
        request = Request(
            self.base_url + path,
            data=None if body is None else json.dumps(body).encode(),
            headers={}
            if body is None
            else {
                "Content-Type": "application/json",
                "Origin": self.base_url,
            },
            method="GET" if body is None else "POST",
        )
        try:
            with urlopen(request, timeout=3) as response:
                return response.status, json.loads(response.read())
        except HTTPError as error:
            with error:
                return error.code, json.loads(error.read())

    def _remote_paths(self):
        result = git(
            self.repository, "diff", "--name-only", self.initial_commit, "origin/gh-pages"
        )
        return {path for path in result.stdout.splitlines() if path}

    def _remote_refs(self):
        return {
            line.split()[1]
            for line in git(self.repository, "ls-remote", "--refs", "origin").stdout.splitlines()
        }

    def test_reviewed_content_is_committed_and_only_origin_gh_pages_is_pushed(self):
        post = self.repository / "_posts" / "post.markdown"
        post.write_text(post.read_text().replace("Original content", "Reviewed content"))
        new_project = self.repository / "_projects" / "new-project.md"
        new_project.write_text("---\ntitle: New project\n---\nNew project content\n")

        status, review = self._json("/publish/status")
        self.assertEqual(status, 200, review)
        self.assertIn("-Original content", review["diff"])
        self.assertIn("+Reviewed content", review["diff"])
        self.assertIn("new file mode", review["diff"])
        self.assertIn("+New project content", review["diff"])
        self.assertEqual(review["destination"], "origin/gh-pages")

        status, published = self._json(
            "/publish", {"confirmed": True, "review_id": review["review_id"]}
        )

        self.assertEqual(status, 200, published)
        self.assertTrue(published["published"])
        self.assertEqual(published["destination"], "origin/gh-pages")
        self.assertEqual(
            self._remote_paths(), {"_posts/post.markdown", "_projects/new-project.md"}
        )
        self.assertEqual(self._remote_refs(), {"refs/heads/gh-pages"})
        self.assertEqual(
            git(self.repository, "show", "origin/gh-pages:_posts/post.markdown").stdout,
            "---\ntitle: Existing post\n---\nReviewed content\n",
        )
        self.assertEqual(
            git(self.repository, "show", "origin/gh-pages:_projects/new-project.md").stdout,
            "---\ntitle: New project\n---\nNew project content\n",
        )
        self.assertEqual(git(self.repository, "remote", "get-url", "origin").stdout.strip(), str(self.remote))

    def test_publish_requires_a_positive_confirmation(self):
        (self.repository / "_projects" / "project.md").write_text(
            "---\ntitle: Existing project\n---\nReviewed project\n"
        )
        _, review = self._json("/publish/status")

        status, declined = self._json(
            "/publish", {"confirmed": False, "review_id": review["review_id"]}
        )

        self.assertEqual(status, 200)
        self.assertFalse(declined["published"])
        self.assertEqual(self._remote_paths(), set())
        self.assertEqual(self._remote_refs(), {"refs/heads/gh-pages"})

    def test_publish_requires_the_exact_diff_to_remain_unchanged_after_review(self):
        post = self.repository / "_posts" / "post.markdown"
        post.write_text(post.read_text().replace("Original content", "First review"))
        _, review = self._json("/publish/status")
        post.write_text(post.read_text().replace("First review", "Changed after review"))

        status, result = self._json(
            "/publish", {"confirmed": True, "review_id": review["review_id"]}
        )

        self.assertEqual(status, 409)
        self.assertIn("changed", result["reason"].lower())
        self.assertEqual(self._remote_paths(), set())

    def test_publish_requires_a_clean_gh_pages_base(self):
        (self.repository / "notes.txt").write_text("Local code change\n")
        git(self.repository, "commit", "-am", "Unrelated local commit")
        (self.repository / "_posts" / "post.markdown").write_text("Post change\n")

        status, review = self._json("/publish/status")

        self.assertEqual(status, 409)
        self.assertFalse(review["ready"])
        self.assertIn("synchronize", review["reason"].lower())
        self.assertEqual(self._remote_paths(), set())

    def test_publish_can_remove_an_existing_content_entry(self):
        (self.repository / "_projects" / "project.md").unlink()
        _, review = self._json("/publish/status")

        status, published = self._json(
            "/publish", {"confirmed": True, "review_id": review["review_id"]}
        )

        self.assertEqual(status, 200, published)
        self.assertEqual(self._remote_paths(), {"_projects/project.md"})
        self.assertNotEqual(
            git(self.repository, "cat-file", "-e", "origin/gh-pages:_projects/project.md", check=False).returncode,
            0,
        )

    def test_publish_rejects_unrelated_or_staged_changes(self):
        cases = (
            ("unrelated tracked edit", lambda: (self.repository / "notes.txt").write_text("unrelated")),
            ("unrelated untracked file", lambda: (self.repository / "extra.txt").write_text("unrelated")),
            (
                "staged content edit",
                lambda: (
                    (self.repository / "_posts" / "post.markdown").write_text("staged change"),
                    git(self.repository, "add", "_posts/post.markdown"),
                ),
            ),
        )
        for name, setup in cases:
            with self.subTest(name=name):
                setup()
                status, review = self._json("/publish/status")
                self.assertEqual(status, 409)
                self.assertFalse(review["ready"])
                self.assertEqual(self._remote_paths(), set())
                if name == "unrelated tracked edit":
                    git(self.repository, "checkout", "--", "notes.txt")
                elif name == "unrelated untracked file":
                    (self.repository / "extra.txt").unlink()
                elif name == "staged content edit":
                    git(self.repository, "reset", "--hard", "HEAD")

    def test_publish_rejects_a_merge_conflict(self):
        git(self.repository, "checkout", "-b", "competing")
        post = self.repository / "_posts" / "post.markdown"
        post.write_text(post.read_text().replace("Original content", "Competing content"))
        git(self.repository, "commit", "-am", "Competing edit")
        git(self.repository, "checkout", "gh-pages")
        post.write_text(post.read_text().replace("Original content", "Local edit"))
        git(self.repository, "commit", "-am", "Local edit")
        git(self.repository, "merge", "competing", check=False)

        status, review = self._json("/publish/status")

        self.assertEqual(status, 409)
        self.assertFalse(review["ready"])
        self.assertIn("conflict", review["reason"].lower())
        self.assertEqual(self._remote_paths(), set())

    def test_companion_shows_sveltia_preview_and_reviewed_diff(self):
        with urlopen(self.base_url) as response:
            page = response.read().decode()

        self.assertIn("/admin/index.html", page)
        self.assertIn("http://127.0.0.1:4000/", page)
        self.assertIn("/publish/status", page)
        self.assertIn("review_id", page)
        self.assertIn('id="review-ack"', page)
        self.assertIn("window.confirm", page)


if __name__ == "__main__":
    unittest.main()

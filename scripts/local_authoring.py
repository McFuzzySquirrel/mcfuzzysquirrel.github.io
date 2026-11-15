#!/usr/bin/env python3
"""Serve a loopback-only authoring companion for Sveltia and reviewed publishing."""

from hashlib import sha256
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import argparse
import json
from pathlib import Path
import re
import subprocess
import threading


PROJECT_ROOT = Path(__file__).resolve().parents[1]
PREVIEW_URL = "http://127.0.0.1:4000/"
DESTINATION = "origin/gh-pages"
ALLOWED_PATH = re.compile(r"_(posts|projects)/[A-Za-z0-9][A-Za-z0-9._-]*\.(markdown|md)\Z")
PUBLISH_LOCK = threading.Lock()


class PublishError(Exception):
    pass


def git(repository, *arguments, timeout=15):
    try:
        result = subprocess.run(
            ["git", *arguments],
            cwd=repository,
            stdin=subprocess.DEVNULL,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            timeout=timeout,
            check=False,
        )
    except (OSError, subprocess.TimeoutExpired) as error:
        raise PublishError("Git could not complete the requested operation.") from error
    if result.returncode:
        raise PublishError("Git could not complete the requested operation.")
    return result.stdout


def find_repository():
    repository = Path.cwd().resolve()
    root = Path(git(repository, "rev-parse", "--show-toplevel").decode().strip()).resolve()
    if repository != root:
        raise PublishError("Start the authoring companion from the repository root.")
    return root


def _is_content_path(path):
    if not ALLOWED_PATH.fullmatch(path):
        return False
    directory, extension = path.split("/", 1)[0], path.rsplit(".", 1)[-1]
    return (directory == "_posts" and extension == "markdown") or (
        directory == "_projects" and extension == "md"
    )


def _git_path(repository, name):
    path = Path(repository, name)
    if path.is_symlink() or not path.is_file():
        raise PublishError("Publishable entries must be regular files.")
    return path


def _tracked_path(repository, name):
    git(repository, "ls-files", "--error-unmatch", "--", name)


def _status_entries(repository):
    status = git(
        repository,
        "status",
        "--porcelain=v1",
        "-z",
        "--untracked-files=all",
        "--ignore-submodules=all",
    )
    return [entry for entry in status.split(b"\0") if entry]


def _diff_for(repository, paths, untracked):
    diff = b""
    for path in sorted(paths):
        if path not in untracked:
            diff += git(
                repository,
                "diff",
                "--no-ext-diff",
                "--no-textconv",
                "--no-color",
                "--no-renames",
                "--",
                path,
            )
            continue
        try:
            result = subprocess.run(
                [
                    "git",
                    "diff",
                    "--no-index",
                    "--no-ext-diff",
                    "--no-textconv",
                    "--no-color",
                    "--",
                    "/dev/null",
                    path,
                ],
                cwd=repository,
                stdin=subprocess.DEVNULL,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                timeout=15,
                check=False,
            )
        except (OSError, subprocess.TimeoutExpired) as error:
            raise PublishError("Git could not prepare the content diff.") from error
        if result.returncode not in (0, 1):
            raise PublishError("Git could not prepare the content diff.")
        diff += result.stdout
    try:
        if b"Binary files " in diff or b"GIT binary patch" in diff:
            raise PublishError("Publishable content must be reviewable UTF-8 text.")
        return diff.decode("utf-8")
    except UnicodeDecodeError as error:
        raise PublishError("Publishable content must be UTF-8 text.") from error


def inspect(repository):
    conflicts = git(repository, "ls-files", "-u", "-z")
    if conflicts:
        raise PublishError("A merge conflict must be resolved before publishing.")
    for state in ("MERGE_HEAD", "CHERRY_PICK_HEAD", "REVERT_HEAD", "rebase-apply", "rebase-merge"):
        state_path = Path(git(repository, "rev-parse", "--git-path", state).decode().strip())
        if not state_path.is_absolute():
            state_path = repository / state_path
        if state_path.exists():
            raise PublishError("Finish the current Git operation before publishing.")

    branch = git(repository, "branch", "--show-current").decode().strip()
    if branch != "gh-pages":
        raise PublishError("Check out the local gh-pages branch before publishing.")
    head = git(repository, "rev-parse", "HEAD").decode().strip()
    try:
        remote_head = git(repository, "rev-parse", "--verify", "refs/remotes/origin/gh-pages").decode().strip()
    except PublishError as error:
        raise PublishError("Fetch origin/gh-pages before reviewing content.") from error
    if head != remote_head:
        raise PublishError("Synchronize local gh-pages with origin/gh-pages before publishing.")

    entries = _status_entries(repository)
    if not entries:
        raise PublishError("There are no post or project changes to publish.")

    paths = []
    untracked = set()
    for entry in entries:
        if len(entry) < 4:
            raise PublishError("Git reported an unsupported working-tree change.")
        index_status, worktree_status = entry[0:1], entry[1:2]
        try:
            path = entry[3:].decode("utf-8")
        except UnicodeDecodeError as error:
            raise PublishError("Git reported a path that is not valid UTF-8.") from error

        if index_status != b" " and (index_status, worktree_status) != (b"?", b"?"):
            raise PublishError("Unstage all changes before reviewing a publish.")
        if worktree_status not in (b"M", b"D", b"?", b"A"):
            raise PublishError("Resolve conflicts and unsupported changes before publishing.")
        if not _is_content_path(path):
            raise PublishError("Only post and project content may be published.")
        if worktree_status == b"?":
            _git_path(repository, path)
            untracked.add(path)
        elif worktree_status == b"D":
            _tracked_path(repository, path)
        else:
            _git_path(repository, path)
        paths.append(path)

    diff = _diff_for(repository, paths, untracked)
    if not diff:
        raise PublishError("There are no post or project changes to publish.")

    review_id = sha256((head + "\0" + "\0".join(paths) + "\0" + diff).encode()).hexdigest()
    return {
        "ready": True,
        "destination": DESTINATION,
        "preview_url": PREVIEW_URL,
        "paths": paths,
        "diff": diff,
        "review_id": review_id,
        "untracked": sorted(untracked),
    }


def _safe_origin(repository):
    fetch_urls = git(repository, "remote", "get-url", "--all", "origin").decode().splitlines()
    urls = git(repository, "remote", "get-url", "--push", "--all", "origin").decode().splitlines()
    if len(fetch_urls) != 1 or len(urls) != 1 or not urls[0] or fetch_urls != urls:
        raise PublishError("Configure one matching fetch and push URL for the origin remote.")


def publish(repository, review_id):
    with PUBLISH_LOCK:
        review = inspect(repository)
        if review["review_id"] != review_id:
            raise PublishError("The reviewed content changed. Review the updated diff before publishing.")

        _safe_origin(repository)
        git(repository, "add", "--", *review["paths"])
        staged = git(repository, "diff", "--cached", "--name-only", "-z")
        staged_paths = sorted(path.decode("utf-8") for path in staged.split(b"\0") if path)
        if staged_paths != sorted(review["paths"]):
            raise PublishError("The staged content differs from the reviewed changes.")
        staged_diff = git(
            repository,
            "diff",
            "--cached",
            "--no-ext-diff",
            "--no-textconv",
            "--no-color",
            "--no-renames",
        ).decode("utf-8")
        if staged_diff != review["diff"]:
            raise PublishError("The staged content differs from the reviewed diff.")
        status_entries = _status_entries(repository)
        if len(status_entries) != len(review["paths"]):
            raise PublishError("The working tree changed during review. Nothing was published.")
        for entry in status_entries:
            status, path = entry[:2], entry[3:].decode("utf-8")
            if status[0:1] not in (b"A", b"D", b"M") or status[1:2] != b" ":
                raise PublishError("The working tree changed during review. Nothing was published.")
            if path not in review["paths"]:
                raise PublishError("The working tree changed during review. Nothing was published.")

        git(
            repository,
            "commit",
            "--only",
            "-m",
            "Publish reviewed content",
            "--",
            *review["paths"],
            timeout=60,
        )
        committed_paths = git(
            repository,
            "diff-tree",
            "--no-renames",
            "--no-commit-id",
            "--name-only",
            "-r",
            "-z",
            "HEAD",
        )
        committed = sorted(path.decode("utf-8") for path in committed_paths.split(b"\0") if path)
        if committed != sorted(review["paths"]) or any(not _is_content_path(path) for path in committed):
            raise PublishError("The local commit contains changes outside the reviewed content.")
        committed_diff = git(
            repository,
            "diff",
            "--no-ext-diff",
            "--no-textconv",
            "--no-color",
            "--no-renames",
            "HEAD^",
            "HEAD",
        ).decode("utf-8")
        if committed_diff != review["diff"] or _status_entries(repository):
            raise PublishError("The committed content differs from the review or the working tree changed.")

        try:
            subprocess.run(
                [
                    "git",
                    "-c",
                    "push.followTags=false",
                    "-c",
                    "remote.origin.mirror=false",
                    "-c",
                    "push.recurseSubmodules=no",
                    "push",
                    "--porcelain",
                    "--no-follow-tags",
                    "origin",
                    "HEAD:refs/heads/gh-pages",
                ],
                cwd=repository,
                stdin=subprocess.DEVNULL,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                timeout=120,
                check=True,
            )
        except (OSError, subprocess.SubprocessError) as error:
            raise PublishError(
                "The content was committed locally, but the push failed. Review Git state before retrying."
            ) from error
        head = git(repository, "rev-parse", "HEAD").strip()
        git(repository, "update-ref", "refs/remotes/origin/gh-pages", head.decode())
        return {"published": True, "destination": DESTINATION}


PAGE = """<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex">
  <title>Local authoring</title>
  <style>
    body { font: 16px system-ui, sans-serif; margin: 0; color: #242323; }
    header { padding: 1rem 1.5rem; background: #f3ead8; }
    main { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 1rem; padding: 1rem; }
    section { min-width: 0; }
    iframe { display: block; width: 100%; height: 65vh; border: 1px solid #999; background: white; }
    #diff { overflow: auto; max-height: 18rem; padding: 1rem; background: #f6f6f6; }
    #message { white-space: pre-wrap; }
    button { padding: .6rem 1rem; font: inherit; }
    @media (max-width: 760px) { main { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <header>
    <h1>Local authoring</h1>
    <p>Save drafts in Sveltia, review the local preview and exact content diff, then publish deliberately.</p>
    <p id="message" role="status" aria-live="polite">Checking repository changes…</p>
    <label><input id="review-ack" type="checkbox" disabled> I reviewed the local preview and exact proposed diff.</label>
    <button id="publish" type="button" disabled>Publish reviewed content</button>
  </header>
  <main>
    <section aria-labelledby="editor-heading">
      <h2 id="editor-heading">Sveltia editor</h2>
      <iframe title="Sveltia CMS editor" src="/admin/index.html"></iframe>
    </section>
    <section aria-labelledby="preview-heading">
      <h2 id="preview-heading">Local preview</h2>
      <iframe title="Local Jekyll preview" src="http://127.0.0.1:4000/"></iframe>
    </section>
    <section>
      <h2>Exact proposed content diff</h2>
      <pre id="diff">Loading diff…</pre>
    </section>
  </main>
  <script>
    const message = document.querySelector("#message");
    const diff = document.querySelector("#diff");
    const button = document.querySelector("#publish");
    const reviewAck = document.querySelector("#review-ack");
    let reviewId = null;
    let publishReady = false;
    function updatePublishButton() {
      button.disabled = !publishReady || !reviewAck.checked;
    }
    reviewAck.addEventListener("change", updatePublishButton);
    async function refresh() {
      publishReady = false;
      reviewAck.checked = false;
      reviewAck.disabled = true;
      updatePublishButton();
      try {
        const response = await fetch("/publish/status", { cache: "no-store" });
        const review = await response.json();
        reviewId = review.review_id || null;
        diff.textContent = review.diff || "";
        message.textContent = review.ready
          ? `Ready to publish ${review.paths.join(", ")} to ${review.destination}.`
          : review.reason;
        publishReady = review.ready && Boolean(review.diff);
        reviewAck.disabled = !publishReady;
        updatePublishButton();
      } catch {
        message.textContent = "Could not read the local Git state.";
        diff.textContent = "";
        updatePublishButton();
      }
    }
    button.addEventListener("click", async () => {
      if (!reviewId || !window.confirm("Publish exactly the reviewed content to origin/gh-pages?")) return;
      button.disabled = true;
      try {
        const response = await fetch("/publish", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ confirmed: true, review_id: reviewId })
        });
        const result = await response.json();
        message.textContent = response.ok ? "Published to origin/gh-pages." : result.reason;
        await refresh();
      } catch {
        message.textContent = "The publish request failed. Review Git state before retrying.";
      }
    });
    refresh();
  </script>
</body>
</html>
"""


class AuthoringHandler(BaseHTTPRequestHandler):
    repository = None

    def _respond(self, status, body, content_type="application/json; charset=utf-8"):
        payload = body if isinstance(body, bytes) else json.dumps(body).encode()
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(payload)))
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(payload)

    def do_GET(self):
        if self.path == "/":
            return self._respond(200, PAGE.encode(), "text/html; charset=utf-8")
        if self.path in ("/admin/index.html", "/admin/config.yml"):
            path = PROJECT_ROOT / self.path.lstrip("/")
            return self._respond(
                200,
                path.read_bytes(),
                "text/yaml; charset=utf-8" if path.suffix == ".yml" else "text/html; charset=utf-8",
            )
        if self.path == "/publish/status":
            try:
                review = inspect(self.repository)
                return self._respond(200, review)
            except PublishError as error:
                return self._respond(
                    409,
                    {
                        "ready": False,
                        "destination": DESTINATION,
                        "preview_url": PREVIEW_URL,
                        "diff": "",
                        "reason": str(error),
                    },
                )
        return self._respond(404, {"reason": "Not found."})

    def do_POST(self):
        if self.path != "/publish":
            return self._respond(404, {"reason": "Not found."})
        origin = self.headers.get("Origin", "")
        allowed_origins = {
            f"http://127.0.0.1:{self.server.server_port}",
            f"http://localhost:{self.server.server_port}",
        }
        if origin not in allowed_origins:
            return self._respond(403, {"reason": "Publish requests must come from this local authoring page."})
        try:
            length = int(self.headers.get("Content-Length", "0"))
            if length <= 0 or length > 4096:
                raise ValueError
            body = json.loads(self.rfile.read(length))
            if not isinstance(body, dict) or type(body.get("confirmed")) is not bool:
                raise ValueError
        except (ValueError, json.JSONDecodeError):
            return self._respond(400, {"reason": "A valid confirmation is required."})
        if body["confirmed"] is False:
            return self._respond(200, {"published": False, "reason": "Publish declined."})
        review_id = body.get("review_id")
        if not isinstance(review_id, str) or not re.fullmatch(r"[a-f0-9]{64}", review_id):
            return self._respond(400, {"reason": "Review the proposed changes before publishing."})
        try:
            return self._respond(200, publish(self.repository, review_id))
        except PublishError as error:
            return self._respond(409, {"published": False, "reason": str(error)})

    def log_message(self, _format, *args):
        return


def create_server(repository, port):
    handler = type("RepositoryAuthoringHandler", (AuthoringHandler,), {"repository": repository})
    return ThreadingHTTPServer(("127.0.0.1", port), handler)


def main():
    parser = argparse.ArgumentParser(description="Run the local Sveltia authoring companion.")
    parser.add_argument("--port", type=int, default=8765, help="loopback HTTP port (default: 8765)")
    args = parser.parse_args()
    try:
        repository = find_repository()
    except PublishError as error:
        parser.error(str(error))
    server = create_server(repository, args.port)
    print(f"Local authoring companion: http://127.0.0.1:{server.server_port}/", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()

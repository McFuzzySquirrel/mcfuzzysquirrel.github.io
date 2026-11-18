import { getPostHref, getPosts, getProjects, siteHref, truncate } from "../lib/content.js";
import { formatDate } from "../lib/format.js";

export const metadata = {
  title: "Home",
  description: "A workshop for AI experiments, useful tools, creative prototypes, and honest notes on learning by doing."
};

export default function HomePage() {
  const projects = getProjects();
  const posts = getPosts({ includeDrafts: process.env.NODE_ENV !== "production" });
  const [featured, ...otherProjects] = projects;

  return (
    <div className="home">
      <section className="playground-hero home-introduction" id="home-introduction" aria-labelledby="home-title">
        <div>
          <p className="home-kicker">Notes from the workshop · Learning in public</p>
          <h1 id="home-title">McFuzzySquirrel&apos;s Playground</h1>
          <p className="playground-tagline">
            I turn questions into working software: AI experiments, useful tools, and the occasional strange prototype.
          </p>
          <p className="home-intro-note">
            Some builds solve a real problem. Others start with “I wonder if…”. All of them are honest snapshots of learning by doing.
          </p>
          <div className="home-intro-links">
            <a className="home-primary-link" href="/projects/">Explore all projects</a>
            <a href="/blog/">Read the blog</a>
          </div>
        </div>
        <img
          src="/assets/images/squirrel-blacksmith.jpeg"
          alt="Squirrel blacksmith forging in a cozy workshop"
          fetchPriority="high"
        />
      </section>

      {featured && (
        <>
          <section className="home-featured-section" id="featured-project" aria-labelledby="featured-project-title">
            <div className="home-section-heading">
              <div>
                <p className="home-kicker">On the workbench · 01</p>
                <h2 id="featured-project-title">Featured project</h2>
              </div>
            </div>
            <article className="project-card project-featured">
              <div>
                <h3><a href={featured.repositoryUrl}>{featured.title}</a></h3>
                <p>{featured.description}</p>
                {featured.storyUrl && <a className="home-story-link" href={siteHref(featured.storyUrl)}>Read the build story</a>}
              </div>
              <a className="home-project-link" href={featured.repositoryUrl} aria-label={`Explore ${featured.title} on GitHub`}>
                Explore on GitHub <span aria-hidden="true">↗</span>
              </a>
            </article>
          </section>

          <div className="home-secondary-layout">
            <section className="home-project-showcase" id="project-showcase" aria-labelledby="project-showcase-title">
              <div className="home-section-heading">
                <div>
                  <p className="home-kicker">More from the workbench</p>
                  <h2 id="project-showcase-title">Selected projects</h2>
                </div>
                <a href="/projects/">All projects <span aria-hidden="true">↗</span></a>
              </div>
              <div className="project-grid home-project-grid">
                {otherProjects.map((project) => (
                  <article className="project-card home-project-card" key={project.title}>
                    <h3><a href={project.repositoryUrl}>{project.title}</a></h3>
                    <p>{project.description}</p>
                    {project.collaboration && (
                      <p className="project-credit">{project.collaboration} · {project.role}</p>
                    )}
                    <ul className="project-links">
                      {project.demoUrl && <li><a href={project.demoUrl}>Try the demo</a></li>}
                      {project.storyUrl && <li><a href={siteHref(project.storyUrl)}>Build story</a></li>}
                      <li><a href={project.repositoryUrl}>Repository</a></li>
                    </ul>
                  </article>
                ))}
              </div>
            </section>

            <section className="home-recent-writing" id="recent-writing" aria-labelledby="recent-writing-title">
              <div className="home-section-heading">
                <div>
                  <p className="home-kicker">Fresh notes</p>
                  <h2 id="recent-writing-title">Recent build stories</h2>
                </div>
              </div>
              <div className="home-stories">
                {posts.slice(0, 3).map((post) => (
                  <article className="home-story-card" key={post.url}>
                    <time dateTime={post.date.toISOString()}>{formatDate(post.date)}</time>
                    <h3><a href={getPostHref(post)}>{post.draft ? `Draft: ${post.title}` : post.title}</a></h3>
                    <p>{truncate(post.excerptText)}</p>
                  </article>
                ))}
              </div>
              <a className="home-more-stories" href="/blog/">More writing <span aria-hidden="true">↗</span></a>
            </section>
          </div>
        </>
      )}
    </div>
  );
}

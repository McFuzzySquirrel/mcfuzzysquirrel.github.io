import { getProjects } from "../../lib/content.js";

export const metadata = {
  title: "Projects",
  description: "A curated selection of projects built to explore ideas, solve practical problems, and learn by making."
};

export default function ProjectsPage() {
  const projects = getProjects();

  return (
    <>
      <h1>Projects</h1>
      <p className="projects-intro">
        A curated selection of projects built to explore ideas, solve practical problems, and learn by making.
      </p>
      <div className="project-grid">
        {projects.map((project) => (
          <article className="project-card" key={project.title}>
            <h2>{project.title}</h2>
            <p>{project.description}</p>
            {project.collaboration && (
              <p className="project-credit">{project.collaboration} · {project.role}</p>
            )}
            <ul className="project-links">
              <li><a href={project.repositoryUrl}>Repository</a></li>
              {project.demoUrl && <li><a href={project.demoUrl}>Try the demo</a></li>}
              {project.storyUrl && <li><a href={project.storyUrl}>Build story</a></li>}
            </ul>
          </article>
        ))}
      </div>
    </>
  );
}

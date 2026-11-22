import { getCollection } from "astro:content";

export type ProjectView = {
  id: string;
  title: string;
  order: number;
  description: string;
  repositoryUrl: string;
  demoUrl: string | null;
  logo: string | null;
  storyUrl: string | null;
  collaboration: string | null;
  role: string | null;
};

export async function getProjects(): Promise<ProjectView[]> {
  const projects = await getCollection("projects");

  return projects
    .map((project) => ({
      id: project.id,
      title: project.data.title,
      order: project.data.order,
      description: project.data.description,
      repositoryUrl: project.data.repository_url,
      demoUrl: project.data.demo_url ?? null,
      logo: project.data.logo ?? null,
      storyUrl: project.data.story_url ?? null,
      collaboration: project.data.collaboration ?? null,
      role: project.data.role ?? null
    }))
    .sort((left, right) => left.order - right.order || left.title.localeCompare(right.title));
}

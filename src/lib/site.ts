export const SITE = {
  title: "McFuzzySquirrel's Playground",
  shortTitle: "McFuzzySquirrel",
  description:
    "AI experiments, useful tools, strange prototypes, and notes from building them in public.",
  author: "Doug McCusker",
  intro:
    "I turn questions into working software: AI experiments, useful tools, and the occasional strange prototype.",
  url: "https://mcfuzzysquirrel.github.io",
  github: "https://github.com/McFuzzySquirrel",
  linkedin: "https://www.linkedin.com/in/doug-mccusker-05054a21/",
  feed: "/feed.xml"
} as const;

export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Blog", href: "/blog/" },
  { label: "Projects", href: "/projects/" },
  { label: "About", href: "/about/" }
] as const;

export const metadata = {
  title: "About",
  description: "About McFuzzySquirrel's Playground and learning by building in public."
};

export default function AboutPage() {
  return (
    <article className="page">
      <h1>About</h1>
      <p>
        McFuzzySquirrel&apos;s Playground is my place to build in public: a friendly workshop for AI experiments,
        useful tools, creative prototypes, and the lessons that come with making them.
      </p>
      <p>
        I&apos;m Doug McCusker. I learn by turning questions into working software, then sharing the process—not just the
        polished result. Here you&apos;ll find what worked, what didn&apos;t, and what I learned along the way.
      </p>
      <p>
        Most of my projects explore AI agents, practical developer tools, local-first workflows, and creative technology.
        Some are useful answers to real problems; others are experiments pursued out of curiosity. All are part of
        learning by doing.
      </p>
      <h2>Explore</h2>
      <ul>
        <li>Browse <a href="/projects/">Projects</a> for a curated look at what I&apos;m building.</li>
        <li>Read the <a href="/blog/">Blog</a> for the stories, decisions, and discoveries behind the work.</li>
      </ul>
      <h2>Find me elsewhere</h2>
      <ul>
        <li>GitHub: <a href="https://github.com/McFuzzySquirrel">McFuzzySquirrel</a></li>
        <li>LinkedIn: <a href="https://www.linkedin.com/in/doug-mccusker-05054a21/">Doug McCusker</a></li>
      </ul>
      <p>If a project sparks a question or gives you an idea to try, I&apos;d be glad to hear about it.</p>
    </article>
  );
}

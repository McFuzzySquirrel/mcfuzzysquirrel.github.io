---
layout: home
---

<section class="playground-hero home-introduction" id="home-introduction" aria-labelledby="home-title">
  <div>
    <p class="home-kicker">Notes from the workshop · Learning in public</p>
    <h1 id="home-title">McFuzzySquirrel's Playground</h1>
    <p class="playground-tagline">I turn questions into working software: AI experiments, useful tools, and the occasional strange prototype.</p>
    <p class="home-intro-note">Some builds solve a real problem. Others start with “I wonder if…”. All of them are honest snapshots of learning by doing.</p>
    <div class="home-intro-links">
      <a class="home-primary-link" href="{{ '/projects/' | relative_url }}">Explore all projects</a>
      <a href="{{ '/blog/' | relative_url }}">Read the blog</a>
    </div>
  </div>
  <img src="{{ '/assets/images/squirrel-blacksmith.jpeg' | relative_url }}" alt="Squirrel blacksmith forging in a cozy workshop" fetchpriority="high" />
</section>

{% assign projects = site.projects | sort: "order" %}
{% assign featured = projects | first %}
{% if featured %}
<section class="home-featured-section" id="featured-project" aria-labelledby="featured-project-title">
  <div class="home-section-heading">
    <div>
      <p class="home-kicker">On the workbench · 01</p>
      <h2 id="featured-project-title">Featured project</h2>
    </div>
  </div>
  <article class="project-card project-featured">
    <div>
      <h3><a href="{{ featured.repository_url }}">{{ featured.title | escape }}</a></h3>
      <p>{{ featured.description | escape }}</p>
      {% if featured.story_url %}
      <a class="home-story-link" href="{{ featured.story_url | relative_url }}">Read the build story</a>
      {% endif %}
    </div>
    <a class="home-project-link" href="{{ featured.repository_url }}" aria-label="Explore {{ featured.title | escape }} on GitHub">Explore on GitHub <span aria-hidden="true">↗</span></a>
  </article>
</section>

<div class="home-secondary-layout">
  <section class="home-project-showcase" id="project-showcase" aria-labelledby="project-showcase-title">
    <div class="home-section-heading">
      <div>
        <p class="home-kicker">More from the workbench</p>
        <h2 id="project-showcase-title">Selected projects</h2>
      </div>
      <a href="{{ '/projects/' | relative_url }}">All projects <span aria-hidden="true">↗</span></a>
    </div>
    <div class="project-grid home-project-grid">
      {% for project in projects offset:1 %}
      <article class="project-card home-project-card">
        <h3><a href="{{ project.repository_url }}">{{ project.title | escape }}</a></h3>
        <p>{{ project.description | escape }}</p>
        {% if project.collaboration %}
        <p class="project-credit">{{ project.collaboration | escape }} · {{ project.role | escape }}</p>
        {% endif %}
        <ul class="project-links">
          {% if project.demo_url %}
          <li><a href="{{ project.demo_url }}">Try the demo</a></li>
          {% endif %}
          {% if project.story_url %}
          <li><a href="{{ project.story_url | relative_url }}">Build story</a></li>
          {% endif %}
          <li><a href="{{ project.repository_url }}">Repository</a></li>
        </ul>
      </article>
      {% endfor %}
    </div>
  </section>

  <section class="home-recent-writing" id="recent-writing" aria-labelledby="recent-writing-title">
    <div class="home-section-heading">
      <div>
        <p class="home-kicker">Fresh notes</p>
        <h2 id="recent-writing-title">Recent build stories</h2>
      </div>
    </div>
    <div class="home-stories">
      {% for post in site.posts limit:3 %}
      <article class="home-story-card">
        <time datetime="{{ post.date | date_to_xmlschema }}">{{ post.date | date: "%b %-d, %Y" }}</time>
        <h3><a href="{{ post.url | relative_url }}">{{ post.title | escape }}</a></h3>
        <p>{{ post.excerpt | strip_html | truncate: 150 }}</p>
      </article>
      {% endfor %}
    </div>
    <a class="home-more-stories" href="{{ '/blog/' | relative_url }}">More writing <span aria-hidden="true">↗</span></a>
  </section>
</div>
{% endif %}

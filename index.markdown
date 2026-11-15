---
layout: prototype-home
title: Home
---

<!-- Three radically different home-page hierarchies for owner feedback; switch with ?variant=A, B, or C. -->
<section data-prototype-variant="A" aria-labelledby="proto-a-title">
  <header class="proto-a-hero">
    <div>
      <p class="proto-kicker">Learning in public · Building by doing</p>
      <h1 id="proto-a-title">McFuzzySquirrel's Playground</h1>
      <p class="proto-intro">I turn questions into working software: AI experiments, useful tools, and the occasional strange prototype.</p>
    </div>
    <img src="/assets/images/squirrel-blacksmith.jpeg" alt="Squirrel blacksmith forging in a cozy workshop">
  </header>

  <div class="proto-section-heading">
    <h2>Featured project</h2>
    <span>01 / 08</span>
  </div>
  {% assign featured = site.data.prototype_projects.first %}
  <article class="proto-card proto-a-feature">
    <div>
      <p class="proto-eyebrow">From question to agent team</p>
      <h3>{{ featured.name | escape }}</h3>
      <p class="proto-project-description">{{ featured.description | escape }}</p>
      <a class="proto-story-link" href="{{ featured.url }}">Explore the project ↗</a>
      {% if featured.story %}
      <span aria-hidden="true"> · </span>
      <a class="proto-story-link" href="{{ featured.story | relative_url }}">Read the story</a>
      {% endif %}
    </div>
    <span class="proto-feature-mark" aria-hidden="true">↗</span>
  </article>
  <div class="proto-a-grid">
    {% for project in site.data.prototype_projects offset:1 %}
    <article class="proto-card">
      <h3 class="proto-project-title"><a href="{{ project.url }}">{{ project.name | escape }}</a></h3>
      {% if project.description %}<p class="proto-project-description">{{ project.description | escape }}</p>{% endif %}
      {% if project.credit %}<span class="proto-credit">{{ project.credit | escape }}</span>{% endif %}
      {% if project.story %}<a class="proto-story-link" href="{{ project.story | relative_url }}">Related story ↗</a>{% endif %}
    </article>
    {% endfor %}
  </div>

  <div class="proto-section-heading">
    <h2>Recently written</h2>
    <span>New notes · <a href="{{ '/feed.xml' | relative_url }}">RSS ↗</a></span>
  </div>
  <div class="proto-recent">
    {% for post in site.posts limit:3 %}
    <article class="proto-card proto-recent-item">
      <time datetime="{{ post.date | date_to_xmlschema }}">{{ post.date | date: "%b %-d, %Y" }}</time>
      <h3><a href="{{ post.url | relative_url }}">{{ post.title | escape }}</a></h3>
      <p>{{ post.excerpt | strip_html | truncate: 115 }}</p>
    </article>
    {% endfor %}
  </div>
</section>

<section data-prototype-variant="B" aria-labelledby="proto-b-title">
  <header class="proto-b-masthead">
    <p class="proto-kicker">Notes from the workshop · Est. by curiosity</p>
    <h1 id="proto-b-title">A playground for things worth figuring out.</h1>
    <p class="proto-intro">Some builds solve a real problem. Others start with “I wonder if…”. Here are the projects, experiments, and notes that came from following those questions.</p>
  </header>

  <div class="proto-b-columns">
    <section aria-labelledby="proto-b-projects-title">
      <div class="proto-section-heading">
        <h2 id="proto-b-projects-title">Selected projects</h2>
        <span>08 builds</span>
      </div>
      <div class="proto-b-projects">
        {% for project in site.data.prototype_projects %}
        <article class="proto-b-row">
          <span class="proto-b-number">{{ forloop.index | prepend: "0" }}</span>
          <div>
            <h3 class="proto-project-title"><a href="{{ project.url }}">{{ project.name | escape }}</a></h3>
            {% if project.description %}<p class="proto-project-description">{{ project.description | escape }}</p>{% endif %}
            {% if project.credit %}<span class="proto-credit">{{ project.credit | escape }}</span>{% endif %}
            {% if project.story %}<a class="proto-story-link" href="{{ project.story | relative_url }}">Related note ↗</a>{% endif %}
          </div>
        </article>
        {% endfor %}
      </div>
    </section>

    <section class="proto-b-reading" id="recent-writing" aria-labelledby="proto-b-writing-title">
      <p class="proto-eyebrow">The latest from the blog</p>
      <h2 id="proto-b-writing-title">Thinking out loud, building in public.</h2>
      {% for post in site.posts limit:4 %}
      <article class="proto-post-row">
        <time datetime="{{ post.date | date_to_xmlschema }}">{{ post.date | date: "%b %-d, %Y" }}</time>
        <h3><a href="{{ post.url | relative_url }}">{{ post.title | escape }}</a></h3>
        <p class="proto-project-description">{{ post.excerpt | strip_html | truncate: 150 }}</p>
      </article>
      {% endfor %}
      <blockquote class="proto-b-note">A place for practical tools, agent experiments, and honest lessons from learning by doing.</blockquote>
    </section>
  </div>
</section>

<section data-prototype-variant="C" aria-labelledby="proto-c-title">
  <header class="proto-c-heading">
    <div>
      <p class="proto-kicker">The workshop is open</p>
      <h1 id="proto-c-title">Make a thing.<br>See what happens.</h1>
    </div>
    <aside class="proto-card proto-c-intro-card">
      <p>Hi, I'm McFuzzySquirrel. This is my corner for AI experiments, practical tools, and ideas that refused to stay ideas.</p>
    </aside>
  </header>

  <div class="proto-section-heading">
    <h2>On the workbench</h2>
    <span>Projects, not promises</span>
  </div>
  <div class="proto-c-board">
    {% for project in site.data.prototype_projects %}
    <article class="proto-card proto-c-card">
      <span class="proto-c-number">BUILD {{ forloop.index | prepend: "0" }}</span>
      <h3 class="proto-project-title"><a href="{{ project.url }}">{{ project.name | escape }}</a></h3>
      {% if project.description %}<p class="proto-project-description">{{ project.description | escape }}</p>{% endif %}
      {% if project.credit %}<span class="proto-credit">{{ project.credit | escape }}</span>{% endif %}
      {% if project.story %}<a class="proto-story-link" href="{{ project.story | relative_url }}">Story ↗</a>{% endif %}
    </article>
    {% endfor %}
  </div>

  <div class="proto-c-writing">
    <h2>Fresh notes · <a href="{{ '/feed.xml' | relative_url }}">RSS</a></h2>
    {% for post in site.posts limit:3 %}
    <a href="{{ post.url | relative_url }}">{{ post.title | escape }} <span aria-hidden="true">↗</span></a>
    {% endfor %}
  </div>
</section>

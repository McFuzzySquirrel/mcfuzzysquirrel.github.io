---
layout: page
title: Projects
permalink: /projects/
---

<p class="projects-intro">A curated selection of projects built to explore ideas, solve practical problems, and learn by making.</p>

<div class="project-grid">
  {% assign projects = site.projects | sort: "order" %}
  {% for project in projects %}
  <article class="project-card">
    <h2>{{ project.title | escape }}</h2>
    <p>{{ project.description | escape }}</p>
    {% if project.collaboration %}
    <p class="project-credit">{{ project.collaboration | escape }} · {{ project.role | escape }}</p>
    {% endif %}
    <ul class="project-links">
      <li><a href="{{ project.repository_url }}">Repository</a></li>
      {% if project.demo_url %}
      <li><a href="{{ project.demo_url }}">Try the demo</a></li>
      {% endif %}
      {% if project.story_url %}
      <li><a href="{{ project.story_url | relative_url }}">Build story</a></li>
      {% endif %}
    </ul>
  </article>
  {% endfor %}
</div>

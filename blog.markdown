---
layout: page
title: Blog
permalink: /blog/
---

<p class="blog-intro">Build notes, experiments, and lessons learned along the way.</p>

<div class="blog-archive">
  {%- assign all_tags = "" | split: "" -%}
  {%- for post in site.posts -%}
    {%- for tag in post.tags -%}
      {%- unless all_tags contains tag -%}
        {%- assign all_tags = all_tags | push: tag -%}
      {%- endunless -%}
    {%- endfor -%}
  {%- endfor -%}
  {%- assign all_tags = all_tags | sort -%}

  <div class="post-browser" aria-label="Filter blog posts">
    <div class="post-browser-filters" role="group" aria-label="Filter posts by tag">
      <button class="post-filter-chip active" type="button" data-filter="all" aria-pressed="true">All</button>
      {%- for tag in all_tags -%}
      <button class="post-filter-chip" type="button" data-filter="{{ tag | escape }}" aria-pressed="false">{{ tag | escape }}</button>
      {%- endfor -%}
    </div>
  </div>

  <ul class="post-list" aria-label="Posts, newest first">
    {%- for post in site.posts -%}
    <li data-tags="{{ post.tags | join: ',' | escape }}">
      {%- assign date_format = site.minima.date_format | default: "%b %-d, %Y" -%}
      <span class="post-meta">{{ post.date | date: date_format }} · {%- include reading-time.html content=post.content -%}</span>
      <h2>
        <a class="post-link" href="{{ post.url | relative_url }}">{{ post.title | escape }}</a>
      </h2>
      {%- if post.tags.size > 0 -%}
      <div class="post-card-tags" aria-label="Tags">
        {%- for tag in post.tags -%}
        <span class="post-card-tag">{{ tag | escape }}</span>
        {%- endfor -%}
      </div>
      {%- endif -%}
      {%- if site.show_excerpts -%}
      {{ post.excerpt }}
      {%- endif -%}
    </li>
    {%- endfor -%}
  </ul>

  <p class="rss-subscribe">Follow new posts with the <a href="{{ "/feed.xml" | relative_url }}">RSS feed</a>.</p>
</div>

<script>
(function() {
  var archive = document.querySelector('.blog-archive');
  if (!archive) return;

  var chips = archive.querySelectorAll('.post-filter-chip');
  var posts = archive.querySelectorAll('.post-list > li');

  chips.forEach(function(chip) {
    chip.addEventListener('click', function() {
      var filter = chip.getAttribute('data-filter');
      chips.forEach(function(candidate) {
        var selected = candidate === chip;
        candidate.classList.toggle('active', selected);
        candidate.setAttribute('aria-pressed', String(selected));
      });

      posts.forEach(function(post) {
        var tags = (post.getAttribute('data-tags') || '').split(',');
        post.hidden = filter !== 'all' && tags.indexOf(filter) === -1;
      });
    });
  });
})();
</script>

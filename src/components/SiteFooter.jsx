export default function SiteFooter() {
  return (
    <footer className="site-footer h-card">
      <data className="u-url" href="/" />
      <div className="wrapper">
        <h2 className="footer-heading">McFuzzySquirrel&apos;s Playground</h2>
        <div className="footer-col-wrapper">
          <div className="footer-col footer-col-1">
            <ul className="contact-list">
              <li className="p-name">McFuzzySquirrel&apos;s Playground</li>
            </ul>
          </div>
          <div className="footer-col footer-col-2">
            <ul className="social-media-list">
              <li><a href="https://github.com/McFuzzySquirrel">GitHub · McFuzzySquirrel</a></li>
            </ul>
          </div>
          <div className="footer-col footer-col-3">
            <p>AI experiments, useful tools, strange prototypes, and honest notes from learning by doing.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

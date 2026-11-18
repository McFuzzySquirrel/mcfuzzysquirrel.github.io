import BackToTop from "../components/BackToTop.jsx";
import SiteFooter from "../components/SiteFooter.jsx";
import SiteHeader from "../components/SiteHeader.jsx";

export const metadata = {
  metadataBase: new URL("https://mcfuzzysquirrel.github.io"),
  title: {
    default: "McFuzzySquirrel's Playground",
    template: "%s | McFuzzySquirrel's Playground"
  },
  description: "AI experiments, useful tools, strange prototypes, and honest notes from learning by doing."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="/assets/main.css" />
      </head>
      <body id="top">
        <SiteHeader />
        <main className="page-content" aria-label="Content">
          <div className="wrapper">{children}</div>
        </main>
        <SiteFooter />
        <BackToTop />
      </body>
    </html>
  );
}

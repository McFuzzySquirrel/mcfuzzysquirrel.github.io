import { copyFile, mkdir, rm } from "node:fs/promises";
import { resolve } from "node:path";

const outputDirectory = resolve("out");

for (const route of ["about", "blog", "projects"]) {
  const flatPage = resolve(outputDirectory, `${route}.html`);
  const directoryPage = resolve(outputDirectory, route, "index.html");

  await mkdir(resolve(outputDirectory, route), { recursive: true });
  await copyFile(flatPage, directoryPage);
  await rm(flatPage);
}

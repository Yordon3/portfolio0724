import http from "node:http";
import { createReadStream, statSync, existsSync, readdirSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));
const port = Number(process.env.PORT || 5198);

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".mp4": "video/mp4",
  ".otf": "font/otf",
};

const projectDetails = {
  yangbo: { title: "\u592e\u535a\u6570\u5b57\u827a\u672f\u9986\u9879\u76ee", folder: "yangbo-detail" },
  pet: { title: "\u72d7\u7cae\u54c1\u724c\u5305\u88c5", folder: "pet-detail" },
  poster: { title: "\u5de5\u4f5c\u6d77\u62a5\u5408\u96c6", folder: "poster-detail" },
  gdc: { title: "GDC\u8bbe\u8ba1\u56e2\u961fLOGO", folder: "GDC-detail" },
  qingmeijiu: { title: "\u7eaf\u53d1\u9175\u9752\u6885\u9152\u5305\u88c5", folder: "qingmeijiu-detail" },
  yinhe: { title: "\u94f6\u6cb3\u8bc1\u5238IP\u89c6\u89c9", folder: "yinhe ip-detail" },
  chegai: { title: "\u5954\u817e\u5c0f\u9a6c\u6f6e\u6d41\u8f66\u6539", folder: "chegai -detail" },
  "yinhe-city": {
    title: "\u94f6\u6cb3\u8bc1\u5238IP\u57ce\u5e02\u7cfb\u5217",
    folder: "yinhe ip2-detail",
    layout: "drag-gallery",
  },
  aigc: { title: "AIGC\u5de5\u4f5c\u9879\u76ee", folder: "aigc-detail" },
};

const imageExtensions = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif"]);
const naturalSorter = new Intl.Collator("zh-CN", {
  numeric: true,
  sensitivity: "base",
});

function resolvePath(urlPath) {
  const cleanPath = decodeURIComponent(urlPath.split("?")[0]);
  const target = cleanPath === "/" ? "/index.html" : cleanPath;
  const resolved = normalize(join(root, target));
  return resolved.startsWith(root) ? resolved : null;
}

http.createServer((request, response) => {
  const requestUrl = new URL(request.url || "/", `http://${request.headers.host || "127.0.0.1"}`);

  if (requestUrl.pathname === "/api/project-images") {
    const projectKey = requestUrl.searchParams.get("project") || "pet";
    const project = projectDetails[projectKey] || projectDetails.pet;
    const folderPath = normalize(join(root, "assets", project.folder));

    if (!folderPath.startsWith(normalize(join(root, "assets"))) || !existsSync(folderPath)) {
      response.writeHead(404, { "Content-Type": "application/json; charset=utf-8" });
      response.end(JSON.stringify({ error: "Project folder not found" }));
      return;
    }

    const files = readdirSync(folderPath, { withFileTypes: true })
      .filter((item) => item.isFile() && imageExtensions.has(extname(item.name).toLowerCase()))
      .map((item) => item.name)
      .sort((a, b) => naturalSorter.compare(a, b));

    response.writeHead(200, {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store, max-age=0",
    });
    response.end(JSON.stringify({ ...project, files }));
    return;
  }

  const filePath = resolvePath(request.url || "/");
  if (!filePath || !existsSync(filePath)) {
    response.writeHead(404);
    response.end("Not found");
    return;
  }

  const stat = statSync(filePath);
  const type = mimeTypes[extname(filePath).toLowerCase()] || "application/octet-stream";
  const range = request.headers.range;

  if (range) {
    const match = /bytes=(\d*)-(\d*)/.exec(range);
    const start = match?.[1] ? Number(match[1]) : 0;
    const end = match?.[2] ? Number(match[2]) : stat.size - 1;
    response.writeHead(206, {
      "Accept-Ranges": "bytes",
      "Content-Range": `bytes ${start}-${end}/${stat.size}`,
      "Content-Length": end - start + 1,
      "Content-Type": type,
    });
    createReadStream(filePath, { start, end }).pipe(response);
    return;
  }

  response.writeHead(200, {
    "Accept-Ranges": "bytes",
    "Content-Length": stat.size,
    "Content-Type": type,
  });
  createReadStream(filePath).pipe(response);
}).listen(port, "127.0.0.1", () => {
  console.log(`Preview server running at http://127.0.0.1:${port}/`);
});

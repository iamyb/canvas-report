import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { viteSingleFile } from "vite-plugin-singlefile";

function canvasErrorReporter() {
  return {
    name: "canvas-report-error",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === "/__canvas/report-error" && req.method === "POST") {
          let body = "";
          req.on("data", (c) => (body += c));
          req.on("end", () => {
            try {
              const { reportId, at, message, stack, file, line } = JSON.parse(body || "{}");
              console.error(
                `\n[canvas-report] error in report "${reportId}" (${at})\n  ${message}\n  ${file ? `${file}:${line}\n` : ""}${stack || ""}\n`
              );
            } catch {
              console.error(`\n[canvas-report] report error: ${body}\n`);
            }
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ ok: true }));
          });
          return;
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), canvasErrorReporter(), viteSingleFile()],
  server: { port: Number(process.env.PORT) || 5199, host: true },
  build: {
    // no code splitting needed when exporting a single-file HTML
    rollupOptions: { output: { inlineDynamicImports: true } },
    // do not empty dist: it also holds exported <report-id>.html files;
    // viteSingleFile only produces index.html, so no stale build files remain
    emptyOutDir: false,
  },
});

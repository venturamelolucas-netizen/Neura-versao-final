import express from "express";
import { createServer as createViteServer } from "vite";
import { createProxyMiddleware } from "http-proxy-middleware";
import { spawn, ChildProcess } from "child_process";
import path from "path";
import fs from "fs";

const PORT = 3000;
const PYTHON_PORT = 8001;
const isProduction = process.env.NODE_ENV === "production";

let pythonProcess: ChildProcess | null = null;

function startPythonBackend() {
  console.log("[Neuro App] Starting Python FastAPI backend on port " + PYTHON_PORT + "...");
  pythonProcess = spawn(
    "python3",
    ["-m", "uvicorn", "api.main:app", "--port", String(PYTHON_PORT), "--host", "127.0.0.1"],
    {
      cwd: process.cwd(),
      env: {
        ...process.env,
        PYTHONPATH: process.cwd(),
        PATH: `${process.env.PATH}:/root/.local/bin`
      },
      stdio: "inherit"
    }
  );

  pythonProcess.on("error", (err) => {
    console.error("[Neuro App] Failed to start Python backend:", err);
  });

  pythonProcess.on("exit", (code, signal) => {
    console.log(`[Neuro App] Python backend exited with code ${code} and signal ${signal}`);
  });
}

async function startServer() {
  startPythonBackend();

  const app = express();

  // Proxy /api requests to FastAPI backend
  app.use(
    "/api",
    createProxyMiddleware({
      target: `http://127.0.0.1:${PYTHON_PORT}`,
      changeOrigin: true,
      ws: true
    })
  );

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Neuro App] Server running at http://localhost:${PORT}`);
  });

  const cleanup = () => {
    console.log("[Neuro App] Shutting down...");
    if (pythonProcess) {
      pythonProcess.kill("SIGTERM");
    }
    server.close(() => {
      process.exit(0);
    });
  };

  process.on("SIGINT", cleanup);
  process.on("SIGTERM", cleanup);
}

startServer().catch((err) => {
  console.error("[Neuro App] Server startup failed:", err);
  if (pythonProcess) {
    pythonProcess.kill();
  }
  process.exit(1);
});

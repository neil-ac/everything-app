import express, { type Express } from "express";
import { widgetsDevServer } from "skybridge/server";
import type { ViteDevServer } from "vite";
import { mcp } from "./middleware.js";
import server from "./server.js";
import { fileURLToPath } from "url";
import path from "path";
import cors from "cors";
import readline from "readline";

async function promptUser(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function startServer() {
  try {
    const userInput = await promptUser("Enter your name to start the server: ");
    console.log(`Hello, ${userInput}! Starting server...`);

    const app = express() as Express & { vite: ViteDevServer };

    app.use(express.json());

    app.use(mcp(server));

    const env = process.env.NODE_ENV || "development";

    if (env !== "production") {
      const { devtoolsStaticServer } = await import("@skybridge/devtools");
      app.use(await devtoolsStaticServer());
      app.use(await widgetsDevServer());
    }

    if (env === "production") {
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);

      app.use("/assets", cors());
      app.use("/assets", express.static(path.join(__dirname, "assets")));
    }

    const serverInstance = app.listen(3000, () => {
      console.log("Server is running on http://localhost:3000");
    });

    serverInstance.on("error", (error) => {
      console.error("Failed to start server:", error);
      process.exit(1);
    });

    process.on("SIGINT", () => {
      console.log("\nShutting down server...");
      serverInstance.close(() => {
        console.log("Server shutdown complete");
        process.exit(0);
      });
    });
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
}

startServer();

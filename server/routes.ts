import type { Express } from "express";
import { createServer, type Server } from "http";
import fs from "fs";
import path from "path";

const CONTENT_PATH = path.resolve(
  import.meta.dirname,
  "..",
  "public",
  "data",
  "content.json",
);

const SITE_PATH = path.resolve(
  import.meta.dirname,
  "..",
  "public",
  "data",
  "site.json",
);

export async function registerRoutes(
  httpServer: Server,
  app: Express,
): Promise<Server> {
  app.get("/api/content", (_req, res) => {
    try {
      const data = fs.readFileSync(CONTENT_PATH, "utf-8");
      res.json(JSON.parse(data));
    } catch (err) {
      res.status(500).json({ message: "Failed to read content" });
    }
  });

  app.put("/api/content", (req, res) => {
    try {
      const content = req.body;
      if (!content || !Array.isArray(content.topics)) {
        return res.status(400).json({ message: "Invalid content format" });
      }
      fs.writeFileSync(CONTENT_PATH, JSON.stringify(content, null, 2), "utf-8");
      res.json({ message: "Content saved successfully" });
    } catch (err) {
      res.status(500).json({ message: "Failed to save content" });
    }
  });

  app.get("/api/site", (_req, res) => {
    try {
      const data = fs.readFileSync(SITE_PATH, "utf-8");
      res.json(JSON.parse(data));
    } catch (err) {
      res.status(500).json({ message: "Failed to read site config" });
    }
  });

  app.put("/api/site", (req, res) => {
    try {
      const config = req.body;
      fs.writeFileSync(SITE_PATH, JSON.stringify(config, null, 2), "utf-8");
      res.json({ message: "Site config saved successfully" });
    } catch (err) {
      res.status(500).json({ message: "Failed to save site config" });
    }
  });

  return httpServer;
}

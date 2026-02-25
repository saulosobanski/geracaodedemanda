import type { Express, Request, Response, NextFunction } from "express";
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

function requireAuth(req: Request, res: Response, next: NextFunction) {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    return res.status(500).json({ message: "Server authentication not configured" });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Autenticacao necessaria" });
  }

  const token = authHeader.slice(7);
  if (token !== secret) {
    return res.status(401).json({ message: "Senha incorreta" });
  }

  next();
}

export async function registerRoutes(
  httpServer: Server,
  app: Express,
): Promise<Server> {
  app.post("/api/auth/login", (req, res) => {
    const secret = process.env.SESSION_SECRET;
    if (!secret) {
      return res.status(500).json({ message: "Server authentication not configured" });
    }

    const { password } = req.body;
    if (!password || password !== secret) {
      return res.status(401).json({ message: "Senha incorreta" });
    }

    res.json({ message: "Autenticado com sucesso" });
  });

  app.get("/api/content", (_req, res) => {
    try {
      const data = fs.readFileSync(CONTENT_PATH, "utf-8");
      res.json(JSON.parse(data));
    } catch (err) {
      res.status(500).json({ message: "Failed to read content" });
    }
  });

  app.put("/api/content", requireAuth, (req, res) => {
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

  app.put("/api/site", requireAuth, (req, res) => {
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

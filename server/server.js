import express from "express";
import cors from "cors";
import crypto from "crypto";
import fs from "fs";
import path from "path";

const app = express();

app.use(cors());
app.use(express.json());

// =========================================================
// MODELS
// =========================================================

const MODELS = {
  fast: "qwen2.5:1.5b",
  deep: "llama3.2:latest",
};

// =========================================================
// SHARE STORAGE
// =========================================================

const shareDirectory = path.join(
  process.cwd(),
  "shared-chats"
);

if (!fs.existsSync(shareDirectory)) {
  fs.mkdirSync(shareDirectory, {
    recursive: true,
  });
}

// =========================================================
// AI CHAT
// =========================================================

app.post("/api/chat", async (req, res) => {
  try {
    const { message, model } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        error: "Message is required.",
      });
    }

    const selectedModel =
      MODELS[model] || MODELS.deep;

    console.log("Mode:", model);
    console.log("Using model:", selectedModel);

    const ollamaResponse = await fetch(
      "http://localhost:11434/api/chat",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          model: selectedModel,

          messages: [
            {
              role: "user",
              content: message,
            },
          ],

          stream: true,

          keep_alive: "10m",

          options: {
            num_predict:
              selectedModel === MODELS.fast
                ? 256
                : 2048,
          },
        }),
      }
    );

    if (!ollamaResponse.ok) {
      const errorText =
        await ollamaResponse.text();

      console.error(
        "Ollama Error:",
        errorText
      );

      return res.status(500).json({
        error:
          errorText ||
          "Ollama request failed.",
      });
    }

    if (!ollamaResponse.body) {
      return res.status(500).json({
        error:
          "No response stream from Ollama.",
      });
    }

    res.setHeader(
      "Content-Type",
      "application/x-ndjson"
    );

    res.setHeader(
      "Cache-Control",
      "no-cache"
    );

    res.setHeader(
      "Connection",
      "keep-alive"
    );

    const reader =
      ollamaResponse.body.getReader();

    const decoder =
      new TextDecoder();

    while (true) {
      const {
        value,
        done,
      } = await reader.read();

      if (done) {
        break;
      }

      const chunk =
        decoder.decode(value, {
          stream: true,
        });

      res.write(chunk);
    }

    const finalChunk =
      decoder.decode();

    if (finalChunk) {
      res.write(finalChunk);
    }

    res.end();

  } catch (error) {
    console.error(
      "Server Error:",
      error
    );

    if (!res.headersSent) {
      res.status(500).json({
        error:
          "Unable to connect to Ollama. Make sure Ollama is running.",
      });
    } else if (!res.writableEnded) {
      res.end();
    }
  }
});

// =========================================================
// CREATE SHARE LINK
// =========================================================

app.post("/api/share", (req, res) => {
  try {
    const {
      title,
      messages,
    } = req.body;

    // Check messages
    if (
      !messages ||
      !Array.isArray(messages)
    ) {
      return res.status(400).json({
        error:
          "Invalid conversation data.",
      });
    }

    // Check empty conversation
    if (messages.length === 0) {
      return res.status(400).json({
        error:
          "There is no conversation to share.",
      });
    }

    // Generate unique ID
    const id =
      crypto.randomUUID();

    // Create share data
    const shareData = {
      id,
      title:
        title ||
        "DevForge Conversation",
      messages,
      createdAt:
        new Date().toISOString(),
    };

    // Create file path
    const filePath =
      path.join(
        shareDirectory,
        `${id}.json`
      );

    // Save conversation
    fs.writeFileSync(
      filePath,
      JSON.stringify(
        shareData,
        null,
        2
      ),
      "utf8"
    );

    console.log(
      `✅ Share created: ${id}`
    );

    // Return ID to frontend
    return res.status(201).json({
      id,
    });

  } catch (error) {
    console.error(
      "Create share error:",
      error
    );

    return res.status(500).json({
      error:
        "Unable to create share link.",
    });
  }
});

// =========================================================
// GET SHARED CONVERSATION
// =========================================================

app.get(
  "/api/share/:id",
  (req, res) => {
    try {
      const {
        id,
      } = req.params;

      // Prevent path traversal
      if (
        !/^[a-zA-Z0-9-]+$/.test(id)
      ) {
        return res.status(400).json({
          error:
            "Invalid share ID.",
        });
      }

      // Find saved JSON file
      const filePath =
        path.join(
          shareDirectory,
          `${id}.json`
        );

      // Check if share exists
      if (
        !fs.existsSync(filePath)
      ) {
        return res.status(404).json({
          error:
            "Shared conversation not found.",
        });
      }

      // Read share data
      const shareData =
        JSON.parse(
          fs.readFileSync(
            filePath,
            "utf8"
          )
        );

      // Return conversation
      return res.json(
        shareData
      );

    } catch (error) {
      console.error(
        "Get share error:",
        error
      );

      return res.status(500).json({
        error:
          "Unable to load shared conversation.",
      });
    }
  }
);

// =========================================================
// SERVER
// =========================================================

const PORT = 5000;

app.listen(
  PORT,
  () => {
    console.log(
      `✅ DevForge AI server running on http://localhost:${PORT}`
    );

    console.log(
      `📁 Shared chats stored in: ${shareDirectory}`
    );
  }
);
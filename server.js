require("dotenv").config();

const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
app.use(cors());
app.use(express.json());

const APIFY_TOKEN = process.env.APIFY_TOKEN;

// Test route
app.get("/", (req, res) => {
  res.send("MCP Server Running");
});


// ✅ MCP: Tool list
app.get("/tools", (req, res) => {
  res.json({
    tools: [
      {
        name: "scrape",
        description: "Scrape a webpage using Apify",
        input_schema: {
          type: "object",
          properties: {
            url: { type: "string" }
          },
          required: ["url"]
        }
      }
    ]
  });
});


// ✅ MCP: Tool execution
app.post("/invoke", async (req, res) => {
  try {
    const { tool, input } = req.body;

    if (tool === "scrape") {
      if (!input.url) {
        return res.status(400).json({ error: "URL required" });
      }

      const response = await fetch(
        `https://api.apify.com/v2/acts/apify~web-scraper/run-sync?token=${APIFY_TOKEN}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            startUrls: [{ url: input.url }]
          })
        }
      );

      const data = await response.json();

      return res.json({
        output: data
      });
    }

    res.status(400).json({ error: "Unknown tool" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// OPTIONAL: keep direct API for testing
app.post("/scrape", async (req, res) => {
  try {
    if (!req.body.url) {
      return res.status(400).json({ error: "URL required" });
    }

    const response = await fetch(
      `https://api.apify.com/v2/acts/apify~web-scraper/run-sync?token=${APIFY_TOKEN}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startUrls: [{ url: req.body.url }]
        })
      }
    );

    const data = await response.json();
    res.json(data);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port " + PORT));
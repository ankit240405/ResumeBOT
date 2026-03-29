import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import path from "path";
import analyzeRoutes from "./routes/analyzeRoutes.js";

dotenv.config();

console.log("OpenRouter Key Loaded?", process.env.OPENROUTER_API_KEY ? "YES" : "NO");
console.log("Mongo URI Loaded?", process.env.MONGO_URI ? "YES" : "NO");

async function startServer() {
  try {
    await connectDB();

    const app = express();

    app.use(cors());
    app.use(express.json());
    
    app.use("/api/analyze", analyzeRoutes);

    app.get("/api/test", (req, res) => {
      res.send("API is working ✔");
    });
  

    const PORT = process.env.PORT || 5000;
    const __dirname=path.resolve();
   if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get(/(.*)/, (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}
    app.listen(PORT, () =>
      console.log(`Server running on port ${PORT}`)
    );


  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

startServer();


import express, { Request, Response, NextFunction } from "express"
import cors from "cors"
import { createSupabaseAdmin } from "./lib/supabase-client"
import { logger } from "@/lib/logger"

const app = express()
const port = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

const supabase = createSupabaseAdmin()

// Middleware to check for API key or user session in the future
const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Placeholder for future auth logic (e.g., checking JWT from Supabase)
  logger.debug("FinanceAPI", "Auth middleware hit", { path: req.path })
  next()
}

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", service: "finance-api" })
})

// --- Finance API Endpoints ---

app.get("/banking/summary", authMiddleware, async (req, res) => {
  // Example: Fetch data from Supabase
  // const { data, error } = await supabase.from('accounts').select('*');
  // if (error) return res.status(500).json({ error: error.message });
  res.json({
    service: "banking",
    summary: {
      checking: 15032.45,
      savings: 82050.11,
    },
  })
})

app.get("/investment/portfolio", authMiddleware, async (req, res) => {
  res.json({
    service: "investment",
    portfolio: {
      totalValue: 125000.0,
      holdings: [
        { ticker: "AAPL", shares: 50 },
        { ticker: "TSLA", shares: 20 },
      ],
    },
  })
})

app.get("/credit/status", authMiddleware, async (req, res) => {
  res.json({
    service: "credit",
    status: {
      score: 780,
      limit: 20000,
      balance: 1250.5,
    },
  })
})

app.listen(port, () => {
  logger.info("FinanceAPI", "Service listening", { port })
})

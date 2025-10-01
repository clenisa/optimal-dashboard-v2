import express from "express"
import cors from "cors"
import { calculateMortgage, MortgageParams } from "./lib/calculator"

const app = express()
const port = Number(process.env.PORT) || 3004

app.use(cors())
app.use(express.json())

const parseNumber = (value: unknown): number => {
  const parsed = typeof value === "string" ? Number.parseFloat(value) : Number(value)
  if (!Number.isFinite(parsed)) {
    throw new Error("Invalid numeric value")
  }
  return parsed
}

app.post("/calculate", (req, res) => {
  try {
    const body = req.body ?? {}

    const params: MortgageParams = {
      homePrice: parseNumber(body.homePrice),
      downPayment: parseNumber(body.downPayment),
      interestRate: parseNumber(body.interestRate),
      loanTerm: parseNumber(body.loanTerm),
      startDate: body.startDate ? new Date(body.startDate) : new Date(),
      propertyTaxes: parseNumber(body.propertyTaxes),
      homeInsurance: parseNumber(body.homeInsurance),
      pmi: parseNumber(body.pmi),
      hoaFees: parseNumber(body.hoaFees ?? 0),
    }

    if (Number.isNaN(params.startDate.getTime())) {
      throw new Error("Invalid start date")
    }

    const result = calculateMortgage(params)
    res.json(result)
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : "Invalid input" })
  }
})

app.get("/health", (_req, res) => {
  res.json({ status: "ok" })
})

app.listen(port, () => {
  console.log(`Mortgage calculator service listening at http://localhost:${port}`)
})

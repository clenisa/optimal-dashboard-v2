export interface ParsedTransaction {
  date: string
  description: string
  amount: number
  category: string
  type: string
}

// Remove UTF-8 BOM if present
function removeBOM(content: string): string {
  // UTF-8 BOM is EF BB BF in hex, which appears as \uFEFF in JavaScript
  if (content && content.charCodeAt(0) === 0xFEFF) {
    return content.slice(1)
  }
  return content
}

// Parse CSV string into an array of transaction objects.
export function parseCSV(csvContent: string): ParsedTransaction[] {
  // Remove BOM if present
  const cleanContent = removeBOM(csvContent)
  // Normalize line endings to handle Windows (\r\n), Unix (\n), and Mac (\r) formats
  const normalizedContent = cleanContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  const lines = normalizedContent.split('\n').filter((line) => line.trim())
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase())

  const transactions: ParsedTransaction[] = []

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.trim())

    if (values.length >= 5) {
      const transaction: ParsedTransaction = {
        date: values[0] || new Date().toISOString().split("T")[0],
        description: values[1] || "Unknown Transaction",
        amount: Number.parseFloat(values[2]) || 0,
        type: values[3] || "expense",
        category: values[4] || "Uncategorized",
      }

      transactions.push(transaction)
    }
  }

  return transactions
}

export async function processCsvFile(file: File): Promise<ParsedTransaction[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (event) => {
      try {
        const csvContent = event.target?.result as string
        const transactions = parseCSV(csvContent)
        resolve(transactions)
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = () => reject(new Error("Failed to read file"))
    reader.readAsText(file)
  })
}

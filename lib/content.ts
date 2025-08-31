export const CONTENT = {
  csvUpload: {
    title: "Financial Data CSV Upload",
    description: "Upload your financial transaction data in CSV format to visualize spending patterns and insights.",
    requirements: [
      "File must be in CSV format (.csv)",
      "Required columns: Date, Amount, Description, Category",
      "Date format: YYYY-MM-DD or MM/DD/YYYY",
      "Amount should be numeric (negative for expenses, positive for income)",
      "Maximum file size: 10MB"
    ],
    examples: [
      "Date,Amount,Description,Category",
      "2024-01-15,-45.67,Grocery Store,Food",
      "2024-01-16,2500.00,Salary Deposit,Income"
    ],
    messages: {
      loading: "Processing CSV file...",
      success: "CSV file processed successfully!",
      error: "Error processing CSV file",
      noFile: "Please select a CSV file to upload",
      invalidFormat: "Invalid file format. Please upload a CSV file.",
      fileTooLarge: "File size exceeds 10MB limit",
    }
  },
  
  paymentSourceBalances: {
    title: "Credit Card Utilization",
    description: "Monitor your credit card balances and utilization rates across all accounts.",
    features: [
      "Real-time utilization tracking",
      "Customizable threshold alerts",
      "Paydown recommendations",
      "Visual utilization charts"
    ],
  },
  
  categoryChart: {
    title: "Category Trends",
    description: "Analyze spending patterns across different categories over time.",
    features: [
      "Multi-category comparison",
      "Monthly trend analysis",
      "Interactive chart controls",
      "Category filtering"
    ],
  },
} as const


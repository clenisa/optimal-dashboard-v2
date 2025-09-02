export interface PaymentSource {
  source: string;
  balance: number;
  max_balance?: number; // Credit limit for credit accounts
  type?: 'credit' | 'debit';
}

export interface ChartData {
  labels: string[];
  datasets: any[];
}

export interface KpiData {
  paydownNeeded: number;
  sourcesAboveThreshold: number;
  totalSources: number;
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
  type?: 'line' | 'bar';
  pointRadius?: number;
}

export interface ThresholdControlProps {
  threshold: number;
  onThresholdChange: (value: number) => void;
  useTestData: boolean;
  onToggleTestData: () => void;
}

export interface KpiDisplayProps {
  kpiData: KpiData;
  threshold: number;
}

export interface PaymentSourceChartProps {
  sources: PaymentSource[];
  threshold: number;
}

export interface PaymentSource {
  source: string;
  balance: number;
  max_balance?: number; // Credit limit for credit accounts
  type?: 'credit' | 'debit';
}

export interface ChartData {
  labels: string[];
  datasets: any[];
}

export interface KpiData {
  paydownNeeded: number;
  sourcesAboveThreshold: number;
  totalSources: number;
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
  type?: 'line' | 'bar';
  pointRadius?: number;
}

export interface ThresholdControlProps {
  threshold: number;
  onThresholdChange: (value: number) => void;
  useTestData: boolean;
  onToggleTestData: () => void;
}

export interface KpiDisplayProps {
  kpiData: KpiData;
  threshold: number;
}

export interface PaymentSourceChartProps {
  sources: PaymentSource[];
  threshold: number;
}

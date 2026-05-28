/**
 * UK Capital Gains Tax calculation for tax year 2025/26.
 *
 * Rates per Autumn Budget 2024: 18% basic / 24% higher rate for ALL asset types from
 * 30 October 2024 onwards (previously residential property differed from other assets).
 *
 * Scope (v1):
 *  - Individuals only (not trusts).
 *  - No BADR / Investors' Relief (specialist; v1.1+).
 *  - Annual Exempt Amount £3,000 (2025/26 onwards).
 *  - All asset types treated identically (same rates post-Oct 2024).
 *
 * Sources (verify before publishing):
 *  - https://www.gov.uk/capital-gains-tax/rates
 *  - https://www.gov.uk/capital-gains-tax/allowances
 *
 * Informational only — not tax advice.
 */

export const UK_TAX_YEAR_CGT = '2025/26';
export const UK_TAX_YEAR_CGT_RANGE = '6 Apr 2025 – 5 Apr 2026';

const ANNUAL_EXEMPT_AMOUNT = 3000;
const BASIC_RATE_LIMIT = 37700; // matches Income Tax basic rate band
const CGT_RATE_BASIC = 0.18;
const CGT_RATE_HIGHER = 0.24;

export interface CGTInputs {
  /** Total chargeable gains for the year (£) */
  totalGains: number;
  /** Allowable losses to set against gains, current year + brought-forward combined (£) */
  allowableLosses: number;
  /**
   * Other taxable income — i.e. income tax taxable income, after Personal Allowance (£).
   * Determines how much of the basic rate band is available for gains.
   * Example: £50,000 salary − £12,570 PA = £37,430.
   */
  otherTaxableIncome: number;
}

export interface CGTBandBreakdown {
  label: string;
  amount: number;
  rate: number;
  tax: number;
}

export interface CGTResult {
  taxYear: string;
  taxYearRange: string;
  inputs: CGTInputs;
  netGainsBeforeAEA: number;
  annualExemptUsed: number;
  taxableGains: number;
  basicBandRemaining: number;
  bands: CGTBandBreakdown[];
  totalCGT: number;
  effectiveRate: number;
}

export function calculateUKCGT(inputs: CGTInputs): CGTResult {
  const gains = Math.max(0, inputs.totalGains || 0);
  const losses = Math.max(0, inputs.allowableLosses || 0);
  const otherIncome = Math.max(0, inputs.otherTaxableIncome || 0);

  const netGainsBeforeAEA = Math.max(0, gains - losses);
  const annualExemptUsed = Math.min(netGainsBeforeAEA, ANNUAL_EXEMPT_AMOUNT);
  const taxableGains = Math.max(0, netGainsBeforeAEA - annualExemptUsed);

  const basicBandRemaining = Math.max(0, BASIC_RATE_LIMIT - otherIncome);

  const gainsAtBasic = Math.min(taxableGains, basicBandRemaining);
  const gainsAtHigher = Math.max(0, taxableGains - gainsAtBasic);

  const bands: CGTBandBreakdown[] = [];
  let totalCGT = 0;

  if (gainsAtBasic > 0) {
    const tax = gainsAtBasic * CGT_RATE_BASIC;
    bands.push({ label: 'Basic rate (18%)', amount: gainsAtBasic, rate: CGT_RATE_BASIC, tax });
    totalCGT += tax;
  }
  if (gainsAtHigher > 0) {
    const tax = gainsAtHigher * CGT_RATE_HIGHER;
    bands.push({ label: 'Higher rate (24%)', amount: gainsAtHigher, rate: CGT_RATE_HIGHER, tax });
    totalCGT += tax;
  }

  const effectiveRate = netGainsBeforeAEA > 0 ? totalCGT / netGainsBeforeAEA : 0;

  return {
    taxYear: UK_TAX_YEAR_CGT,
    taxYearRange: UK_TAX_YEAR_CGT_RANGE,
    inputs: { totalGains: gains, allowableLosses: losses, otherTaxableIncome: otherIncome },
    netGainsBeforeAEA,
    annualExemptUsed,
    taxableGains,
    basicBandRemaining,
    bands,
    totalCGT,
    effectiveRate,
  };
}

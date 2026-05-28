/**
 * UK Income Tax & Class 1 employee NIC calculation for tax year 2025/26 (rUK).
 *
 * Scope:
 *  - rUK bands only (England, Wales, NI). Scottish bands not yet supported.
 *  - Employment income (salary) only. Dividends, savings interest, self-employed NIC not yet supported.
 *  - Working-age employed taxpayer. State pension age NIC exemption not modelled.
 *
 * Sources (verify before publishing):
 *  - HMRC Income Tax rates and Personal Allowances: https://www.gov.uk/income-tax-rates
 *  - National Insurance rates: https://www.gov.uk/national-insurance-rates-letters
 *
 * Informational only — not tax advice.
 */

export const UK_TAX_YEAR = '2025/26';
export const UK_TAX_YEAR_RANGE = '6 Apr 2025 – 5 Apr 2026';

// Personal Allowance
const PA_DEFAULT = 12570;
const PA_TAPER_START = 100000; // ANI above this triggers PA taper (£1 reduction per £2)

// Income tax bands (in taxable income, after PA)
const BASIC_RATE_LIMIT = 37700;
const ADDITIONAL_RATE_THRESHOLD = 125140; // in total income terms

const RATE_BASIC = 0.2;
const RATE_HIGHER = 0.4;
const RATE_ADDITIONAL = 0.45;

// Class 1 employee NIC
const NIC_PRIMARY_THRESHOLD = 12570;
const NIC_UPPER_EARNINGS_LIMIT = 50270;
const NIC_MAIN_RATE = 0.08;
const NIC_HIGHER_RATE = 0.02;

export interface IncomeTaxInputs {
  /** Gross annual salary (employment income) in £ */
  salary: number;
}

export interface BandBreakdown {
  label: string;
  amount: number;
  rate: number;
  tax: number;
}

export interface IncomeTaxResult {
  taxYear: string;
  taxYearRange: string;
  salary: number;
  personalAllowance: number;
  personalAllowanceTaper: number;
  taxableIncome: number;
  incomeTaxBands: BandBreakdown[];
  totalIncomeTax: number;
  nationalInsurance: number;
  totalDeductions: number;
  takeHomePay: number;
  effectiveRate: number;
  marginalRate: number;
}

export function calculateUKIncomeTax(inputs: IncomeTaxInputs): IncomeTaxResult {
  const salary = Math.max(0, inputs.salary || 0);

  const taper = salary > PA_TAPER_START ? (salary - PA_TAPER_START) / 2 : 0;
  const personalAllowance = Math.max(0, PA_DEFAULT - taper);
  const personalAllowanceTaper = PA_DEFAULT - personalAllowance;

  const taxableIncome = Math.max(0, salary - personalAllowance);

  const incomeTaxBands: BandBreakdown[] = [];
  let totalIncomeTax = 0;

  const basicAmount = Math.min(taxableIncome, BASIC_RATE_LIMIT);
  if (basicAmount > 0) {
    const tax = basicAmount * RATE_BASIC;
    incomeTaxBands.push({ label: 'Basic rate (20%)', amount: basicAmount, rate: RATE_BASIC, tax });
    totalIncomeTax += tax;
  }

  // Higher band runs from £37,700 (taxable) up to (£125,140 - PA) (taxable).
  const higherBandUpperTaxable = Math.max(
    BASIC_RATE_LIMIT,
    ADDITIONAL_RATE_THRESHOLD - personalAllowance
  );
  const higherBandWidth = higherBandUpperTaxable - BASIC_RATE_LIMIT;
  const higherAmount = Math.min(Math.max(0, taxableIncome - BASIC_RATE_LIMIT), higherBandWidth);
  if (higherAmount > 0) {
    const tax = higherAmount * RATE_HIGHER;
    incomeTaxBands.push({ label: 'Higher rate (40%)', amount: higherAmount, rate: RATE_HIGHER, tax });
    totalIncomeTax += tax;
  }

  const additionalAmount = Math.max(0, taxableIncome - higherBandUpperTaxable);
  if (additionalAmount > 0) {
    const tax = additionalAmount * RATE_ADDITIONAL;
    incomeTaxBands.push({
      label: 'Additional rate (45%)',
      amount: additionalAmount,
      rate: RATE_ADDITIONAL,
      tax,
    });
    totalIncomeTax += tax;
  }

  let nationalInsurance = 0;
  if (salary > NIC_PRIMARY_THRESHOLD) {
    const mainBand = Math.min(salary, NIC_UPPER_EARNINGS_LIMIT) - NIC_PRIMARY_THRESHOLD;
    nationalInsurance += mainBand * NIC_MAIN_RATE;
  }
  if (salary > NIC_UPPER_EARNINGS_LIMIT) {
    nationalInsurance += (salary - NIC_UPPER_EARNINGS_LIMIT) * NIC_HIGHER_RATE;
  }

  const totalDeductions = totalIncomeTax + nationalInsurance;
  const takeHomePay = salary - totalDeductions;
  const effectiveRate = salary > 0 ? totalDeductions / salary : 0;
  const marginalRate = computeMarginalRate(salary);

  return {
    taxYear: UK_TAX_YEAR,
    taxYearRange: UK_TAX_YEAR_RANGE,
    salary,
    personalAllowance,
    personalAllowanceTaper,
    taxableIncome,
    incomeTaxBands,
    totalIncomeTax,
    nationalInsurance,
    totalDeductions,
    takeHomePay,
    effectiveRate,
    marginalRate,
  };
}

/**
 * Marginal rate on the next £1 of salary, combining income tax + Class 1 NIC.
 * In the £100k–£125,140 PA-taper zone, the marginal rate is 62%:
 * 40% IT + 2% NIC + 20% from losing £0.50 of PA (taxed at 40%) = 62%.
 */
function computeMarginalRate(salary: number): number {
  if (salary < NIC_PRIMARY_THRESHOLD) return 0;
  if (salary < NIC_UPPER_EARNINGS_LIMIT) return RATE_BASIC + NIC_MAIN_RATE; // 28%
  if (salary < PA_TAPER_START) return RATE_HIGHER + NIC_HIGHER_RATE; // 42%
  if (salary < ADDITIONAL_RATE_THRESHOLD) return RATE_HIGHER + NIC_HIGHER_RATE + 0.2; // 62%
  return RATE_ADDITIONAL + NIC_HIGHER_RATE; // 47%
}

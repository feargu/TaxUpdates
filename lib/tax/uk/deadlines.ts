/**
 * UK tax deadlines (fixed, nationally-applicable dates).
 *
 * Variable deadlines that depend on a specific taxpayer's accounting year (Corporation Tax,
 * VAT returns, monthly PAYE/RTI payments) are not yet modelled — those need per-user
 * configuration which will come later.
 *
 * Sources cited per deadline. Verify against HMRC before relying on these dates.
 */

export type DeadlineCategory = 'self-assessment' | 'paye' | 'tax-year';

export interface UKTaxDeadline {
  id: string;
  /** ISO yyyy-mm-dd */
  date: string;
  title: string;
  description: string;
  category: DeadlineCategory;
  source: string;
}

/**
 * Fixed UK tax deadlines for late 2025/26 → 2026/27.
 * Keep this list rolling: update annually, prune passed-by-more-than-90-days entries.
 */
export const UK_DEADLINES: UKTaxDeadline[] = [
  {
    id: 'fps-final-2025-26',
    date: '2026-04-19',
    title: 'Final FPS for 2025/26',
    description:
      'Submit the final Full Payment Submission for the 2025/26 tax year. Mark as "Yes" in the final submission field.',
    category: 'paye',
    source: 'https://www.gov.uk/running-payroll/reporting-to-hmrc',
  },
  {
    id: 'p60-2025-26',
    date: '2026-05-31',
    title: 'P60s to employees',
    description:
      'Provide P60s to all employees who were on the payroll on 5 April 2026, showing their total pay and deductions for 2025/26.',
    category: 'paye',
    source: 'https://www.gov.uk/payroll-annual-reporting/give-employees-a-p60',
  },
  {
    id: 'p11d-2025-26',
    date: '2026-07-06',
    title: 'P11D and P11D(b) submission',
    description:
      'File P11D and P11D(b) returns reporting expenses and benefits provided to employees in 2025/26. Provide copies to employees by the same date.',
    category: 'paye',
    source: 'https://www.gov.uk/employer-reporting-expenses-benefits',
  },
  {
    id: 'class-1a-nic-2025-26',
    date: '2026-07-22',
    title: 'Class 1A NIC payment',
    description:
      'Pay Class 1A National Insurance on benefits reported on P11D(b) for 2025/26 (electronic payment). Postal payment deadline was 19 July.',
    category: 'paye',
    source: 'https://www.gov.uk/pay-class-1a-national-insurance',
  },
  {
    id: 'sa-payment-on-account-2-2025-26',
    date: '2026-07-31',
    title: '2nd payment on account (2025/26)',
    description:
      'Second self-assessment payment on account for the 2025/26 tax year is due. Calculated as half of your 2024/25 tax liability.',
    category: 'self-assessment',
    source: 'https://www.gov.uk/understand-self-assessment-bill/payments-on-account',
  },
  {
    id: 'sa-register-2025-26',
    date: '2026-10-05',
    title: 'Register for Self Assessment',
    description:
      'Deadline to register with HMRC if you need to file a Self Assessment return for the first time for the 2025/26 tax year.',
    category: 'self-assessment',
    source: 'https://www.gov.uk/register-for-self-assessment',
  },
  {
    id: 'sa-paper-2025-26',
    date: '2026-10-31',
    title: 'Paper Self Assessment return',
    description:
      'Deadline to file a paper Self Assessment return for the 2025/26 tax year. Online filing remains open until 31 January.',
    category: 'self-assessment',
    source: 'https://www.gov.uk/self-assessment-tax-returns/deadlines',
  },
  {
    id: 'sa-paye-coding-2025-26',
    date: '2026-12-30',
    title: 'Online filing for PAYE coding',
    description:
      'File online by this date if you owe less than £3,000 in tax and want HMRC to collect it through your PAYE tax code rather than paying in a lump sum.',
    category: 'self-assessment',
    source: 'https://www.gov.uk/self-assessment-tax-returns/deadlines',
  },
  {
    id: 'sa-online-balancing-2025-26',
    date: '2027-01-31',
    title: 'Online SA return + balancing payment',
    description:
      'Final deadline to file the 2025/26 Self Assessment return online, pay any balancing tax due, and make the 1st payment on account for 2026/27.',
    category: 'self-assessment',
    source: 'https://www.gov.uk/self-assessment-tax-returns/deadlines',
  },
  {
    id: 'tax-year-end-2026-27',
    date: '2027-04-05',
    title: 'End of 2026/27 tax year',
    description:
      'Last day of the 2026/27 UK tax year. Use the days before this date for end-of-year planning (ISA, pension contributions, CGT exemption).',
    category: 'tax-year',
    source: 'https://www.gov.uk/income-tax-rates',
  },
  {
    id: 'tax-year-start-2027-28',
    date: '2027-04-06',
    title: 'Start of 2027/28 tax year',
    description: 'First day of the 2027/28 UK tax year. New allowances and bands apply.',
    category: 'tax-year',
    source: 'https://www.gov.uk/income-tax-rates',
  },
];

const MS_PER_DAY = 1000 * 60 * 60 * 24;

/** Days from today (midnight) to the target date. Positive = future, negative = past. */
export function daysUntil(isoDate: string, now: Date = new Date()): number {
  const target = new Date(`${isoDate}T00:00:00`);
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / MS_PER_DAY);
}

/** Human-readable countdown like "In 3 days" / "Today" / "In 2 weeks" / "In 5 months". */
export function countdownLabel(isoDate: string, now: Date = new Date()): string {
  const days = daysUntil(isoDate, now);
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days === -1) return 'Yesterday';
  if (days > 0 && days < 14) return `In ${days} days`;
  if (days > 0 && days < 60) return `In ${Math.round(days / 7)} weeks`;
  if (days > 0 && days < 365) return `In ${Math.round(days / 30)} months`;
  if (days >= 365) return `In ${Math.round(days / 365)} year${days >= 730 ? 's' : ''}`;
  if (days > -14) return `${Math.abs(days)} days ago`;
  if (days > -60) return `${Math.round(Math.abs(days) / 7)} weeks ago`;
  return `${Math.round(Math.abs(days) / 30)} months ago`;
}

/** "31 May 2026" */
export function formatDeadlineDate(isoDate: string): string {
  const d = new Date(`${isoDate}T00:00:00`);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function upcomingDeadlines(now: Date = new Date()): UKTaxDeadline[] {
  return UK_DEADLINES.filter((d) => daysUntil(d.date, now) >= 0).sort((a, b) =>
    a.date.localeCompare(b.date)
  );
}

export function pastDeadlines(now: Date = new Date()): UKTaxDeadline[] {
  return UK_DEADLINES.filter((d) => daysUntil(d.date, now) < 0).sort((a, b) =>
    b.date.localeCompare(a.date)
  );
}

export const CATEGORY_LABEL: Record<DeadlineCategory, string> = {
  'self-assessment': 'Self Assessment',
  paye: 'PAYE',
  'tax-year': 'Tax year',
};

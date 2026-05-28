import { describe, expect, it } from 'vitest';
import { calculateUKCGT } from './cgt';

describe('calculateUKCGT 2025/26', () => {
  it('no gains — no tax', () => {
    const r = calculateUKCGT({ totalGains: 0, allowableLosses: 0, otherTaxableIncome: 0 });
    expect(r.totalCGT).toBe(0);
    expect(r.taxableGains).toBe(0);
  });

  it('gains under AEA — no tax', () => {
    const r = calculateUKCGT({ totalGains: 2000, allowableLosses: 0, otherTaxableIncome: 30000 });
    expect(r.netGainsBeforeAEA).toBe(2000);
    expect(r.annualExemptUsed).toBe(2000);
    expect(r.taxableGains).toBe(0);
    expect(r.totalCGT).toBe(0);
  });

  it('gains exactly at AEA (£3,000) — no tax', () => {
    const r = calculateUKCGT({ totalGains: 3000, allowableLosses: 0, otherTaxableIncome: 30000 });
    expect(r.taxableGains).toBe(0);
    expect(r.totalCGT).toBe(0);
  });

  it('all gains in basic band — 18%', () => {
    const r = calculateUKCGT({ totalGains: 10000, allowableLosses: 0, otherTaxableIncome: 20000 });
    // Taxable gains: 10000 - 3000 = 7000. Basic band remaining: 37700 - 20000 = 17700. All in basic.
    expect(r.taxableGains).toBe(7000);
    expect(r.basicBandRemaining).toBe(17700);
    expect(r.totalCGT).toBeCloseTo(1260, 1); // 7000 × 18%
    expect(r.bands).toHaveLength(1);
    expect(r.bands[0].rate).toBe(0.18);
  });

  it('all gains in higher band — 24%', () => {
    const r = calculateUKCGT({ totalGains: 15000, allowableLosses: 0, otherTaxableIncome: 50000 });
    // Taxable: 15000 - 3000 = 12000. Basic remaining: max(0, 37700-50000) = 0. All higher.
    expect(r.basicBandRemaining).toBe(0);
    expect(r.totalCGT).toBeCloseTo(2880, 1); // 12000 × 24%
    expect(r.bands).toHaveLength(1);
    expect(r.bands[0].rate).toBe(0.24);
  });

  it('gains split across basic and higher bands', () => {
    const r = calculateUKCGT({ totalGains: 20000, allowableLosses: 0, otherTaxableIncome: 30000 });
    // Taxable: 20000 - 3000 = 17000. Basic remaining: 37700 - 30000 = 7700.
    // 7700 × 18% + 9300 × 24% = 1386 + 2232 = 3618.
    expect(r.basicBandRemaining).toBe(7700);
    expect(r.totalCGT).toBeCloseTo(3618, 1);
    expect(r.bands).toHaveLength(2);
  });

  it('losses applied before AEA', () => {
    const r = calculateUKCGT({ totalGains: 10000, allowableLosses: 5000, otherTaxableIncome: 40000 });
    // Net: 10000 - 5000 = 5000. AEA: 3000. Taxable: 2000. All higher (income > 37700).
    expect(r.netGainsBeforeAEA).toBe(5000);
    expect(r.annualExemptUsed).toBe(3000);
    expect(r.taxableGains).toBe(2000);
    expect(r.totalCGT).toBeCloseTo(480, 1); // 2000 × 24%
  });

  it('losses wipe out gains entirely', () => {
    const r = calculateUKCGT({ totalGains: 5000, allowableLosses: 8000, otherTaxableIncome: 30000 });
    expect(r.netGainsBeforeAEA).toBe(0);
    expect(r.totalCGT).toBe(0);
  });

  it('negative inputs clamp to zero', () => {
    const r = calculateUKCGT({ totalGains: -1000, allowableLosses: -500, otherTaxableIncome: -200 });
    expect(r.inputs.totalGains).toBe(0);
    expect(r.inputs.allowableLosses).toBe(0);
    expect(r.inputs.otherTaxableIncome).toBe(0);
    expect(r.totalCGT).toBe(0);
  });

  it('effective rate computed correctly', () => {
    const r = calculateUKCGT({ totalGains: 10000, allowableLosses: 0, otherTaxableIncome: 20000 });
    // Total CGT 1260, on net gains 10000 = 12.6%
    expect(r.effectiveRate).toBeCloseTo(0.126, 3);
  });
});

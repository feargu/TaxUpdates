import { describe, expect, it } from 'vitest';
import { calculateUKIncomeTax } from './income';

describe('calculateUKIncomeTax 2025/26 rUK', () => {
  it('£0 salary — no tax, no NIC', () => {
    const r = calculateUKIncomeTax({ salary: 0 });
    expect(r.totalIncomeTax).toBe(0);
    expect(r.nationalInsurance).toBe(0);
    expect(r.takeHomePay).toBe(0);
    expect(r.marginalRate).toBe(0);
  });

  it('salary at Personal Allowance (£12,570) — no tax, no NIC', () => {
    const r = calculateUKIncomeTax({ salary: 12570 });
    expect(r.personalAllowance).toBe(12570);
    expect(r.taxableIncome).toBe(0);
    expect(r.totalIncomeTax).toBe(0);
    expect(r.nationalInsurance).toBe(0);
    expect(r.takeHomePay).toBe(12570);
  });

  it('basic rate — £30,000 salary', () => {
    const r = calculateUKIncomeTax({ salary: 30000 });
    expect(r.totalIncomeTax).toBeCloseTo(3486, 1); // (30000 - 12570) × 20%
    expect(r.nationalInsurance).toBeCloseTo(1394.4, 1); // (30000 - 12570) × 8%
    expect(r.takeHomePay).toBeCloseTo(25119.6, 1);
    expect(r.marginalRate).toBeCloseTo(0.28, 4);
    expect(r.incomeTaxBands).toHaveLength(1);
    expect(r.incomeTaxBands[0].label).toContain('Basic');
  });

  it('top of basic rate — £50,270 salary', () => {
    const r = calculateUKIncomeTax({ salary: 50270 });
    expect(r.taxableIncome).toBe(37700);
    expect(r.totalIncomeTax).toBeCloseTo(7540, 1); // 37700 × 20%
    expect(r.nationalInsurance).toBeCloseTo(3016, 1); // 37700 × 8%
    expect(r.marginalRate).toBeCloseTo(0.42, 4); // basic + NIC main rate at the exact boundary
  });

  it('higher rate — £60,000 salary', () => {
    const r = calculateUKIncomeTax({ salary: 60000 });
    expect(r.totalIncomeTax).toBeCloseTo(11432, 1); // 37700×20% + 9730×40%
    expect(r.nationalInsurance).toBeCloseTo(3210.6, 1); // 37700×8% + 9730×2%
    expect(r.takeHomePay).toBeCloseTo(45357.4, 1);
    expect(r.marginalRate).toBeCloseTo(0.42, 4);
    expect(r.incomeTaxBands).toHaveLength(2);
  });

  it('PA taper start — £100,000 salary, no taper yet', () => {
    const r = calculateUKIncomeTax({ salary: 100000 });
    expect(r.personalAllowance).toBe(12570);
    expect(r.personalAllowanceTaper).toBe(0);
  });

  it('PA taper zone — £110,000 salary, taper engaged', () => {
    const r = calculateUKIncomeTax({ salary: 110000 });
    expect(r.personalAllowance).toBe(7570); // 12570 - (110000-100000)/2
    expect(r.personalAllowanceTaper).toBe(5000);
    expect(r.totalIncomeTax).toBeCloseTo(33432, 1); // 37700×20% + 64730×40%
    expect(r.nationalInsurance).toBeCloseTo(4210.6, 1);
    expect(r.takeHomePay).toBeCloseTo(72357.4, 1);
    expect(r.marginalRate).toBeCloseTo(0.62, 4); // 40% + 2% NIC + 20% PA-loss penalty
  });

  it('PA fully tapered — £125,140 salary, PA = 0', () => {
    const r = calculateUKIncomeTax({ salary: 125140 });
    expect(r.personalAllowance).toBe(0);
    expect(r.personalAllowanceTaper).toBe(12570);
    expect(r.taxableIncome).toBe(125140);
    expect(r.marginalRate).toBeCloseTo(0.47, 4); // additional rate boundary
  });

  it('additional rate — £150,000 salary', () => {
    const r = calculateUKIncomeTax({ salary: 150000 });
    expect(r.personalAllowance).toBe(0);
    expect(r.totalIncomeTax).toBeCloseTo(53703, 1); // 37700×20% + 87440×40% + 24860×45%
    expect(r.nationalInsurance).toBeCloseTo(5010.6, 1);
    expect(r.takeHomePay).toBeCloseTo(91286.4, 1);
    expect(r.marginalRate).toBeCloseTo(0.47, 4);
    expect(r.incomeTaxBands).toHaveLength(3);
  });

  it('negative or invalid salary clamps to zero', () => {
    const r = calculateUKIncomeTax({ salary: -1000 });
    expect(r.salary).toBe(0);
    expect(r.totalIncomeTax).toBe(0);
  });
});

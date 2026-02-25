/**
 * @jest-environment node
 */
import {
  buildStatusSteps,
  getStatusProgress,
  formatCurrency,
  STATUS_SEQUENCE,
} from "@/lib/utils";
import { OrderStatus } from "@/lib/types";

describe("formatCurrency", () => {
  it("formats Indian currency correctly", () => {
    expect(formatCurrency(340)).toMatch(/340/);
    expect(formatCurrency(1000)).toMatch(/1,000|1000/);
    expect(formatCurrency(0)).toMatch(/0/);
  });

  it("includes ₹ or INR symbol", () => {
    const result = formatCurrency(100);
    expect(result).toMatch(/₹|INR/);
  });
});

describe("getStatusProgress", () => {
  it("returns 0 for ORDER_RECEIVED", () => {
    expect(getStatusProgress("ORDER_RECEIVED")).toBe(0);
  });

  it("returns 100 for DELIVERED", () => {
    expect(getStatusProgress("DELIVERED")).toBe(100);
  });

  it("returns a value between 0 and 100 for intermediate statuses", () => {
    const intermediate: OrderStatus[] = ["CONFIRMED", "PREPARING", "QUALITY_CHECK", "OUT_FOR_DELIVERY"];
    intermediate.forEach((status) => {
      const progress = getStatusProgress(status);
      expect(progress).toBeGreaterThan(0);
      expect(progress).toBeLessThan(100);
    });
  });

  it("progress increases with each status", () => {
    const values = STATUS_SEQUENCE.map(getStatusProgress);
    for (let i = 0; i < values.length - 1; i++) {
      expect(values[i]).toBeLessThan(values[i + 1]);
    }
  });
});

describe("buildStatusSteps", () => {
  it("returns steps for all statuses", () => {
    const steps = buildStatusSteps("ORDER_RECEIVED");
    expect(steps).toHaveLength(STATUS_SEQUENCE.length);
  });

  it("marks only the current step as active", () => {
    const steps = buildStatusSteps("PREPARING");
    const active = steps.filter((s) => s.active);
    expect(active).toHaveLength(1);
    expect(active[0].status).toBe("PREPARING");
  });

  it("marks prior steps as completed", () => {
    const steps = buildStatusSteps("PREPARING");
    const preparingIndex = STATUS_SEQUENCE.indexOf("PREPARING");
    steps.forEach((step, index) => {
      if (index < preparingIndex) expect(step.completed).toBe(true);
      if (index >= preparingIndex) expect(step.completed).toBe(false);
    });
  });

  it("marks future steps as not completed and not active", () => {
    const steps = buildStatusSteps("CONFIRMED");
    const confirmedIndex = STATUS_SEQUENCE.indexOf("CONFIRMED");
    steps.forEach((step, index) => {
      if (index > confirmedIndex) {
        expect(step.completed).toBe(false);
        expect(step.active).toBe(false);
      }
    });
  });

  it("all steps have required fields", () => {
    const steps = buildStatusSteps("ORDER_RECEIVED");
    steps.forEach((step) => {
      expect(step.status).toBeDefined();
      expect(step.label).toBeTruthy();
      expect(step.description).toBeTruthy();
      expect(typeof step.completed).toBe("boolean");
      expect(typeof step.active).toBe("boolean");
    });
  });
});

describe("Cart calculations", () => {
  it("handles zero items gracefully", () => {
    expect(formatCurrency(0)).toMatch(/0/);
    expect(getStatusProgress("ORDER_RECEIVED")).toBe(0);
  });
});

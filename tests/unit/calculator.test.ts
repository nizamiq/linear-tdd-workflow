import { Calculator } from '../../src/services/calculator';

describe('Calculator', () => {
  let calculator: Calculator;

  beforeEach(() => {
    calculator = new Calculator();
  });

  describe('add', () => {
    it('should add two positive numbers correctly', () => {
      const result = calculator.add(2, 3);
      expect(result).toBe(5);
    });

    it('should add negative numbers correctly', () => {
      const result = calculator.add(-5, -3);
      expect(result).toBe(-8);
    });

    it('should add zero correctly', () => {
      const result = calculator.add(10, 0);
      expect(result).toBe(10);
    });

    it('should handle decimal numbers', () => {
      const result = calculator.add(0.1, 0.2);
      expect(result).toBeCloseTo(0.3);
    });
  });

  describe('subtract', () => {
    it('should subtract two numbers correctly', () => {
      const result = calculator.subtract(10, 4);
      expect(result).toBe(6);
    });

    it('should handle negative results', () => {
      const result = calculator.subtract(3, 7);
      expect(result).toBe(-4);
    });
  });

  describe('multiply', () => {
    it('should multiply two numbers correctly', () => {
      const result = calculator.multiply(4, 5);
      expect(result).toBe(20);
    });

    it('should return zero when multiplying by zero', () => {
      const result = calculator.multiply(100, 0);
      expect(result).toBe(0);
    });

    it('should handle negative numbers', () => {
      const result = calculator.multiply(-3, 4);
      expect(result).toBe(-12);
    });
  });

  describe('divide', () => {
    it('should divide two numbers correctly', () => {
      const result = calculator.divide(10, 2);
      expect(result).toBe(5);
    });

    it('should throw error when dividing by zero', () => {
      expect(() => calculator.divide(10, 0)).toThrow('Division by zero is not allowed');
    });

    it('should handle decimal results', () => {
      const result = calculator.divide(7, 2);
      expect(result).toBe(3.5);
    });
  });
});
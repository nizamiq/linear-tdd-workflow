/**
 * Calculator class providing basic arithmetic operations
 */
export class Calculator {
  /**
   * Adds two numbers
   * @param a First number
   * @param b Second number
   * @returns Sum of a and b
   */
  add(a: number, b: number): number {
    return a + b;
  }

  /**
   * Subtracts second number from first
   * @param a First number
   * @param b Second number
   * @returns Difference of a and b
   */
  subtract(a: number, b: number): number {
    return a - b;
  }

  /**
   * Multiplies two numbers
   * @param a First number
   * @param b Second number
   * @returns Product of a and b
   */
  multiply(a: number, b: number): number {
    return a * b;
  }

  /**
   * Divides first number by second
   * @param a Dividend
   * @param b Divisor
   * @returns Quotient of a divided by b
   * @throws Error when dividing by zero
   */
  divide(a: number, b: number): number {
    this.validateDivisor(b);
    return a / b;
  }

  /**
   * Validates that divisor is not zero
   * @private
   */
  private validateDivisor(divisor: number): void {
    if (divisor === 0) {
      throw new Error('Division by zero is not allowed');
    }
  }
}
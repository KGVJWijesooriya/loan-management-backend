/**
 * Calculate daily installment amount
 * @param {Number} principal - Loan principal amount
 * @param {Number} interestRate - Annual interest rate in percentage
 * @param {Number} durationInDays - Loan duration in days
 * @returns {Object} - Daily installment amount and total repayment amount
 */
const calculateDailyInstallment = (principal, interestRate, durationInDays) => {
  // Convert annual interest rate to daily rate
  const dailyInterestRate = interestRate / 100 / 365;

  // Calculate total interest
  const totalInterest = principal * dailyInterestRate * durationInDays;

  // Calculate total amount to be repaid
  const totalAmount = principal + totalInterest;

  // Calculate daily installment
  const dailyInstallment = totalAmount / durationInDays;

  return {
    dailyInstallment: parseFloat(dailyInstallment.toFixed(2)),
    totalAmount: parseFloat(totalAmount.toFixed(2)),
  };
};

module.exports = {
  calculateDailyInstallment,
};

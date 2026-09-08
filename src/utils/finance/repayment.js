import {
  calculateEmi,
} from "@/utils/finance/emi";


function roundMoney(value) {
  return Math.round(
    (value + Number.EPSILON) * 100
  ) / 100;
}


export function calculateRepaymentSummary({
  loanAmount,
  interestRate,
  tenure,
}) {
  const monthlyEmi =
    calculateEmi({
      principal: loanAmount,
      annualInterestRate:
        interestRate,
      tenureMonths:
        tenure,
    });


  const totalRepayment =
    roundMoney(
      monthlyEmi * tenure
    );


  const totalInterest =
    roundMoney(
      totalRepayment -
      loanAmount
    );


  return {
    principal:
      roundMoney(loanAmount),

    monthlyEmi,

    totalInterest,

    totalRepayment,
  };
}


export function generateRepaymentSchedule({
  loanAmount,
  interestRate,
  tenure,
}) {
  const monthlyEmi =
    calculateEmi({
      principal: loanAmount,
      annualInterestRate:
        interestRate,
      tenureMonths:
        tenure,
    });


  const monthlyInterestRate =
    interestRate / 12 / 100;


  let balance =
    roundMoney(loanAmount);

  const schedule = [];


  for (
    let month = 1;
    month <= tenure;
    month++
  ) {
    const openingBalance =
      balance;


    const interestPayment =
      roundMoney(
        openingBalance *
          monthlyInterestRate
      );


    let principalPayment =
      roundMoney(
        monthlyEmi -
          interestPayment
      );


    let payment =
      monthlyEmi;


    /*
      Last month rounding adjustment.

      Due to decimal rounding,
      remaining balance can be slightly
      smaller/larger than normal
      principalPayment.
    */
    if (
      month === tenure ||
      principalPayment > openingBalance
    ) {
      principalPayment =
        openingBalance;

      payment =
        roundMoney(
          principalPayment +
            interestPayment
        );
    }


    const closingBalance =
      roundMoney(
        Math.max(
          0,
          openingBalance -
            principalPayment
        )
      );


    schedule.push({
      month,

      openingBalance:
        roundMoney(
          openingBalance
        ),

      payment,

      principalPayment,

      interestPayment,

      closingBalance,
    });


    balance =
      closingBalance;
  }


  return schedule;
}
function roundMoney(value) {
  return Math.round(
    (value + Number.EPSILON) * 100
  ) / 100;
}


export function calculateEmi({
  principal,
  annualInterestRate,
  tenureMonths,
}) {
  if (principal <= 0) {
    return 0;
  }

  if (tenureMonths <= 0) {
    return 0;
  }

  const monthlyInterestRate =
    annualInterestRate / 12 / 100;


  if (monthlyInterestRate === 0) {
    return roundMoney(
      principal / tenureMonths
    );
  }


  const factor =
    Math.pow(
      1 + monthlyInterestRate,
      tenureMonths
    );


  const emi =
    principal *
    monthlyInterestRate *
    factor /
    (factor - 1);


  return roundMoney(emi);
}
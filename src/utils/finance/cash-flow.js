function roundMoney(value) {
  return Math.round(
    (value + Number.EPSILON) * 100
  ) / 100;
}


function roundRatio(value) {
  return Math.round(
    (value + Number.EPSILON) * 100
  ) / 100;
}


export function calculateCashFlow({
  revenue,
  expenses,
  monthlyEmi,
}) {
  const operatingSurplus =
    revenue - expenses;


  const surplusAfterEmi =
    operatingSurplus -
    monthlyEmi;


  const operatingMargin =
    revenue > 0
      ? (
          operatingSurplus /
          revenue
        ) * 100
      : 0;


  const emiCoverageRatio =
    monthlyEmi > 0
      ? operatingSurplus /
        monthlyEmi
      : null;


  return {
    monthlyRevenue:
      roundMoney(revenue),

    monthlyExpenses:
      roundMoney(expenses),

    operatingSurplus:
      roundMoney(
        operatingSurplus
      ),

    operatingMarginPercentage:
      roundRatio(
        operatingMargin
      ),

    monthlyEmi:
      roundMoney(
        monthlyEmi
      ),

    emiCoverageRatio:
      emiCoverageRatio !== null
        ? roundRatio(
            emiCoverageRatio
          )
        : null,

    surplusAfterEmi:
      roundMoney(
        surplusAfterEmi
      ),
  };
}
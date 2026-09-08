"""
Financial precision, formatting, and currency utility functions.
"""

from decimal import Decimal, ROUND_HALF_UP


def round_currency(val: float) -> float:
    """
    Rounds floating point money values to 2 decimal places using HALF_UP rounding.
    """
    if val is None:
        return 0.0
    d = Decimal(str(val))
    return float(d.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP))


def format_inr(amount: float) -> str:
    """
    Formats a numeric value into standard Indian Rupee notation (e.g., ₹1,00,000).
    """
    if amount is None:
        return "₹0"
    
    amount_rounded = round_currency(amount)
    is_negative = amount_rounded < 0
    abs_val = abs(amount_rounded)
    
    s, *d = f"{abs_val:.2f}".split(".")
    
    if len(s) <= 3:
        formatted = s
    else:
        last3 = s[-3:]
        other = s[:-3]
        res = ""
        while len(other) > 2:
            res = "," + other[-2:] + res
            other = other[:-2]
        formatted = other + res + "," + last3

    if d and int(d[0]) > 0:
        formatted += f".{d[0]}"
    
    prefix = "-₹" if is_negative else "₹"
    return f"{prefix}{formatted}"


def format_lakh_crore(amount: float) -> str:
    """
    Formats large numbers into readable Lakh / Crore strings.
    Example: 1000000 -> ₹10.00 Lakh, 5000000 -> ₹50.00 Lakh
    """
    if amount is None or amount == 0:
        return "₹0"
    
    if amount >= 10000000:  # 1 Crore
        return f"₹{amount / 10000000:.2f} Cr"
    elif amount >= 100000:   # 1 Lakh
        return f"₹{amount / 100000:.2f} Lakh"
    else:
        return format_inr(amount)

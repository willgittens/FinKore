# SPDX-License-Identifier: MPL-2.0
"""FinKore Money value behavior implemented with exact base-10 decimals."""

from __future__ import annotations

from dataclasses import dataclass
from decimal import Decimal, InvalidOperation
from fractions import Fraction
import math
import re
from typing import Any

from .errors import FinKoreError

INVALID_AMOUNT = "FINKORE_MONEY_INVALID_AMOUNT"
INVALID_CURRENCY = "FINKORE_MONEY_INVALID_CURRENCY"
CURRENCY_MISMATCH = "FINKORE_MONEY_CURRENCY_MISMATCH"
DIVISION_BY_ZERO = "FINKORE_MONEY_DIVISION_BY_ZERO"
ROUNDING_REQUIRED = "FINKORE_MONEY_ROUNDING_REQUIRED"
INVALID_ROUNDING = "FINKORE_MONEY_INVALID_ROUNDING"
INVALID_ALLOCATION = "FINKORE_MONEY_INVALID_ALLOCATION"

_AMOUNT_RE = re.compile(r"^-?(?:0|[0-9]+)(?:\.[0-9]+)?$")
_CURRENCY_RE = re.compile(r"^[A-Z]{3}$")
_ROUNDING = {"HALF_UP", "HALF_EVEN", "DOWN", "UP", "FLOOR", "CEILING"}


def _plain_decimal(value: str) -> Decimal:
    if not isinstance(value, str) or _AMOUNT_RE.fullmatch(value) is None:
        raise FinKoreError(INVALID_AMOUNT)
    try:
        decimal = Decimal(value)
    except InvalidOperation as error:
        raise FinKoreError(INVALID_AMOUNT) from error
    if not decimal.is_finite():
        raise FinKoreError(INVALID_AMOUNT)
    return decimal


def _scale(value: str) -> int:
    return len(value.partition(".")[2])


def _format_decimal(value: Decimal, scale: int | None = None) -> str:
    if value.is_zero():
        if scale is None or scale == 0:
            text = format(value, "f")
            return text[1:] if text.startswith("-") else text
        return f"0.{''.join('0' for _ in range(scale))}"
    text = format(value, "f")
    if text.startswith("-0") and Decimal(text).is_zero():
        text = text[1:]
    if scale is not None:
        integer, dot, fraction = text.partition(".")
        if scale == 0:
            return integer
        fraction = (fraction if dot else "").ljust(scale, "0")
        return f"{integer}.{fraction[:scale]}"
    return text


def _decimal_units(value: Decimal) -> tuple[int, int]:
    digits = int("".join(str(digit) for digit in value.as_tuple().digits))
    if value.as_tuple().sign == 1:
        digits = -digits
    exponent = value.as_tuple().exponent
    if exponent >= 0:
        return digits * (10**exponent), 0
    return digits, -exponent


def _decimal_from_units(units: int, scale: int) -> Decimal:
    sign = 1 if units < 0 else 0
    digits = tuple(int(digit) for digit in str(abs(units))) or (0,)
    return Decimal((sign, digits, -scale))


def _add_decimal(left: Decimal, right: Decimal) -> Decimal:
    left_units, left_scale = _decimal_units(left)
    right_units, right_scale = _decimal_units(right)
    scale = max(left_scale, right_scale)
    units = left_units * (10 ** (scale - left_scale)) + right_units * (10 ** (scale - right_scale))
    return _decimal_from_units(units, scale)


def _multiply_decimal(left: Decimal, right: Decimal) -> Decimal:
    left_units, left_scale = _decimal_units(left)
    right_units, right_scale = _decimal_units(right)
    return _decimal_from_units(left_units * right_units, left_scale + right_scale)


def _shift_decimal_scale(value: Decimal, places: int) -> Decimal:
    units, scale = _decimal_units(value)
    return _decimal_from_units(units, scale + places)


def _valid_scale(value: Any, error_code: str = INVALID_ROUNDING) -> int:
    if not isinstance(value, int) or isinstance(value, bool) or value < 0:
        raise FinKoreError(error_code)
    return value


def _allocation_integer(value: Any, minimum: int, maximum: int) -> int:
    if isinstance(value, bool) or not isinstance(value, (int, float, Decimal)):
        raise FinKoreError(INVALID_ALLOCATION)
    if isinstance(value, float) and (not math.isfinite(value) or not value.is_integer()):
        raise FinKoreError(INVALID_ALLOCATION)
    if isinstance(value, Decimal) and (not value.is_finite() or value != value.to_integral_value()):
        raise FinKoreError(INVALID_ALLOCATION)
    integer = int(value)
    if integer < minimum or integer > maximum:
        raise FinKoreError(INVALID_ALLOCATION)
    return integer


def _whole_units(amount: Decimal, scale: int) -> int | None:
    units, amount_scale = _decimal_units(amount)
    if amount_scale <= scale:
        return units * (10 ** (scale - amount_scale))
    factor = 10 ** (amount_scale - scale)
    if units % factor != 0:
        return None
    return units // factor


def _round_decimal(amount: Decimal, target_scale: int, mode: str) -> Decimal:
    units, scale = _decimal_units(amount)
    if scale <= target_scale:
        return _decimal_from_units(units * (10 ** (target_scale - scale)), target_scale)

    divisor = 10 ** (scale - target_scale)
    sign = -1 if units < 0 else 1
    absolute_units = abs(units)
    quotient, remainder = divmod(absolute_units, divisor)
    increment = False
    if remainder != 0:
        if mode == "UP":
            increment = True
        elif mode == "FLOOR":
            increment = sign < 0
        elif mode == "CEILING":
            increment = sign > 0
        elif mode == "HALF_UP":
            increment = remainder * 2 >= divisor
        elif mode == "HALF_EVEN":
            doubled = remainder * 2
            increment = doubled > divisor or (doubled == divisor and quotient % 2 == 1)
    return _decimal_from_units(sign * (quotient + (1 if increment else 0)), target_scale)


def _finite_decimal_quotient(dividend: Decimal, divisor: Decimal) -> tuple[Decimal, int] | None:
    ratio = Fraction(*dividend.as_integer_ratio()) / Fraction(*divisor.as_integer_ratio())
    denominator = ratio.denominator
    twos = 0
    fives = 0
    while denominator % 2 == 0:
        denominator //= 2
        twos += 1
    while denominator % 5 == 0:
        denominator //= 5
        fives += 1
    if denominator != 1:
        return None
    scale = max(twos, fives)
    integer = ratio.numerator * (2 ** (scale - twos)) * (5 ** (scale - fives))
    return _decimal_from_units(integer, scale), scale


@dataclass(frozen=True)
class Money:
    """A FinKore Money value containing one exact amount and one currency.

    Money arithmetic uses exact decimal semantics, preserves currency, and never
    mutates operands.

    @see MONEY-REPRESENTATION-001
    @see MONEY-SERIALIZATION-001
    """

    amount: Decimal
    currency: str
    presentation_scale: int | None = None

    @staticmethod
    def from_portable(value: Any) -> "Money":
        """Parse FinKore portable Money JSON.

        Unknown members are ignored and cannot alter amount or currency meaning.

        @throws FinKoreError with ``FINKORE_MONEY_INVALID_AMOUNT`` or
        ``FINKORE_MONEY_INVALID_CURRENCY``.
        @see MONEY-SERIALIZATION-001
        @see MONEY-SERIALIZATION-006
        """

        if not isinstance(value, dict):
            raise FinKoreError(INVALID_AMOUNT)
        if "amount" not in value:
            raise FinKoreError(INVALID_AMOUNT)
        amount_text = value["amount"]
        amount = _plain_decimal(amount_text)
        if "currency" not in value or not isinstance(value["currency"], str) or _CURRENCY_RE.fullmatch(value["currency"]) is None:
            raise FinKoreError(INVALID_CURRENCY)
        return Money(amount=amount, currency=value["currency"], presentation_scale=_scale(amount_text))

    def to_portable(self, scale: int | None = None) -> dict[str, str]:
        """Serialize this value to FinKore portable Money JSON.

        @returns a dictionary containing ``amount`` and ``currency``.
        @see MONEY-SERIALIZATION-008
        """

        return {"amount": _format_decimal(self.amount, self.presentation_scale if scale is None else scale), "currency": self.currency}

    def _compatible(self, other: "Money") -> None:
        if self.currency != other.currency:
            raise FinKoreError(CURRENCY_MISMATCH)

    def add(self, other: "Money") -> "Money":
        """Add compatible Money values exactly without mutating either operand."""

        self._compatible(other)
        return Money(_add_decimal(self.amount, other.amount), self.currency)

    def subtract(self, other: "Money") -> "Money":
        """Subtract compatible Money values exactly without mutating either operand.

        Sign reversal and arithmetic preserve every digit independently of the
        caller's Decimal precision and rounding mode; the context is unchanged.
        Raises ``FinKoreError`` with ``FINKORE_MONEY_CURRENCY_MISMATCH`` when
        currencies differ.

        @see MONEY-ARITHMETIC-001
        @see MONEY-ARITHMETIC-002
        @see MONEY-ARITHMETIC-007
        @see MONEY-ARITHMETIC-009
        """

        self._compatible(other)
        return Money(_add_decimal(self.amount, other.amount.copy_negate()), self.currency)

    def negate(self) -> "Money":
        """Return the exact additive inverse while preserving currency and this operand.

        Negation neither applies nor changes the caller's Decimal context.

        @see MONEY-ARITHMETIC-003
        @see MONEY-ARITHMETIC-007
        @see MONEY-ARITHMETIC-009
        """

        return Money(self.amount.copy_negate(), self.currency, self.presentation_scale)

    def multiply(self, scalar: Any) -> "Money":
        """Multiply by an exact decimal scalar while preserving currency."""

        return Money(_multiply_decimal(self.amount, _plain_decimal(scalar)), self.currency)

    def divide(self, scalar: Any) -> "Money":
        """Divide by a non-zero exact decimal scalar or fail when rounding is required."""

        divisor = _plain_decimal(scalar)
        if divisor.is_zero():
            raise FinKoreError(DIVISION_BY_ZERO)
        quotient = _finite_decimal_quotient(self.amount, divisor)
        if quotient is None:
            raise FinKoreError(ROUNDING_REQUIRED)
        result, scale = quotient
        return Money(result, self.currency, scale)

    def compare(self, other: "Money") -> str:
        """Compare compatible Money values numerically."""

        self._compatible(other)
        if self.amount < other.amount:
            return "LESS"
        if self.amount > other.amount:
            return "GREATER"
        return "EQUAL"

    def round(self, scale: Any, mode: Any) -> "Money":
        """Round to an explicit target scale using a portable rounding mode."""

        target_scale = _valid_scale(scale)
        if not isinstance(mode, str) or mode not in _ROUNDING:
            raise FinKoreError(INVALID_ROUNDING)
        rounded = _round_decimal(self.amount, target_scale, mode)
        return Money(rounded, self.currency, target_scale)

    def apply_rate(self, rate: Any, rounding: Any | None = None) -> "Money":
        """Apply an exact decimal or percentage Rate to this Money value."""

        if not isinstance(rate, dict):
            raise FinKoreError(INVALID_AMOUNT)
        kind = rate.get("kind")
        if kind not in {"DECIMAL", "PERCENTAGE"}:
            raise FinKoreError(INVALID_AMOUNT)
        value = _plain_decimal(rate.get("value"))
        scalar = value if kind == "DECIMAL" else _shift_decimal_scale(value, 2)
        result = Money(_multiply_decimal(self.amount, scalar), self.currency)
        if rounding is None:
            return result
        if not isinstance(rounding, dict):
            raise FinKoreError(INVALID_ROUNDING)
        try:
            return result.round(rounding.get("scale"), rounding.get("mode"))
        except FinKoreError as error:
            if error.code == INVALID_ROUNDING:
                raise
            raise FinKoreError(INVALID_ROUNDING) from error

    def allocate(self, allocation: Any, scale: Any) -> list["Money"]:
        """Allocate in declared order using the portable scale, part, and ratio integer ranges.

        Raises ``FinKoreError`` with ``FINKORE_MONEY_INVALID_ALLOCATION`` for
        malformed or out-of-range requests, or ``FINKORE_MONEY_ROUNDING_REQUIRED``
        when the source cannot be represented in whole units at the target scale.
        Preserves this Money value on success and failure. Result construction
        conserves the exact source total independently of the caller's Decimal
        precision and rounding mode, without changing that context.

        @see MONEY-ALLOCATION-007
        @see MONEY-ALLOCATION-008
        @see MONEY-ALLOCATION-010
        @see MONEY-ALLOCATION-011
        @see MONEY-ALLOCATION-013
        """

        target_scale = _allocation_integer(scale, 0, 50)
        if not isinstance(allocation, dict):
            raise FinKoreError(INVALID_ALLOCATION)
        method = allocation.get("method")
        if method == "EQUAL":
            parts = allocation.get("parts")
            parts = _allocation_integer(parts, 1, 100)
            weights = [1] * parts
        elif method == "RATIO":
            ratios = allocation.get("ratios")
            if not isinstance(ratios, list) or len(ratios) == 0:
                raise FinKoreError(INVALID_ALLOCATION)
            weights = [_allocation_integer(ratio, 1, 9007199254740991) for ratio in ratios]
        else:
            raise FinKoreError(INVALID_ALLOCATION)

        units = _whole_units(self.amount, target_scale)
        if units is None:
            raise FinKoreError(ROUNDING_REQUIRED)
        sign = -1 if units < 0 else 1
        absolute_units = abs(units)
        total_weight = sum(weights)
        base_units = [(absolute_units * weight) // total_weight for weight in weights]
        remainder = absolute_units - sum(base_units)
        for index in range(remainder):
            base_units[index] += 1
        return [Money(_decimal_from_units(sign * units_for_part, target_scale), self.currency, target_scale) for units_for_part in base_units]

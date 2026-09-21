# SPDX-License-Identifier: MPL-2.0
from __future__ import annotations

from copy import deepcopy
from decimal import Context, Decimal, Inexact, Rounded, ROUND_DOWN, ROUND_HALF_EVEN, ROUND_UP, getcontext, localcontext
from fractions import Fraction
import unittest

from finkore import FinKoreError, Money


class MoneyTests(unittest.TestCase):
    def assert_money_value(self, result: Money, expected: str) -> None:
        """Check exact numeric serialization and round-trip without prescribing trailing zeros."""
        serialized = result.to_portable()
        self.assertEqual(serialized["currency"], "EUR")
        self.assertEqual(Decimal(serialized["amount"]), Decimal(expected))
        restored = Money.from_portable(serialized)
        self.assertEqual(restored.amount, Decimal(expected))
        self.assertEqual(restored.currency, "EUR")

    def test_sign_reversal_and_cancellation_at_precision_boundaries(self) -> None:
        """MONEY-ARITHMETIC-003/007/009: preserve digits on both sides of precision 28."""
        amounts = [
            "1234567890123456789012345.67",  # 27 significant digits
            "12345678901234567890123456.78",  # 28 significant digits
            "123456789012345678901234567.89",  # 29 significant digits
            "1234567890123456789012345678.91",
            "0.00000000000000000000000000000000000000000000000001",
            "0.00",
        ]
        for amount in amounts:
            for sign in ("", "-"):
                with self.subTest(amount=amount, sign=sign), localcontext(Context(prec=28)):
                    source = {"amount": sign + amount, "currency": "EUR"}
                    value = Money.from_portable(source)
                    before = value.to_portable()
                    zero = Money.from_portable({"amount": "0", "currency": "EUR"})
                    opposite = amount if sign else "-" + amount
                    self.assert_money_value(zero.subtract(value), opposite)
                    self.assert_money_value(value.negate(), opposite)
                    self.assert_money_value(value.subtract(value), "0")
                    self.assert_money_value(value.add(value.negate()), "0")
                    self.assertEqual(value.to_portable(), before)
                    self.assert_money_value(zero, "0")

    def test_money_operations_preserve_caller_decimal_context(self) -> None:
        """MONEY-ARITHMETIC-007/008 and MONEY-ALLOCATION-008: context is not a rounding policy."""
        caller = getcontext()
        caller_state = repr(caller)
        for precision in (3, 28, 60):
            for mode in (ROUND_DOWN, ROUND_HALF_EVEN, ROUND_UP):
                for trap_rounding in (False, True):
                    with self.subTest(precision=precision, mode=mode, traps=trap_rounding):
                        with localcontext(Context(prec=precision, rounding=mode)) as context:
                            context.traps[Inexact] = trap_rounding
                            context.traps[Rounded] = trap_rounding
                            # Include an existing flag so clearing caller flags also fails.
                            context.flags[Inexact] = True
                            before = repr(context)
                            value = Money.from_portable({"amount": "123.45", "currency": "EUR"})
                            other = Money.from_portable({"amount": "23.45", "currency": "EUR"})
                            operations = [
                                (lambda: value.subtract(other), "100"),
                                (lambda: other.subtract(value), "-100"),
                                (lambda: value.negate(), "-123.45"),
                                (lambda: value.add(other), "146.90"),
                                (lambda: value.multiply("2"), "246.90"),
                                (lambda: value.divide("2"), "61.725"),
                                (lambda: value.apply_rate({"kind": "PERCENTAGE", "value": "10"}), "12.345"),
                                (lambda: value.round(1, "HALF_UP"), "123.5"),
                            ]
                            for operation, expected in operations:
                                self.assert_money_value(operation(), expected)
                                self.assertIs(getcontext(), context)
                                self.assertEqual(repr(context), before)
                            for allocation in ({"method": "EQUAL", "parts": 2}, {"method": "RATIO", "ratios": [1, 1]}):
                                parts = value.allocate(allocation, 2)
                                self.assertEqual(len(parts), 2)
                                self.assert_money_value(parts[0], "61.73")
                                self.assert_money_value(parts[1], "61.72")
                                self.assertEqual(sum(Fraction(part.amount) for part in parts), Fraction("123.45"))
                                self.assertEqual(repr(context), before)
                            self.assertEqual(value.compare(other), "GREATER")
                            self.assert_money_value(value, "123.45")
                            self.assert_money_value(other, "23.45")
                            self.assertEqual(repr(context), before)
                        self.assertIs(getcontext(), caller)
                        self.assertEqual(repr(caller), caller_state)

    def test_allocation_conserves_exact_signed_values_and_declared_order(self) -> None:
        """MONEY-ALLOCATION-005/007/008/010/011/012/013: conserve signed units in order."""
        tiny = "0." + "0" * 49 + "1"
        cases = [
            ("10.00", 2, {"method": "EQUAL", "parts": 3}, ["3.34", "3.33", "3.33"]),
            ("10.00", 2, {"method": "RATIO", "ratios": [1, 2, 3]}, ["1.67", "3.33", "5.00"]),
            ("1234567890123456789012345678.91", 2, {"method": "RATIO", "ratios": [1, 1]},
             ["617283945061728394506172839.46", "617283945061728394506172839.45"]),
            (tiny, 50, {"method": "EQUAL", "parts": 3}, [tiny, "0", "0"]),
            ("0.00", 2, {"method": "RATIO", "ratios": [3, 1]}, ["0", "0"]),
        ]
        for amount, scale, allocation, expected in cases:
            for sign in ("", "-"):
                with self.subTest(amount=amount, sign=sign, allocation=allocation), localcontext(Context(prec=3)):
                    value = Money.from_portable({"amount": sign + amount, "currency": "EUR"})
                    before = value.to_portable()
                    allocation_before = deepcopy(allocation)
                    parts = value.allocate(allocation, scale)
                    self.assertEqual(len(parts), len(expected))
                    for part, expected_amount in zip(parts, expected, strict=True):
                        self.assert_money_value(part, sign + expected_amount)
                    self.assertEqual(sum(Fraction(part.amount) for part in parts), Fraction(sign + amount))
                    self.assertEqual([part.to_portable() for part in value.allocate(allocation, scale)],
                                     [part.to_portable() for part in parts])
                    self.assertEqual(value.to_portable(), before)
                    self.assertEqual(allocation, allocation_before)

    def test_failed_money_operations_preserve_values_requests_and_context(self) -> None:
        """MONEY-ERROR-007 and MONEY-ALLOCATION-013: failures cannot alter operands or context."""
        with localcontext(Context(prec=3, rounding=ROUND_UP)) as context:
            value = Money.from_portable({"amount": "123.451", "currency": "EUR"})
            other = Money.from_portable({"amount": "1", "currency": "USD"})
            source_before, other_before, context_before = value.to_portable(), other.to_portable(), repr(context)
            allocation = {"method": "RATIO", "ratios": [1, 2]}
            allocation_before = deepcopy(allocation)
            for operation, code in [
                (lambda: value.subtract(other), "FINKORE_MONEY_CURRENCY_MISMATCH"),
                (lambda: value.allocate(allocation, 2), "FINKORE_MONEY_ROUNDING_REQUIRED"),
                (lambda: value.allocate(allocation, 51), "FINKORE_MONEY_INVALID_ALLOCATION"),
            ]:
                with self.subTest(code=code), self.assertRaises(FinKoreError) as raised:
                    operation()
                self.assertEqual(raised.exception.code, code)
                self.assertEqual(value.to_portable(), source_before)
                self.assertEqual(other.to_portable(), other_before)
                self.assertEqual(allocation, allocation_before)
                self.assertEqual(repr(context), context_before)

    def test_subtracts_high_precision_right_operand_exactly(self) -> None:
        """MONEY-ARITHMETIC-007/009: sign reversal must not round the right operand."""
        with localcontext(Context(prec=28, rounding=ROUND_HALF_EVEN)):
            left_input = {"amount": "0", "currency": "EUR"}
            right_input = {"amount": "1234567890123456789012345678.91", "currency": "EUR"}
            left = Money.from_portable(left_input)
            right = Money.from_portable(right_input)
            result = left.subtract(right)
            self.assertEqual(left.to_portable(), left_input)
            self.assertEqual(right.to_portable(), right_input)
            self.assertEqual(result.to_portable(), {"amount": "-1234567890123456789012345678.91", "currency": "EUR"})

    def test_negates_high_precision_amount_exactly(self) -> None:
        """MONEY-ARITHMETIC-003/007/009: negation changes only the numeric sign."""
        with localcontext(Context(prec=28, rounding=ROUND_HALF_EVEN)):
            source = {"amount": "1234567890123456789012345678.91", "currency": "EUR"}
            value = Money.from_portable(source)
            result = value.negate()
            self.assertEqual(value.to_portable(), source)
            self.assertEqual(result.to_portable(), {"amount": "-1234567890123456789012345678.91", "currency": "EUR"})

    def test_single_part_allocation_preserves_high_precision_source(self) -> None:
        """MONEY-ALLOCATION-003/007/008/013: one part must conserve the exact source."""
        with localcontext(Context(prec=28, rounding=ROUND_HALF_EVEN)):
            source = {"amount": "1234567890123456789012345678.91", "currency": "EUR"}
            value = Money.from_portable(source)
            parts = value.allocate({"method": "EQUAL", "parts": 1}, 2)
            self.assertEqual(value.to_portable(), source)
            self.assertEqual([part.to_portable() for part in parts], [source])

    def test_portable_errors_carry_codes(self) -> None:
        with self.assertRaises(FinKoreError) as context:
            Money.from_portable({"amount": "1e3", "currency": "EUR"})
        self.assertEqual(context.exception.code, "FINKORE_MONEY_INVALID_AMOUNT")

    def test_adds_exact_decimal_values_without_mutation(self) -> None:
        left = Money.from_portable({"amount": "0.1", "currency": "EUR"})
        right = Money.from_portable({"amount": "0.2", "currency": "EUR"})
        self.assertEqual(left.add(right).to_portable(), {"amount": "0.3", "currency": "EUR"})
        self.assertEqual(left.to_portable(), {"amount": "0.1", "currency": "EUR"})
        self.assertEqual(right.to_portable(), {"amount": "0.2", "currency": "EUR"})

    def test_rejects_currency_mismatch(self) -> None:
        left = Money.from_portable({"amount": "10.00", "currency": "EUR"})
        right = Money.from_portable({"amount": "10.00", "currency": "USD"})
        with self.assertRaises(FinKoreError) as context:
            left.compare(right)
        self.assertEqual(context.exception.code, "FINKORE_MONEY_CURRENCY_MISMATCH")

    def test_rounds_negative_boundaries(self) -> None:
        value = Money.from_portable({"amount": "-1.231", "currency": "EUR"})
        self.assertEqual(value.round(2, "DOWN").to_portable(), {"amount": "-1.23", "currency": "EUR"})
        self.assertEqual(value.round(2, "FLOOR").to_portable(), {"amount": "-1.24", "currency": "EUR"})

    def test_allocates_declared_order_remainder(self) -> None:
        value = Money.from_portable({"amount": "10.00", "currency": "USD"})
        self.assertEqual(
            [part.to_portable() for part in value.allocate({"method": "RATIO", "ratios": [3, 2, 1]}, 2)],
            [
                {"amount": "5.01", "currency": "USD"},
                {"amount": "3.33", "currency": "USD"},
                {"amount": "1.66", "currency": "USD"},
            ],
        )

    def test_allocation_integer_domain_is_portable(self) -> None:
        value = Money.from_portable({"amount": "10.00", "currency": "USD"})
        self.assertEqual(
            [part.to_portable() for part in value.allocate({"method": "RATIO", "ratios": [1.0, 2.0]}, 2.0)],
            [
                {"amount": "3.34", "currency": "USD"},
                {"amount": "6.66", "currency": "USD"},
            ],
        )
        self.assertEqual(
            [part.to_portable() for part in value.allocate({"method": "RATIO", "ratios": [Decimal("1.0"), Decimal("2.0")]}, Decimal("2.0"))],
            [
                {"amount": "3.34", "currency": "USD"},
                {"amount": "6.66", "currency": "USD"},
            ],
        )
        self.assertEqual(
            [part.to_portable() for part in value.allocate({"method": "RATIO", "ratios": [9007199254740991, 1]}, 2)],
            [
                {"amount": "10.00", "currency": "USD"},
                {"amount": "0.00", "currency": "USD"},
            ],
        )
        hundred = Money.from_portable({"amount": "1.00", "currency": "USD"}).allocate({"method": "EQUAL", "parts": 100}, 2)
        self.assertEqual(len(hundred), 100)
        self.assertTrue(all(part.to_portable() == {"amount": "0.01", "currency": "USD"} for part in hundred))
        self.assertEqual(
            [part.to_portable() for part in Money.from_portable({"amount": "1", "currency": "USD"}).allocate({"method": "EQUAL", "parts": 2}, 50)],
            [
                {"amount": "0.50000000000000000000000000000000000000000000000000", "currency": "USD"},
                {"amount": "0.50000000000000000000000000000000000000000000000000", "currency": "USD"},
            ],
        )

        invalid_requests = [
            ({"method": "RATIO", "ratios": [9007199254740992, 1]}, 2),
            ({"method": "EQUAL", "parts": 101}, 2),
            ({"method": "EQUAL", "parts": 2}, 51),
            ({"method": "RATIO", "ratios": ["2", 1]}, 2),
            ({"method": "RATIO", "ratios": [1.5, 1]}, 2),
            ("invalid", 2),
        ]
        for allocation, scale in invalid_requests:
            with self.subTest(allocation=allocation, scale=scale):
                with self.assertRaises(FinKoreError) as context:
                    value.allocate(allocation, scale)
                self.assertEqual(context.exception.code, "FINKORE_MONEY_INVALID_ALLOCATION")
                self.assertEqual(value.to_portable(), {"amount": "10.00", "currency": "USD"})

    def test_draft_06_large_decimal_operations_ignore_decimal_context_precision(self) -> None:
        left = Money.from_portable({"amount": "123456789012345678901234567890123456789012345678901234567890.12", "currency": "EUR"})
        right = Money.from_portable({"amount": "0.88", "currency": "EUR"})
        self.assertEqual(
            left.add(right).to_portable(),
            {"amount": "123456789012345678901234567890123456789012345678901234567891.00", "currency": "EUR"},
        )

        left = Money.from_portable({"amount": "-98765432109876543210987654321098765432109876543210.75", "currency": "USD"})
        right = Money.from_portable({"amount": "12345678901234567890.25", "currency": "USD"})
        self.assertEqual(
            left.subtract(right).to_portable(),
            {"amount": "-98765432109876543210987654321111111111011111111101.00", "currency": "USD"},
        )

        value = Money.from_portable({"amount": "123456789012345678901234567890.12", "currency": "JPY"})
        self.assertEqual(
            value.multiply("987654321098765432109876543210.98").to_portable(),
            {"amount": "121932631137021795226185032733862429504001414418287658588617.5176", "currency": "JPY"},
        )

    def test_draft_06_high_scale_rounding_and_rate_are_exact(self) -> None:
        value = Money.from_portable({"amount": "1.234567890123456789012345678901234567890123456789015", "currency": "EUR"})
        self.assertEqual(
            value.round(50, "HALF_EVEN").to_portable(),
            {"amount": "1.23456789012345678901234567890123456789012345678902", "currency": "EUR"},
        )

        value = Money.from_portable({"amount": "123456789012345678901234567890.12", "currency": "EUR"})
        self.assertEqual(
            value.apply_rate({"kind": "PERCENTAGE", "value": "1234567890.123456789"}).to_portable(),
            {"amount": "1524157875323883675034293577503386681.3431672002468", "currency": "EUR"},
        )


if __name__ == "__main__":
    unittest.main()

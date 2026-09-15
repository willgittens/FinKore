# SPDX-License-Identifier: MPL-2.0
"""Portable-code-bearing FinKore error model for Python APIs."""


class FinKoreError(Exception):
    """Base exception carrying a language-neutral FinKore portable error code.

    The Python class name is implementation-specific. Consumers that need
    portable semantics should inspect :attr:`code`.
    """

    def __init__(self, code: str, message: str | None = None) -> None:
        super().__init__(message or code)
        self.code = code

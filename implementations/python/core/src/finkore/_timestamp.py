# SPDX-License-Identifier: MPL-2.0
"""Strict parsing for the portable FinKore RFC 3339 timestamp profile."""

from __future__ import annotations

from datetime import date
import re
from typing import Any

_PORTABLE_TIMESTAMP = re.compile(
    r"^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})"
    r"(?:\.(\d{1,9}))?(Z|([+-])(\d{2}):(\d{2}))$",
    re.ASCII,
)
_UNIX_EPOCH_ORDINAL = date(1970, 1, 1).toordinal()


def parse_portable_timestamp(value: Any) -> tuple[int, int]:
    """Return exact epoch seconds and nanoseconds for a portable timestamp.

    @see SPEC-TIMESTAMP-001
    @see SPEC-TIMESTAMP-002
    @see SPEC-TIMESTAMP-003
    @see SPEC-TIMESTAMP-004
    @see SPEC-TIMESTAMP-005
    """

    if not isinstance(value, str):
        raise ValueError("invalid portable timestamp")
    match = _PORTABLE_TIMESTAMP.fullmatch(value)
    if match is None:
        raise ValueError("invalid portable timestamp")

    year, month, day, hour, minute, second = (int(match.group(index)) for index in range(1, 7))
    if year < 1 or hour > 23 or minute > 59 or second > 59:
        raise ValueError("invalid portable timestamp")
    calendar_date = date(year, month, day)

    zone = match.group(8)
    offset_seconds = 0
    if zone != "Z":
        sign = match.group(9)
        offset_hour = int(match.group(10))
        offset_minute = int(match.group(11))
        if offset_hour > 23 or offset_minute > 59 or (sign == "-" and offset_hour == 0 and offset_minute == 0):
            raise ValueError("invalid portable timestamp")
        offset_seconds = (offset_hour * 60 + offset_minute) * 60
        if sign == "-":
            offset_seconds = -offset_seconds

    fraction = match.group(7) or ""
    nanosecond = int(fraction.ljust(9, "0")) if fraction else 0
    local_second = (
        (calendar_date.toordinal() - _UNIX_EPOCH_ORDINAL) * 86400
        + hour * 3600
        + minute * 60
        + second
    )
    return local_second - offset_seconds, nanosecond

from pydantic import BaseModel, Field
from typing import Literal
from datetime import date

class IRSRequest(BaseModel):
    trade_date: date = Field(..., description="Trade date")
    effective_date: date = Field(..., description="Effective date")
    maturity_date: date = Field(..., description="Maturity date")
    notional: float = Field(..., gt=0, description="Notional amount")
    fixed_rate: float = Field(..., gt=0, description="Fixed rate")
    float_spread: float = Field(..., description="Floating rate spread")
    currency: str = Field(..., description="Currency code")
    fixed_frequency: Literal["1M", "3M", "6M", "12M"] = Field(..., description="Fixed leg payment frequency")
    float_frequency: Literal["1M", "3M", "6M", "12M"] = Field(..., description="Floating leg payment frequency")
    day_count_fixed: Literal["30/360", "ACT/360", "ACT/365"] = Field(..., description="Day count convention for fixed leg")
    day_count_float: Literal["30/360", "ACT/360", "ACT/365"] = Field(..., description="Day count convention for floating leg")
    business_day_convention: Literal["Following", "Modified Following", "Preceding"] = Field(..., description="Business day convention")
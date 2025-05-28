from pydantic import BaseModel, Field
from typing import Literal

class GeometricAsianOptionRequest(BaseModel):
    S: float = Field(..., gt=0, description="Current price of the underlying asset")
    K: float = Field(..., gt=0, description="Strike price of the option")
    T: float = Field(..., gt=0, description="Time to expiration in years")
    r: float = Field(..., gt=0, description="Risk-free interest rate")
    sigma: float = Field(..., gt=0, description="Volatility")
    n: int = Field(..., gt=0, description="Number of periods")
    option_type: Literal["call", "put"] = Field(..., description="Type of option")
    
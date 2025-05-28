from pydantic import BaseModel, Field
from typing import Literal

class ArithmeticMeanBasketOptionRequest(BaseModel):
    S1: float = Field(..., gt=0, description="Current price of the first underlying asset")
    S2: float = Field(..., gt=0, description="Current price of the second underlying asset")
    sigma1: float = Field(..., gt=0, description="Volatility of the first underlying asset")
    sigma2: float = Field(..., gt=0, description="Volatility of the second underlying asset")
    r: float = Field(..., gt=0, description="Risk-free interest rate")
    K: float = Field(..., gt=0, description="Strike price of the option")
    T: float = Field(..., gt=0, description="Time to expiration in years")
    rho: float = Field(..., ge=-1, le=1, description="Correlation coefficient between the two assets")
    m: int = Field(..., gt=0, description="Number of simulations (paths)")
    option_type: Literal["call", "put"] = Field(..., description="Type of option")
    control_variate: Literal['none', 'geometric'] = Field(..., description="Control variate method to use")
    
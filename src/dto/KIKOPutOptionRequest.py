from pydantic import BaseModel, Field

class KIKOPutOptionRequest(BaseModel):
    S: float = Field(..., gt=0, description="Current price of the underlying asset")
    K: float = Field(..., gt=0, description="Strike price of the option")
    T: float = Field(..., gt=0, description="Time to expiration in years")
    r: float = Field(..., gt=0, description="Risk-free interest rate")
    sigma: float = Field(..., gt=0, description="Volatility")
    L: float = Field(..., gt=0, description="Lower barrier")
    U: float = Field(..., gt=0, description="Upper barrier")
    n: int = Field(..., gt=0, description="Number of time steps")
    R: float = Field(..., ge=0, description="Rebate amount")
    
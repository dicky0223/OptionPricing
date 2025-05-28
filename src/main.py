from fastapi import FastAPI, APIRouter, HTTPException
from fastapi.staticfiles import StaticFiles
import numpy as np
import math
from .dto.EuropeanOptionRequest import EuropeanOptionRequest
from .dto.ImpliedVolatilityRequest import ImpliedVolatilityRequest
from .dto.GeometricAsianOptionRequest import GeometricAsianOptionRequest
from .dto.GeometricBasketOptionRequest import GeometricBasketOptionRequest
from .dto.ArithmeticAsianOptionRequest import ArithmeticAsianOptionRequest
from .dto.ArithmeticMeanBasketOptionRequest import ArithmeticMeanBasketOptionRequest
from .dto.AmericanOptionRequest import AmericanOptionRequest
from .dto.KIKOPutOptionRequest import KIKOPutOptionRequest
from .service.BlackScholes import BlackScholes
from .service.ImpliedVolatility import ImpliedVolatility
from .service.ClosedFormOption import ClosedFormOption
from .service.ArithmeticOption import ArithmeticOption
from .service.AmericanOption import AmericanOption
from .service.KIKOPutOption import KIKOPutOption
from fastapi.middleware.cors import CORSMiddleware

def is_valid_float(value):
    return isinstance(value, float) and not math.isnan(value) and not np.isnan(value)


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api_router = APIRouter(prefix="/api")

@api_router.post("/black-scholes-european-option")
def calculate_black_scholes_european_option(request: EuropeanOptionRequest):
    try:
        price = BlackScholes.european_option_price(
            request.S,
            request.K,
            request.T,
            request.r,
            request.sigma,
            request.q,
            request.option_type
        )

        return {"price": price, "input": request.dict()}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@api_router.post("/implied-volatility")
def calculate_implied_volatility(request: ImpliedVolatilityRequest):
    try:
        implied_volatility = ImpliedVolatility.implied_volatility(
            request.S,
            request.K,
            request.T,
            request.r,
            request.q,
            request.option_premium,
            request.option_type
        )

        if is_valid_float(implied_volatility):
            return {"implied_volatility": implied_volatility, "input": request.dict()}
        else:
            return {"implied_volatility": "NaN", "input": request.dict()}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
@api_router.post("/closed-form-geometric-asian-option")
def calculate_closed_form_geometric_asian_option(request: GeometricAsianOptionRequest):
    try:
        price = ClosedFormOption.geometric_asian_option_price(
            request.S,
            request.K,
            request.T,
            request.r,
            request.sigma,
            request.n,
            request.option_type
        )

        if is_valid_float(price):
            return {"price": price, "input": request.dict()}
        else:
            return {"price": "NaN", "input": request.dict()}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@api_router.post("/closed-form-geometric-basket-option")
def calculate_closed_form_geometric_basket_option(request: GeometricBasketOptionRequest):
    try:
        price = ClosedFormOption.geometric_basket_option_price(
            request.S1,
            request.S2,
            request.sigma1,
            request.sigma2,
            request.r,
            request.K,
            request.T,
            request.rho,
            request.option_type
        )

        if is_valid_float(price):
            return {"price": price, "input": request.dict()}
        else:
            return {"price": "NaN", "input": request.dict()}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@api_router.post("/monte-carlo-arithmetic-asian-option")
def calculate_monte_carlo_arithmetic_asian_option(request: ArithmeticAsianOptionRequest):
    try:
        price, confident_interval = ArithmeticOption.arithmetic_asian_option_price(
            request.S,
            request.K,
            request.T,
            request.r,
            request.sigma,
            request.n,
            request.m,
            request.option_type,
            request.control_variate
        )

        if is_valid_float(price) and is_valid_float(confident_interval[0]) and is_valid_float(confident_interval[1]):
            return {"price": price, "confident_interval": confident_interval, "input": request.dict()}
        else:
            return {"price": "NaN", "confident_interval": ("NaN", "NaN"), "input": request.dict()}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@api_router.post("/monte-carlo-arithmetic-mean-basket-option")
def calculate_monte_carlo_arithmetic_mean_basket_option(request: ArithmeticMeanBasketOptionRequest):
    try:
        price, confident_interval = ArithmeticOption.arithemetic_mean_basket_option_price(
            request.S1,
            request.S2,
            request.sigma1,
            request.sigma2,
            request.r,
            request.K,
            request.T,
            request.rho,
            request.m,
            request.option_type,
            request.control_variate
        )

        if is_valid_float(price) and is_valid_float(confident_interval[0]) and is_valid_float(confident_interval[1]):
            return {"price": price, "confident_interval": confident_interval, "input": request.dict()}
        else:
            return {"price": "NaN", "confident_interval": ("NaN", "NaN"), "input": request.dict()}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
@api_router.post("/quasi-monte-carlo-kiko-put-option")
def calculate_quasi_monte_carlo_kiko_put_option(request: KIKOPutOptionRequest):
    try:
        price, delta, confident_interval = KIKOPutOption.price_kiko_put_with_delta(
            request.S,
            request.K,
            request.T,
            request.r,
            request.sigma,
            request.L,
            request.U,
            request.n,
            request.R,
        )

        if is_valid_float(price) and is_valid_float(delta) and is_valid_float(confident_interval[0]) and is_valid_float(confident_interval[1]):
            return {"price": price, "delta": delta, "confident_interval": confident_interval, "input": request.dict()}
        else:
            return {"price": "NaN", "delta": "NaN", "confident_interval": ("NaN", "NaN"), "input": request.dict()}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@api_router.post("/binomial-tree-american-option")
def calculate_binomial_tree_american_option(request: AmericanOptionRequest):
    try:
        price = AmericanOption.binomial_tree_american_option_price(
            request.S,
            request.K,
            request.T,
            request.r,
            request.sigma,
            request.n,
            request.option_type
        )

        if is_valid_float(price):
            return {"price": price, "input": request.dict()}
        else:
            return {"price": "NaN", "input": request.dict()}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


app.include_router(api_router)

app.mount("/", StaticFiles(directory="src/static", html=True), name="static")

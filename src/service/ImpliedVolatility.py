import numpy as np
from scipy.stats import norm
from .BlackScholes import BlackScholes

class ImpliedVolatility:
    @staticmethod
    def vega(S, K, T, r, sigma, q):
        d1 = (np.log(S / K) + (r - q + 0.5 * sigma ** 2) * T) / (sigma * np.sqrt(T))
        return S * np.exp(-q * T) * np.sqrt(T) * norm.pdf(d1)

    @staticmethod
    def implied_volatility(S, K, T, r, q, option_premium, option_type = 'call', tolerance=1e-8, max_iter=100):
        sigmahat = np.sqrt(2 * abs(np.log(S / K) + (r - q) * T) / T)
        sigmadiff = 1
        n = 1
        sigma = sigmahat
        while sigmadiff >= tolerance and n < max_iter:
            C = BlackScholes.european_option_price(S, K, T, r, sigma, q, option_type)
            vega = ImpliedVolatility.vega(S, K, T, r, sigma, q)
            increment = (C - option_premium) / vega
            sigma -= increment
            n += 1
            sigmadiff = abs(increment)

        return sigma
        
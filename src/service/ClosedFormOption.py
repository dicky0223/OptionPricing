import numpy as np
from scipy.stats import norm

class ClosedFormOption:
    @staticmethod
    def geometric_asian_option_price(S, K, T, r, sigma, n, option_type='call'):
        sigma_adj = sigma * np.sqrt((n+1) * (2*n+1) / (6 * n**2))
        r_adj = (r - 0.5 * sigma**2) * (n+1) / (2*n) + 0.5 * sigma_adj**2
    
        d1 = (np.log(S / K) + (r_adj + 0.5 * sigma_adj**2) * T) / (sigma_adj * np.sqrt(T))
        d2 = d1 - sigma_adj * np.sqrt(T)
    
        if option_type == 'call':
            return np.exp(-r * T) * (S * np.exp(r_adj * T) * norm.cdf(d1) - K * norm.cdf(d2))
        elif option_type == 'put':
            return np.exp(-r * T) * (K * norm.cdf(-d2) - S * np.exp(r_adj * T) * norm.cdf(-d1))


    @staticmethod
    def geometric_basket_option_price(S1, S2, sigma1, sigma2, r, K, T, rho, option_type='call'):
        sigma = np.sqrt((sigma1**2 + sigma2**2 + 2*rho*sigma1*sigma2) / 4)
        b = r - 0.5 * (sigma1**2 + sigma2**2) / 2 + 0.5 * sigma**2
        S0 = np.sqrt(S1 * S2)
    
        d1 = (np.log(S0/K) + (b + 0.5 * sigma**2) * T) / (sigma * np.sqrt(T))
        d2 = d1 - sigma * np.sqrt(T)
    
        if option_type == 'call':
            return np.exp(-r * T) * (S0 * np.exp(b * T) * norm.cdf(d1) - K * norm.cdf(d2))
        elif option_type == 'put':
            return np.exp(-r * T) * (K * norm.cdf(-d2) - S0 * np.exp(b * T) * norm.cdf(-d1))

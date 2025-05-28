import numpy as np

class AmericanOption:
    @staticmethod
    def binomial_tree_american_option_price(S, K, T, r, sigma, n, option_type='call'):
        dt = T / n
        u = np.exp(sigma * np.sqrt(dt))
        d = 1 / u
        p = (np.exp(r * dt) - d) / (u - d)
        q = 1 - p
        asset_prices = np.zeros(n + 1)
        for i in range(n + 1):
            asset_prices[i] = S * (u ** (n - i)) * (d ** i)
        option_values = np.zeros(n + 1)
        if option_type == 'call':
            option_values = np.maximum(0, asset_prices - K)
        elif option_type == 'put':
            option_values = np.maximum(0, K - asset_prices)
        for j in range(n - 1, -1, -1):
            for i in range(j + 1):
                option_values[i] = np.exp(-r * dt) * (p * option_values[i] + q * option_values[i + 1])
                asset_prices[i] = S * (u ** (j - i)) * (d ** i)
                if option_type == 'call':
                    option_values[i] = np.maximum(option_values[i], asset_prices[i] - K)
                elif option_type == 'put':
                    option_values[i] = np.maximum(option_values[i], K - asset_prices[i])
        return option_values[0]
        
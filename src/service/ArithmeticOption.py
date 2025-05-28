import numpy as np
from scipy.stats import norm

class ArithmeticOption:
    @staticmethod
    def arithmetic_asian_option_price(S, K, T, r, sigma, n, m, option_type='call', control_variate='none'):
        rng = np.random.default_rng(7405)

        dt = T / n
        S_t = np.zeros((m, n+1))
        S_t[:, 0] = S

        Z = rng.standard_normal((m, n))
        scaling = np.exp((r - 0.5 * sigma**2) * dt + sigma * np.sqrt(dt) * Z)
        S_t[:, 1:] = S[:, np.newaxis] * np.cumprod(scaling, axis=1)

        S_avg = np.mean(S_t[:, 1:], axis=1)
        if option_type == 'call':
            payoffs = np.maximum(S_avg - K, 0)
        elif option_type == 'put':
            payoffs = np.maximum(K - S_avg, 0)

        if control_variate == 'none':
            price = np.exp(-r * T) * np.mean(payoffs)
            std_error = np.exp(-r * T) * np.std(payoffs) / np.sqrt(m)
            conf_interval = [price - 1.96 * std_error, price + 1.96 * std_error]

            print(f"Price: {price}, Std Error: {std_error}, Confidence Interval: {conf_interval}")
            
            return price, conf_interval

        elif control_variate == 'geometric':
            geometric_avg = np.exp(np.mean(np.log(S_t[:, 1:]), axis=1))

            if option_type == 'call':
                geo_payoffs = np.maximum(geometric_avg - K, 0)
            else:
                geo_payoffs = np.maximum(K - geometric_avg, 0)

            sigma_adj = sigma*np.sqrt((n+1)*(2*n+1)/(6*n**2))
            mu_adj = (r- 0.5 * sigma**2) * (n + 1)/(2 * n)+ 0.5 *sigma_adj**2
            d1 = (np.log(S/K) + (mu_adj + 0.5 * sigma_adj**2) * T) / (sigma_adj * np.sqrt(T))
            d2 = d1 - sigma_adj * np.sqrt(T)

            if option_type == 'call':
                geo_price = np.exp(-r * T) * (S * np.exp(mu_adj * T) * norm.cdf(d1) - K * norm.cdf(d2))
            else:
                geo_price = np.exp(-r * T) * (K * norm.cdf(-d2) - S * np.exp(mu_adj * T) * norm.cdf(-d1))

            cov = np.cov(payoffs, geo_payoffs)[0, 1]
            var = np.var(geo_payoffs)
            theta = cov / var

            cv_payoffs = payoffs - theta * (geo_payoffs - geo_price * np.exp(r * T))
            price = np.exp(-r * T) * np.mean(cv_payoffs)
            std_error = np.exp(-r * T) * np.std(cv_payoffs) / np.sqrt(m)
            conf_interval = [price - 1.96 * std_error, price + 1.96 * std_error]

            print(f"Price: {price}, Std Error: {std_error}, Confidence Interval: {conf_interval}")
            return price, conf_interval


    @staticmethod
    def arithemetic_mean_basket_option_price(S1, S2, sigma1, sigma2, r, K, T, rho, m, option_type='call', control_variate='none'):
        rng = np.random.default_rng(7405)

        Z1 = rng.standard_normal(m)
        Z2 = rho * Z1 + np.sqrt(1 - rho**2) * rng.standard_normal(m)

        S1_T = S1 * np.exp((r - 0.5 * sigma1**2) * T + sigma1 * np.sqrt(T) * Z1)
        S2_T = S2 * np.exp((r - 0.5 * sigma2**2) * T + sigma2 * np.sqrt(T) * Z2)


        Ba_T = (S1_T + S2_T) / 2
        if option_type == "call":
            arithmetic_bkst_payoff = np.maximum(Ba_T - K, 0)
        elif option_type == "put":
            arithmetic_bkst_payoff = np.maximum(K - Ba_T, 0)

        if control_variate == 'none':
            price = np.exp(-r * T) * np.mean(arithmetic_bkst_payoff)
            price_std = np.std(np.exp(-r * T)*arithmetic_bkst_payoff)
            conf_interval = [price - 1.96 * price_std / np.sqrt(m), price + 1.96 * price_std / np.sqrt(m)]
            print(f"Price: {price}, Std Error: {price_std}, Confidence Interval: {conf_interval}")
            return price, conf_interval
            
        Bg_T = np.sqrt(S1_T * S2_T)
        if option_type == "call":
            geometric_bkst_payoff = np.maximum(Bg_T - K, 0)
        elif option_type == "put":
            geometric_bkst_payoff = np.maximum(K - Bg_T, 0)

        geometric_bkt_closeform_price = ArithmeticOption.geometric_basket_price(S1, S2, sigma1, sigma2, rho, r, T, K, option_type)

        arithmetic_bkst_price = np.exp(-r*T)*arithmetic_bkst_payoff
        geometric_bkst_price = np.exp(-r*T)*geometric_bkst_payoff

        cov_fg = np.cov(arithmetic_bkst_price, geometric_bkst_price)[0, 1]
        var_g = np.var(geometric_bkst_price)
        theta = cov_fg / var_g

        adj_price= arithmetic_bkst_price+ theta*(geometric_bkt_closeform_price - geometric_bkst_price)
        adj_price_mu = np.mean(adj_price)
        adj_price_std = np.std(adj_price)

        conf_interval = [adj_price_mu - 1.96 * adj_price_std / np.sqrt(m), adj_price_mu + 1.96 * adj_price_std / np.sqrt(m)]
        print(f"Price: {adj_price_mu}, Std Error: {adj_price_std}, Confidence Interval: {conf_interval}")
        return adj_price_mu, conf_interval

    @staticmethod
    def geometric_basket_price(S1, S2, sigma1, sigma2, rho, r, T, K, option_type="call"):
        sigma_bg = np.sqrt((sigma1**2 + sigma2**2 + 2*rho*sigma1*sigma2)/4 ) #revsied code from dicky
        mu_bg = r - 0.5 * (sigma1**2 + sigma2**2)*0.5 + 0.5 * sigma_bg**2
        Bg0 = np.sqrt(S1 * S2)
        d1 = (np.log(Bg0 / K) + (mu_bg + 0.5 * sigma_bg**2) * T) / (sigma_bg * np.sqrt(T))
        d2 = d1 - sigma_bg * np.sqrt(T)

        if option_type == "call":
            price = np.exp(-r * T) * (Bg0 * np.exp(mu_bg * T) * norm.cdf(d1) - K * norm.cdf(d2))
        elif option_type == "put":
            price = np.exp(-r * T) * (K * norm.cdf(-d2) - Bg0 * np.exp(mu_bg * T) * norm.cdf(-d1))
        else:
            raise ValueError("Invalid option_type. Must be 'call' or 'put'.")
        return price

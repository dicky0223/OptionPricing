import numpy as np
import math
import pandas as pd
from scipy.stats import norm, qmc
import dask.dataframe as dd
class KIKOPutOption:
    @staticmethod
    def price_kiko_put_with_delta(S, K, T, r, sigma, L, U, n, R, seed=7405, deltaS=0.2):
        np.random.seed(seed)
        deltaT = T / n
        M = int(1e6)
        sequencer = qmc.Sobol(d=n, seed=seed)
        X = np.array(sequencer.random(n=M))
        Z = norm.ppf(X)

        samples = (r - 0.5 * sigma**2) * deltaT + sigma * np.sqrt(deltaT) * Z
        df_samples = pd.DataFrame(samples)
        df_samples_cumsum = df_samples.cumsum(axis=1)

        ddf_stocks_base = dd.from_pandas(df_samples_cumsum, npartitions=4)

        list_s = [("down", S - deltaS), ("up", S + deltaS), ("S", S)]
        value_local = {}

        for (s_str, s) in list_s:
            ddf_stocks = ddf_stocks_base.map_partitions(lambda df: s * np.exp(df))
            
            def calculate_payoff(row):
                ds_path_local = row.values
                price_max = ds_path_local.max()
                price_min = ds_path_local.min()

                if price_max >= U:
                    knockout_time = np.argmax(ds_path_local >= U) + 1
                    return R * np.exp(-r * knockout_time * deltaT)
                elif price_min <= L:
                    final_price = ds_path_local[-1]
                    return np.exp(-r * T) * max(K - final_price, 0)
                else:
                    return 0

            payoffs = ddf_stocks.apply(calculate_payoff, axis=1, meta=('payoff', 'float64'))
            
            value = payoffs.mean().compute()
            std = payoffs.std().compute()
            value_local[s_str] = value

            if s_str == 'S':
                value_local['std'] = std
                conf_interval_lower = value - 1.96 * std / math.sqrt(M)
                conf_interval_upper = value + 1.96 * std / math.sqrt(M)
                value_local['conf_interval'] = (conf_interval_lower, conf_interval_upper)

        delta = (value_local['up'] - value_local['down']) / (2 * deltaS)

        return value_local['S'], delta, value_local['conf_interval']
    
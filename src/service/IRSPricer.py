import numpy as np
from datetime import date, timedelta
import pandas as pd

class IRSPricer:
    def __init__(self, curve_data: dict):
        """
        Initialize IRS Pricer with curve data
        curve_data: Dictionary containing discount factors and forward rates
        """
        self.curve_data = curve_data

    @staticmethod
    def get_payment_dates(start_date: date, end_date: date, frequency: str) -> list:
        """Generate payment dates based on frequency"""
        dates = []
        current = start_date
        freq_months = {"1M": 1, "3M": 3, "6M": 6, "12M": 12}
        months = freq_months[frequency]
        
        while current <= end_date:
            dates.append(current)
            # Add months to current date
            current = date(current.year + (current.month + months - 1) // 12,
                         (current.month + months - 1) % 12 + 1,
                         current.day)
        return dates

    @staticmethod
    def calculate_day_count_fraction(start_date: date, end_date: date, convention: str) -> float:
        """Calculate day count fraction based on convention"""
        if convention == "30/360":
            return (360 * (end_date.year - start_date.year) + 
                   30 * (end_date.month - start_date.month) +
                   (end_date.day - start_date.day)) / 360
        elif convention == "ACT/360":
            return (end_date - start_date).days / 360
        elif convention == "ACT/365":
            return (end_date - start_date).days / 365
        
    def price_irs(self, trade_details: dict) -> dict:
        """
        Price an Interest Rate Swap
        Returns dictionary with NPV and other metrics
        """
        fixed_dates = self.get_payment_dates(
            trade_details["effective_date"],
            trade_details["maturity_date"],
            trade_details["fixed_frequency"]
        )
        
        float_dates = self.get_payment_dates(
            trade_details["effective_date"],
            trade_details["maturity_date"],
            trade_details["float_frequency"]
        )

        # Calculate fixed leg cash flows
        fixed_leg_cf = []
        for i in range(1, len(fixed_dates)):
            dcf = self.calculate_day_count_fraction(
                fixed_dates[i-1],
                fixed_dates[i],
                trade_details["day_count_fixed"]
            )
            cf = trade_details["notional"] * trade_details["fixed_rate"] * dcf
            fixed_leg_cf.append({
                "date": fixed_dates[i],
                "amount": cf,
                "df": self.curve_data["discount_factors"].get(fixed_dates[i], 1.0)
            })

        # Calculate floating leg cash flows (using forward rates)
        float_leg_cf = []
        for i in range(1, len(float_dates)):
            dcf = self.calculate_day_count_fraction(
                float_dates[i-1],
                float_dates[i],
                trade_details["day_count_float"]
            )
            forward_rate = self.curve_data["forward_rates"].get(float_dates[i-1], 0.0)
            cf = trade_details["notional"] * (forward_rate + trade_details["float_spread"]) * dcf
            float_leg_cf.append({
                "date": float_dates[i],
                "amount": cf,
                "df": self.curve_data["discount_factors"].get(float_dates[i], 1.0)
            })

        # Calculate NPV
        fixed_npv = sum(cf["amount"] * cf["df"] for cf in fixed_leg_cf)
        float_npv = sum(cf["amount"] * cf["df"] for cf in float_leg_cf)
        
        return {
            "npv": float_npv - fixed_npv,
            "fixed_leg_npv": fixed_npv,
            "float_leg_npv": float_npv,
            "fixed_cashflows": fixed_leg_cf,
            "float_cashflows": float_leg_cf
        }
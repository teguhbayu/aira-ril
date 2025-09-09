
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.preprocessing import PolynomialFeatures
from sklearn.linear_model import Ridge
import seaborn as sns
from sklearn.model_selection import train_test_split


df = pd.read_csv('dataset.csv')
df.head()

X = df[['valve_position_percent', 'water_level_cm']].values
y = df['generated_voltage_v'].values


# Split data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, train_size=0.8)


# Train final model with best degree
poly = PolynomialFeatures(degree=2, include_bias=False)
X_poly_train = poly.fit_transform(X_train)
X_poly_test = poly.transform(X_test)

model = Ridge(alpha=1.0)
model.fit(X_poly_train, y_train)




# try valve optimizer
class ValveOptimizer:
    def __init__(self, model, poly):
        self.model = model
        self.poly = poly
    
    def predict_voltage(self, valve_position, water_level):
        X_input = np.array([[valve_position, water_level]])
        X_poly = self.poly.transform(X_input)
        return max(0, self.model.predict(X_poly)[0])
    
    def optimize_valve_position(self, current_water_level, min_water_level=45, max_water_level=100, safety_buffer=5):
        min_safe_level = min_water_level + safety_buffer
        valve_positions = np.linspace(0, 100, 201)
        
        best_voltage = -np.inf
        best_valve_position = 0
        
        for valve_pos in valve_positions:
            voltage = self.predict_voltage(valve_pos, current_water_level)
            water_consumption_rate = valve_pos / 100.0 * 0.5
            estimated_new_level = current_water_level - water_consumption_rate
            
            if estimated_new_level >= min_safe_level:
                if voltage > best_voltage:
                    best_voltage = voltage
                    best_valve_position = valve_pos
        
        return {
            'optimal_valve_position': best_valve_position,
            'predicted_voltage': best_voltage,
            'estimated_water_level_after': current_water_level - (best_valve_position/100 * 0.5),
            'safety_status': 'safe' if current_water_level >= min_safe_level else 'low'
        }
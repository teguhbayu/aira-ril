import joblib

import numpy as np

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

def predict_v(valve_pos:int, water_lev:int):
    model = joblib.load("model.pkl")
    poly = joblib.load("poly.pkl")
    

    optimizer = ValveOptimizer(model=model, poly=poly)
    
    return optimizer.predict_voltage(valve_position=valve_pos, water_level=water_lev)
from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import numpy as np

app = FastAPI()

# Load trained ML model
model = joblib.load("model/ev_range_model.pkl")

# Define request body model
class InputData(BaseModel):
    trip_distance :float
    elevation_change : float
    traffic_delay : float
    battery_consumption : float

@app.get("/")
def home():
    return {"message": "EV Range Prediction API is running!"}

@app.post("/predict/")
def predict(data: InputData):
    # Convert input to NumPy array
    input_data = np.array([[data.trip_distance, data.elevation_change, data.traffic_delay, data.battery_consumption]])

    # Get prediction
    predicted_range = model.predict(input_data)[0]
    
    return {"predicted_range_km": float(predicted_range)}

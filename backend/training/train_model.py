import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, r2_score


print("Loading cleaned dataset...")

df = pd.read_csv("E:\aqi_mlops_project\data\clean_aqi_data.csv")

print("Dataset shape:", df.shape)


# ---------------------------
# Feature Selection
# ---------------------------

features = [
    "PM2.5",
    "PM10",
    "NO2",
    "SO2",
    "CO",
    "O3",
    "Temperature",
    "Humidity",
    "Wind Speed"
]

X = df[features]
y = df["AQI"]


# ---------------------------
# Train Test Split
# ---------------------------

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42
)

print("Training samples:", len(X_train))
print("Testing samples:", len(X_test))


# ---------------------------
# Model Training
# ---------------------------

print("Training RandomForest model...")

model = RandomForestRegressor(
    n_estimators=300,
    max_depth=12,
    random_state=42
)

model.fit(X_train, y_train)

print("Model training completed")


# ---------------------------
# Model Evaluation
# ---------------------------

predictions = model.predict(X_test)

mae = mean_absolute_error(y_test, predictions)
r2 = r2_score(y_test, predictions)

print("\nModel Evaluation")
print("MAE:", mae)
print("R2 Score:", r2)


# ---------------------------
# Save Model
# ---------------------------

joblib.dump(model, "models/aqi_model.pkl")

print("\nModel saved successfully")
print("Location: models/aqi_model.pkl")

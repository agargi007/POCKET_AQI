import pandas as pd

# Load dataset
df = pd.read_csv("data/aqi_data.csv")

print("Dataset Loaded")
print("Initial Shape:", df.shape)


# ---------------------------
# Handle Missing Values
# ---------------------------

df = df.dropna()

print("After removing missing values:", df.shape)


# ---------------------------
# Remove Duplicates
# ---------------------------

df = df.drop_duplicates()

print("After removing duplicates:", df.shape)


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

target = "AQI"

df = df[features + [target]]


# ---------------------------
# AQI Category Creation
# ---------------------------

def categorize_aqi(aqi):

    if aqi <= 50:
        return "Good"

    elif aqi <= 100:
        return "Moderate"

    elif aqi <= 150:
        return "Unhealthy for Sensitive"

    elif aqi <= 200:
        return "Unhealthy"

    elif aqi <= 300:
        return "Very Unhealthy"

    else:
        return "Hazardous"


df["AQI_Category"] = df["AQI"].apply(categorize_aqi)


print("AQI categories added")


# ---------------------------
# Save Clean Dataset
# ---------------------------

df.to_csv("data/clean_aqi_data.csv", index=False)

print("Clean dataset saved as clean_aqi_data.csv")

print(df.head())
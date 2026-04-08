// Wait until page is fully loaded
document.addEventListener("DOMContentLoaded", () => {

    const button = document.getElementById("predictBtn");

    // Attach button click event
    button.addEventListener("click", predictAQI);

});


// Main function
async function predictAQI() {

    const cityInput = document.getElementById("cityInput");
    const city = cityInput.value.trim();

    if (!city) {
        alert("Please enter a city name");
        return;
    }

    // Show loading state
    document.getElementById("aqiValue").innerText = "...";
    document.getElementById("aqiCategory").innerText = "Fetching data";
    document.getElementById("advisoryText").innerText = "Analyzing air quality...";

    try {

        const response = await fetch("http://127.0.0.1:8000/predict", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                city: city
            })
        });

        if (!response.ok) {
            throw new Error("Server error");
        }

        const data = await response.json();

        console.log("API response:", data);

        // Extract values from API response
        const aqi = Number(data.predicted_aqi);
        const category = data.category;
        const advisory = data.health_advisory;

        // Update UI
        document.getElementById("aqiValue").innerText =
            isNaN(aqi) ? "--" : Math.round(aqi);

        document.getElementById("aqiCategory").innerText =
            category || "Unknown";

        document.getElementById("advisoryText").innerText =
            advisory || "No advisory available";

        updateAQIColor(category);

    }

    catch (error) {

        console.error("API error:", error);

        document.getElementById("aqiValue").innerText = "--";
        document.getElementById("aqiCategory").innerText = "Error";
        document.getElementById("advisoryText").innerText =
            "Could not retrieve AQI data. Please try again.";

    }

}


// Change card color based on AQI category
function updateAQIColor(category) {

    const card = document.querySelector(".card");

    if (!card) return;

    switch (category) {

        case "Good":
            card.style.background = "#2ecc71";
            break;

        case "Moderate":
            card.style.background = "#f1c40f";
            break;

        case "Unhealthy":
            card.style.background = "#e67e22";
            break;

        case "Very Unhealthy":
            card.style.background = "#e74c3c";
            break;

        default:
            card.style.background = "rgba(255,255,255,0.1)";
    }

}
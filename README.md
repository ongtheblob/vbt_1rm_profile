# 🏋️ Velocity-Based Training (VBT) – 1RM Profiling System

A browser-based sports performance tool that estimates an athlete's One-Repetition Maximum (1RM) using the **Multi-Point Load–Velocity Method**.

The application uses exercise-specific velocity thresholds and linear regression to generate load–velocity profiles, estimate 1RM and monitor strength development over multiple testing sessions.

## 🎯 Project Overview

Velocity-Based Training (VBT) is an approach to resistance training that uses movement velocity to monitor performance and provide insights into an athlete's strength capabilities.

This project was developed to simplify the process of estimating 1RM through multiple load–velocity measurements, allowing coaches and sports practitioners to analyse performance without requiring manual calculations.

Users can input multiple load and velocity data points, generate a linear regression profile and estimate 1RM based on the selected exercise's reference velocity at 1RM (V1RM).

## ✨ Features

### 1. Athlete Information
- Record athlete name.
- Input body weight (kg).
- Record testing date.
- Organise testing sessions by athlete.

### 2. Exercise-Specific V1RM Reference Values

The application includes reference velocities for 10 exercises:

| Exercise | V1RM (m/s) |
|---|---:|
| Bench Press | 0.17 |
| Prone Bench Pull | 0.50 |
| Pull-Up | 0.23 |
| Seated Military Press | 0.19 |
| Lat Pulldown | 0.47 |
| Seated Cable Row | 0.40 |
| Squat | 0.30 |
| Deadlift | 0.15 |
| Hip Thrust | 0.25 |
| Leg Press | 0.21 |

### 3. Multi-Point Load–Velocity Profiling
- Select between 2 and 8 load–velocity data points.
- Input resistance load (kg).
- Input mean concentric velocity (m/s).
- Automatically generate a linear load–velocity profile.

### 4. Automatic 1RM Estimation

The application uses linear regression to establish the relationship between load and velocity.

**Linear regression equation:**

Load = a × Velocity + b

Where:
- a = Regression slope
- b = Regression intercept

Estimated 1RM is calculated using:

**Estimated 1RM = a × V1RM + b**

The result is displayed in kilograms.

### 5. Regression Analysis
The application calculates:
- Regression slope.
- Regression intercept.
- Coefficient of determination (R²).
- Indicative regression fit quality.

R² provides an indication of how closely the measured data follows the fitted linear relationship.

### 6. Data Visualisation
Interactive load–velocity graph displaying:
- Measured load–velocity points.
- Linear regression line.
- Estimated 1RM point.

### 7. Athlete Progress Tracking
- Save multiple testing sessions.
- Review previous testing results.
- Track estimated 1RM changes over time.
- Compare the latest estimated 1RM across exercises.
- Filter testing history by athlete name.

### 8. Data Export
- Export testing records as CSV.
- Open the browser's print function to save reports as PDF.
- Use exported CSV files for further analysis in Excel.

## 🛠️ Technologies Used

| Technology | Purpose |
|---|---|
| HTML5 | Website structure |
| CSS3 | Styling and responsive layout |
| JavaScript | Calculations and application logic |
| Chart.js | Interactive data visualisation |
| LocalStorage | Browser-based data persistence |
| GitHub Pages | Website hosting |


## 📊 How to Use

1. Enter the athlete's name, body weight and testing date.
2. Select the exercise being tested.
3. Choose the number of load–velocity data points.
4. Enter the corresponding loads and mean concentric velocities.
5. Click **Generate Load–Velocity Profile**.
6. Review the estimated 1RM, regression statistics and graph.
7. Click **Save Athlete Test** to store the results.
8. Access the athlete's previous testing sessions to monitor progress.
9. Export the testing history as CSV or PDF when required.

## ⚠️ Important Considerations

- The application assumes a linear relationship between load and mean concentric velocity.
- Exercise-specific V1RM values are reference assumptions and may not accurately represent every individual.
- Estimated 1RM accuracy depends on the quality and range of the collected data.
- Extrapolation beyond measured loads introduces uncertainty.
- R² indicates goodness of fit, not the accuracy of the estimated 1RM.
- The application is intended as a performance-monitoring aid and should not replace individualised testing and professional judgement.

## 💾 Data Storage

Athlete testing records are currently stored using browser LocalStorage.

This means:
- Records persist on the same browser and device.
- Data is not automatically shared between devices.
- Clearing browser storage may permanently remove saved records.
- CSV exports are recommended as regular backups.

## 🔮 Future Improvements

Potential future developments include:

- Supabase integration for centralised athlete databases.
- Multi-athlete management and athlete profiles.
- Cloud-based testing history and synchronisation.
- Automated athlete performance reports.
- Additional strength and power profiling tests.
- Comparison of training adaptations across testing periods.
- Integration with velocity-tracking devices.

## 👨‍💻 Author

Developed as part of a sports science and performance technology portfolio.

**Project:** Velocity-Based Training 1RM Profiling System

**Focus Areas:** Sports Science | Strength & Conditioning | Performance Testing | Data Visualisation | Web Development

---

*Built to make strength profiling, performance monitoring and sports-science data analysis more accessible.*

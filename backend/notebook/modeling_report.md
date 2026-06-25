# SteelSense Machine Learning Modeling Report

This report acts as a descriptive modeling notebook documenting the dataset characteristics, feature engineering, model training exploration, comparative evaluation, and deployment outcome.

---

## 1. Project Objective

The goal is to develop a classification model that accurately predicts the electrical load state of a steel manufacturing plant. telemetries are classified into three types:
* **`Light_Load`**
* **`Medium_Load`**
* **`Maximum_Load`**

Accurate prediction enables automated peak-shaving recommendations, reactive power charge management, and anomalies detection.

---

## 2. Dataset Overview

The model is trained on the **Steel Industry Energy Consumption** dataset containing **35,040 rows** representing telemetry readings at 15-minute intervals.

### Column Definitions

| Original Column Header | Lowercase Mapper | DataType | Description |
| :--- | :--- | :--- | :--- |
| `date` | *ignored* | `string` | Reading timestamp (DD/MM/YYYY HH:MM) |
| `Usage_kWh` | `usage_kwh` | `float` | Active electricity usage (kWh) |
| `Lagging_Current_Reactive.Power_kVarh` | `lagging_reactive` | `float` | Lagging reactive power (kVarh) |
| `Leading_Current_Reactive_Power_kVarh` | `leading_reactive` | `float` | Leading reactive power (kVarh) |
| `CO2(tCO2)` | *ignored* | `float` | Metric tons of carbon emissions |
| `Lagging_Current_Power_Factor` | `lagging_pf` | `float` | Lagging current power factor (%) |
| `Leading_Current_Power_Factor` | `leading_pf` | `float` | Leading current power factor (%) |
| `NSM` | `nsm` | `int` | Number of Seconds since Midnight |
| `WeekStatus` | `week_status` | `string` | `"Weekday"` or `"Weekend"` |
| `Day_of_week` | `day_of_week` | `string` | Day string (e.g. `"Monday"`) |
| `Load_Type` | `load_type` | `string` | Class target (`Light_Load`/`Medium_Load`/`Maximum_Load`) |

---

## 3. Data Processing & Preprocessing

The preprocessing pipeline ensures shape consistency and numeric normalization before prediction.

```
       Raw Features
      /            \
[Numerical]     [Categorical]
     |                |
StandardScaler   OneHotEncoder
     \                /
      \              /
       Horizontal Stack (numpy.hstack)
              |
         Input vector (dim: 1x15)
              |
          Classifier
```

### Preprocessing Steps:
1. **Feature Extraction:** Input data is split into 6 numerical columns and 2 categorical columns.
2. **Standardization:** Numeric columns are normalized via `StandardScaler` to have a mean of `0.0` and variance of `1.0`.
3. **One-Hot Encoding:** Categorical string columns (`week_status`, `day_of_week`) are converted into dense binary representation using `OneHotEncoder(sparse_output=False)`.
4. **Horizontal Stacking:** Both representation vectors are concatenated horizontally (`numpy.hstack`) yielding a single feature vector of length **15**.

---

## 4. Modeling & Candidate Evaluations

We performed a comparative study of three machine learning classification models using an **80/20 train/test split** (stratified by target variable).

### Comparative Evaluation Results

| Candidate Model | Test Accuracy | Macro F1-score |
| :--- | :---: | :---: |
| **Logistic Regression** | `76.03%` | `0.7067` |
| **Decision Tree** | `89.51%` | `0.8662` |
| **Random Forest** | **`90.25%`** | **`0.8746`** |

* **Logistic Regression** shows limited capacity in fitting complex nonlinear patterns inherent to industrial electricity demand.
* **Decision Tree** improves metrics but is vulnerable to minor data variances.
* **Random Forest Classifier** achieves the highest performance with **90.25% test accuracy**, demonstrating excellent generalization capability.

---

## 5. Winning Model Performance

### Classification Report (Test Set)

```text
              precision    recall  f1-score   support

  Light_Load       0.97      0.98      0.98      3615
Maximum_Load       0.80      0.84      0.82      1454
 Medium_Load       0.84      0.81      0.83      1939

    accuracy                           0.90      7008
   macro avg       0.87      0.88      0.87      7008
weighted avg       0.90      0.90      0.90      7008
```

### Key Takeaways:
* **Light Load detection** is extremely accurate with a **0.98 F1-score**, indicating that idle periods can be predicted with near-perfection.
* **Maximum Load** yields a **0.82 F1-score**. This is a highly robust level, ensuring that energy peak alerts triggered by the backend scheduler are highly reliable.

---

## 6. Model Serialization & Deployment

Upon completing evaluation, the pipeline automatically exported the following artifacts to [`app/ml/`](file:///Users/perdianaka/Desktop/projectDemo/backend/app/ml):
1. **`classifier.pkl`**: Serialized Random Forest model instance.
2. **`scaler.pkl`**: Serialized numerical `StandardScaler`.
3. **`encoder.pkl`**: Serialized categorical `OneHotEncoder`.

The FastAPI routes and background scheduler are now dynamically loading and executing predictions using this real-world model.

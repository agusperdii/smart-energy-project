import os
import pickle
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, f1_score

def run_modeling():
    print("==================================================")

    csv_path = "notebook/Steel_industry_data.csv"
    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"Dataset not found at {csv_path}")

    print(f"Loading dataset from {csv_path}...")
    df = pd.read_csv(csv_path)
    print(f"Loaded {len(df)} rows and {len(df.columns)} columns.")


    column_mapping = {
        "Usage_kWh": "usage_kwh",
        "Lagging_Current_Reactive.Power_kVarh": "lagging_reactive",
        "Leading_Current_Reactive_Power_kVarh": "leading_reactive",
        "Lagging_Current_Power_Factor": "lagging_pf",
        "Leading_Current_Power_Factor": "leading_pf",
        "NSM": "nsm",
        "WeekStatus": "week_status",
        "Day_of_week": "day_of_week",
        "Load_Type": "load_type"
    }
    df = df.rename(columns=column_mapping)


    num_cols = ["usage_kwh", "lagging_reactive", "leading_reactive", "lagging_pf", "leading_pf", "nsm"]
    cat_cols = ["week_status", "day_of_week"]
    target_col = "load_type"

    X = df[num_cols + cat_cols]
    y = df[target_col]


    print("Splitting dataset into train and test sets...")
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)


    print("Fitting preprocessors (StandardScaler and OneHotEncoder)...")
    scaler = StandardScaler()

    scaler.fit(X_train[num_cols])

    encoder = OneHotEncoder(sparse_output=False, handle_unknown="ignore")

    encoder.fit(X_train[cat_cols])


    X_train_num = scaler.transform(X_train[num_cols])
    X_train_cat = encoder.transform(X_train[cat_cols])
    X_train_processed = np.hstack([X_train_num, X_train_cat])

    X_test_num = scaler.transform(X_test[num_cols])
    X_test_cat = encoder.transform(X_test[cat_cols])
    X_test_processed = np.hstack([X_test_num, X_test_cat])


    models = {
        "LogisticRegression": LogisticRegression(max_iter=1000, random_state=42),
        "DecisionTree": DecisionTreeClassifier(max_depth=12, random_state=42),
        "RandomForest": RandomForestClassifier(n_estimators=100, max_depth=15, random_state=42)
    }

    best_model_name = None
    best_model = None
    best_accuracy = 0.0
    model_results = {}

    print("\nTraining and evaluating candidate models:")
    for name, model in models.items():
        print(f"  Training {name}...")
        model.fit(X_train_processed, y_train)


        y_pred = model.predict(X_test_processed)
        acc = accuracy_score(y_test, y_pred)
        macro_f1 = f1_score(y_test, y_pred, average="macro")

        model_results[name] = {"accuracy": acc, "macro_f1": macro_f1}
        print(f"    -> Test Accuracy: {acc:.4f} | Macro F1-score: {macro_f1:.4f}")

        if acc > best_accuracy:
            best_accuracy = acc
            best_model_name = name
            best_model = model

    print(f"\n==================================================")
    print(f"WINNER: {best_model_name} with Accuracy = {best_accuracy:.4f}")
    print(f"==================================================")


    y_pred_best = best_model.predict(X_test_processed)
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred_best))


    ml_dir = "app/ml"
    os.makedirs(ml_dir, exist_ok=True)

    model_path = os.path.join(ml_dir, "classifier.pkl")
    scaler_path = os.path.join(ml_dir, "scaler.pkl")
    encoder_path = os.path.join(ml_dir, "encoder.pkl")

    print(f"Saving final pipeline artifacts to {ml_dir}...")
    with open(model_path, "wb") as f:
        pickle.dump(best_model, f)
    with open(scaler_path, "wb") as f:
        pickle.dump(scaler, f)
    with open(encoder_path, "wb") as f:
        pickle.dump(encoder, f)

    print("Done! Artifacts successfully exported. Backend is now using the real trained model.")

if __name__ == "__main__":
    run_modeling()

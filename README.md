# SmartCargo: AI-Powered LCL Marketplace & Predictive Container Optimization

SmartCargo is an intelligent Less-than-Container Load (LCL) marketplace that connects cargo shippers with logistics providers. The platform integrates a **3-stage Hybrid Container Recommender**, **XGBoost booking conversion modeling**, **Prophet time-series demand forecasting**, and **Google Gemini 1.5 Flash grounded LLM explanations**.

---

## 1. ML Models & Performance Comparison

All machine learning models were trained and benchmarked on the real transaction dataset (`Smart_Cargo_Large_Dataset.xlsx` containing **20,000 bookings** and **5,000 containers**).

### A. Supervised Booking Conversion & Ranking Models

| Model | Model Type | Accuracy | F1-Score | ROC-AUC | Precision | Recall | Key Strength / Limitation |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| **Old Rule-Based Baseline** | Static Handcrafted Heuristic | **67.20%** | **0.7411** | **0.8685** | 1.0000 | 0.5887 | Misses ~41% of viable bookings due to rigid binary thresholds. |
| **Logistic Regression** | Linear Classification | **89.04%** | **0.9328** | **0.9472** | 0.9126 | 0.9539 | Fast baseline, but cannot capture complex multi-feature tradeoffs. |
| **Random Forest** | Bagged Trees (150 Trees) | **97.74%** | **0.9859** | **0.9975** | 0.9790 | 0.9930 | Strong ensemble performance across non-linear boundaries. |
| **XGBoost (Top Accuracy)** | **Gradient Boosted Trees** | **98.28%** | **0.9892** | **0.9984** | **0.9892** | **0.9892** | **Best overall accuracy (+31.08% over baseline)** and calibrated conversion probability. |

### B. XGBoost Decision Factors (Feature Importance)

```
┌───────────────────────────────────────────────────────────────┐
│ Feature Name                  Importance (%)  Role            │
├───────────────────────────────────────────────────────────────┤
│ Price vs Lane Median Ratio        26.37%      Price Elasticity│
│ CBM Space Fit Ratio               25.89%      Space Fit Tight │
│ Weight Fit Ratio                  20.93%      Weight Capacity │
│ Quoted Price per CBM              11.21%      Direct Cost     │
│ Container Utilization %            5.60%      Fill Rate       │
│ Carrier Reliability Rating         5.42%      Trust Factor    │
│ Days to Departure Window           3.75%      Time Urgency    │
│ Container Size (40ft vs 20ft)      0.84%      Equipment Type  │
└───────────────────────────────────────────────────────────────┘
```

### C. Time-Series Lane Demand Forecasting

| Time-Series Model | Mean Absolute Error (MAE) | Root Mean Squared Error (RMSE) | Accuracy Improvement |
| :--- | :---: | :---: | :---: |
| **Historical Moving Average (3-Mo Baseline)** | 30.00 CBM | 35.54 CBM | *Baseline* |
| **Prophet (Seasonal Decomposition)** | **26.25 CBM** | **26.65 CBM** | **+12.5% MAE Improvement** |

### D. Main Product Feature: 3-Stage Hybrid Container Recommender

1. **Stage 1 (Deterministic Funnel)**: Hard feasibility filtering on UN/LOCODE route pairs, departure dates, and physical CBM/weight limits.
2. **Stage 2 (Supervised ML Re-Ranking)**: Evaluates filtered candidates using the trained **XGBoost** model to predict booking conversion probabilities and compute a composite score (0–100).
3. **Stage 3 (Grounded LLM Explanation)**: **Google Gemini 1.5 Flash** synthesizes human-readable bullet points explaining the exact drivers behind the match.

---

## 2. Exact Code Locations (Model Code & Training Pipelines)

| Component | File Path | Description |
| :--- | :--- | :--- |
| **ML Training & Benchmarking** | [`server/src/scripts/train_ml_models.py`](file:///e:/PROJECTSCSE/SMARTCARGO%28MD%29/server/src/scripts/train_ml_models.py) | Full training pipeline for XGBoost, Random Forest, Logistic Reg & Prophet on real data. |
| **Matplotlib Visualizations** | [`server/src/scripts/visualize_models.py`](file:///e:/PROJECTSCSE/SMARTCARGO%28MD%29/server/src/scripts/visualize_models.py) | Generates the 4-panel comparison figure saved to [`ml_model_comparison_charts.png`](file:///e:/PROJECTSCSE/SMARTCARGO%28MD%29/ml_model_comparison_charts.png). |
| **Raw Training Dataset** | [`Smart_Cargo_Large_Dataset.xlsx`](file:///e:/PROJECTSCSE/SMARTCARGO%28MD%29/Smart_Cargo_Large_Dataset.xlsx) | Excel workbook with 20,000 bookings, 5,000 containers, prices, companies, tracking events. |
| **ETL Data Ingestion Pipeline** | [`server/src/scripts/etl.ts`](file:///e:/PROJECTSCSE/SMARTCARGO%28MD%29/server/src/scripts/etl.ts) | Node.js ETL script that parses the Excel workbook and seeds MongoDB collections. |
| **Hybrid Recommender Controller** | [`server/src/controllers/recommendation.controller.ts`](file:///e:/PROJECTSCSE/SMARTCARGO%28MD%29/server/src/controllers/recommendation.controller.ts) | Implements Stage 1 (Funnel) + Stage 2 (XGBoost scoring) + Stage 3 (LLM explanation). |
| **Prediction & Analytics API** | [`server/src/controllers/prediction.controller.ts`](file:///e:/PROJECTSCSE/SMARTCARGO%28MD%29/server/src/controllers/prediction.controller.ts) | Handlers for Prophet demand forecasting, delay risk prediction, dynamic pricing, and benchmarks. |
| **LLM Grounding Service** | [`server/src/services/llm.service.ts`](file:///e:/PROJECTSCSE/SMARTCARGO%28MD%29/server/src/services/llm.service.ts) | Google Gemini 1.5 Flash integration for NLP query intent extraction and grounded explanation. |
| **ML Model Registry & Config** | [`server/src/config/ml_benchmark_report.json`](file:///e:/PROJECTSCSE/SMARTCARGO%28MD%29/server/src/config/ml_benchmark_report.json) | Exported JSON containing model metrics, hyper-parameters, and decision threshold weights. |

---

## 3. How to Run the Complete Application (Step-by-Step)

### Prerequisites
- **Node.js**: v18 or higher
- **Python**: 3.10+ (with `pandas`, `scikit-learn`, `xgboost`, `matplotlib`, `openpyxl`)
- **MongoDB**: Running locally on `mongodb://localhost:27017/lcl-marketplace` or MongoDB Atlas URI in `.env`

---

### Step 1: Install Dependencies

```bash
# Install Server Dependencies
cd server
npm install

# Install Client Dependencies
cd ../client
npm install

# Install Python ML Dependencies
pip install pandas scikit-learn xgboost matplotlib openpyxl
```

---

### Step 2: Load Dataset into MongoDB (ETL Ingestion)

```bash
# Run from project root or server directory
cd server
npx ts-node src/scripts/etl.ts
```
> Reads [`Smart_Cargo_Large_Dataset.xlsx`](file:///e:/PROJECTSCSE/SMARTCARGO%28MD%29/Smart_Cargo_Large_Dataset.xlsx) and loads 5,000 containers, 20,000 bookings, companies, prices, and snapshots into MongoDB.

---

### Step 3: Train & Benchmark ML Models

```bash
# Run from project root
python server/src/scripts/train_ml_models.py
```
> Trains the supervised models (XGBoost, Random Forest, Logistic Reg) and Prophet forecasting, evaluating accuracy and writing metrics to [`server/src/config/ml_benchmark_report.json`](file:///e:/PROJECTSCSE/SMARTCARGO%28MD%29/server/src/config/ml_benchmark_report.json).

---

### Step 4: Generate Matplotlib Visualization Charts

```bash
# Run from project root
python server/src/scripts/visualize_models.py
```
> Generates the 4-panel publication-grade chart and saves it to [`ml_model_comparison_charts.png`](file:///e:/PROJECTSCSE/SMARTCARGO%28MD%29/ml_model_comparison_charts.png).

---

### Step 5: Start Backend API Server

```bash
cd server
npm run dev
```
> Starts the Express backend on `http://localhost:5000` with hot-reload.

---

### Step 6: Start Frontend Client

```bash
cd client
npm run dev
```
> Launches the Vite React client on `http://localhost:5173`.

---

## 4. Key ML & Prediction API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/ml/recommend/containers` | 3-Stage Hybrid Container Recommender (Funnel + XGBoost + Gemini LLM). |
| `POST` | `/api/assistant/parse` | Natural language query intent extraction using Gemini 1.5 Flash. |
| `POST` | `/api/ml/validate/booking` | Pre-confirmation booking guard checking capacity, weight & departure limits. |
| `GET` | `/api/ml/price/estimate` | Dynamic pricing intelligence with P10/P90 market price bands. |
| `POST` | `/api/ml/predict/delay` | Predictive delay and ETA risk analysis. |
| `GET` | `/api/ml/demand/forecast` | Prophet seasonal demand forecast by origin-destination lane. |
| `GET` | `/api/ml/benchmark` | Live benchmark report of all trained models and accuracy metrics. |

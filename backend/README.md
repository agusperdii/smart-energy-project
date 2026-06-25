# SteelSense Backend

FastAPI backend application for the SteelSense electricity monitoring and predictive analysis platform.

## Setup Instructions

1. **Create Python Virtual Environment**
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   ```

2. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure Environment Variables**
   Copy the template environment file and adjust configuration values as needed:
   ```bash
   cp .env.example .env
   ```

4. **Generate ML Model Artifacts**
   Run the mock training script to generate the required classifier, scaler, and encoder serialization files:
   ```bash
   python train_mock_models.py
   ```

5. **Initialize Database Tables**
   Database tables are automatically created on application startup. To run migrations via Alembic:
   ```bash
   alembic upgrade head
   ```

## Running the Server

Start the local development server:
```bash
uvicorn app.main:app --reload
```

The API will be available at [http://localhost:8000](http://localhost:8000).
Interactive OpenAPI documentation can be accessed at [http://localhost:8000/docs](http://localhost:8000/docs).

## Automated Tests

Run the test suite using `pytest`:
```bash
pytest
```

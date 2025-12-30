Kolkata Flood Risk Analyzer

Grid-level flood risk prediction system for Kolkata using multi-source environmental data and machine learning, with real-time location-based analysis and interactive visualization.

Problem Statement

Urban flooding in Kolkata is a recurring and high-impact issue caused by intense rainfall, low elevation, inadequate drainage, and complex hydrological interactions. While weather forecasts exist, actionable, location-specific flood risk intelligence for residents and planners remains limited.

Most existing solutions operate at coarse spatial resolution, rely solely on rainfall thresholds, or fail to generalize across neighborhoods.

This project addresses that gap by building a grid-level, data-driven flood risk prediction system designed for real-world deployment.

Objective

To predict current and near-term flood risk for any location in Kolkata by:

Discretizing the city into spatial grids

Combining meteorological, terrain, and hydrological signals

Learning robust flood-risk patterns via machine learning

Exposing results through a clean web interface

Flood risk is classified into:

No Risk
Low Risk
Medium Risk
High Risk

System Overview

End-to-end pipeline:

Spatial Grid Creation
Kolkata is divided into approximately 200+ uniform grids to enable localized risk modeling.

Feature Engineering
Each grid-day instance is represented using:

Multi-day rainfall aggregates (3-day, 7-day)

Elevation and terrain proxies

Hydrological context features

Interaction features capturing compound effects

Label Construction (Rule-based)
Flood risk labels are generated using a defensible scoring framework combining rainfall accumulation, terrain susceptibility, and water-retention characteristics. This enables consistent supervision without noisy manual labels.

Machine Learning Model
A gradient-boosted classifier is trained to predict flood risk categories.

Robust Evaluation

Time-based splits to prevent temporal leakage

Spatial holdout testing to evaluate generalization to unseen areas

High-risk recall prioritized to minimize missed flood events

Deployment Layer

FastAPI backend for inference

Frontend with location search and risk visualization

Architecture designed for real-time extension

Architecture

User Location (GPS or Search)
→ Grid Mapping
→ Weather Feature Retrieval
→ Machine Learning Inference
→ Flood Risk Classification
→ Interactive Visualization

Model Highlights

Strong recall on High-Risk zones, critical for disaster response

Generalizes across both time and space

Uses interpretable, domain-informed features

Avoids overfitting through spatial validation

The system prioritizes decision usefulness over raw accuracy.

Tech Stack

Backend:

Python

FastAPI

Scikit-learn / XGBoost

Pandas, NumPy

Frontend:

React

Modern CSS and UI animations

Interactive risk visualization

Data and Modeling:

Multi-year daily weather data (2014–2024)

Grid-level spatial preprocessing

Rule-based label generation with supervised learning


Running the Project Locally

Backend:

pip install -r requirements.txt
python -m uvicorn app.main:app --reload


Frontend:

cd frontend
npm install
npm run dev

Impact and Use Cases

Citizens: Location-specific flood awareness

Urban planners: Identification of structurally vulnerable zones

Disaster response teams: Prioritization of high-risk areas

Researchers: Transferable framework for urban flood modeling

Future Work

Probabilistic flood risk forecasting for 24–72 hour horizons

Alert and notification systems for high-risk zones

Integration of drainage and sewer network data

Model explainability and interpretability dashboard

Extension to multi-city flood risk modeling

# comet-for-students


This project was created as part of my role as a **Perplexity Campus Partner at UCSD**.  
The goal was to design an interface that promotes **Comet** to students while also collecting engagement data to better understand what messaging drives interest and sign-ups.  

## 🎯 Project Overview
The platform presents UCSD students with promotional content about **Comet**. Behind the scenes, users are randomly assigned to different **test groups** where the messaging or layout changes slightly. This allows us to measure which approach performs better in terms of engagement.

## 🧪 A/B Testing & Analytics
- **Experiment Design:** Students are split into two groups:
  - **Control:** baseline messaging and interface.
  - **Variant:** alternative messaging or feature emphasis.
- **Tracking:** User interactions (e.g., clicks on links) are tracked through **Dub.co**.
- **Metrics Analyzed:**
  - **Click-Through Rate (CTR):** % of users who clicked the Comet link.
  - **Engagement Rate:** total interactions per student.
  - **Conversion:** students who sign up for Comet after clicking.
- **Analysis Pipeline:**
  - Data is stored in a **SQL database** for querying.
  - Analysis is performed in **Python** (Pandas, Matplotlib, SciPy).
  - Statistical tests validate whether observed differences are significant.

## 🛠️ Tech Stack
- **Frontend:** Next.js (landing interface with A/B test assignment)
- **Backend:** Python (API + data processing)
- **Database:** PostgreSQL / SQLite
- **Data Analysis:** SQL, Pandas, Matplotlib, SciPy
- **Tracking:** Dub.co link analytics

## 📊 Example Insights
- 120+ student interactions tracked
- Variant message increased **CTR by 12%** compared to control
- SQL queries enabled quick segmentation and engagement analysis

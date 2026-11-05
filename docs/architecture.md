# TaskFlow - Architecture Diagram

```mermaid
flowchart LR
    Dev[Developer] -->|git push| GH[GitHub Repository]
    GH -->|trigger| CI[GitHub Actions CI/CD]
    CI -->|1. npm test| CI
    CI -->|2. docker build + push| GHCR[(GHCR Container Registry)]
    CI -->|3. SSH deploy| EC2

    subgraph AWS["AWS Cloud (EC2 + Docker Compose)"]
        EC2[EC2 Ubuntu Instance]
        APP[taskflow-app<br/>Node.js + Express]
        PROM[taskflow-prometheus]
        GRAF[taskflow-grafana]
        EC2 --- APP
        EC2 --- PROM
        EC2 --- GRAF
        PROM -->|scrape /metrics| APP
        GRAF -->|query| PROM
    end

    GHCR -->|docker pull| EC2
    User[End User Browser] -->|HTTP :80| APP
    APP -->|SSL| DB[(Managed PostgreSQL<br/>Neon / AWS RDS)]
    Admin[Admin] -->|:3001| GRAF
    UP[UptimeRobot] -->|ping /health| APP
```

## Components
| Component | Technology | Purpose |
|---|---|---|
| Frontend | HTML/CSS/JS | Login + task UI |
| Backend | Node.js, Express | REST API + JWT auth |
| Database | Managed PostgreSQL | Users & tasks storage |
| Container | Docker, Docker Compose | Packaging & orchestration |
| CI/CD | GitHub Actions | Test, build, push, deploy |
| Registry | GitHub Container Registry | Docker image storage |
| Cloud | AWS EC2 | Hosting |
| Monitoring | Prometheus + Grafana + UptimeRobot | Metrics, dashboards, uptime alerts |

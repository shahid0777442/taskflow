# TaskFlow - Cloud & DevOps Capstone

Task manager web app + REST API, containerized with Docker, automated with GitHub Actions CI/CD,
deployed on AWS EC2, monitored with Prometheus/Grafana, data on managed PostgreSQL.

- **Live URL:** http://YOUR_EC2_PUBLIC_IP  (replace after deployment)
- **Grafana:** http://YOUR_EC2_PUBLIC_IP:3001
- **Architecture:** see [docs/architecture.md](docs/architecture.md)
- **Step-by-step guide:** see [GUIDE.md](GUIDE.md)

## Run locally
```bash
docker compose up --build
# App:        http://localhost:3000
# Prometheus: http://localhost:9090
# Grafana:    http://localhost:3001  (admin / admin)
```

## API
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | /health | - | Health check |
| GET | /metrics | - | Prometheus metrics |
| POST | /api/auth/register | - | Create account |
| POST | /api/auth/login | - | Login, returns JWT |
| GET | /api/tasks | JWT | List my tasks |
| POST | /api/tasks | JWT | Create task |
| PUT | /api/tasks/:id | JWT | Update task |
| DELETE | /api/tasks/:id | JWT | Delete task |

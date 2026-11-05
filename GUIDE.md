# TaskFlow - Step by Step Implementation Guide

Project structure:
```
taskflow/
├── app/                      # Node.js app (API + frontend)
│   ├── src/ (server.js, app.js, db.js, routes/, middleware/)
│   ├── public/ (index.html, app.js, style.css)
│   ├── test/api.test.js
│   └── Dockerfile
├── monitoring/ (prometheus.yml, grafana/provisioning)
├── .github/workflows/ci-cd.yml
├── docker-compose.yml        # local dev
├── docker-compose.prod.yml   # production (EC2)
├── docs/architecture.md
└── .env.example
```

## STEP 1 - Tools install karein (local PC)
- Git, Node.js 20+, Docker Desktop, VS Code
- Check: `git --version`, `node -v`, `docker --version`

## STEP 2 - Project local pe chalayein
```bash
cd taskflow/app
npm install            # package-lock.json generate hoga (commit kar dena)
cd ..
docker compose up --build
```
Browser: http://localhost:3000 -> Register -> Task add karein.
Test: `cd app && npm test`

## STEP 3 - GitHub repository
1. github.com pe naya repo banayein: `taskflow` (Public)
2. Terminal:
```bash
cd taskflow
git init
git add .
git commit -m "Initial commit: TaskFlow"
git branch -M main
git remote add origin https://github.com/<USERNAME>/taskflow.git
git push -u origin main
```
(Pehli push pe CI test job chalega; build/deploy secrets ke baghair fail hoga, normal hai.)

## STEP 4 - Managed Database (Neon - free)
1. neon.tech pe sign up -> New Project `taskflow`
2. Connection string copy karein (looks like `postgres://user:pass@ep-xxx.neon.tech/neondb?sslmode=require`)
3. Yehi `DATABASE_URL` hai. Tables app khud bana leti hai (db.js -> init()).
(Alternative: AWS RDS PostgreSQL free tier.)

## STEP 5 - AWS EC2 server
1. AWS Console -> EC2 -> Launch instance
   - Name: `taskflow-server`, OS: Ubuntu 22.04, Type: t2.micro/t3.micro (free tier)
   - Key pair banayein: `taskflow-key.pem` (download, safe rakhein)
2. Security Group inbound rules:
   - 22 (SSH) -> My IP
   - 80 (HTTP) -> Anywhere
   - 3001 (Grafana) -> My IP
3. Server pe Docker install:
```bash
ssh -i taskflow-key.pem ubuntu@<EC2_PUBLIC_IP>
sudo apt update && sudo apt install -y docker.io docker-compose-v2 curl
sudo usermod -aG docker ubuntu
exit    # logout/login taake group apply ho
```
4. Server pe `.env` banayein:
```bash
ssh -i taskflow-key.pem ubuntu@<EC2_PUBLIC_IP>
mkdir -p ~/taskflow && nano ~/taskflow/.env
```
Content (apni values ke sath):
```
DATABASE_URL=postgres://...neon.tech/neondb?sslmode=require
JWT_SECRET=<openssl rand -hex 32 ka output>
GRAFANA_PASSWORD=<strong password>
```

## STEP 6 - GitHub Secrets (CI/CD ke liye)
Repo -> Settings -> Secrets and variables -> Actions -> New repository secret:

| Secret | Value |
|---|---|
| EC2_HOST | EC2 public IP |
| EC2_USER | ubuntu |
| EC2_SSH_KEY | taskflow-key.pem ka poora content |
| GHCR_USER | aap ka GitHub username |
| GHCR_TOKEN | GitHub PAT (Settings -> Developer settings -> Tokens (classic)) with `read:packages` |

## STEP 7 - CI/CD pipeline chalayein
```bash
git commit --allow-empty -m "Trigger pipeline" && git push
```
GitHub -> Actions tab: **Test -> Build & Push -> Deploy** teeno green hone chahiye.
Pipeline: test chalata hai, Docker image GHCR pe push karta hai, EC2 pe SSH karke `docker compose up -d` karta hai, aur `/health` check karta hai.

Verify: `http://<EC2_PUBLIC_IP>` kholein.

## STEP 8 - Monitoring
1. **Prometheus + Grafana (already compose mein):**
   - Grafana: `http://<EC2_IP>:3001` (user: admin, pass: GRAFANA_PASSWORD)
   - Dashboards -> New -> Import -> ID **11159** (Node.js app metrics) ya custom panel banayein:
     - `rate(taskflow_http_requests_total[1m])` (requests/sec)
     - `histogram_quantile(0.95, rate(taskflow_http_request_duration_seconds_bucket[5m]))` (p95 latency)
     - `taskflow_process_resident_memory_bytes` (memory)
2. **Uptime alerts:** uptimerobot.com -> New Monitor -> HTTP(s) -> `http://<EC2_IP>/health` -> email alert on.
3. Screenshots lein (submission ke liye).

## STEP 9 - Architecture diagram
`docs/architecture.md` mein Mermaid diagram hai, GitHub pe automatically render hota hai.
Screenshot bhi le lein ya https://mermaid.live pe paste karke PNG export karein.

## STEP 10 - Final Submission Checklist
- [ ] GitHub repo link (public)
- [ ] Cloud deployment link: `http://<EC2_PUBLIC_IP>`
- [ ] Dockerfile + docker-compose.yml + docker-compose.prod.yml
- [ ] CI/CD pipeline: `.github/workflows/ci-cd.yml` + green run screenshot
- [ ] Architecture diagram (docs/architecture.md)
- [ ] Monitoring screenshots (Grafana + UptimeRobot)
- [ ] README mein live URL update karein

## Troubleshooting
| Problem | Fix |
|---|---|
| `permission denied` docker pe EC2 | `sudo usermod -aG docker ubuntu` phir re-login |
| App start nahi hoti | `docker logs taskflow-app` - DATABASE_URL/JWT_SECRET check karein |
| SSH action fail | EC2_SSH_KEY mein poora .pem (BEGIN/END lines ke sath) paste karein |
| Image pull denied | GHCR_TOKEN mein `read:packages` scope check karein |
| Site open nahi | Security Group mein port 80 open hai? |

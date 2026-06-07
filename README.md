# Scholastica Stars 3.0 — MERN Deployment

Production deployment for a **MongoDB + Express + React + Node.js** application, fully automated through **GitHub Actions**, **Docker Hub**, and **AWS EC2**.

> **Why a separate README section about JWT_SECRET?** The backend's `validateEnv()` in `src/app.js` throws on startup if `JWT_SECRET` is missing, so the original 8-secret spec had to be extended to 9. See [Required GitHub Secrets](#-required-github-secrets).

---

## 🏗️ Architecture Overview

```
                    ┌──────────────────────────────────────────┐
                    │              DEVELOPER                   │
                    │        git push origin main              │
                    └─────────────────┬────────────────────────┘
                                      │
                                      ▼
                    ┌──────────────────────────────────────────┐
                    │        GitHub Actions (CI/CD)            │
                    │  ┌────────────────────────────────────┐  │
                    │  │  Job 1: Build & Push               │  │
                    │  │   • docker build  (backend)        │  │
                    │  │   • docker build  (frontend)       │  │
                    │  │   • docker push  → Docker Hub      │  │
                    │  └────────────────────────────────────┘  │
                    │  ┌────────────────────────────────────┐  │
                    │  │  Job 2: Deploy                     │  │
                    │  │   • SCP docker-compose.yml         │  │
                    │  │   • SSH into EC2                   │  │
                    │  │   • Generate .env from secrets     │  │
                    │  │   • docker compose pull            │  │
                    │  │   • docker compose up -d           │  │
                    │  └────────────────────────────────────┘  │
                    └─────────────────┬────────────────────────┘
                                      │  pull
                                      ▼
                    ┌──────────────────────────────────────────┐
                    │              Docker Hub                  │
                    │      mern-frontend :latest               │
                    │      mern-backend  :latest               │
                    └─────────────────┬────────────────────────┘
                                      │
                                      ▼
                    ┌──────────────────────────────────────────┐
                    │              AWS EC2                     │
                    │  ┌─────────────────┐ ┌─────────────────┐ │
                    │  │  mern-frontend  │ │  mern-backend   │ │
                    │  │  (Nginx)        │ │  (Node.js)      │ │
                    │  │  port 80 (pub)  │ │  port 5000      │ │
                    │  └────────┬────────┘ └────────┬────────┘ │
                    └───────────┼───────────────────┼──────────┘
                                │ /api/*            │
                                │   proxy_pass ─────┘
                                │
                                ▼
                    ┌──────────────────────────────────────────┐
                    │  Browser  ◄────  same-origin  ────► EC2  │
                    │  http://<EC2_HOST>/api/*                 │
                    └──────────────────────────────────────────┘
                                      │ MONGO_URI
                                      ▼
                    ┌──────────────────────────────────────────┐
                    │           MongoDB Atlas                  │
                    └──────────────────────────────────────────┘
```

**Request flow** (browser → API):

1. Browser loads `http://<EC2_HOST>/` → served by the **frontend** container's Nginx from React static assets.
2. Browser calls `http://<EC2_HOST>/api/...` → same-origin.
3. **Frontend nginx** reverse-proxies `/api/*` → `http://backend:5000/api/*` (Compose DNS).
4. **Backend** container handles the request and returns JSON.
5. No CORS preflight is required because everything is same-origin from the browser's perspective.

---

## 📁 Repository Structure

```
.
├── frontend/                          # React app (Vite + React 18)
│   ├── Dockerfile                     # Multi-stage: Node build → Nginx serve
│   ├── nginx.conf                     # SPA fallback + /api → backend proxy
│   ├── package.json
│   ├── .dockerignore
│   └── ...
├── backend/                           # Express API (ESM, MongoDB via Mongoose)
│   ├── Dockerfile                     # Multi-stage: full deps → prod-only, non-root
│   ├── package.json
│   ├── .env.example                   # Template — copy to .env locally
│   ├── .dockerignore
│   └── ...
├── docker-compose.yml                 # Runs on EC2 — pulls images from Docker Hub
├── .github/
│   └── workflows/
│       └── cicd.yml                   # CI/CD pipeline
├── .gitignore
├── .dockerignore
└── README.md
```

---

## 🔄 CI/CD Pipeline Flow

### 1. Trigger
A `git push` to the `main` branch starts the workflow in `.github/workflows/cicd.yml`. A `concurrency: production-deploy` group prevents overlapping deploys.

### 2. Job 1 — Build & Push
- Checks out the source code.
- Logs in to Docker Hub with `DOCKER_USERNAME` / `DOCKER_PASSWORD`.
- Sets up Docker Buildx for layer caching.
- **Backend image** — built from `./backend` and pushed as:
  - `<DOCKER_USERNAME>/mern-backend:latest` (consumed by EC2)
  - `<DOCKER_USERNAME>/mern-backend:<github.sha>` (immutable reference)
- **Frontend image** — built from `./frontend` with `VITE_API_URL=""` (empty = same-origin) and pushed with the same tag scheme.
- Both images use registry-based layer caching (`buildcache` tags) for fast rebuilds.

### 3. Job 2 — Deploy (runs only if Job 1 succeeded)
- Uses `appleboy/scp-action@v0.1.7` to securely copy `docker-compose.yml` to `~/app/` on EC2.
- Uses `appleboy/ssh-action@v1.0.10` with an `env:` block containing all 9 secrets. The remote script:
  1. **Generates** `~/app/.env` (with `chmod 600`) from the injected secrets, including `CLIENT_URL=http://<EC2_HOST>`.
  2. **Logs in** to Docker Hub on the EC2 host.
  3. **Pulls** the latest images.
  4. **Restarts** the stack with `docker compose up -d --remove-orphans`.
  5. **Prunes** dangling images to free disk space.
  6. Prints `docker compose ps` for a status snapshot.

> 🛡️ **Security**: secrets are only passed via the `env:` block of the SSH step. GitHub Actions auto-masks known secret values in runner logs. The `.env` file on EC2 is `chmod 600`.

---

## 🔐 Required GitHub Secrets

Configure in **Settings → Secrets and variables → Actions**:

| Secret Name        | Required? | Description                                                                                       |
| ------------------ | :-------: | ------------------------------------------------------------------------------------------------- |
| `EC2_HOST`         | ✅        | Public IP or DNS of the AWS EC2 instance (e.g. `54.123.45.67`).                                   |
| `EC2_USER`         | ✅        | SSH user for the EC2 instance (usually `ec2-user` for Amazon Linux, `ubuntu` for Ubuntu).        |
| `EC2_SSH_KEY`      | ✅        | **Private** SSH key (PEM contents) matching the key pair on the EC2 instance.                     |
| `DOCKER_USERNAME`  | ✅        | Docker Hub account username.                                                                      |
| `DOCKER_PASSWORD`  | ✅        | Docker Hub password or [access token](https://docs.docker.com/docker-hub/access-tokens/).         |
| `ADMIN_EMAIL`      | ✅        | Email for the initial admin user (used by `ensureAdminAccount` on first boot).                    |
| `ADMIN_PASSWORD`   | ✅        | Password for the initial admin user.                                                              |
| `MONGO_URI`        | ✅        | Full MongoDB Atlas connection string (e.g. `mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/dbname`). |
| `JWT_SECRET`       | ✅        | **9th secret — deviation from the original 8-secret spec.** Long random string (e.g. `openssl rand -base64 48`). The backend throws at startup without it. |

> ⚠️ **Why 9 instead of 8?** The backend's `validateEnv()` in `src/app.js` requires both `MONGO_URI` **and** `JWT_SECRET`. To keep the app self-contained and rotatable across deploys, `JWT_SECRET` is a 9th GitHub Secret. If you'd rather not add it, the deploy job can generate one on the EC2 host (`openssl rand -base64 48 > .env`) — modify the SSH `script` block accordingly.

---

## ⚙️ EC2 Instance Prerequisites (one-time setup)

```bash
# 1. Install Docker Engine (Amazon Linux 2023 example)
sudo yum update -y
sudo yum install -y docker
sudo service docker start
sudo usermod -aG docker ec2-user

# 2. Install Docker Compose v2 (plugin)
sudo mkdir -p /usr/local/libexec/docker/cli-plugins
sudo curl -SL https://github.com/docker/compose/releases/latest/download/docker-compose-linux-$(uname -m) \
  -o /usr/local/libexec/docker/cli-plugins/docker-compose
sudo chmod +x /usr/local/libexec/docker/cli-plugins/docker-compose

# 3. Verify
docker --version
docker compose version

# 4. Create the deployment directory
mkdir -p ~/app
chmod 700 ~/app

# 5. Log out and back in so the docker group takes effect
exit
```

**EC2 Security Group — inbound rules:**

| Port  | Protocol | Source       | Purpose                       |
| ----- | -------- | ------------ | ----------------------------- |
| 22    | TCP      | Your IP      | SSH (deploy job)              |
| 80    | TCP      | 0.0.0.0/0    | Public HTTP (frontend nginx)  |
| 5000  | TCP      | Your IP      | Optional: direct API access   |

> 💡 Optionally put an **AWS ALB** in front for HTTPS / custom domain, and lock port 80 down to the ALB only.

---

## 🚀 First-Time Setup Guide

1. **Create two Docker Hub repositories** (public or private) named:
   - `mern-frontend`
   - `mern-backend`
2. **Add the 9 GitHub Secrets** listed above.
3. **(Optional) Test locally first**:
   ```bash
   cp backend/.env.example backend/.env
   # edit backend/.env with real MONGO_URI and JWT_SECRET
   docker compose -f docker-compose.yml up --build
   ```
4. **Push to `main`**:
   ```bash
   git add .
   git commit -m "feat: deployment setup"
   git push origin main
   ```
5. **Watch the workflow run** in the *Actions* tab.
6. **Verify on EC2**:
   ```bash
   ssh ec2-user@<EC2_HOST>
   cd ~/app
   docker compose ps
   docker compose logs -f
   ```
7. **Open the app** at `http://<EC2_HOST>`.

---

## 🛠️ Customization

| Need                                  | Where to change                                                                |
| ------------------------------------- | ------------------------------------------------------------------------------ |
| Image names                           | `tags:` in `cicd.yml` and `image:` in `docker-compose.yml`.                    |
| Different host ports                  | `ports:` in `docker-compose.yml`.                                               |
| API at a different origin             | `ARG VITE_API_URL` in `frontend/Dockerfile` + `build-args` in the workflow.    |
| Custom CORS allowlist                 | `CLIENT_URL` in the deploy job's `.env` heredoc.                               |
| HTTPS / custom domain                 | Add a reverse proxy (Caddy / Traefik) or front with AWS ALB + ACM.             |
| Local dev mode with hot reload        | Add a dev override (`docker-compose.override.yml`) — not currently included.   |
| Different MongoDB (non-Atlas)         | Change `MONGO_URI` value; backend code does not care about provider.           |

---

## 🩺 Troubleshooting

| Problem                                          | Likely Cause / Fix                                                                                  |
| ------------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| `permission denied` when running `docker`        | User not in the `docker` group: `sudo usermod -aG docker $USER`, then log out and back in.         |
| `pull access denied` for image                   | Verify `DOCKER_USERNAME` / `DOCKER_PASSWORD` and that `mern-frontend` / `mern-backend` exist on Docker Hub. |
| Frontend loads, but API calls fail (504)         | The `mern-network` Compose network is missing or the backend service name changed — keep it as `backend`. |
| CORS error in browser console                    | `CLIENT_URL` in `.env` on EC2 must exactly match the URL the browser uses. Update via deploy.      |
| `docker-compose: command not found`              | Install the Compose v2 plugin (see prerequisites) — the workflow uses `docker compose` (with a space). |
| `Host key verification failed` during SSH        | `appleboy/ssh-action` accepts the host key on first contact; if it persists, add the host fingerprint. |
| `Missing required environment variables: JWT_SECRET` | The 9th secret isn't set in GitHub Secrets, or the deploy job didn't write `.env` correctly.  |
| EC2 disk full                                    | The deploy step prunes dangling images. Add a weekly `docker system prune` cron if needed.         |
| First deploy very slow                           | First-time pulls of `node:22-alpine` and `nginx:1.27-alpine` are large; subsequent deploys use the registry cache and are much faster. |

---

## 📦 Tech Stack

- **Frontend**: Vite 5, React 18, React Router 6, Nginx 1.27 (alpine)
- **Backend**: Node.js 22 (alpine), Express 4, Mongoose 8, Helmet, CORS, JWT
- **Database**: MongoDB Atlas
- **CI/CD**: GitHub Actions (Checkout v5, Docker Buildx v4, Build/Push v7, SCP v0.1.7, SSH v1.0.10)
- **Registry**: Docker Hub
- **Hosting**: AWS EC2 with Docker + Compose v2

# TaskForge

Full-stack task management app, 3 tiers:

| Tier | Tech | Where |
|---|---|---|
| Frontend | HTML/CSS/vanilla JS (black & red UI) | `public/index.html` |
| Backend | Node.js + Express REST API, JWT auth, bcrypt | `server.js` |
| Database | SQLite (users, tasks, logs tables) | `taskforge.db` (auto-created) |

## Run (Node 18+)
```bash
npm install
JWT_SECRET=your-long-random-secret npm start
```
Open http://localhost:3010, create an account, and start working. Each account gets demo tasks and its own private data.

## API (all except auth need `Authorization: Bearer <token>`)
- `POST /api/auth/register` {name,email,password} / `POST /api/auth/login` {email,password}
- `GET /api/me`
- `GET|POST /api/tasks`, `PUT|DELETE /api/tasks/:id`
- `GET|POST /api/logs` (time-tracker sessions)
- `POST /api/reset` (restore demo data)

## Production notes
Set `JWT_SECRET`, serve behind HTTPS, and back up the `.db` file.


## 🏗️ Project Architecture

<!-- Add architecture diagram here -->

## 📊 DevOps Implementation Tracker

Track all DevOps activities and implementation progress.

### 🐙 1. Git & GitHub

<details>
<summary>Git & GitHub Progress</summary>

**Documentation:** [Git & GitHub](docs/git-github.md)

- [ ] Git initialization
- [ ] Branch management
- [ ] Pull Requests
- [ ] Collaborator management
- [ ] Merge conflict resolution

</details>

### ⚙️ 2. GitHub Actions CI/CD

<details>
<summary>GitHub Actions Progress</summary>

**Documentation:** [GitHub Actions CI/CD](docs/md-files/github-actions.md)

**Workflow:** `.github/workflows/github-actions-ci.yml`

- [ ] Workflow configuration
- [ ] Configure triggers
- [ ] Dependency installation
- [ ] Automated testing
- [ ] Docker image build
- [ ] Verify successful workflow

![GitHub Actions Workflow](docs/pictures/GitHub%20Actions%20CI%20Workflow%20Cheat%20Sheet.png)

</details>

### 🔧 3. Jenkins CI/CD

<details>
<summary>Jenkins Progress</summary>

**Documentation:** [Jenkins CI/CD](docs/jenkins.md)

**Pipeline:** `Jenkinsfile`

- [ ] Jenkins installation
- [ ] Plugin configuration
- [ ] Jenkins pipeline
- [ ] GitHub integration
- [ ] SonarQube integration
- [ ] Trivy integration
- [ ] Docker build

![Jenkins Pipeline](docs/pictures/Jenkins%20Pipeline%20Infographic.png)

</details>

### 🐳 4. Docker

<details>
<summary>Docker Progress</summary>

**Documentation:** [Docker](docs/docker.md)

- [ ] Dockerfile
- [ ] Docker image build
- [ ] Container execution
- [ ] Docker networking
- [ ] Docker volumes
- [ ] Docker Compose
- [ ] Docker Hub / ECR

</details>

### 🔍 5. Code Quality & Security

<details>
<summary>SonarQube & Trivy Progress</summary>

**Documentation:**
- [SonarQube](docs/sonarqube.md)
- [Trivy](docs/trivy.md)

- [ ] SonarQube configuration
- [ ] Code quality analysis
- [ ] Trivy installation
- [ ] Filesystem scanning
- [ ] Docker image scanning

</details>

### ☁️ 6. AWS Cloud

<details>
<summary>AWS Progress</summary>

**Documentation:** [AWS](docs/aws.md)

- [ ] IAM configuration
- [ ] VPC and Subnets
- [ ] EC2
- [ ] ECR
- [ ] ECS
- [ ] Application Load Balancer
- [ ] Auto Scaling

</details>

### 🏗️ 7. Infrastructure as Code

<details>
<summary>Terraform Progress</summary>

**Documentation:** [Terraform](docs/terraform.md)

- [ ] Terraform installation
- [ ] AWS provider
- [ ] VPC provisioning
- [ ] EC2 provisioning
- [ ] Variables and Outputs
- [ ] State management
- [ ] Modules

</details>

### 🤖 8. Ansible

<details>
<summary>Ansible Progress</summary>

**Documentation:** [Ansible](docs/ansible.md)

- [ ] Ansible installation
- [ ] Inventory configuration
- [ ] Playbooks
- [ ] Variables
- [ ] Roles

</details>

### ☸️ 9. Kubernetes

<details>
<summary>Kubernetes Progress</summary>

**Documentation:** [Kubernetes](docs/kubernetes.md)

- [ ] Cluster setup
- [ ] Deployments
- [ ] Services
- [ ] ConfigMaps
- [ ] Secrets
- [ ] Ingress
- [ ] HPA

</details>

### 📊 10. Monitoring & Logging

<details>
<summary>Monitoring Progress</summary>

**Documentation:** [Monitoring](docs/monitoring.md)

- [ ] Prometheus
- [ ] Grafana
- [ ] Dashboards
- [ ] Alerting
- [ ] Centralized logging

</details>

---

## ▶️ Run Application

**Requirements:** Node.js 18+

```bash
npm install
JWT_SECRET=your-long-random-secret npm start
```

Open: http://localhost:3010

## 🔌 API Documentation

All endpoints except authentication require:

`Authorization: Bearer <token>`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register |
| POST | `/api/auth/login` | Login |
| GET | `/api/me` | User profile |
| GET / POST | `/api/tasks` | Manage tasks |
| PUT / DELETE | `/api/tasks/:id` | Update / Delete tasks |
| GET / POST | `/api/logs` | Manage logs |
| POST | `/api/reset` | Restore demo data |

## 🔐 Production Notes

- Set a strong JWT_SECRET.
- Serve behind HTTPS.
- Back up the SQLite database.
- Never commit secrets to GitHub.

---

**Project:** TaskForge  
**Focus:** Full-stack Development + DevOps + CI/CD + Cloud Infrastructure

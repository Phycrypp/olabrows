# 🌸 Browed by Olá — Website

> Production e-commerce frontend for [olabrows.store](https://olabrows.store), containerized with Docker and deployed via GitHub Actions CI/CD to AWS EC2.

🌐 **Live Site:** [olabrows.store](https://olabrows.store)

## Tech Stack
- **Frontend:** HTML5, CSS3, JavaScript
- **Container:** Docker + Nginx (Alpine)
- **Registry:** AWS ECR
- **CI/CD:** GitHub Actions
- **Hosting:** AWS EC2 Blue-Green deployment
- **DNS:** AWS Route 53 (Failover routing)
- **SSL:** Let's Encrypt (Certbot)

## CI/CD Pipeline
Every push to main triggers:
1. Build AMD64 Docker image
2. Push to AWS ECR
3. SSH deploy to Blue + Green servers
4. Zero-downtime rolling update

## Features
- 🤖 AI Beauty Advisor (AWS Bedrock + Claude)
- 📧 Email subscription
- 🔵🟢 Blue-Green deployment
- 🔒 SSL/HTTPS
- ⚡ Gzip compression + 30d asset caching

## Related Repositories
- [olabrows-api](https://github.com/Phycrypp/olabrows-api) — Spring Boot REST API
- [ola-terraform](https://github.com/Phycrypp/ola-terraform) — Infrastructure as Code

## Live URLs
- 🌐 [olabrows.store](https://olabrows.store) — Production
- 🔗 [api.olabrows.store](https://api.olabrows.store) — REST API
- 🔐 [admin.olabrows.store](https://admin.olabrows.store) — Admin Dashboard

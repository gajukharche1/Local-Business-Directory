1. Issues Identified & Resolved
Docker Hub MinIO Deprecation: Official minio/minio images were retired from Docker Hub and Quay.io was restricted. Updated docker-compose.yml to use Chainguard's public, production-grade image (cgr.dev/chainguard/minio:latest).
Missing Web Service in Compose: docker-compose.yml originally only ran PostgreSQL, Redis, and MinIO. Added the web container service with healthcheck dependencies and internal network environment variables.
Missing public/ Folder: Dockerfile stage 4 expected /app/public. Created public/.gitkeep so the production stage copies cleanly.
Google Fonts Build Timeout: Docker build environments can timeout downloading external Google Fonts (Inter). Replaced external font fetching in app/layout.tsx with the system font stack.
Database Initialization & Seeding: Pushed the Prisma schema (18 tables) into PostgreSQL and executed the seed script (seed.ts), populating sample listings, categories, locations, and users.
2. Live Containers in Docker Desktop
Container Name	Service	Status	Port Mapping
ps-web	Next.js 15 App (Standalone)	Up (Running)	http://localhost:3000

ps-postgres	PostgreSQL 16 (Alpine)	Up (Healthy)	localhost:5432
ps-redis	Redis 7 (Alpine)	Up (Healthy)	localhost:6379
ps-minio	MinIO Object Storage	Up (Running)	9000 (API) & http://localhost:9001
 (Console)
3. Quick Access URLs & Credentials
Web Application: http://localhost:3000
Health Check: http://localhost:3000/api/health
Sample Listing: http://localhost:3000/listing/govind-garden-multi-cuisine-restaurant
MinIO Console: http://localhost:9001
 (minioadmin / minioadmin)
Pre-seeded Test Accounts:
Role	Email	Password
Admin	admin@pimplesaudagar.local	PimpleSaudagar@2026
Business Owner	owner@pimplesaudagar.local	PimpleSaudagar@2026
Visitor	visitor@pimplesaudagar.local	PimpleSaudagar@2026
4. Useful Management Commands
View in Docker Desktop GUI: Open Docker Desktop to see the ps application group with logs, CPU/memory stats, and inspect tabs.
View container logs:
powershell
docker logs -f ps-web
Stop containers:
powershell
docker compose down
Restart containers:
powershell
docker compose up -d
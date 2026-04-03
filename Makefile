# ──────────────────────────────────────────────────────────────
# Wants AI — Developer Makefile
# ──────────────────────────────────────────────────────────────

.DEFAULT_GOAL := help
SHELL := /bin/bash

# Colors
CYAN  := \033[36m
GREEN := \033[32m
RESET := \033[0m

# ─── Development ─────────────────────────────────────────────

.PHONY: dev
dev: ## Start all services with Docker Compose
	docker compose up --build

.PHONY: dev-local
dev-local: ## Start backend & frontend locally (no Docker)
	@echo "Starting backend and frontend in parallel..."
	@(cd backend && npm run start:dev) & \
	 (cd frontend && npm run dev) & \
	 wait

.PHONY: dev-backend
dev-backend: ## Start only the backend locally
	cd backend && npm run start:dev

.PHONY: dev-frontend
dev-frontend: ## Start only the frontend locally
	cd frontend && npm run dev

# ─── Build ───────────────────────────────────────────────────

.PHONY: build
build: ## Build all services
	npm run build --workspaces

.PHONY: build-docker
build-docker: ## Build Docker images
	docker compose build

.PHONY: build-prod
build-prod: ## Build production Docker images
	docker compose -f docker-compose.yml -f docker-compose.prod.yml build

# ─── Test & Lint ─────────────────────────────────────────────

.PHONY: test
test: ## Run all tests
	npm run test --workspaces --if-present

.PHONY: test-backend
test-backend: ## Run backend tests
	cd backend && npm test

.PHONY: test-frontend
test-frontend: ## Run frontend tests
	cd frontend && npm test

.PHONY: lint
lint: ## Run linting across all workspaces
	npm run lint --workspaces --if-present

.PHONY: lint-fix
lint-fix: ## Run linting with auto-fix
	npm run lint:fix --workspaces --if-present

# ─── Docker ──────────────────────────────────────────────────

.PHONY: docker-up
docker-up: ## Start Docker services in background
	docker compose up -d

.PHONY: docker-down
docker-down: ## Stop Docker services
	docker compose down

.PHONY: docker-logs
docker-logs: ## Tail logs from all Docker services
	docker compose logs -f

.PHONY: docker-ps
docker-ps: ## Show running Docker services
	docker compose ps

.PHONY: docker-restart
docker-restart: ## Restart all Docker services
	docker compose restart

.PHONY: docker-prod
docker-prod: ## Start production stack
	docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# ─── Database ────────────────────────────────────────────────

.PHONY: db-migrate
db-migrate: ## Run database migrations
	cd backend && npm run migration:run --if-present

.PHONY: db-seed
db-seed: ## Seed development data
	cd backend && npm run seed --if-present

.PHONY: db-reset
db-reset: ## Reset database (drop, create, migrate, seed)
	@echo "$(CYAN)Resetting database...$(RESET)"
	docker compose exec postgres psql -U $${POSTGRES_USER:-wants} -c "DROP DATABASE IF EXISTS $${POSTGRES_DB:-wants};"
	docker compose exec postgres psql -U $${POSTGRES_USER:-wants} -c "CREATE DATABASE $${POSTGRES_DB:-wants};"
	@$(MAKE) db-migrate
	@$(MAKE) db-seed
	@echo "$(GREEN)Database reset complete.$(RESET)"

.PHONY: db-shell
db-shell: ## Open a psql shell to the database
	docker compose exec postgres psql -U $${POSTGRES_USER:-wants} $${POSTGRES_DB:-wants}

# ─── Setup & Maintenance ────────────────────────────────────

.PHONY: setup
setup: ## First-time project setup
	@echo "$(CYAN)Setting up Wants AI development environment...$(RESET)"
	@echo ""
	@# Copy env files if they don't exist
	@if [ ! -f backend/.env ]; then \
		if [ -f backend/.env.example ]; then \
			cp backend/.env.example backend/.env; \
			echo "  Created backend/.env from .env.example"; \
		else \
			echo "  Warning: No backend/.env.example found"; \
		fi \
	else \
		echo "  backend/.env already exists, skipping"; \
	fi
	@if [ ! -f frontend/.env ]; then \
		if [ -f frontend/.env.example ]; then \
			cp frontend/.env.example frontend/.env; \
			echo "  Created frontend/.env from .env.example"; \
		else \
			echo "  Warning: No frontend/.env.example found"; \
		fi \
	else \
		echo "  frontend/.env already exists, skipping"; \
	fi
	@echo ""
	@# Install dependencies
	@echo "  Installing dependencies..."
	npm install
	@echo ""
	@echo "$(GREEN)Setup complete! Run 'make dev' to start developing.$(RESET)"

.PHONY: clean
clean: ## Clean build artifacts and node_modules
	@echo "$(CYAN)Cleaning build artifacts...$(RESET)"
	rm -rf backend/dist
	rm -rf frontend/dist
	rm -rf backend/node_modules
	rm -rf frontend/node_modules
	rm -rf node_modules
	docker compose down -v --remove-orphans 2>/dev/null || true
	@echo "$(GREEN)Clean complete.$(RESET)"

.PHONY: install
install: ## Install all dependencies
	npm install

.PHONY: update
update: ## Update all dependencies
	npm update --workspaces
	npm update

# ─── Help ────────────────────────────────────────────────────

.PHONY: help
help: ## Show this help message
	@echo ""
	@echo "$(CYAN)Wants AI — Available Commands$(RESET)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-18s$(RESET) %s\n", $$1, $$2}'
	@echo ""

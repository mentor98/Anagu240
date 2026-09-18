# Anagu Land Administration Framework — Makefile
# Single entry point for all development commands.
# Usage: make <target>

.PHONY: help up down ps logs install build test deploy-local seed-local \
        verify-local test-contracts test-backend test-web clean reset \
        dev-backend dev-web dev-mobile component4 status

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

up: ## Start all Docker services (postgres, redis, minio, mqtt, besu)
	docker compose up -d
	@echo "✓ All services started. Waiting for health checks..."
	@sleep 5
	docker compose ps

down: ## Stop all Docker services
	docker compose down

ps: ## Show service status
	docker compose ps

logs: ## Tail all service logs
	docker compose logs -f

install: ## Install all npm dependencies across monorepo
	cd apps/backend && npm install
	cd apps/web && npm install
	cd apps/mobile && npm install
	cd contracts && npm install
	@echo "✓ All dependencies installed"

build: ## Build all apps
	cd apps/backend && npm run build
	cd apps/web && npm run build
	cd contracts && npm run compile

test: test-contracts test-backend test-web ## Run ALL tests

test-contracts: ## Run smart contract tests (Hardhat, in-process network)
	cd contracts && npm test

test-backend: ## Run NestJS backend tests (Jest)
	cd apps/backend && npm test

test-web: ## Run Next.js type check
	cd apps/web && npm run type-check

deploy-local: ## Deploy smart contracts to local Besu node
	@echo "Deploying contracts to Besu (http://localhost:8545)..."
	cd contracts && npm run deploy:local
	@echo "✓ Contracts deployed. Update .env with the printed addresses."

seed-local: ## Seed test data to local Besu node
	cd contracts && npx hardhat run scripts/seed.ts --network besu_local

verify-local: ## Verify deployed contracts on local Besu
	cd contracts && npx hardhat run scripts/verify.ts --network besu_local

dev-backend: ## Start NestJS backend in watch mode
	cd apps/backend && npm run start:dev

dev-web: ## Start Next.js web app in dev mode
	cd apps/web && npm run dev

dev-mobile: ## Start Expo mobile app
	cd apps/mobile && npx expo start

component4: ## Run ALL Component 4 evaluation tests (fraud, latency, storage)
	@echo "Running Component 4 cross-cutting evaluation..."
	cd apps/backend && npx jest src/evaluation/fraud-scenarios.spec.ts src/evaluation/latency-benchmark.spec.ts src/evaluation/storage-overhead.spec.ts --verbose --runInBand
	@echo "✓ Component 4 evaluation complete. Fill in PROJECT.md Tables 4B, 4C, 4D with printed results."

clean: ## Remove all build artifacts and node_modules
	rm -rf apps/backend/dist apps/backend/node_modules
	rm -rf apps/web/.next apps/web/node_modules
	rm -rf apps/mobile/node_modules
	rm -rf contracts/artifacts contracts/cache contracts/typechain-types contracts/node_modules
	@echo "✓ Clean complete"

reset: down clean ## Stop services, delete build artifacts (keeps data volumes)
	@echo "✓ Reset complete. Run 'make up && make install' to start fresh."

status: ## Full project status check
	@echo "=== Docker Services ===" && docker compose ps
	@echo ""
	@echo "=== Git Status ===" && git status --short
	@echo ""
	@echo "=== Remote ===" && git remote -v

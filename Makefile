# Anagu Land Administration Framework — Makefile
.PHONY: help up down ps logs install build test test-contracts test-backend \
        test-web deploy-local seed-local verify-local dev-backend dev-web \
        dev-mobile component4 fraud latency storage clean reset status

help: ## Show available commands
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
	  awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# ── Infrastructure ──────────────────────────────────────────────────────────
up: ## Start all Docker services (postgres, redis, minio, mqtt, besu)
	docker compose up -d
	@echo ""
	@echo "⏳  Waiting 10 s for services to initialise..."
	@sleep 10
	@docker compose ps

down: ## Stop all Docker services
	docker compose down

ps: ## Show service status
	docker compose ps

logs: ## Tail logs from all services
	docker compose logs -f

# ── Dependencies ────────────────────────────────────────────────────────────
install: ## Install all npm dependencies
	npm install --legacy-peer-deps
	@echo "✓ All workspace dependencies installed"

# ── Development servers ─────────────────────────────────────────────────────
dev-backend: ## Start NestJS backend in watch mode (port 3001)
	cd apps/backend && ../../node_modules/.bin/nest start --watch

dev-web: ## Start Next.js web app (port 3000)
	cd apps/web && ../../node_modules/.bin/next dev -p 3000

dev-mobile: ## Start Expo mobile app
	cd apps/mobile && npx expo start

# ── Build ───────────────────────────────────────────────────────────────────
build: ## Build backend + web + contracts
	cd apps/backend && ../../node_modules/.bin/nest build
	cd apps/web && ../../node_modules/.bin/next build
	$(MAKE) compile-contracts
	@echo "✓ All builds complete"

# ── Contracts ───────────────────────────────────────────────────────────────
compile-contracts: ## Compile Solidity contracts
	@echo "Compiling contracts..."
	@cd contracts && HARDHAT_DISABLE_NODE_VERSION_CHECK=true \
	  ../node_modules/.bin/hardhat compile
	@echo "✓ Contracts compiled"

test-contracts: compile-contracts ## Run smart contract tests (in-process Hardhat)
	@echo "Running contract tests..."
	@cd contracts && HARDHAT_DISABLE_NODE_VERSION_CHECK=true \
	  ../node_modules/.bin/hardhat test
	@echo "✓ Contract tests complete"

deploy-local: compile-contracts ## Deploy contracts to local Besu node
	@echo "Deploying contracts to Besu (http://localhost:8545)..."
	@cd contracts && HARDHAT_DISABLE_NODE_VERSION_CHECK=true \
	  ../node_modules/.bin/hardhat run scripts/deploy.ts --network besu_local
	@echo "✓ Deployed. Copy the printed addresses into .env"

seed-local: ## Seed test NFT titles on local Besu
	@cd contracts && HARDHAT_DISABLE_NODE_VERSION_CHECK=true \
	  ../node_modules/.bin/hardhat run scripts/seed.ts --network besu_local

verify-local: ## Verify deployed contracts on local Besu
	@cd contracts && HARDHAT_DISABLE_NODE_VERSION_CHECK=true \
	  ../node_modules/.bin/hardhat run scripts/verify.ts --network besu_local

# ── Backend tests ───────────────────────────────────────────────────────────
test-backend: ## Run NestJS backend unit tests (44 tests, no DB needed)
	@cd apps/backend && ../../node_modules/.bin/jest --runInBand --silent
	@echo "✓ Backend tests complete"

# ── Web type-check ──────────────────────────────────────────────────────────
test-web: ## TypeScript type-check the Next.js web app
	@cd apps/web && ../../node_modules/.bin/tsc --noEmit
	@echo "✓ Web type-check complete"

# ── All tests ───────────────────────────────────────────────────────────────
test: test-contracts test-backend test-web ## Run ALL tests
	@echo ""
	@echo "✅  All test suites passed"

# ── Component 4 evaluation ──────────────────────────────────────────────────
component4: ## Run Component 4 evaluation (fraud + latency + storage) → Tables 4B/4C/4D
	@echo "Running Component 4 cross-cutting evaluation..."
	@cd apps/backend && ../../node_modules/.bin/jest \
	  --testPathPattern="evaluation" \
	  --runInBand --verbose
	@echo ""
	@echo "✓ Copy the printed tables into PROJECT.md Section 18"

fraud: ## Fraud scenario tests only (Table 4B)
	@cd apps/backend && ../../node_modules/.bin/jest \
	  --testPathPattern="fraud-scenarios" --runInBand --verbose

latency: ## Latency benchmark only (Table 4C)
	@cd apps/backend && ../../node_modules/.bin/jest \
	  --testPathPattern="latency-benchmark" --runInBand --verbose

storage: ## Storage overhead only (Table 4D)
	@cd apps/backend && ../../node_modules/.bin/jest \
	  --testPathPattern="storage-overhead" --runInBand --verbose

# ── Status / cleanup ────────────────────────────────────────────────────────
status: ## Full project status
	@echo "=== Docker ===" && docker compose ps
	@echo "" && echo "=== Git ===" && git log --oneline -4
	@echo "" && echo "=== Remote ===" && git remote -v

clean: ## Remove build artifacts
	rm -rf apps/backend/dist
	rm -rf apps/web/.next
	rm -rf contracts/artifacts contracts/cache contracts/typechain-types contracts/dist
	@echo "✓ Build artifacts removed"

reset: down clean ## Stop services and remove artifacts
	@echo "✓ Reset complete. Run 'make up && make install' to start fresh."

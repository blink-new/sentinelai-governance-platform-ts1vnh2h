# SentinelAI Development Makefile

.PHONY: help dev-setup build test lint clean docker-build docker-up docker-down

# Default target
help:
	@echo "🛡️  SentinelAI Development Commands"
	@echo ""
	@echo "Setup:"
	@echo "  dev-setup     Install all development dependencies"
	@echo "  build         Build all components"
	@echo ""
	@echo "Development:"
	@echo "  dev-rust      Start Rust CLI development"
	@echo "  dev-server    Start Python FastAPI server"
	@echo "  dev-web       Start React web dashboard"
	@echo ""
	@echo "Testing:"
	@echo "  test          Run all tests"
	@echo "  test-rust     Run Rust tests"
	@echo "  test-server   Run Python tests"
	@echo "  test-web      Run React tests"
	@echo ""
	@echo "Quality:"
	@echo "  lint          Run all linters"
	@echo "  lint-rust     Run Rust linter"
	@echo "  lint-server   Run Python linter"
	@echo "  lint-web      Run React linter"
	@echo ""
	@echo "Docker:"
	@echo "  docker-build  Build all Docker images"
	@echo "  docker-up     Start all services with Docker Compose"
	@echo "  docker-down   Stop all Docker services"
	@echo ""
	@echo "Utilities:"
	@echo "  clean         Clean all build artifacts"
	@echo "  logs          View Docker Compose logs"

# Development setup
dev-setup:
	@echo "🔧 Setting up development environment..."
	
	# Install Rust dependencies
	@echo "📦 Installing Rust dependencies..."
	cd core && cargo build
	
	# Install Python dependencies
	@echo "🐍 Installing Python dependencies..."
	cd server && pip install -r requirements.txt
	
	# Install Node.js dependencies
	@echo "📦 Installing Node.js dependencies..."
	cd web && npm install
	
	@echo "✅ Development environment ready!"

# Build all components
build:
	@echo "🏗️  Building all components..."
	
	# Build Rust CLI
	@echo "🦀 Building Rust CLI..."
	cd core && cargo build --release
	
	# Build Python server (no build step needed)
	@echo "🐍 Python server ready"
	
	# Build React web dashboard
	@echo "⚛️  Building React dashboard..."
	cd web && npm run build
	
	@echo "✅ All components built successfully!"

# Development servers
dev-rust:
	@echo "🦀 Starting Rust CLI development..."
	cd core && cargo run -- --help

dev-server:
	@echo "🐍 Starting Python FastAPI server..."
	cd server && uvicorn main:app --host 0.0.0.0 --port 8000 --reload

dev-web:
	@echo "⚛️  Starting React web dashboard..."
	cd web && npm run dev

# Testing
test: test-rust test-server test-web

test-rust:
	@echo "🧪 Running Rust tests..."
	cd core && cargo test

test-server:
	@echo "🧪 Running Python tests..."
	cd server && python -m pytest tests/ -v

test-web:
	@echo "🧪 Running React tests..."
	cd web && npm test

# Linting
lint: lint-rust lint-server lint-web

lint-rust:
	@echo "🔍 Running Rust linter..."
	cd core && cargo clippy -- -D warnings
	cd core && cargo fmt --check

lint-server:
	@echo "🔍 Running Python linter..."
	cd server && black --check .
	cd server && flake8 .
	cd server && mypy .

lint-web:
	@echo "🔍 Running React linter..."
	cd web && npm run lint

# Docker operations
docker-build:
	@echo "🐳 Building Docker images..."
	docker-compose build

docker-up:
	@echo "🚀 Starting all services with Docker Compose..."
	docker-compose up -d
	@echo "✅ Services started!"
	@echo "   🌐 Web Dashboard: http://localhost:3000"
	@echo "   🔌 API Server: http://localhost:8000"
	@echo "   📊 API Docs: http://localhost:8000/docs"

docker-down:
	@echo "🛑 Stopping Docker services..."
	docker-compose down

logs:
	@echo "📋 Viewing Docker Compose logs..."
	docker-compose logs -f

# Utilities
clean:
	@echo "🧹 Cleaning build artifacts..."
	
	# Clean Rust
	cd core && cargo clean
	
	# Clean Python
	find server -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find server -name "*.pyc" -delete 2>/dev/null || true
	
	# Clean Node.js
	cd web && rm -rf node_modules dist build
	
	@echo "✅ Cleanup complete!"

# CLI shortcuts
install-cli:
	@echo "📦 Installing SentinelAI CLI..."
	cd core && cargo install --path .
	@echo "✅ CLI installed! Try: sentinelai --help"

demo:
	@echo "🎬 Running SentinelAI demo..."
	@echo "1. Starting services..."
	make docker-up
	@echo "2. Waiting for services to be ready..."
	sleep 10
	@echo "3. Running CLI demo..."
	sentinelai auth login --api-key sk_demo_key
	sentinelai policy list
	sentinelai evaluate --content "Hello world" --format table
	@echo "✅ Demo complete!"

# Development workflow
dev-all:
	@echo "🚀 Starting full development environment..."
	@echo "Starting MongoDB..."
	docker run -d -p 27017:27017 --name sentinelai-mongo mongo:latest || true
	@echo "Starting services in parallel..."
	make dev-server &
	make dev-web &
	@echo "✅ Development environment running!"
	@echo "   🌐 Web Dashboard: http://localhost:3000"
	@echo "   🔌 API Server: http://localhost:8000"
	@echo "   📊 API Docs: http://localhost:8000/docs"

# Production deployment
deploy-prod:
	@echo "🚀 Deploying to production..."
	docker-compose -f docker-compose.prod.yml up -d
	@echo "✅ Production deployment complete!"

# Health checks
health:
	@echo "🏥 Checking service health..."
	@echo "API Server:"
	curl -f http://localhost:8000/health || echo "❌ API Server down"
	@echo "Web Dashboard:"
	curl -f http://localhost:3000 || echo "❌ Web Dashboard down"
	@echo "MongoDB:"
	docker exec sentinelai-mongo mongosh --eval "db.adminCommand('ping')" || echo "❌ MongoDB down"
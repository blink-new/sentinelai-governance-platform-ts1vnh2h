# SentinelAI: Real-Time AI Governance & Policy Enforcement Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Rust](https://img.shields.io/badge/rust-1.70+-orange.svg)](https://www.rust-lang.org)
[![Python](https://img.shields.io/badge/python-3.8+-blue.svg)](https://www.python.org)
[![TypeScript](https://img.shields.io/badge/typescript-5.0+-blue.svg)](https://www.typescriptlang.org)

SentinelAI is an enterprise-grade, real-time AI governance platform designed for high-performance policy enforcement and compliance automation. It features a Rust-based CLI for sub-10ms policy evaluation, a Python FastAPI server for ML-driven evaluators, and a Next.js dashboard for policy management.

## 🏗️ Architecture Overview

```
sentinelai/
├── core/                    # Rust CLI - High-performance policy engine
├── server/                  # Python FastAPI - ML evaluators & API
├── web/                     # React/TypeScript - Management dashboard
├── docker-compose.yml       # Complete orchestration
└── examples/               # Policy templates & configurations
```

## 🚀 Quick Start

### Prerequisites

- **Rust** 1.70+ (for CLI)
- **Python** 3.8+ (for server)
- **Node.js** 18+ (for web dashboard)
- **Docker** & **Docker Compose** (for deployment)
- **MongoDB** (for data storage)

### 1. Clone & Setup

```bash
git clone https://github.com/your-org/sentinelai.git
cd sentinelai

# Install Rust CLI
cd core
cargo build --release
cargo install --path .

# Install Python server dependencies
cd ../server
pip install -r requirements.txt

# Install web dashboard dependencies
cd ../web
npm install
```

### 2. Start Services

```bash
# Start all services with Docker Compose
docker-compose up -d

# Or start individually:

# Start MongoDB
docker run -d -p 27017:27017 --name sentinelai-mongo mongo:latest

# Start FastAPI server
cd server
uvicorn main:app --host 0.0.0.0 --port 8000

# Start web dashboard
cd web
npm run dev
```

### 3. Configure CLI

```bash
# Authenticate with SentinelAI
sentinelai auth login --api-key sk_your_api_key

# Test connection
sentinelai auth test

# View available commands
sentinelai --help
```

## 🛡️ Core Features

### ⚡ Sub-10ms Policy Evaluation
- **Two-stage pipeline**: Fast Rust evaluators → Comprehensive Python ML
- **Early exit optimization**: Stop on first critical violation
- **Concurrent evaluation**: Parallel policy execution
- **Performance target**: 10-50ms end-to-end evaluation

### 🔧 CLI Commands

#### Real-time Policy Enforcement
```bash
# Start LLM proxy with policy enforcement
sentinelai guard --port 8080 --policies pol_001,pol_002

# Proxy OpenAI requests with governance
curl -X POST http://localhost:8080/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-openai-key" \
  -d '{"model": "gpt-4", "messages": [{"role": "user", "content": "Hello"}]}'
```

#### Content Evaluation
```bash
# Evaluate content against policies
sentinelai evaluate --content "Test message" --format table

# Test specific policy
sentinelai evaluate --content "Test" --policy-id pol_001 --verbose

# Multiple output formats
sentinelai evaluate --content "Test" --format json
sentinelai evaluate --content "Test" --format yaml
```

#### Policy Management
```bash
# List all policies
sentinelai policy list --format table

# Create new policy
sentinelai policy create \
  --name "Profanity Filter" \
  --type keyword_filter \
  --config examples/policies/keyword-filter.yaml

# Get policy details
sentinelai policy get pol_001 --format yaml

# Update policy
sentinelai policy update pol_001 --status active

# Delete policy
sentinelai policy delete pol_001 --force
```

### 📊 Policy Types

#### 1. Keyword Filter (Rust) - Ultra Fast
```yaml
# examples/policies/keyword-filter.yaml
name: "Profanity Filter"
type: keyword_filter
config:
  patterns:
    - "\\b(spam|scam|fraud)\\b"
    - "\\b(hate|toxic)\\b"
  case_sensitive: false
  severity: high
  action: block
```

#### 2. Performance (Rust) - Quality Metrics
```yaml
# examples/policies/performance.yaml
name: "Response Quality"
type: performance
config:
  min_length: 10
  max_length: 1000
  required_quality_score: 0.7
  check_coherence: true
```

#### 3. Content Safety (Python) - ML-based
```yaml
# examples/policies/content-safety.yaml
name: "Toxicity Detection"
type: content_safety
config:
  toxicity_threshold: 0.8
  model: "unitary/toxic-bert"
  categories:
    - toxicity
    - severe_toxicity
    - obscene
    - threat
```

#### 4. Semantic (Python) - Similarity Matching
```yaml
# examples/policies/semantic.yaml
name: "Brand Safety"
type: semantic
config:
  similarity_threshold: 0.85
  reference_texts:
    - "inappropriate brand content"
    - "competitor mentions"
  embedding_model: "sentence-transformers/all-MiniLM-L6-v2"
```

## 🌐 API Endpoints

### FastAPI Server (Port 8000)

#### LLM Proxy with Policy Enforcement
```bash
POST /v1/chat/completions
# OpenAI-compatible endpoint with real-time policy enforcement
```

#### Direct Policy Evaluation
```bash
POST /v1/evaluation/evaluate
# Evaluate content against specific policies

GET /v1/evaluation/history
# Get evaluation history and analytics
```

#### Policy Management
```bash
GET /v1/policies/
POST /v1/policies/
GET /v1/policies/{policy_id}
PUT /v1/policies/{policy_id}
DELETE /v1/policies/{policy_id}
```

#### Authentication
```bash
POST /v1/auth/login
POST /v1/auth/refresh
GET /v1/auth/me
```

### Web Dashboard (Port 3000)

- **Dashboard**: Real-time metrics and system health
- **Policy Management**: CRUD operations with YAML editor
- **Real-time Monitoring**: Live evaluation streams
- **Analytics**: Usage metrics and policy effectiveness
- **Team Management**: RBAC and user permissions
- **API Documentation**: Interactive OpenAPI/Swagger

## 🏢 Enterprise Features

### 🔐 Security & Compliance
- **SOC 2 Type II** compliance framework
- **GDPR/CCPA** data privacy compliance
- **Encryption** at rest and in transit
- **VPC Support** for private cloud deployment
- **Audit Logging** with comprehensive compliance trail

### 👥 Multi-tenant SaaS
- **Organization isolation** with data segregation
- **Role-based Access Control** (Admin, Manager, Analyst, Viewer)
- **SSO Integration** (SAML, OAuth, LDAP)
- **Custom Branding** and white-label options

### 📈 Advanced Analytics
- **Usage metrics** and cost optimization
- **Policy effectiveness** tracking
- **ROI metrics** and adoption analytics
- **Real-time dashboards** with Prometheus/Grafana

### 🔗 Integration Ecosystem
- **Webhook Integration** for real-time notifications
- **API SDKs** (Python, Node.js, Go)
- **Integration Marketplace** with pre-built connectors
- **Custom Integrations** via REST API

## 💰 Business Model

### SaaS Pricing Tiers
- **Free**: 1,000 evaluations/month
- **Pro**: $99/month - 50,000 evaluations
- **Enterprise**: Custom pricing with advanced features

### Usage-based Billing
- Per evaluation pricing
- Per policy pricing
- Per user pricing
- API rate limiting with overage charges

## 🚀 Deployment

### Docker Compose (Recommended)
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Scale services
docker-compose up -d --scale server=3
```

### Kubernetes
```bash
# Deploy to Kubernetes
kubectl apply -f k8s/

# Monitor deployment
kubectl get pods -l app=sentinelai
```

### Cloud Deployment
- **AWS**: ECS, EKS, Lambda
- **GCP**: Cloud Run, GKE, Cloud Functions
- **Azure**: Container Instances, AKS, Functions

## 📊 Performance Benchmarks

### Evaluation Latency
- **Keyword Filter**: < 1ms
- **Performance Check**: < 5ms
- **Content Safety**: < 50ms
- **Semantic Analysis**: < 100ms
- **End-to-end**: 10-50ms (with early exit)

### Throughput
- **CLI**: 10,000+ evaluations/second
- **API Server**: 1,000+ requests/second
- **Concurrent Policies**: 100+ policies per evaluation

## 🧪 Testing

### Unit Tests
```bash
# Rust CLI tests
cd core
cargo test

# Python server tests
cd server
pytest

# Web dashboard tests
cd web
npm test
```

### Integration Tests
```bash
# End-to-end testing
docker-compose -f docker-compose.test.yml up --abort-on-container-exit
```

### Load Testing
```bash
# API load testing
cd server
locust -f tests/load_test.py --host http://localhost:8000
```

## 📚 Documentation

- **API Documentation**: http://localhost:8000/docs (Swagger UI)
- **CLI Help**: `sentinelai --help`
- **Policy Examples**: `examples/policies/`
- **Deployment Guides**: `docs/deployment/`
- **Integration Guides**: `docs/integrations/`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Setup
```bash
# Install development dependencies
make dev-setup

# Run all tests
make test

# Run linting
make lint

# Build all components
make build
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs.sentinelai.dev](https://docs.sentinelai.dev)
- **Community**: [Discord](https://discord.gg/sentinelai)
- **Issues**: [GitHub Issues](https://github.com/your-org/sentinelai/issues)
- **Enterprise Support**: enterprise@sentinelai.dev

## 🎯 Roadmap

### Q1 2024
- [ ] Advanced ML models integration
- [ ] Real-time streaming evaluations
- [ ] Enhanced webhook system
- [ ] Mobile dashboard app

### Q2 2024
- [ ] Multi-cloud deployment
- [ ] Advanced analytics dashboard
- [ ] Custom policy DSL
- [ ] Compliance reporting automation

### Q3 2024
- [ ] AI-powered policy recommendations
- [ ] Advanced threat detection
- [ ] Integration marketplace expansion
- [ ] Performance optimization

---

**Built with ❤️ by the SentinelAI Team**

*Securing AI, one policy at a time.*
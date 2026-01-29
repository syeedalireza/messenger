# Kubernetes Deployment Guide

## Prerequisites

- Kubernetes cluster (1.24+)
- kubectl configured
- Nginx Ingress Controller
- Cert-manager (for TLS)

## Quick Start

### 1. Create Namespace

```bash
kubectl apply -f namespace.yaml
```

### 2. Create Secrets

**IMPORTANT:** Update `secrets.yaml` with actual production values before applying!

```bash
# Generate secure secrets
kubectl create secret generic messenger-secrets \
  --from-literal=POSTGRES_PASSWORD=$(openssl rand -base64 32) \
  --from-literal=REDIS_PASSWORD=$(openssl rand -base64 32) \
  --from-literal=JWT_SECRET=$(openssl rand -base64 32) \
  --from-literal=JWT_REFRESH_SECRET=$(openssl rand -base64 32) \
  --from-literal=MINIO_ROOT_PASSWORD=$(openssl rand -base64 32) \
  --from-literal=MEILISEARCH_MASTER_KEY=$(openssl rand -base64 32) \
  -n messenger
```

### 3. Apply ConfigMaps

```bash
kubectl apply -f configmap.yaml
```

### 4. Deploy Infrastructure

```bash
kubectl apply -f postgres-deployment.yaml
kubectl apply -f redis-deployment.yaml
kubectl apply -f minio-deployment.yaml
kubectl apply -f meilisearch-deployment.yaml
```

### 5. Deploy Application

```bash
kubectl apply -f backend-deployment.yaml
kubectl apply -f frontend-deployment.yaml
```

### 6. Setup Ingress

```bash
kubectl apply -f ingress.yaml
```

### 7. Run Database Migrations

```bash
kubectl exec -it deployment/backend -n messenger -- npx prisma migrate deploy
```

## Monitoring

### Check Pod Status

```bash
kubectl get pods -n messenger
```

### View Logs

```bash
# Backend logs
kubectl logs -f deployment/backend -n messenger

# Frontend logs
kubectl logs -f deployment/frontend -n messenger
```

### Check Services

```bash
kubectl get svc -n messenger
```

## Scaling

### Manual Scaling

```bash
kubectl scale deployment/backend --replicas=5 -n messenger
```

### Auto-scaling

HPA is configured to scale between 2-10 replicas based on CPU/Memory.

```bash
kubectl get hpa -n messenger
```

## Update Deployment

```bash
# Update with new image
kubectl set image deployment/backend backend=ghcr.io/your-username/messenger-backend:v2.0.0 -n messenger

# Rolling update
kubectl rollout status deployment/backend -n messenger

# Rollback if needed
kubectl rollout undo deployment/backend -n messenger
```

## Cleanup

```bash
kubectl delete namespace messenger
```

# Messenger Helm Chart

This Helm chart deploys the Messenger application on a Kubernetes cluster.

## Prerequisites

- Kubernetes 1.24+
- Helm 3.8+
- PV provisioner support in the underlying infrastructure
- Nginx Ingress Controller
- Cert-manager (for TLS certificates)

## Installing the Chart

### Add the repository (if published)

```bash
helm repo add messenger https://your-repo-url.com
helm repo update
```

### Install from local

```bash
# From the helm directory
helm install messenger ./messenger

# With custom values
helm install messenger ./messenger -f custom-values.yaml

# With namespace
helm install messenger ./messenger --namespace messenger --create-namespace
```

## Configuration

### Important Values to Override

Create a `custom-values.yaml` file:

```yaml
ingress:
  hosts:
    - host: your-domain.com
      paths:
        - path: /
          pathType: Prefix
  tls:
    - secretName: your-tls-secret
      hosts:
        - your-domain.com

secrets:
  jwtSecret: "your-secure-jwt-secret-min-32-chars"
  jwtRefreshSecret: "your-secure-refresh-secret"
  postgresPassword: "your-postgres-password"
  redisPassword: "your-redis-password"
  minioRootPassword: "your-minio-password"
  minioAccessKey: "your-access-key"
  minioSecretKey: "your-secret-key"
  meilisearch MasterKey: "your-meilisearch-key"

backend:
  image:
    repository: ghcr.io/your-username/messenger-backend
    tag: "v1.0.0"

frontend:
  image:
    repository: ghcr.io/your-username/messenger-frontend
    tag: "v1.0.0"
```

### Generate Secure Secrets

```bash
# Generate secure random secrets
openssl rand -base64 32  # JWT secret
openssl rand -base64 32  # Refresh secret
openssl rand -base64 24  # Passwords
```

## Upgrading

```bash
helm upgrade messenger ./messenger -f custom-values.yaml
```

## Uninstalling

```bash
helm uninstall messenger
```

## Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `backend.replicaCount` | Number of backend replicas | `3` |
| `backend.image.repository` | Backend image repository | `ghcr.io/your-username/messenger-backend` |
| `backend.image.tag` | Backend image tag | `latest` |
| `frontend.replicaCount` | Number of frontend replicas | `2` |
| `ingress.enabled` | Enable ingress | `true` |
| `ingress.className` | Ingress class name | `nginx` |
| `postgresql.enabled` | Enable PostgreSQL | `true` |
| `redis.enabled` | Enable Redis | `true` |
| `minio.enabled` | Enable MinIO | `true` |
| `meilisearch.enabled` | Enable MeiliSearch | `true` |

## Monitoring

To enable monitoring:

```yaml
monitoring:
  prometheus:
    enabled: true
  grafana:
    enabled: true
```

## Persistence

All data services use PersistentVolumes:

- PostgreSQL: 10Gi
- Redis: 1Gi
- MinIO: 20Gi
- MeiliSearch: 5Gi

Configure storage class:

```yaml
postgresql:
  primary:
    persistence:
      storageClass: "your-storage-class"
      size: 20Gi
```

## Scaling

### Manual Scaling

```bash
helm upgrade messenger ./messenger --set backend.replicaCount=5
```

### Auto-scaling

Auto-scaling is enabled by default with HPA:

```yaml
backend:
  autoscaling:
    enabled: true
    minReplicas: 2
    maxReplicas: 10
    targetCPUUtilizationPercentage: 70
```

## Troubleshooting

### Check pod status

```bash
kubectl get pods -l app.kubernetes.io/name=messenger
```

### View logs

```bash
kubectl logs -l app.kubernetes.io/component=backend
```

### Access services

```bash
# Port forward to backend
kubectl port-forward svc/messenger-backend 3001:3001

# Port forward to frontend
kubectl port-forward svc/messenger-frontend 3000:3000
```

## Support

For issues and questions, please visit:
https://github.com/your-username/messenger/issues

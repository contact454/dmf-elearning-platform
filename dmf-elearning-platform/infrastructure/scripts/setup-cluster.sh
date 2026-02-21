#!/bin/bash
# M8 Step 3 — K8s Cluster Setup Script
# Creates a production-ready K8s cluster + deploys DMF platform
#
# Prerequisites:
#   - gcloud CLI (for GKE) or aws CLI (for EKS) or az CLI (for AKS)
#   - kubectl, helm installed
#   - Required environment variables set (see .env.example at project root):
#     DATABASE_URL, REDIS_URL, SUPABASE_JWT_SECRET, ANTHROPIC_API_KEY
#
# Usage: ./setup-cluster.sh [gke|eks|aks]

set -euo pipefail

# ─── VALIDATE REQUIRED SECRETS ───
: "${DATABASE_URL:?ERROR: DATABASE_URL must be set}"
: "${REDIS_URL:?ERROR: REDIS_URL must be set}"
: "${SUPABASE_JWT_SECRET:?ERROR: SUPABASE_JWT_SECRET must be set}"
: "${ANTHROPIC_API_KEY:?ERROR: ANTHROPIC_API_KEY must be set}"

PROVIDER=${1:-gke}
PROJECT=dmf-elearning
REGION=asia-southeast1
CLUSTER_NAME=dmf-prod
NODE_COUNT=3
MACHINE_TYPE=e2-standard-2

echo "═══════════════════════════════════════"
echo "🚀 DMF eLearning — K8s Cluster Setup"
echo "  Provider: $PROVIDER"
echo "  Cluster:  $CLUSTER_NAME"
echo "  Region:   $REGION"
echo "═══════════════════════════════════════"

# ─── CREATE CLUSTER ───

case $PROVIDER in
  gke)
    echo "📦 Creating GKE cluster..."
    gcloud container clusters create $CLUSTER_NAME \
      --project=$PROJECT \
      --region=$REGION \
      --num-nodes=$NODE_COUNT \
      --machine-type=$MACHINE_TYPE \
      --enable-autoscaling --min-nodes=2 --max-nodes=10 \
      --enable-autorepair --enable-autoupgrade \
      --workload-pool="${PROJECT}.svc.id.goog" \
      --release-channel=regular

    gcloud container clusters get-credentials $CLUSTER_NAME \
      --region=$REGION --project=$PROJECT
    ;;

  eks)
    echo "📦 Creating EKS cluster..."
    eksctl create cluster \
      --name=$CLUSTER_NAME \
      --region=ap-southeast-1 \
      --nodegroup-name=dmf-nodes \
      --node-type=t3.medium \
      --nodes=$NODE_COUNT \
      --nodes-min=2 --nodes-max=10 \
      --managed
    ;;

  aks)
    echo "📦 Creating AKS cluster..."
    az aks create \
      --resource-group $PROJECT \
      --name $CLUSTER_NAME \
      --node-count $NODE_COUNT \
      --node-vm-size Standard_B2s \
      --enable-cluster-autoscaler --min-count 2 --max-count 10 \
      --generate-ssh-keys

    az aks get-credentials --resource-group $PROJECT --name $CLUSTER_NAME
    ;;

  *)
    echo "❌ Unknown provider: $PROVIDER. Use: gke, eks, or aks"
    exit 1
    ;;
esac

# ─── INSTALL PREREQUISITES ───

echo "📦 Installing nginx-ingress..."
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update
helm install ingress-nginx ingress-nginx/ingress-nginx \
  --namespace ingress-nginx --create-namespace \
  --set controller.replicaCount=2

echo "📦 Installing cert-manager..."
helm repo add jetstack https://charts.jetstack.io
helm install cert-manager jetstack/cert-manager \
  --namespace cert-manager --create-namespace \
  --set crds.enabled=true

# ─── CREATE SECRETS ───

echo "🔐 Creating secrets from environment variables..."
kubectl create namespace dmf-prod --dry-run=client -o yaml | kubectl apply -f -

kubectl create secret generic dmf-secrets \
  --namespace=dmf-prod \
  --from-literal=database-url="${DATABASE_URL}" \
  --from-literal=redis-url="${REDIS_URL}" \
  --from-literal=supabase-jwt-secret="${SUPABASE_JWT_SECRET}" \
  --from-literal=anthropic-api-key="${ANTHROPIC_API_KEY}" \
  --dry-run=client -o yaml | kubectl apply -f -

# ─── DEPLOY DMF ───

echo "🚀 Deploying DMF eLearning Platform..."
helm upgrade --install dmf-prod ../k8s/helm \
  --namespace=dmf-prod \
  --values=../k8s/helm/values.yaml \
  --wait --timeout=300s

echo ""
echo "═══════════════════════════════════════"
echo "✅ DMF Platform deployed!"
echo "  kubectl get pods -n dmf-prod"
echo "  kubectl get svc -n dmf-prod"
echo "═══════════════════════════════════════"

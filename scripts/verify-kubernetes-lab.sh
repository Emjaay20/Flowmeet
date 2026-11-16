#!/usr/bin/env bash
# Real single-node Kubernetes acceptance exercise. No public application traffic is moved.
set -euo pipefail
cd "$(dirname "$0")/.."
export KUBECONFIG="$PWD/.lab/kubeconfig"
export PATH="$PWD/.lab/tools:$PATH"
namespace=flowmeet-verification
kubectl create namespace "$namespace" --dry-run=client -o yaml | kubectl apply -f -
kubectl label namespace "$namespace" flowmeet-access=allowed --overwrite
kubectl create namespace flowmeet-denied --dry-run=client -o yaml | kubectl apply -f -
python3 - <<'PY'
import json,subprocess
from pathlib import Path
settings=dict(line.split('=',1) for line in Path('.env').read_text().splitlines() if '=' in line and not line.startswith('#'))
secret={'apiVersion':'v1','kind':'Secret','metadata':{'name':'flowmeet-service-auth','namespace':'flowmeet-verification'},'stringData':{'service-token':settings['FLOWMEET_SERVICE_TOKEN']}}
subprocess.run(['.lab/tools/kubectl','apply','-f','-'],input=json.dumps(secret),text=True,check=True)
PY
image=flowmeet-crawler:acceptance-20261116
docker tag flowmeet-platform-flowmeet-crawler:latest "$image"
kind load docker-image "$image" --name flowmeet-lab
helm upgrade --install flowmeet deploy/helm/flowmeet -n "$namespace" \
  --set crawler.image.repository=flowmeet-crawler --set crawler.image.tag=acceptance-20261116 \
  --set crawler.image.pullPolicy=Never --set crawler.autoscaling.enabled=false \
  --set crawler.replicaCount=2 --set crawler.resources.limits.memory=128Mi \
  --set crawler.serviceMonitor.enabled=false --wait --timeout 180s
kubectl -n "$namespace" rollout status deployment/flowmeet-crawler --timeout=120s
# Pod fixtures are limited to this acceptance namespace.
cat <<YAML | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: allowed-probe
  namespace: $namespace
spec:
  containers:
    - name: curl
      image: curlimages/curl:8.12.1
      command: ["sleep", "86400"]
---
apiVersion: v1
kind: Pod
metadata:
  name: denied-probe
  namespace: flowmeet-denied
spec:
  containers:
    - name: curl
      image: curlimages/curl:8.12.1
      command: ["sleep", "86400"]
---
apiVersion: v1
kind: Pod
metadata:
  name: private-target
  namespace: $namespace
spec:
  containers:
    - name: http
      image: python:3.12-alpine
      command: ["python", "-m", "http.server", "8080"]
YAML
kubectl -n "$namespace" wait pod/allowed-probe pod/private-target --for=condition=Ready --timeout=180s
kubectl -n flowmeet-denied wait pod/denied-probe --for=condition=Ready --timeout=180s
crawler_ip="$(kubectl -n "$namespace" get pod -l app.kubernetes.io/component=crawler -o jsonpath='{.items[0].status.podIP}')"
target_ip="$(kubectl -n "$namespace" get pod private-target -o jsonpath='{.status.podIP}')"
kubectl -n "$namespace" exec allowed-probe -- curl -fsS --max-time 5 "http://$crawler_ip:8081/health"
kubectl -n "$namespace" exec allowed-probe -- curl -fsS --max-time 5 "http://$target_ip:8080" >/dev/null
if kubectl -n flowmeet-denied exec denied-probe -- curl -fsS --max-time 3 "http://$crawler_ip:8081/health"; then
  echo 'FAIL: unlabelled namespace reached crawler'; exit 1
fi
if kubectl -n "$namespace" exec deployment/flowmeet-crawler -- curl -fsS --max-time 3 "http://$target_ip:8080"; then
  echo 'FAIL: crawler reached private target'; exit 1
fi
kubectl -n "$namespace" exec deployment/flowmeet-crawler -- curl -fsS --max-time 15 https://example.com >/dev/null
kubectl -n "$namespace" exec allowed-probe -- curl -fsS --max-time 5 "http://$crawler_ip:8081/metrics" | grep flowmeet_crawler_active_requests
# Simulate an invalid rollout, then recover using the Helm release history.
previous="$(helm -n "$namespace" history flowmeet -o json | python3 -c 'import json,sys; print(json.load(sys.stdin)[-1]["revision"])')"
helm upgrade flowmeet deploy/helm/flowmeet -n "$namespace" --reuse-values --set crawler.image.tag=intentionally-missing
if kubectl -n "$namespace" rollout status deployment/flowmeet-crawler --timeout=20s; then
  echo 'FAIL: invalid image unexpectedly rolled out'; exit 1
fi
helm rollback flowmeet "$previous" -n "$namespace" --wait --timeout 120s
kubectl -n "$namespace" rollout status deployment/flowmeet-crawler --timeout=120s
kubectl -n "$namespace" get pods -l app.kubernetes.io/component=crawler
helm -n "$namespace" history flowmeet
printf '\nPASS: readiness, health, metrics, allowed ingress, denied ingress, denied private egress, public HTTPS, failed rollout and rollback\n'

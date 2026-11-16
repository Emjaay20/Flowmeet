#!/usr/bin/env bash
# Run on the deployment host. Isolated Docker-backed Kubernetes, not the public gateway.
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p .lab/tools
chmod 700 .lab
if [[ ! -x .lab/tools/kind ]]; then
  curl -fsSL https://kind.sigs.k8s.io/dl/v0.33.0/kind-linux-amd64 -o .lab/tools/kind
  curl -fsSL https://github.com/kubernetes-sigs/kind/releases/download/v0.33.0/kind-linux-amd64.sha256sum -o .lab/tools/kind.sha256sum
  expected="$(cut -d ' ' -f1 .lab/tools/kind.sha256sum)"
  actual="$(sha256sum .lab/tools/kind | cut -d ' ' -f1)"
  [[ "$expected" == "$actual" ]]
  chmod +x .lab/tools/kind
fi
if [[ ! -x .lab/tools/kubectl ]] || ! .lab/tools/kubectl version --client -o yaml | grep -q "gitVersion: v1.37.0"; then
  curl -fsSL https://dl.k8s.io/release/v1.37.0/bin/linux/amd64/kubectl -o .lab/tools/kubectl
  curl -fsSL https://dl.k8s.io/release/v1.37.0/bin/linux/amd64/kubectl.sha256 -o .lab/tools/kubectl.sha256
  [[ "$(sha256sum .lab/tools/kubectl | cut -d ' ' -f1)" == "$(cat .lab/tools/kubectl.sha256)" ]]
  chmod +x .lab/tools/kubectl
fi
if [[ ! -x .lab/tools/helm ]]; then
  curl -fsSL https://get.helm.sh/helm-v3.16.4-linux-amd64.tar.gz -o .lab/tools/helm.tar.gz
  curl -fsSL https://get.helm.sh/helm-v3.16.4-linux-amd64.tar.gz.sha256sum -o .lab/tools/helm.sha256sum
  [[ "$(sha256sum .lab/tools/helm.tar.gz | cut -d ' ' -f1)" == "$(cut -d ' ' -f1 .lab/tools/helm.sha256sum)" ]]
  tar -xzf .lab/tools/helm.tar.gz -C .lab/tools linux-amd64/helm
  mv .lab/tools/linux-amd64/helm .lab/tools/helm
fi
export KUBECONFIG="$PWD/.lab/kubeconfig"
if ! .lab/tools/kind get clusters | grep -qx flowmeet-lab; then
  .lab/tools/kind create cluster --config deploy/kind/cluster.yaml --kubeconfig "$KUBECONFIG" --wait 0s --retain
fi
.lab/tools/kind export kubeconfig --name flowmeet-lab --kubeconfig "$KUBECONFIG"
docker update --cpus 2 --memory 4g --memory-swap 5g flowmeet-lab-control-plane >/dev/null
curl -fsSL https://raw.githubusercontent.com/projectcalico/calico/v3.33.0/manifests/calico.yaml -o .lab/calico.yaml
.lab/tools/kubectl apply -f .lab/calico.yaml
.lab/tools/kubectl -n kube-system rollout status daemonset/calico-node --timeout=300s
.lab/tools/kubectl wait node --all --for=condition=Ready --timeout=180s

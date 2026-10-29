# Multi-stage production container for Python AI Brain
FROM python:3.12-slim-bookworm

# Prevent Python from writing .pyc files and enable unbuffered logging
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install security certificates & curl for healthcheck
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates curl && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Create unprivileged non-root user for enterprise security
RUN useradd -m -u 1003 flowbrain
USER flowbrain

# Copy application code
COPY --chown=flowbrain:flowbrain . /app

EXPOSE 8083

# Liveness probe for Docker / Kubernetes
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://127.0.0.1:8083/health || exit 1

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8083", "--workers", "1"]

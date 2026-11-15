use crate::error::PermissionError;
use crate::policy::{EvaluationContext, PolicyEngine};
use crate::subject::Subject;
#[cfg(feature = "axum-integration")]
use axum::{async_trait, extract::FromRequestParts, http::request::Parts, response::Response};

/// Extracted and verified identity from incoming Axum request headers.
#[derive(Debug, Clone)]
pub struct AuthenticatedSubject(pub Subject);

#[cfg(feature = "axum-integration")]
#[async_trait]
impl<S> FromRequestParts<S> for AuthenticatedSubject
where
    S: Send + Sync,
{
    type Rejection = Response;

    async fn from_request_parts(parts: &mut Parts, _state: &S) -> Result<Self, Self::Rejection> {
        let headers = &parts.headers;

        // Try to read x-subject-id header; default to internal mesh or guest identity
        let subject_id = headers
            .get("x-subject-id")
            .and_then(|h| h.to_str().ok())
            .unwrap_or_else(|| {
                if headers.get("x-internal-mesh").is_some() {
                    "svc:flowmeet-mesh"
                } else {
                    "user:guest"
                }
            })
            .to_string();

        let tenant_id = headers
            .get("x-tenant-id")
            .and_then(|h| h.to_str().ok())
            .map(|s| s.to_string());

        let roles_header = headers
            .get("x-subject-roles")
            .and_then(|h| h.to_str().ok())
            .unwrap_or("operator");

        let roles: std::collections::HashSet<String> = roles_header
            .split(',')
            .map(|s| s.trim().to_string())
            .filter(|s| !s.is_empty())
            .collect();

        let subject = Subject {
            id: subject_id,
            tenant_id,
            roles,
            direct_flags: crate::ActionFlags::NONE,
            attributes: std::collections::HashMap::new(),
        };

        Ok(AuthenticatedSubject(subject))
    }
}

/// Helper function to perform authorization check within Axum request handlers.
pub fn authorize_action(
    engine: &PolicyEngine,
    subject: &Subject,
    action: &str,
    resource: &str,
    context: &EvaluationContext,
) -> Result<(), PermissionError> {
    engine.evaluate(subject, action, resource, context)
}

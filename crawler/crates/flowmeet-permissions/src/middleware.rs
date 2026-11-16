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
        // Identity must be inserted by trusted authentication middleware.
        // Caller-supplied identity and role headers are never authentication.
        let subject = parts.extensions.get::<Subject>().cloned().ok_or_else(|| {
            axum::response::IntoResponse::into_response(PermissionError::MissingIdentity)
        })?;

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

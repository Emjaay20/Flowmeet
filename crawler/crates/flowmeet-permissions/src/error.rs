use thiserror::Error;

/// Core error types for the FlowMeet platform authorization engine.
#[derive(Debug, Error, Clone, PartialEq, Eq)]
pub enum PermissionError {
    #[error("Subject '{subject_id}' denied action '{action}' on resource '{resource}': {reason}")]
    Forbidden {
        subject_id: String,
        action: String,
        resource: String,
        reason: String,
    },

    #[error("Missing identity: caller credentials could not be resolved")]
    MissingIdentity,

    #[error("Tenant isolation violation: expected tenant '{expected}', but subject belongs to '{actual}'")]
    TenantMismatch { expected: String, actual: String },

    #[error("Missing required role: '{required_role}'")]
    MissingRole { required_role: String },

    #[error("Policy evaluation error: {0}")]
    EvaluationError(String),
}

#[cfg(feature = "axum-integration")]
impl axum::response::IntoResponse for PermissionError {
    fn into_response(self) -> axum::response::Response {
        use axum::http::StatusCode;
        use axum::Json;
        use serde_json::json;

        let (status, error_type, details) = match &self {
            PermissionError::Forbidden {
                subject_id,
                action,
                resource,
                reason,
            } => (
                StatusCode::FORBIDDEN,
                "forbidden",
                json!({
                    "subject": subject_id,
                    "action": action,
                    "resource": resource,
                    "reason": reason,
                }),
            ),
            PermissionError::MissingIdentity => (
                StatusCode::UNAUTHORIZED,
                "unauthorized",
                json!({ "reason": "Missing or invalid authorization context" }),
            ),
            PermissionError::TenantMismatch { expected, actual } => (
                StatusCode::FORBIDDEN,
                "tenant_isolation_violation",
                json!({ "expected_tenant": expected, "subject_tenant": actual }),
            ),
            PermissionError::MissingRole { required_role } => (
                StatusCode::FORBIDDEN,
                "insufficient_role",
                json!({ "required_role": required_role }),
            ),
            PermissionError::EvaluationError(msg) => (
                StatusCode::INTERNAL_SERVER_ERROR,
                "policy_evaluation_error",
                json!({ "details": msg }),
            ),
        };

        let body = Json(json!({
            "error": error_type,
            "message": self.to_string(),
            "details": details,
        }));

        (status, body).into_response()
    }
}

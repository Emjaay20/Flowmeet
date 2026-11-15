//! # flowmeet-permissions
//!
//! High-performance, zero-allocation, type-safe authorization library for FlowMeet services.
//! Designed for low-latency platform microservices and monolith architectures.
//!
//! Provides:
//! - 64-bit zero-cost bitflag permissions for hot request path validation.
//! - Attribute-Based Access Control (ABAC) and Role-Based Access Control (RBAC).
//! - Role hierarchy graph with transitive inheritance.
//! - Multi-tenant isolation boundary validation.
//! - Declarative macros (`require_role!`, `policy_rule!`).
//! - Axum extractor and middleware integration.

pub mod bitflags_perms;
pub mod error;
pub mod macros;
pub mod middleware;
pub mod policy;
pub mod subject;

pub use bitflags_perms::ActionFlags;
pub use error::PermissionError;
pub use policy::{Effect, EvaluationContext, PolicyEngine, PolicyRule, RoleHierarchy};
pub use subject::{Subject, SubjectBuilder};

#[cfg(feature = "axum-integration")]
pub use middleware::{authorize_action, AuthenticatedSubject};

/// Common prelude for ergonomic imports across service modules.
pub mod prelude {
    pub use crate::bitflags_perms::ActionFlags;
    pub use crate::error::PermissionError;
    pub use crate::policy::{Effect, EvaluationContext, PolicyEngine, PolicyRule};
    pub use crate::subject::{Subject, SubjectBuilder};
    pub use crate::{policy_rule, require_flags, require_role};

    #[cfg(feature = "axum-integration")]
    pub use crate::middleware::{authorize_action, AuthenticatedSubject};
}

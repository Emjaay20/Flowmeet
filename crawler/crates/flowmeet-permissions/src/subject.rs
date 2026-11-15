use crate::bitflags_perms::ActionFlags;
use serde::{Deserialize, Serialize};
use std::collections::{HashMap, HashSet};

/// Principal identity passed through authentication middleware or service-to-service tokens.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct Subject {
    /// Unique identity (e.g. user ID, API key ID, or service identity "svc:flowmeet-web").
    pub id: String,

    /// Tenant/Organization ID for multi-tenant isolation.
    pub tenant_id: Option<String>,

    /// Assigned role names (e.g. "admin", "platform-engineer", "crawler-agent").
    pub roles: HashSet<String>,

    /// Direct bitwise action permissions granted outside of role definitions.
    pub direct_flags: ActionFlags,

    /// Key-value metadata for attribute-based policies (e.g. environment, tier, department).
    pub attributes: HashMap<String, String>,
}

impl Subject {
    /// Create a new Subject builder.
    pub fn builder(id: impl Into<String>) -> SubjectBuilder {
        SubjectBuilder::new(id)
    }

    /// Creates an internal service account subject.
    pub fn service_account(name: &str, direct_flags: ActionFlags) -> Self {
        Self {
            id: format!("svc:{}", name),
            tenant_id: Some("system".to_string()),
            roles: vec!["service_account".to_string()].into_iter().collect(),
            direct_flags,
            attributes: HashMap::new(),
        }
    }

    /// Creates an AI Agent subject for autonomous workflows.
    pub fn ai_agent(name: &str, tenant_id: impl Into<String>) -> Self {
        let mut attributes = HashMap::new();
        attributes.insert("is_agent".to_string(), "true".to_string());
        attributes.insert("agent_name".to_string(), name.to_string());

        Self {
            id: format!("agent:{}", name),
            tenant_id: Some(tenant_id.into()),
            roles: vec!["crawler_agent".to_string(), "ai_agent".to_string()]
                .into_iter()
                .collect(),
            direct_flags: ActionFlags::SCRAPE | ActionFlags::ENRICH | ActionFlags::READ,
            attributes,
        }
    }

    /// Check if the subject has a specific assigned role.
    pub fn has_role(&self, role: &str) -> bool {
        self.roles.contains(role)
    }

    /// Check if the subject has a specific direct action flag.
    pub fn has_flag(&self, flag: ActionFlags) -> bool {
        self.direct_flags.allows(flag)
    }

    /// Check if the subject is an autonomous AI agent.
    pub fn is_agent(&self) -> bool {
        self.attributes
            .get("is_agent")
            .map(|v| v == "true")
            .unwrap_or(false)
    }

    /// Retrieve an attribute value.
    pub fn get_attribute(&self, key: &str) -> Option<&str> {
        self.attributes.get(key).map(|s| s.as_str())
    }
}

/// Fluent builder for constructing `Subject` identities.
pub struct SubjectBuilder {
    id: String,
    tenant_id: Option<String>,
    roles: HashSet<String>,
    direct_flags: ActionFlags,
    attributes: HashMap<String, String>,
}

impl SubjectBuilder {
    pub fn new(id: impl Into<String>) -> Self {
        Self {
            id: id.into(),
            tenant_id: None,
            roles: HashSet::new(),
            direct_flags: ActionFlags::NONE,
            attributes: HashMap::new(),
        }
    }

    pub fn tenant(mut self, tenant: impl Into<String>) -> Self {
        self.tenant_id = Some(tenant.into());
        self
    }

    pub fn role(mut self, role: impl Into<String>) -> Self {
        self.roles.insert(role.into());
        self
    }

    pub fn roles<I, S>(mut self, roles: I) -> Self
    where
        I: IntoIterator<Item = S>,
        S: Into<String>,
    {
        for r in roles {
            self.roles.insert(r.into());
        }
        self
    }

    pub fn flags(mut self, flags: ActionFlags) -> Self {
        self.direct_flags = flags;
        self
    }

    pub fn attribute(mut self, key: impl Into<String>, val: impl Into<String>) -> Self {
        self.attributes.insert(key.into(), val.into());
        self
    }

    pub fn build(self) -> Subject {
        Subject {
            id: self.id,
            tenant_id: self.tenant_id,
            roles: self.roles,
            direct_flags: self.direct_flags,
            attributes: self.attributes,
        }
    }
}

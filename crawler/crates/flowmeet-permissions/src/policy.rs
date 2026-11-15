use crate::bitflags_perms::ActionFlags;
use crate::error::PermissionError;
use crate::subject::Subject;
use serde::{Deserialize, Serialize};
use std::collections::{HashMap, HashSet};

/// Effect of a policy rule evaluation.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum Effect {
    Allow,
    Deny,
}

/// Evaluation context supplied at request time.
#[derive(Debug, Clone, Default)]
pub struct EvaluationContext {
    pub tenant_id: Option<String>,
    pub environment: Option<String>,
    pub rate_limit_remaining: Option<u32>,
}

impl EvaluationContext {
    pub fn for_tenant(tenant: impl Into<String>) -> Self {
        Self {
            tenant_id: Some(tenant.into()),
            environment: None,
            rate_limit_remaining: None,
        }
    }
}

/// A declarative access control rule.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PolicyRule {
    pub id: String,
    pub effect: Effect,
    pub actions: Vec<String>,
    pub resources: Vec<String>,
    pub require_roles: Option<Vec<String>>,
    pub require_flags: Option<ActionFlags>,
    pub enforce_tenant_isolation: bool,
}

impl PolicyRule {
    pub fn allow(id: impl Into<String>) -> PolicyRuleBuilder {
        PolicyRuleBuilder::new(id, Effect::Allow)
    }

    pub fn deny(id: impl Into<String>) -> PolicyRuleBuilder {
        PolicyRuleBuilder::new(id, Effect::Deny)
    }

    /// Evaluates if this rule matches the requested action and resource.
    pub fn matches(&self, action: &str, resource: &str) -> bool {
        let action_matches = self
            .actions
            .iter()
            .any(|pattern| match_pattern(pattern, action));
        let resource_matches = self
            .resources
            .iter()
            .any(|pattern| match_pattern(pattern, resource));
        action_matches && resource_matches
    }
}

/// Builder for constructing rules ergonomically.
pub struct PolicyRuleBuilder {
    rule: PolicyRule,
}

impl PolicyRuleBuilder {
    pub fn new(id: impl Into<String>, effect: Effect) -> Self {
        Self {
            rule: PolicyRule {
                id: id.into(),
                effect,
                actions: Vec::new(),
                resources: Vec::new(),
                require_roles: None,
                require_flags: None,
                enforce_tenant_isolation: false,
            },
        }
    }

    pub fn action(mut self, action: impl Into<String>) -> Self {
        self.rule.actions.push(action.into());
        self
    }

    pub fn actions<I, S>(mut self, actions: I) -> Self
    where
        I: IntoIterator<Item = S>,
        S: Into<String>,
    {
        for a in actions {
            self.rule.actions.push(a.into());
        }
        self
    }

    pub fn resource(mut self, resource: impl Into<String>) -> Self {
        self.rule.resources.push(resource.into());
        self
    }

    pub fn resources<I, S>(mut self, resources: I) -> Self
    where
        I: IntoIterator<Item = S>,
        S: Into<String>,
    {
        for r in resources {
            self.rule.resources.push(r.into());
        }
        self
    }

    pub fn require_role(mut self, role: impl Into<String>) -> Self {
        let roles = self.rule.require_roles.get_or_insert_with(Vec::new);
        roles.push(role.into());
        self
    }

    pub fn require_flags(mut self, flags: ActionFlags) -> Self {
        self.rule.require_flags = Some(flags);
        self
    }

    pub fn with_tenant_isolation(mut self) -> Self {
        self.rule.enforce_tenant_isolation = true;
        self
    }

    pub fn build(self) -> PolicyRule {
        self.rule
    }
}

/// Matches wildcards such as "crawler:*" against "crawler:scrape".
fn match_pattern(pattern: &str, target: &str) -> bool {
    if pattern == "*" || pattern == target {
        return true;
    }
    if let Some(prefix) = pattern.strip_suffix('*') {
        return target.starts_with(prefix);
    }
    false
}

/// Role hierarchy engine supporting transitive inheritance.
#[derive(Debug, Clone, Default)]
pub struct RoleHierarchy {
    parents_to_children: HashMap<String, HashSet<String>>,
}

impl RoleHierarchy {
    pub fn new() -> Self {
        Self::default()
    }

    /// Register that `parent_role` inherits all permissions of `child_role`.
    pub fn add_inheritance(&mut self, parent_role: &str, child_role: &str) {
        self.parents_to_children
            .entry(parent_role.to_string())
            .or_default()
            .insert(child_role.to_string());
    }

    /// Resolves all effective roles for a set of assigned roles.
    pub fn resolve_all_roles(&self, assigned_roles: &HashSet<String>) -> HashSet<String> {
        let mut effective = assigned_roles.clone();
        let mut queue: Vec<String> = assigned_roles.iter().cloned().collect();

        while let Some(current) = queue.pop() {
            if let Some(children) = self.parents_to_children.get(&current) {
                for child in children {
                    if effective.insert(child.clone()) {
                        queue.push(child.clone());
                    }
                }
            }
        }
        effective
    }
}

/// The central policy enforcement engine.
#[derive(Debug, Clone, Default)]
pub struct PolicyEngine {
    rules: Vec<PolicyRule>,
    hierarchy: RoleHierarchy,
}

impl PolicyEngine {
    pub fn new() -> Self {
        Self::default()
    }

    /// Add a policy rule to the engine.
    pub fn add_rule(&mut self, rule: PolicyRule) {
        self.rules.push(rule);
    }

    /// Configure role inheritance.
    pub fn set_hierarchy(&mut self, hierarchy: RoleHierarchy) {
        self.hierarchy = hierarchy;
    }

    /// Standard production policy set for FlowMeet services.
    pub fn flowmeet_standard() -> Self {
        let mut engine = Self::new();

        // Role hierarchy: platform_admin > operator > viewer
        let mut hierarchy = RoleHierarchy::new();
        hierarchy.add_inheritance("platform_admin", "operator");
        hierarchy.add_inheritance("operator", "viewer");
        hierarchy.add_inheritance("operator", "crawler_agent");
        engine.set_hierarchy(hierarchy);

        // Rule 1: Superuser override
        engine.add_rule(
            PolicyRule::allow("rule_superuser")
                .action("*")
                .resource("*")
                .require_flags(ActionFlags::ADMIN)
                .build(),
        );

        // Rule 2: Operator scrape and analyze permissions
        engine.add_rule(
            PolicyRule::allow("rule_crawler_operator")
                .actions(["crawler:scrape", "crawler:analyze", "crawler:health"])
                .resources(["domain:*", "system:health"])
                .require_role("operator")
                .build(),
        );

        // Rule 3: AI agent autonomous scrape with tenant isolation
        engine.add_rule(
            PolicyRule::allow("rule_ai_agent_scrape")
                .actions(["crawler:scrape", "crawler:analyze"])
                .resource("domain:*")
                .require_role("crawler_agent")
                .with_tenant_isolation()
                .build(),
        );

        // Rule 4: Explicit Deny for restricted/private domains (e.g. localhost, internal VPC)
        engine.add_rule(
            PolicyRule::deny("rule_deny_internal_targets")
                .actions(["crawler:*"])
                .resources([
                    "domain:localhost*",
                    "domain:127.0.0.1*",
                    "domain:169.254.*",
                    "domain:*.internal",
                ])
                .build(),
        );

        engine
    }

    /// Evaluates whether a subject is authorized to perform an action on a resource.
    /// Evaluation semantics:
    /// 1. Deny overrides Allow: any matching Deny rule causes immediate rejection.
    /// 2. If no Deny matches, at least one matching Allow rule is required.
    /// 3. If no rules match, default is Deny (Closed-world security model).
    pub fn evaluate(
        &self,
        subject: &Subject,
        action: &str,
        resource: &str,
        context: &EvaluationContext,
    ) -> Result<(), PermissionError> {
        let effective_roles = self.hierarchy.resolve_all_roles(&subject.roles);

        // Check if subject has direct ADMIN flag for instantaneous O(1) bypass
        if subject.has_flag(ActionFlags::ADMIN) {
            // Still check explicit denies for defense in depth (e.g. internal network probe block)
            for rule in &self.rules {
                if rule.effect == Effect::Deny && rule.matches(action, resource) {
                    return Err(PermissionError::Forbidden {
                        subject_id: subject.id.clone(),
                        action: action.to_string(),
                        resource: resource.to_string(),
                        reason: format!("Explicit deny rule '{}' matched target", rule.id),
                    });
                }
            }
            return Ok(());
        }

        let mut allowed = false;

        for rule in &self.rules {
            if !rule.matches(action, resource) {
                continue;
            }

            // Check if rule requires specific role
            if let Some(required) = &rule.require_roles {
                let has_required_role = required.iter().any(|r| effective_roles.contains(r));
                if !has_required_role {
                    continue;
                }
            }

            // Check if rule requires direct action flags
            if let Some(required_flags) = rule.require_flags {
                if !subject.has_flag(required_flags) {
                    continue;
                }
            }

            // Check tenant isolation
            if rule.enforce_tenant_isolation {
                if let (Some(subj_tenant), Some(ctx_tenant)) =
                    (&subject.tenant_id, &context.tenant_id)
                {
                    if subj_tenant != ctx_tenant && subj_tenant != "system" {
                        return Err(PermissionError::TenantMismatch {
                            expected: ctx_tenant.clone(),
                            actual: subj_tenant.clone(),
                        });
                    }
                }
            }

            match rule.effect {
                Effect::Deny => {
                    return Err(PermissionError::Forbidden {
                        subject_id: subject.id.clone(),
                        action: action.to_string(),
                        resource: resource.to_string(),
                        reason: format!("Explicit deny rule '{}' matched", rule.id),
                    });
                }
                Effect::Allow => {
                    allowed = true;
                }
            }
        }

        if allowed {
            Ok(())
        } else {
            Err(PermissionError::Forbidden {
                subject_id: subject.id.clone(),
                action: action.to_string(),
                resource: resource.to_string(),
                reason: "No matching allow policy rule or insufficient role/flags".to_string(),
            })
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_role_hierarchy_transitive() {
        let mut hierarchy = RoleHierarchy::new();
        hierarchy.add_inheritance("platform_admin", "operator");
        hierarchy.add_inheritance("operator", "viewer");

        let mut assigned = HashSet::new();
        assigned.insert("platform_admin".to_string());

        let resolved = hierarchy.resolve_all_roles(&assigned);
        assert!(resolved.contains("platform_admin"));
        assert!(resolved.contains("operator"));
        assert!(resolved.contains("viewer"));
    }

    #[test]
    fn test_flowmeet_standard_policies() {
        let engine = PolicyEngine::flowmeet_standard();
        let operator = Subject::builder("user:alex").role("operator").build();

        let ctx = EvaluationContext::default();

        // Allowed actions
        assert!(engine
            .evaluate(&operator, "crawler:scrape", "domain:stripe.com", &ctx)
            .is_ok());
        assert!(engine
            .evaluate(&operator, "crawler:analyze", "domain:linear.app", &ctx)
            .is_ok());

        // Blocked internal resource due to explicit deny rule
        let res = engine.evaluate(&operator, "crawler:scrape", "domain:localhost:8080", &ctx);
        assert!(res.is_err());

        // Unauthorized action
        let res = engine.evaluate(&operator, "admin:delete_tenant", "system:tenants", &ctx);
        assert!(res.is_err());
    }

    #[test]
    fn test_tenant_isolation() {
        let engine = PolicyEngine::flowmeet_standard();
        let agent = Subject::ai_agent("scraper-1", "tenant-alpha");

        let ctx_matching = EvaluationContext::for_tenant("tenant-alpha");
        assert!(engine
            .evaluate(&agent, "crawler:scrape", "domain:github.com", &ctx_matching)
            .is_ok());

        let ctx_cross = EvaluationContext::for_tenant("tenant-beta");
        let res = engine.evaluate(&agent, "crawler:scrape", "domain:github.com", &ctx_cross);
        assert!(matches!(res, Err(PermissionError::TenantMismatch { .. })));
    }
}

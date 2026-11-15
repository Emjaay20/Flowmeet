/// Macro for fast, declarative role requirement checks.
///
/// Example:
/// ```rust,ignore
/// require_role!(subject, "platform_admin");
/// ```
#[macro_export]
macro_rules! require_role {
    ($subject:expr, $role:expr) => {
        if !$subject.has_role($role) && !$subject.has_flag($crate::ActionFlags::ADMIN) {
            return Err($crate::PermissionError::MissingRole {
                required_role: $role.to_string(),
            });
        }
    };
}

/// Macro for fast flag verification.
///
/// Example:
/// ```rust,ignore
/// require_flags!(subject, ActionFlags::SCRAPE);
/// ```
#[macro_export]
macro_rules! require_flags {
    ($subject:expr, $flags:expr) => {
        if !$subject.has_flag($flags) {
            return Err($crate::PermissionError::Forbidden {
                subject_id: $subject.id.clone(),
                action: format!("{:?}", $flags),
                resource: "*".to_string(),
                reason: "Insufficient action flags".to_string(),
            });
        }
    };
}

/// Macro to create declarative policy rules with minimal boilerplate.
///
/// Example:
/// ```rust,ignore
/// let rule = policy_rule!(allow "rule_scrape", actions: ["crawler:*"], resources: ["domain:*"]);
/// ```
#[macro_export]
macro_rules! policy_rule {
    (allow $id:literal, actions: [ $($act:expr),* ], resources: [ $($res:expr),* ]) => {
        $crate::PolicyRule::allow($id)
            .actions([$($act),*])
            .resources([$($res),*])
            .build()
    };
    (deny $id:literal, actions: [ $($act:expr),* ], resources: [ $($res:expr),* ]) => {
        $crate::PolicyRule::deny($id)
            .actions([$($act),*])
            .resources([$($res),*])
            .build()
    };
}

#[cfg(test)]
mod tests {
    use crate::subject::Subject;

    fn test_role_check(subject: &Subject) -> Result<(), crate::PermissionError> {
        require_role!(subject, "operator");
        Ok(())
    }

    #[test]
    fn test_require_role_macro() {
        let valid = Subject::builder("user:1").role("operator").build();
        assert!(test_role_check(&valid).is_ok());

        let invalid = Subject::builder("user:2").role("viewer").build();
        assert!(test_role_check(&invalid).is_err());
    }

    #[test]
    fn test_policy_rule_macro() {
        let rule =
            policy_rule!(allow "test_rule", actions: ["scrape", "enrich"], resources: ["domain:*"]);
        assert_eq!(rule.id, "test_rule");
        assert!(rule.matches("scrape", "domain:example.com"));
        assert!(!rule.matches("delete", "domain:example.com"));
    }
}

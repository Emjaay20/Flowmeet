use criterion::{black_box, criterion_group, criterion_main, Criterion};
use flowmeet_permissions::prelude::*;
use flowmeet_permissions::{ActionFlags, RoleHierarchy};
use std::collections::HashSet;

fn bench_bitflags(c: &mut Criterion) {
    let operator = ActionFlags::OPERATOR;
    let required = ActionFlags::SCRAPE;

    c.bench_function("bitflags_o1_allow_check", |b| {
        b.iter(|| black_box(operator).allows(black_box(required)))
    });
}

fn bench_role_hierarchy_resolution(c: &mut Criterion) {
    let mut hierarchy = RoleHierarchy::new();
    hierarchy.add_inheritance("platform_admin", "core_engineer");
    hierarchy.add_inheritance("core_engineer", "operator");
    hierarchy.add_inheritance("operator", "crawler_agent");
    hierarchy.add_inheritance("crawler_agent", "viewer");

    let mut assigned = HashSet::new();
    assigned.insert("platform_admin".to_string());

    c.bench_function("role_hierarchy_transitive_resolution", |b| {
        b.iter(|| hierarchy.resolve_all_roles(black_box(&assigned)))
    });
}

fn bench_standard_policy_evaluation(c: &mut Criterion) {
    let engine = PolicyEngine::flowmeet_standard();
    let operator = Subject::builder("user:staff_eng").role("operator").build();
    let ctx = EvaluationContext::default();

    c.bench_function("standard_allow_policy_evaluation", |b| {
        b.iter(|| {
            engine.evaluate(
                black_box(&operator),
                black_box("crawler:scrape"),
                black_box("domain:stripe.com"),
                black_box(&ctx),
            )
        })
    });

    let internal_probe = "domain:localhost:8080";
    c.bench_function("standard_deny_override_evaluation", |b| {
        b.iter(|| {
            engine.evaluate(
                black_box(&operator),
                black_box("crawler:scrape"),
                black_box(internal_probe),
                black_box(&ctx),
            )
        })
    });
}

fn bench_scaled_100_rules(c: &mut Criterion) {
    let mut engine = PolicyEngine::new();

    // Populate 100 enterprise rules
    for i in 0..100 {
        let rule = PolicyRule::allow(format!("rule_monolith_{}", i))
            .action(format!("service_{}:action", i))
            .resource(format!("resource_{}:*", i))
            .require_role("operator")
            .build();
        engine.add_rule(rule);
    }

    // Add target rule at end of list
    engine.add_rule(
        PolicyRule::allow("target_rule")
            .action("crawler:scrape")
            .resource("domain:*")
            .require_role("operator")
            .build(),
    );

    let operator = Subject::builder("user:staff_eng").role("operator").build();
    let ctx = EvaluationContext::default();

    c.bench_function("evaluate_100_rules_linear_worst_case", |b| {
        b.iter(|| {
            engine.evaluate(
                black_box(&operator),
                black_box("crawler:scrape"),
                black_box("domain:enterprise.com"),
                black_box(&ctx),
            )
        })
    });
}

criterion_group!(
    benches,
    bench_bitflags,
    bench_role_hierarchy_resolution,
    bench_standard_policy_evaluation,
    bench_scaled_100_rules
);
criterion_main!(benches);

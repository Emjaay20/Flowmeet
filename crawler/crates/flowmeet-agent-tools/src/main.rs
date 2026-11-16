use clap::{Parser, Subcommand};
use flowmeet_permissions::prelude::*;
use flowmeet_permissions::ActionFlags;
use serde::{Deserialize, Serialize};
use serde_json::json;

#[derive(Parser)]
#[command(
    name = "flowmeet-agent-tools",
    about = "Platform DX CLI and MCP harness empowering AI coding agents to safely navigate FlowMeet Rust monoliths",
    version = "0.1.0"
)]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    /// Export machine-readable system architecture and permissions context for AI agents
    ExportContext {
        #[arg(short, long, default_value = "json")]
        format: String,
    },

    /// Test if an identity/role is permitted to execute an action on a target resource
    VerifyAction {
        #[arg(long, default_value = "agent:coding-assistant")]
        subject_id: String,

        #[arg(long, default_value = "operator")]
        role: String,

        #[arg(short, long)]
        action: String,

        #[arg(short, long)]
        resource: String,

        #[arg(short, long)]
        tenant: Option<String>,
    },

    /// Output Model Context Protocol (MCP) JSON tool definitions for AI agents (Cursor / Claude Code)
    McpTools,

    /// Serve read-only platform tools over MCP JSON-RPC on stdin/stdout.
    ServeMcp,

    /// Run executable security probes against the standard policy set
    LintPolicies,
}

#[derive(Serialize, Deserialize)]
struct AgentArchitectureContext {
    service: String,
    language: String,
    cgroup_budget_mb: u32,
    target_latency_ms: u32,
    roles: Vec<RoleInfo>,
    action_flags: Vec<String>,
    endpoints: Vec<EndpointInfo>,
    security_denylist: Vec<String>,
}

#[derive(Serialize, Deserialize)]
struct RoleInfo {
    role: String,
    description: String,
    inherits: Vec<String>,
}

#[derive(Serialize, Deserialize)]
struct EndpointInfo {
    method: String,
    path: String,
    required_action: String,
    required_role: String,
    description: String,
}

fn generate_agent_context() -> AgentArchitectureContext {
    AgentArchitectureContext {
        service: "flowmeet-crawler".to_string(),
        language: "Rust 2021 (Axum + Tokio + Scraper)".to_string(),
        cgroup_budget_mb: 128,
        target_latency_ms: 10000,
        roles: vec![
            RoleInfo {
                role: "platform_admin".to_string(),
                description: "Superuser role with full bypass capability".to_string(),
                inherits: vec!["operator".to_string(), "viewer".to_string()],
            },
            RoleInfo {
                role: "operator".to_string(),
                description:
                    "Core service operator capable of scraping and firmographic extraction"
                        .to_string(),
                inherits: vec!["viewer".to_string()],
            },
            RoleInfo {
                role: "crawler_agent".to_string(),
                description:
                    "Autonomous AI agent principal restricted by tenant boundary isolation"
                        .to_string(),
                inherits: vec![],
            },
            RoleInfo {
                role: "viewer".to_string(),
                description: "Read-only access to health and metrics endpoints".to_string(),
                inherits: vec![],
            },
        ],
        action_flags: ActionFlags::SUPERUSER
            .active_names()
            .into_iter()
            .map(|s| s.to_string())
            .collect(),
        endpoints: vec![
            EndpointInfo {
                method: "GET".to_string(),
                path: "/health".to_string(),
                required_action: "crawler:health".to_string(),
                required_role: "none (private network only)".to_string(),
                description: "Liveness and telemetry check probe".to_string(),
            },
            EndpointInfo {
                method: "GET".to_string(),
                path: "/metrics".to_string(),
                required_action: "crawler:metrics".to_string(),
                required_role: "none (private network only)".to_string(),
                description: "Prometheus text format telemetry scraper".to_string(),
            },
            EndpointInfo {
                method: "POST".to_string(),
                path: "/scrape".to_string(),
                required_action: "crawler:scrape".to_string(),
                required_role: "operator".to_string(),
                description: "Live DOM-to-markdown tokenization and firmographic scoring"
                    .to_string(),
            },
            EndpointInfo {
                method: "POST".to_string(),
                path: "/analyze".to_string(),
                required_action: "crawler:analyze".to_string(),
                required_role: "operator".to_string(),
                description: "Keyword-based firmographic signal extraction over pre-fetched text"
                    .to_string(),
            },
        ],
        security_denylist: vec![
            "domain:localhost* (SSRF protection)".to_string(),
            "domain:127.0.0.1* (Loopback isolation)".to_string(),
            "domain:169.254.* (Cloud Instance Metadata API isolation)".to_string(),
            "DNS validation and address pinning enforce outbound network restrictions".to_string(),
        ],
    }
}

fn main() {
    let cli = Cli::parse();
    let engine = PolicyEngine::flowmeet_standard();

    match cli.command {
        Commands::ServeMcp => serve_mcp(&engine),
        Commands::ExportContext { .. } => {
            let context = generate_agent_context();
            println!("{}", serde_json::to_string_pretty(&context).unwrap());
        }

        Commands::VerifyAction {
            subject_id,
            role,
            action,
            resource,
            tenant,
        } => {
            let mut builder = Subject::builder(&subject_id).role(&role);
            if let Some(t) = &tenant {
                builder = builder.tenant(t);
            }
            let subject = builder.build();

            let mut ctx = EvaluationContext::default();
            if let Some(t) = tenant {
                ctx.tenant_id = Some(t);
            }

            match engine.evaluate(&subject, &action, &resource, &ctx) {
                Ok(()) => {
                    println!(
                        "{}",
                        json!({
                            "status": "ALLOWED",
                            "subject": subject_id,
                            "role": role,
                            "action": action,
                            "resource": resource,
                        })
                    );
                }
                Err(err) => {
                    println!(
                        "{}",
                        json!({
                            "status": "DENIED",
                            "subject": subject_id,
                            "role": role,
                            "action": action,
                            "resource": resource,
                            "reason": err.to_string(),
                        })
                    );
                }
            }
        }

        Commands::McpTools => {
            println!(
                "{}",
                serde_json::to_string_pretty(&json!({"tools":mcp_tools()})).unwrap()
            );
        }

        Commands::LintPolicies => {
            println!("Linting FlowMeet platform policies against security best practices...");
            let sample_subject = Subject::builder("lint-checker").role("operator").build();
            let mut pass_count = 0;

            // Check 1: Ensure loopback is blocked
            let probe_res = engine.evaluate(
                &sample_subject,
                "crawler:scrape",
                "domain:127.0.0.1",
                &EvaluationContext::default(),
            );
            if probe_res.is_err() {
                println!("  [PASS] Loopback / SSRF targets are strictly denied");
                pass_count += 1;
            } else {
                eprintln!("  [FAIL] Loopback 127.0.0.1 was allowed!");
            }

            // Check 2: Ensure cloud metadata IP is blocked
            let metadata_res = engine.evaluate(
                &sample_subject,
                "crawler:scrape",
                "domain:169.254.169.254",
                &EvaluationContext::default(),
            );
            if metadata_res.is_err() {
                println!("  [PASS] Cloud Instance Metadata IP (169.254.x) is strictly denied");
                pass_count += 1;
            } else {
                eprintln!("  [FAIL] Cloud metadata IP was allowed!");
            }

            // Check 3: Ensure closed-world default deny for unknown actions
            let unknown_res = engine.evaluate(
                &sample_subject,
                "admin:delete_database",
                "db:*",
                &EvaluationContext::default(),
            );
            if unknown_res.is_err() {
                println!(
                    "  [PASS] Closed-world security model: unregistered actions default to Deny"
                );
                pass_count += 1;
            } else {
                eprintln!("  [FAIL] Unregistered action was allowed!");
            }

            println!(
                "\nPlatform Policy Lint Complete: {}/3 security constraints satisfied.",
                pass_count
            );
            if pass_count != 3 {
                std::process::exit(1);
            }
        }
    }
}

fn mcp_tools() -> serde_json::Value {
    json!([
        {"name":"flowmeet_context","description":"Read architecture and operating constraints", "inputSchema":{"type":"object","properties":{},"additionalProperties":false}},
        {"name":"flowmeet_check_permission","description":"Simulate policy evaluation; grants no access", "inputSchema":{"type":"object","properties":{"role":{"type":"string"},"action":{"type":"string"},"resource":{"type":"string"},"subject_tenant":{"type":"string"},"resource_tenant":{"type":"string"}},"required":["role","action","resource"],"additionalProperties":false}}
    ])
}

fn serve_mcp(engine: &PolicyEngine) {
    use std::io::{self, BufRead, Write};
    let stdin = io::stdin();
    let mut out = io::stdout().lock();
    for line in stdin.lock().lines() {
        let Ok(line) = line else { break };
        let req: serde_json::Value = match serde_json::from_str(&line) {
            Ok(v) => v,
            Err(_) => {
                let _ = writeln!(
                    out,
                    "{}",
                    json!({"jsonrpc":"2.0","id":null,"error":{"code":-32700,"message":"Parse error"}})
                );
                let _ = out.flush();
                continue;
            }
        };
        let Some(id) = req.get("id") else { continue };
        let result = match req["method"].as_str().unwrap_or("") {
            "initialize" => Ok(
                json!({"protocolVersion":"2024-11-05", "capabilities":{"tools":{}}, "serverInfo":{"name":"flowmeet-platform", "version":"0.2.0"}}),
            ),
            "ping" => Ok(json!({})),
            "tools/list" => Ok(json!({"tools":mcp_tools()})),
            "tools/call" => {
                let args = &req["params"]["arguments"];
                match req["params"]["name"].as_str().unwrap_or("") {
                    "flowmeet_context" => Ok(
                        json!({"content":[{"type":"text","text":serde_json::to_string(&generate_agent_context()).unwrap()}]}),
                    ),
                    "flowmeet_check_permission" => {
                        if ["role", "action", "resource"]
                            .iter()
                            .any(|k| args[k].as_str().filter(|v| !v.is_empty()).is_none())
                        {
                            Err((-32602, "role, action and resource are required"))
                        } else {
                            let mut builder = Subject::builder("agent:simulation")
                                .role(args["role"].as_str().unwrap());
                            if let Some(t) = args["subject_tenant"].as_str() {
                                builder = builder.tenant(t);
                            }
                            let ctx = EvaluationContext {
                                tenant_id: args["resource_tenant"].as_str().map(String::from),
                                ..Default::default()
                            };
                            let evaluation = engine.evaluate(
                                &builder.build(),
                                args["action"].as_str().unwrap(),
                                args["resource"].as_str().unwrap(),
                                &ctx,
                            );
                            let value = json!({"allowed":evaluation.is_ok(), "reason":evaluation.err().map(|e| e.to_string()), "simulation_only":true});
                            Ok(json!({"content":[{"type":"text","text":value.to_string()}]}))
                        }
                    }
                    _ => Err((-32602, "Unknown tool")),
                }
            }
            _ => Err((-32601, "Method not found")),
        };
        let response = match result {
            Ok(value) => json!({"jsonrpc":"2.0","id":id,"result":value}),
            Err((code, message)) => {
                json!({"jsonrpc":"2.0","id":id,"error":{"code":code,"message":message}})
            }
        };
        if writeln!(out, "{response}")
            .and_then(|_| out.flush())
            .is_err()
        {
            break;
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_generate_agent_context() {
        let ctx = generate_agent_context();
        assert_eq!(ctx.service, "flowmeet-crawler");
        assert_eq!(ctx.cgroup_budget_mb, 128);
        assert!(ctx.roles.iter().any(|r| r.role == "operator"));
        assert!(ctx.endpoints.iter().any(|e| e.path == "/scrape"));
    }

    #[test]
    fn test_lint_rules_pass() {
        let engine = PolicyEngine::flowmeet_standard();
        let operator = Subject::builder("test-op").role("operator").build();

        // Legitimate target passes
        assert!(engine
            .evaluate(
                &operator,
                "crawler:scrape",
                "domain:stripe.com",
                &EvaluationContext::default()
            )
            .is_ok());

        // SSRF target blocked
        assert!(engine
            .evaluate(
                &operator,
                "crawler:scrape",
                "domain:localhost",
                &EvaluationContext::default()
            )
            .is_err());
    }
}

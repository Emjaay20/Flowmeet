use bitflags::bitflags;
use serde::{Deserialize, Serialize};

bitflags! {
    /// Zero-cost, 64-bit permission flags for high-throughput in-memory authorization checks.
    /// Provides O(1) bitwise operations for hot request paths.
    #[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash, Serialize, Deserialize)]
    #[serde(transparent)]
    pub struct ActionFlags: u64 {
        const NONE        = 0;
        const READ        = 1 << 0;  // 1
        const WRITE       = 1 << 1;  // 2
        const DELETE      = 1 << 2;  // 4
        const EXECUTE     = 1 << 3;  // 8
        const SCRAPE      = 1 << 4;  // 16 - Crawler domain scraping
        const ENRICH      = 1 << 5;  // 32 - Firmographic signal analysis
        const ROUTE       = 1 << 6;  // 64 - Territory lead routing
        const AUDIT       = 1 << 7;  // 128 - Viewing security & access logs
        const CONFIGURE   = 1 << 8;  // 256 - Tenant settings & rate limits
        const ADMIN       = 1 << 9;  // 512 - Superuser override

        // Standard combined capability tiers
        const OPERATOR    = Self::READ.bits() | Self::SCRAPE.bits() | Self::ENRICH.bits() | Self::ROUTE.bits();
        const DEVELOPER   = Self::OPERATOR.bits() | Self::WRITE.bits() | Self::EXECUTE.bits();
        const SUPERUSER   = u64::MAX;
    }
}

impl ActionFlags {
    /// Checks if this set of flags satisfies all required permission flags.
    #[inline(always)]
    pub fn allows(&self, required: ActionFlags) -> bool {
        self.contains(ActionFlags::ADMIN) || self.contains(required)
    }

    /// Returns human-readable names of active flags.
    pub fn active_names(&self) -> Vec<&'static str> {
        let mut names = Vec::new();
        if self.contains(Self::ADMIN) {
            names.push("ADMIN");
        }
        if self.contains(Self::READ) {
            names.push("READ");
        }
        if self.contains(Self::WRITE) {
            names.push("WRITE");
        }
        if self.contains(Self::DELETE) {
            names.push("DELETE");
        }
        if self.contains(Self::EXECUTE) {
            names.push("EXECUTE");
        }
        if self.contains(Self::SCRAPE) {
            names.push("SCRAPE");
        }
        if self.contains(Self::ENRICH) {
            names.push("ENRICH");
        }
        if self.contains(Self::ROUTE) {
            names.push("ROUTE");
        }
        if self.contains(Self::AUDIT) {
            names.push("AUDIT");
        }
        if self.contains(Self::CONFIGURE) {
            names.push("CONFIGURE");
        }
        names
    }
}

impl Default for ActionFlags {
    fn default() -> Self {
        Self::NONE
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_flag_containment() {
        let operator = ActionFlags::OPERATOR;
        assert!(operator.allows(ActionFlags::SCRAPE));
        assert!(operator.allows(ActionFlags::ENRICH));
        assert!(!operator.allows(ActionFlags::ADMIN));
        assert!(!operator.allows(ActionFlags::DELETE));
    }

    #[test]
    fn test_admin_supersedes_all() {
        let admin = ActionFlags::ADMIN;
        assert!(admin.allows(ActionFlags::SCRAPE));
        assert!(admin.allows(ActionFlags::DELETE));
        assert!(admin.allows(ActionFlags::CONFIGURE));
    }

    #[test]
    fn test_serialization_roundtrip() {
        let flags = ActionFlags::SCRAPE | ActionFlags::ENRICH;
        let serialized = serde_json::to_string(&flags).unwrap();
        let deserialized: ActionFlags = serde_json::from_str(&serialized).unwrap();
        assert_eq!(flags, deserialized);
    }
}

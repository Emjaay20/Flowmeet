import Link from "next/link";

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#ffffff', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Navigation */}
      <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)', borderBottom: '1px solid #e5e7eb' }}>
        <nav style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)', borderRadius: '8px' }}></div>
            <span style={{ fontSize: '20px', fontWeight: 700, color: '#111827' }}>FlowMeet</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
            <a href="#features" style={{ fontSize: '14px', fontWeight: 500, color: '#4b5563', textDecoration: 'none' }}>Features</a>
            <a href="#how-it-works" style={{ fontSize: '14px', fontWeight: 500, color: '#4b5563', textDecoration: 'none' }}>How it works</a>
            <a href="#pricing" style={{ fontSize: '14px', fontWeight: 500, color: '#4b5563', textDecoration: 'none' }}>Pricing</a>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link href="/login" style={{ fontSize: '14px', fontWeight: 500, color: '#4b5563', padding: '8px 16px', textDecoration: 'none' }}>Sign in</Link>
            <Link href="/signup" style={{ fontSize: '14px', fontWeight: 600, color: '#ffffff', padding: '10px 20px', borderRadius: '9999px', background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)', textDecoration: 'none' }}>
              Start free trial
            </Link>
          </div>
        </nav>
      </header>

      <main>
        {/* Hero Section */}
        <section style={{ paddingTop: '140px', paddingBottom: '80px', position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0, zIndex: -1, background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(139, 92, 246, 0.12), transparent)' }}></div>

          <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', marginBottom: '24px', borderRadius: '9999px', background: 'rgba(139, 92, 246, 0.1)' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#7c3aed' }}></span>
              <span style={{ fontSize: '14px', fontWeight: 500, color: '#7c3aed' }}>Now with AI-powered lead scoring</span>
            </div>

            <h1 style={{ fontSize: '48px', fontWeight: 700, color: '#111827', lineHeight: 1.1, marginBottom: '24px' }}>
              Turn inbound leads into
              <span style={{ display: 'block', background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                qualified meetings
              </span>
            </h1>

            <p style={{ fontSize: '18px', color: '#4b5563', maxWidth: '700px', margin: '0 auto 40px', lineHeight: 1.7 }}>
              FlowMeet uses AI to instantly score your leads, identify the best opportunities, and book meetings automatically — so your team can focus on closing deals.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
              <Link
                href="/signup"
                style={{
                  color: '#ffffff',
                  fontWeight: 600,
                  padding: '16px 32px',
                  borderRadius: '9999px',
                  fontSize: '14px',
                  textDecoration: 'none',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                  boxShadow: '0 8px 32px rgba(139, 92, 246, 0.3)'
                }}
              >
                Start your free trial
              </Link>
              <Link
                href="/demo"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontWeight: 600,
                  color: '#374151',
                  padding: '16px 32px',
                  borderRadius: '9999px',
                  fontSize: '14px',
                  border: '1px solid #d1d5db',
                  textDecoration: 'none',
                  background: '#ffffff'
                }}
              >
                <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="8" height="10" viewBox="0 0 8 10" fill="white"><path d="M0 0L8 5L0 10V0Z" /></svg>
                </span>
                See it in action
              </Link>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" style={{ padding: '80px 24px', background: '#f9fafb' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '64px' }}>
              <p style={{ fontSize: '14px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px', color: '#7c3aed' }}>Features</p>
              <h2 style={{ fontSize: '36px', fontWeight: 700, color: '#111827' }}>Everything you need to convert more leads</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
              {/* Card 1 */}
              <div style={{ padding: '32px', borderRadius: '16px', border: '1px solid #e5e7eb', background: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
                  </svg>
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#111827', marginBottom: '8px' }}>AI Lead Scoring</h3>
                <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.6 }}>Automatically score and rank leads based on fit, intent, and engagement signals.</p>
              </div>

              {/* Card 2 */}
              <div style={{ padding: '32px', borderRadius: '16px', border: '1px solid #e5e7eb', background: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#111827', marginBottom: '8px' }}>Instant Scheduling</h3>
                <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.6 }}>Qualified leads are automatically invited to book a meeting on your calendar.</p>
              </div>

              {/* Card 3 */}
              <div style={{ padding: '32px', borderRadius: '16px', border: '1px solid #e5e7eb', background: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#111827', marginBottom: '8px' }}>Smart Notifications</h3>
                <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.6 }}>Get instant alerts when high-value leads engage so you never miss an opportunity.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section style={{ padding: '80px 24px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center', borderRadius: '24px', padding: '64px 48px', background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)' }}>
            <h2 style={{ fontSize: '32px', fontWeight: 700, color: '#ffffff', marginBottom: '16px' }}>Ready to convert more leads?</h2>
            <p style={{ color: '#c7d2fe', marginBottom: '32px' }}>Start your free 14-day trial today. No credit card required.</p>
            <Link
              href="/signup"
              style={{
                display: 'inline-block',
                color: '#312e81',
                fontWeight: 600,
                padding: '16px 32px',
                borderRadius: '9999px',
                fontSize: '14px',
                background: '#ffffff',
                textDecoration: 'none'
              }}
            >
              Get started for free
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid #e5e7eb', padding: '48px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '24px', height: '24px', background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)', borderRadius: '6px' }}></div>
            <span style={{ fontWeight: 600, color: '#111827' }}>FlowMeet</span>
          </div>
          <p style={{ fontSize: '14px', color: '#6b7280' }}>© 2026 FlowMeet, Inc. All rights reserved.</p>
          <div style={{ display: 'flex', gap: '24px' }}>
            <a href="#" style={{ fontSize: '14px', color: '#6b7280', textDecoration: 'none' }}>Privacy</a>
            <a href="#" style={{ fontSize: '14px', color: '#6b7280', textDecoration: 'none' }}>Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

import { useEffect, useState } from 'react';

export default function ChromeErrorPage() {
  const [domain, setDomain] = useState('site.com');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setDomain(window.location.hostname);
    }
  }, []);

  return (
    <div style={{
      backgroundColor: '#202124',
      color: '#e8eaed',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      height: '100vh',
      width: '100vw',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: 0,
      padding: 0,
      userSelect: 'none'
    }}>
      <div style={{ maxWidth: '560px', width: '90%', padding: '20px' }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9aa0a6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '24px' }}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="9" y1="13" x2="9.01" y2="13" strokeWidth="2.5" />
          <line x1="15" y1="13" x2="15.01" y2="13" strokeWidth="2.5" />
          <path d="M10 17c.5-.5 1.5-.5 2 0s1.5.5 2 0" />
        </svg>

        <h1 style={{ fontSize: '24px', fontWeight: 500, color: '#e8eaed', margin: '0 0 16px 0' }}>
          This site can’t be reached
        </h1>

        <p style={{ fontSize: '14px', color: '#9aa0a6', margin: '0 0 12px 0' }}>
          Check if there is a typo in <span style={{ color: '#e8eaed', fontWeight: 500 }}>{domain}</span>.
        </p>

        <p style={{ fontSize: '14px', color: '#9aa0a6', margin: '0 0 24px 0' }}>
          If spelling is correct, <a href="#" onClick={(e) => e.preventDefault()} style={{ color: '#8ab4f8', textDecoration: 'none' }}>try running windows network Diagnostics</a>.
        </p>

        <p style={{ fontSize: '12px', color: '#9aa0a6', margin: '0 0 32px 0', letterSpacing: '0.5px' }}>
          DNS_PROBE_FINISHED_NXDOMAIN
        </p>

        <button
          onClick={() => typeof window !== 'undefined' && window.location.reload()}
          style={{
            backgroundColor: '#8ab4f8',
            color: '#202124',
            border: 'none',
            borderRadius: '16px',
            padding: '8px 24px',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer'
          }}
        >
          Reload
        </button>
      </div>
    </div>
  );
}

import { useState } from 'react';

export function CopyButton({ value, label = 'Copy', className = 'btn btn-outline' }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(value || '');
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }
  return <button className={className} type="button" onClick={copy} disabled={!value}><span className="material-symbols-outlined">{copied ? 'check' : 'content_copy'}</span>{copied ? 'Copied' : label}</button>;
}

import { Link } from 'react-router-dom';
import chalet from '../assets/illustrations/chalet.svg';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function NotFoundPage() {
  useDocumentTitle('Page not found');
  return <div className="join-page"><section className="surface-card" style={{ width: 'min(720px,100%)', overflow: 'hidden', textAlign: 'center' }}><img src={chalet} alt="Grandfather's cabin" style={{ width: '100%', maxHeight: 300, objectFit: 'cover' }} /><div style={{ padding: 32 }}><div className="label uppercase" style={{ color: 'var(--secondary)' }}>Trail not found</div><h1 className="headline-lg" style={{ margin: '10px 0' }}>This path does not lead to the Alm.</h1><p className="muted">The page may have moved, or the address may be incomplete.</p><Link className="btn btn-secondary" to="/">Return home</Link></div></section></div>;
}

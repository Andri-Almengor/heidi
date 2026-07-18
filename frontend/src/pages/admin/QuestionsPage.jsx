import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api/adminApi';
import { QuestionCard } from '../../components/admin/QuestionCard';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { PageHeader } from '../../components/common/PageHeader';
import { LoadingState, ErrorState, EmptyState } from '../../components/common/StateViews';
import { useToast } from '../../components/common/ToastProvider';
import { useAuth } from '../../context/AuthContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

export default function QuestionsPage() {
  useDocumentTitle('Questions');
  const { token } = useAuth();
  const { showToast } = useToast();
  const [questions, setQuestions] = useState([]);
  const [search, setSearch] = useState('');
  const [includeInactive, setIncludeInactive] = useState(false);
  const [imageFilter, setImageFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [target, setTarget] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const result = await adminApi.listQuestions(token, { includeInactive, search });
      setQuestions(result.questions || []);
    } catch (requestError) { setError(requestError.message); }
    finally { setLoading(false); }
  }, [token, includeInactive, search]);

  useEffect(() => {
    const timer = window.setTimeout(load, 220);
    return () => window.clearTimeout(timer);
  }, [load]);

  const filtered = useMemo(() => questions.filter((question) => imageFilter === 'ALL' || (imageFilter === 'WITH' ? Boolean(question.imageUrl) : !question.imageUrl)), [questions, imageFilter]);

  async function removeQuestion() {
    setBusy(true);
    try {
      await adminApi.deleteQuestion(token, target.questionId);
      showToast('The question was removed from the active library.', 'success');
      setTarget(null);
      await load();
    } catch (requestError) { showToast(requestError.message, 'error'); }
    finally { setBusy(false); }
  }

  return (
    <>
      <PageHeader eyebrow="Administrator / Questions" title="Question Library" description="Build a polished collection of questions about Heidi, her friends, and life in the Alps." actions={<Link className="btn btn-secondary" to="/admin/questions/new"><span className="material-symbols-outlined">add</span>New question</Link>} />
      <section className="surface-card filter-bar">
        <div className="input-with-icon search"><span className="material-symbols-outlined">search</span><input className="input" placeholder="Search questions or image context" value={search} onChange={(event) => setSearch(event.target.value)} /></div>
        <select className="select" style={{ width: 'auto' }} value={imageFilter} onChange={(event) => setImageFilter(event.target.value)} aria-label="Image filter"><option value="ALL">All media</option><option value="WITH">With image</option><option value="WITHOUT">Without image</option></select>
        <label className="btn btn-ghost" style={{ gap: 8 }}><input type="checkbox" checked={includeInactive} onChange={(event) => setIncludeInactive(event.target.checked)} />Show inactive</label>
        <button className="btn btn-outline" onClick={() => { setSearch(''); setImageFilter('ALL'); setIncludeInactive(false); }}>Clear</button>
      </section>
      {loading ? <LoadingState message="Opening the question library…" /> : error ? <ErrorState message={error} onRetry={load} /> : filtered.length === 0 ? <div className="surface-card"><EmptyState icon="quiz" title="No questions match this trail" message="Adjust the filters or create a new Heidi story question." action={<Link className="btn btn-secondary" to="/admin/questions/new">Create a question</Link>} /></div> : <section className="question-grid">{filtered.map((question) => <QuestionCard key={question.questionId} question={question} onDelete={setTarget} />)}</section>}
      <ConfirmModal open={Boolean(target)} title="Remove this question?" message="The question will become inactive and will no longer appear in new sessions." confirmLabel="Remove question" danger busy={busy} onConfirm={removeQuestion} onClose={() => setTarget(null)} />
    </>
  );
}

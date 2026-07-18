import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { adminApi } from '../../api/adminApi';
import { PageHeader } from '../../components/common/PageHeader';
import { LoadingState, ErrorState } from '../../components/common/StateViews';
import { useToast } from '../../components/common/ToastProvider';
import { useAuth } from '../../context/AuthContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

export default function SessionEditorPage() {
  const { sessionId } = useParams();
  const editing = Boolean(sessionId);
  useDocumentTitle(editing ? 'Edit session' : 'Create session');
  const { token } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [values, setValues] = useState({ title: '', description: '', questionIds: [] });
  const [questions, setQuestions] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const questionResult = await adminApi.listQuestions(token);
      setQuestions(questionResult.questions || []);
      if (editing) {
        const sessionResult = await adminApi.getSession(token, sessionId);
        setValues({ title: sessionResult.session.title, description: sessionResult.session.description || '', questionIds: (sessionResult.questions || []).map((question) => question.questionId) });
      }
    } catch (requestError) { setError(requestError.message); }
    finally { setLoading(false); }
  }, [editing, sessionId, token]);

  useEffect(() => { load(); }, [load]);

  const visibleQuestions = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return questions.filter((question) => !needle || `${question.questionText} ${question.imageContext}`.toLowerCase().includes(needle));
  }, [questions, search]);

  const selectedQuestions = useMemo(() => values.questionIds.map((id) => questions.find((question) => question.questionId === id)).filter(Boolean), [values.questionIds, questions]);

  function toggleQuestion(questionId) {
    setValues((current) => ({ ...current, questionIds: current.questionIds.includes(questionId) ? current.questionIds.filter((id) => id !== questionId) : [...current.questionIds, questionId] }));
  }

  function moveSelected(index, direction) {
    const target = index + direction;
    if (target < 0 || target >= values.questionIds.length) return;
    setValues((current) => {
      const questionIds = [...current.questionIds];
      [questionIds[index], questionIds[target]] = [questionIds[target], questionIds[index]];
      return { ...current, questionIds };
    });
  }

  async function save(event, openAfter = false) {
    event.preventDefault();
    setError('');
    if (values.title.trim().length < 2) { setError('Enter a session title.'); return; }
    if (openAfter && values.questionIds.length === 0) { setError('Choose at least one question before opening the session.'); return; }
    setBusy(true);
    try {
      let result;
      if (editing) {
        result = await adminApi.updateSession(token, sessionId, { title: values.title.trim(), description: values.description.trim() });
        result = await adminApi.setSessionQuestions(token, sessionId, values.questionIds);
      } else {
        result = await adminApi.createSession(token, { title: values.title.trim(), description: values.description.trim(), questionIds: values.questionIds });
      }
      const savedSession = result.session;
      if (openAfter) await adminApi.openSession(token, savedSession.sessionId);
      showToast(openAfter ? 'The session was saved and opened.' : 'The draft session was saved.', 'success');
      navigate(`/admin/sessions/${savedSession.sessionId}`);
    } catch (requestError) { setError(requestError.message); }
    finally { setBusy(false); }
  }

  if (loading) return <LoadingState message="Preparing the session builder…" />;
  if (error && editing && !values.title) return <ErrorState message={error} onRetry={load} />;

  return (
    <>
      <PageHeader eyebrow={<><Link to="/admin/sessions">Sessions</Link><span>/</span><span>{editing ? 'Edit' : 'Create'}</span></>} title={editing ? 'Edit Session' : 'Create Session'} description="Choose a title, add a short chapter description, and arrange the questions in order." />
      <form onSubmit={save}>
        <div className="editor-layout">
          <div>
            <section className="surface-card editor-section">
              <div className="section-title"><span className="material-symbols-outlined">edit_calendar</span><h2 className="headline-md" style={{ marginBottom: 0 }}>Session details</h2></div>
              <div className="stack-md"><div className="field"><label htmlFor="session-title">Session title</label><input className="input" id="session-title" value={values.title} onChange={(event) => setValues({ ...values, title: event.target.value })} maxLength="160" placeholder="Example: Life on the Alm" required /></div><div className="field"><label htmlFor="session-description">Description</label><textarea className="textarea" id="session-description" value={values.description} onChange={(event) => setValues({ ...values, description: event.target.value })} maxLength="2000" placeholder="Tell guests which part of Heidi’s story they will explore." /></div></div>
            </section>
            <section className="surface-card editor-section">
              <div className="section-title"><span className="material-symbols-outlined">library_add</span><h2 className="headline-md" style={{ marginBottom: 0 }}>Available questions</h2></div>
              <div className="input-with-icon" style={{ marginBottom: 16 }}><span className="material-symbols-outlined">search</span><input className="input" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search the question library" /></div>
              <div style={{ display: 'grid', gap: 10, maxHeight: 570, overflow: 'auto', paddingRight: 4 }}>
                {visibleQuestions.map((question) => {
                  const selected = values.questionIds.includes(question.questionId);
                  return <label key={question.questionId} className="surface-card interactive" style={{ padding: 14, display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer', background: selected ? 'var(--secondary-container)' : 'white' }}><input type="checkbox" checked={selected} onChange={() => toggleQuestion(question.questionId)} style={{ marginTop: 5 }} /><div><strong>{question.questionText}</strong><div className="label-sm muted" style={{ marginTop: 4 }}>{question.options.length} options {question.imageUrl ? '· image included' : ''}</div></div></label>;
                })}
              </div>
            </section>
          </div>
          <aside className="editor-aside">
            <section className="surface-card editor-section" style={{ position: 'sticky', top: 86 }}>
              <div className="section-title"><span className="material-symbols-outlined">format_list_numbered</span><h2 className="headline-md" style={{ marginBottom: 0 }}>Selected trail</h2></div>
              <div className="badge badge-open" style={{ marginBottom: 16 }}>{selectedQuestions.length} questions selected</div>
              {selectedQuestions.length === 0 ? <p className="muted">Choose questions from the library to build this session.</p> : <div style={{ display: 'grid', gap: 10 }}>{selectedQuestions.map((question, index) => <div className="option-preview" key={question.questionId}><span className="option-letter" style={{ width: 32, height: 32, flex: '0 0 32px' }}>{index + 1}</span><span style={{ flex: 1 }}>{question.questionText}</span><button className="btn btn-ghost btn-icon" type="button" onClick={() => moveSelected(index, -1)} disabled={index === 0} aria-label="Move question up"><span className="material-symbols-outlined">arrow_upward</span></button><button className="btn btn-ghost btn-icon" type="button" onClick={() => moveSelected(index, 1)} disabled={index === selectedQuestions.length - 1} aria-label="Move question down"><span className="material-symbols-outlined">arrow_downward</span></button></div>)}</div>}
            </section>
          </aside>
        </div>
        {error && <div className="field-error" style={{ margin: '16px 0' }}>{error}</div>}
        <div className="sticky-actions"><Link className="btn btn-ghost" to="/admin/sessions">Cancel</Link><button className="btn btn-outline" type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save as draft'}</button><button className="btn btn-secondary" type="button" onClick={(event) => save(event, true)} disabled={busy || values.questionIds.length === 0}><span className="material-symbols-outlined">play_arrow</span>Save and open</button></div>
      </form>
    </>
  );
}

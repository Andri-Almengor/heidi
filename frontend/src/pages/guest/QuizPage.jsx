import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { guestApi } from '../../api/guestApi';
import { AnswerOption } from '../../components/guest/AnswerOption';
import { Brand } from '../../components/common/Brand';
import { ImageLightbox } from '../../components/common/ImageLightbox';
import { LoadingState, ErrorState } from '../../components/common/StateViews';
import { useToast } from '../../components/common/ToastProvider';
import { useGuest } from '../../context/GuestContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { initials } from '../../utils/formatters';

export default function QuizPage() {
  useDocumentTitle('Quiz session');
  const { token, participant: storedParticipant, updateParticipant, clearGuest } = useGuest();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState('');
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [lightbox, setLightbox] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const result = await guestApi.quiz(token);
      setQuiz(result);
      updateParticipant(result.participant);
      const firstPending = result.questions.findIndex((question) => !question.answered);
      const nextIndex = firstPending >= 0 ? firstPending : Math.max(0, result.questions.length - 1);
      setIndex(nextIndex);
      const current = result.questions[nextIndex];
      setSelected(current?.previousAnswer?.selectedOptionId || '');
      setSaved(Boolean(current?.answered));
      if (result.participant.status === 'COMPLETED') navigate('/guest/results', { replace: true });
    } catch (requestError) { setError(requestError.message); }
    finally { setLoading(false); }
  }, [navigate, token, updateParticipant]);

  useEffect(() => { load(); }, [load]);

  const question = quiz?.questions?.[index];
  const answeredCount = quiz?.questions?.filter((item) => item.answered).length || 0;
  const progress = quiz?.questions?.length ? Math.round((answeredCount / quiz.questions.length) * 10000) / 100 : 0;

  const canGoPrevious = index > 0;
  const canGoNext = quiz && index < quiz.questions.length - 1;

  function goTo(nextIndex) {
    if (!quiz?.questions[nextIndex]) return;
    setIndex(nextIndex);
    const nextQuestion = quiz.questions[nextIndex];
    setSelected(nextQuestion.previousAnswer?.selectedOptionId || '');
    setSaved(Boolean(nextQuestion.answered));
  }

  async function submitAnswer() {
    if (!selected || saved || !question) return;
    setBusy(true); setError('');
    try {
      const result = await guestApi.answer(token, { questionId: question.questionId, selectedOptionId: selected });
      const nextQuiz = { ...quiz, participant: result.participant, questions: quiz.questions.map((item) => item.questionId === question.questionId ? { ...item, answered: true, previousAnswer: result.answer } : item) };
      setQuiz(nextQuiz);
      updateParticipant(result.participant);
      setSaved(true);
      showToast('Your answer was saved. Continue when you are ready.', 'success');
      if (result.participant.status === 'COMPLETED') window.setTimeout(() => navigate('/guest/results'), 650);
    } catch (requestError) { setError(requestError.message); showToast(requestError.message, 'error'); }
    finally { setBusy(false); }
  }

  function nextQuestion() {
    if (!quiz) return;
    const pendingAfter = quiz.questions.findIndex((item, questionIndex) => questionIndex > index && !item.answered);
    if (pendingAfter >= 0) goTo(pendingAfter);
    else if (canGoNext) goTo(index + 1);
    else navigate('/guest/results');
  }

  const guestName = quiz?.participant?.guestName || storedParticipant?.guestName || 'Guest';
  const answeredIndexes = useMemo(() => new Set((quiz?.questions || []).map((item, itemIndex) => item.answered ? itemIndex : -1).filter((itemIndex) => itemIndex >= 0)), [quiz]);

  if (loading) return <LoadingState message="Climbing to your next question…" />;
  if (error && !quiz) return <ErrorState message={error} onRetry={load} />;
  if (!question) return <ErrorState message="This session does not contain any available questions." />;

  return (
    <div className="guest-layout">
      <header className="guest-topbar">
        <div className="container guest-topbar-row">
          <Brand compact />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="label-sm uppercase muted" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{quiz.session.title}</div>
            <strong>Question {index + 1} of {quiz.questions.length}</strong>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="guest-name-meta" style={{ textAlign: 'right' }}><strong>{guestName}</strong><div className="label-sm muted">{answeredCount} answered</div></div>
            <div className="avatar">{initials(guestName)}</div>
            <button className="btn btn-ghost btn-icon" onClick={() => { clearGuest(); navigate('/'); }} aria-label="Leave quiz"><span className="material-symbols-outlined">logout</span></button>
          </div>
        </div>
        <div className="guest-progress-line"><div style={{ width: `${progress}%` }} /></div>
      </header>

      <main className="quiz-main">
        <div className="quiz-grid">
          <section className="quiz-question">
            <article className="surface-card quiz-question-card">
              <span className="badge badge-open">Question {String(index + 1).padStart(2, '0')}</span>
              <h1 className="headline-lg" style={{ margin: '16px 0 12px' }}>{question.questionText}</h1>
              {question.imageContext && <p className="muted" style={{ marginBottom: 0 }}>{question.imageContext}</p>}
            </article>
            {question.imageUrl && <div className="quiz-context-image"><img src={question.imageUrl} alt={question.imageContext || 'Question context'} onClick={() => setLightbox(true)} /><button className="btn btn-icon" onClick={() => setLightbox(true)} style={{ position: 'absolute', right: 12, bottom: 12, background: 'rgba(255,255,255,.88)', color: 'var(--primary)' }} aria-label="Enlarge question image"><span className="material-symbols-outlined">zoom_in</span></button></div>}
          </section>

          <section className="quiz-options" aria-label="Answer options">
            {question.options.map((option) => <AnswerOption key={option.id} option={option} selected={selected === option.id} locked={saved || question.answered} onSelect={setSelected} />)}
            {error && <div className="field-error">{error}</div>}
            <div className="quiz-actions">
              <button className="btn btn-ghost" onClick={() => goTo(index - 1)} disabled={!canGoPrevious}><span className="material-symbols-outlined">arrow_back</span>Previous</button>
              {!saved && !question.answered ? <button className="btn btn-secondary" onClick={submitAnswer} disabled={!selected || busy}>{busy ? 'Saving…' : <><span className="material-symbols-outlined">check_circle</span>Confirm answer</>}</button> : <button className="btn btn-primary" onClick={nextQuestion}>{canGoNext ? 'Next question' : 'View results'}<span className="material-symbols-outlined">arrow_forward</span></button>}
            </div>
            <div className="surface-card" style={{ padding: 14, display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}><span className="label-sm muted" style={{ marginRight: 4 }}>Question trail</span>{quiz.questions.map((item, itemIndex) => <button key={item.questionId} className={`btn btn-icon ${itemIndex === index ? 'btn-primary' : answeredIndexes.has(itemIndex) ? 'btn-secondary' : 'btn-ghost'}`} style={{ width: 36, height: 36, minHeight: 36 }} onClick={() => goTo(itemIndex)} aria-label={`Go to question ${itemIndex + 1}`}>{itemIndex + 1}</button>)}</div>
          </section>
        </div>
      </main>

      {(saved || question.answered) && <div className="answer-saved"><span className="material-symbols-outlined filled" style={{ fontSize: 34, color: 'var(--sun)' }}>check_circle</span><div><strong style={{ display: 'block' }}>Answer saved</strong><span style={{ color: 'rgba(255,255,255,.75)' }}>Your choice is locked. There is no timer, so continue whenever you are ready.</span></div></div>}
      <ImageLightbox imageUrl={lightbox ? question.imageUrl : ''} context={question.imageContext} onClose={() => setLightbox(false)} />
    </div>
  );
}

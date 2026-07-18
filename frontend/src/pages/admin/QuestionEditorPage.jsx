import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { adminApi } from '../../api/adminApi';
import { ImageLightbox } from '../../components/common/ImageLightbox';
import { PageHeader } from '../../components/common/PageHeader';
import { LoadingState, ErrorState } from '../../components/common/StateViews';
import { useToast } from '../../components/common/ToastProvider';
import { useAuth } from '../../context/AuthContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

const makeOptions = () => [
  { id: 'A', text: '' },
  { id: 'B', text: '' },
  { id: 'C', text: '' },
  { id: 'D', text: '' },
];

export default function QuestionEditorPage() {
  const { questionId } = useParams();
  const editing = Boolean(questionId);
  useDocumentTitle(editing ? 'Edit question' : 'Create question');
  const { token } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [values, setValues] = useState({ questionText: '', imageUrl: '', imageContext: '', options: makeOptions(), correctOptionId: 'A' });
  const [loading, setLoading] = useState(editing);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [lightbox, setLightbox] = useState(false);

  const load = useCallback(async () => {
    if (!editing) return;
    setLoading(true); setError('');
    try {
      const result = await adminApi.getQuestion(token, questionId);
      setValues({
        questionText: result.question.questionText || '',
        imageUrl: result.question.imageUrl || '',
        imageContext: result.question.imageContext || '',
        options: result.question.options || makeOptions(),
        correctOptionId: result.question.correctOptionId || result.question.options?.[0]?.id || 'A',
      });
    } catch (requestError) { setError(requestError.message); }
    finally { setLoading(false); }
  }, [editing, questionId, token]);

  useEffect(() => { load(); }, [load]);

  const nextOptionId = useMemo(() => String.fromCharCode(65 + values.options.length), [values.options.length]);

  function updateOption(index, text) {
    setValues((current) => ({ ...current, options: current.options.map((option, optionIndex) => optionIndex === index ? { ...option, text } : option) }));
  }

  function addOption() {
    if (values.options.length >= 8) return;
    setValues((current) => ({ ...current, options: [...current.options, { id: String.fromCharCode(65 + current.options.length), text: '' }] }));
  }

  function removeOption(index) {
    if (values.options.length <= 2) return;
    setValues((current) => {
      const options = current.options.filter((_, optionIndex) => optionIndex !== index).map((option, optionIndex) => ({ ...option, id: String.fromCharCode(65 + optionIndex) }));
      const removed = current.options[index];
      const correctOptionId = removed.id === current.correctOptionId ? options[0].id : options.find((option) => option.text === current.options.find((item) => item.id === current.correctOptionId)?.text)?.id || options[0].id;
      return { ...current, options, correctOptionId };
    });
  }

  function moveOption(index, direction) {
    const target = index + direction;
    if (target < 0 || target >= values.options.length) return;
    setValues((current) => {
      const selectedText = current.options.find((item) => item.id === current.correctOptionId)?.text;
      const reordered = [...current.options];
      [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
      const options = reordered.map((option, optionIndex) => ({ ...option, id: String.fromCharCode(65 + optionIndex) }));
      return { ...current, options, correctOptionId: options.find((option) => option.text === selectedText)?.id || options[0].id };
    });
  }

  function validate() {
    const errors = {};
    if (values.questionText.trim().length < 2) errors.questionText = 'Write the question before saving.';
    if (values.options.length < 2) errors.options = 'Add at least two answer options.';
    if (values.options.some((option) => !option.text.trim())) errors.options = 'Every answer option needs text.';
    if (!values.options.some((option) => option.id === values.correctOptionId)) errors.correctOptionId = 'Choose the correct answer.';
    if (values.imageUrl && !/^https?:\/\//i.test(values.imageUrl) && !values.imageUrl.startsWith('/src/') && !values.imageUrl.startsWith('data:')) errors.imageUrl = 'Use a valid http:// or https:// image URL.';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function save(event, createAnother = false) {
    event.preventDefault();
    if (!validate()) return;
    setBusy(true); setError('');
    const payload = { ...values, questionText: values.questionText.trim(), imageUrl: values.imageUrl.trim(), imageContext: values.imageContext.trim(), options: values.options.map((option) => ({ ...option, text: option.text.trim() })) };
    try {
      if (editing) await adminApi.updateQuestion(token, questionId, payload);
      else await adminApi.createQuestion(token, payload);
      showToast(editing ? 'The question was updated.' : 'The question was added to the Alpine library.', 'success');
      if (createAnother && !editing) {
        setValues({ questionText: '', imageUrl: '', imageContext: '', options: makeOptions(), correctOptionId: 'A' });
        setFieldErrors({});
      } else navigate('/admin/questions');
    } catch (requestError) { setError(requestError.message); }
    finally { setBusy(false); }
  }

  if (loading) return <LoadingState message="Opening the question editor…" />;
  if (error && editing && !values.questionText) return <ErrorState message={error} onRetry={load} />;

  return (
    <>
      <PageHeader eyebrow={<><Link to="/admin/questions">Questions</Link><span>/</span><span>{editing ? 'Edit' : 'Create'}</span></>} title={editing ? 'Edit Question' : 'Create Question'} description="Keep the Stitch editor layout while shaping each question around Heidi’s Alpine world." />
      <form onSubmit={save}>
        <div className="editor-layout">
          <div>
            <section className="surface-card editor-section">
              <div className="section-title"><span className="material-symbols-outlined">subject</span><h2 className="headline-md" style={{ marginBottom: 0 }}>Question details</h2></div>
              <div className="stack-md">
                <div className="field"><label htmlFor="question-text">Question</label><textarea className="textarea" id="question-text" value={values.questionText} onChange={(event) => setValues({ ...values, questionText: event.target.value })} placeholder="Example: What does Heidi love most about life on the Alm?" maxLength="3000" />{fieldErrors.questionText && <div className="field-error">{fieldErrors.questionText}</div>}</div>
                <div className="field"><label htmlFor="image-context">Story or image context</label><textarea className="textarea" id="image-context" value={values.imageContext} onChange={(event) => setValues({ ...values, imageContext: event.target.value })} placeholder="Give participants the story detail they need before answering." maxLength="3000" /></div>
              </div>
            </section>

            <section className="surface-card editor-section">
              <div className="section-title"><span className="material-symbols-outlined">list_alt</span><h2 className="headline-md" style={{ marginBottom: 0 }}>Answer options</h2></div>
              <div className="option-editor-list">
                {values.options.map((option, index) => (
                  <div className={`option-editor-row ${option.id === values.correctOptionId ? 'correct' : ''}`} key={`${option.id}-${index}`}>
                    <div className="option-letter">{option.id}</div>
                    <input className="input" value={option.text} onChange={(event) => updateOption(index, event.target.value)} placeholder={`Answer ${option.id}`} maxLength="500" />
                    <label className="correct-control label-sm" style={{ display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}><input type="radio" name="correct-answer" checked={option.id === values.correctOptionId} onChange={() => setValues({ ...values, correctOptionId: option.id })} />Correct</label>
                    <div style={{ display: 'flex' }}>
                      <button className="btn btn-ghost btn-icon" type="button" onClick={() => moveOption(index, -1)} disabled={index === 0} aria-label="Move answer up"><span className="material-symbols-outlined">arrow_upward</span></button>
                      <button className="btn btn-ghost btn-icon" type="button" onClick={() => moveOption(index, 1)} disabled={index === values.options.length - 1} aria-label="Move answer down"><span className="material-symbols-outlined">arrow_downward</span></button>
                      <button className="btn btn-ghost btn-icon" type="button" onClick={() => removeOption(index)} disabled={values.options.length <= 2} aria-label="Remove answer"><span className="material-symbols-outlined">delete</span></button>
                    </div>
                  </div>
                ))}
              </div>
              {fieldErrors.options && <div className="field-error" style={{ marginTop: 12 }}>{fieldErrors.options}</div>}
              {fieldErrors.correctOptionId && <div className="field-error" style={{ marginTop: 12 }}>{fieldErrors.correctOptionId}</div>}
              <button className="btn btn-outline" type="button" onClick={addOption} disabled={values.options.length >= 8} style={{ marginTop: 16 }}><span className="material-symbols-outlined">add</span>Add option {values.options.length < 8 && `(${nextOptionId})`}</button>
            </section>
          </div>

          <aside className="editor-aside">
            <section className="surface-card editor-section">
              <div className="section-title"><span className="material-symbols-outlined">image</span><h2 className="headline-md" style={{ marginBottom: 0 }}>Media support</h2></div>
              <div className="field"><label htmlFor="image-url">Image URL</label><input className="input" id="image-url" type="text" inputMode="url" value={values.imageUrl} onChange={(event) => setValues({ ...values, imageUrl: event.target.value })} placeholder="https://example.com/alpine-image.jpg" />{fieldErrors.imageUrl && <div className="field-error">{fieldErrors.imageUrl}</div>}<span className="label-sm muted">The participant can click the image to view it at full size.</span></div>
            </section>
            {values.imageUrl ? <section className="surface-card image-preview-card"><img src={values.imageUrl} alt={values.imageContext || 'Question preview'} onClick={() => setLightbox(true)} onError={(event) => { event.currentTarget.style.display = 'none'; }} /><div className="image-preview-copy"><div className="label-sm uppercase muted">Preview</div><p style={{ margin: '8px 0 0' }}>{values.imageContext || 'No image context has been added yet.'}</p></div></section> : <section className="surface-card" style={{ padding: 24, textAlign: 'center' }}><div className="state-icon"><span className="material-symbols-outlined">add_photo_alternate</span></div><strong>Add an Alpine image</strong><p className="muted" style={{ margin: '8px 0 0' }}>A cabin, goat, mountain path, or Frankfurt scene can make the story easier to remember.</p></section>}
          </aside>
        </div>
        {error && <div className="field-error" style={{ margin: '16px 0' }}>{error}</div>}
        <div className="sticky-actions">
          <Link className="btn btn-ghost" to="/admin/questions">Cancel</Link>
          {!editing && <button className="btn btn-outline" type="button" disabled={busy} onClick={(event) => save(event, true)}>Save and create another</button>}
          <button className="btn btn-secondary" type="submit" disabled={busy}>{busy ? 'Saving…' : <><span className="material-symbols-outlined">save</span>Save question</>}</button>
        </div>
      </form>
      <ImageLightbox imageUrl={lightbox ? values.imageUrl : ''} context={values.imageContext} onClose={() => setLightbox(false)} />
    </>
  );
}

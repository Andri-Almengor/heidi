export function AnswerOption({ option, selected, locked, onSelect }) {
  return (
    <button type="button" className={`answer-option ${selected ? 'selected' : ''} ${locked ? 'locked' : ''}`} disabled={locked} onClick={() => onSelect(option.id)}>
      <span className="answer-letter">{option.id}</span>
      <span style={{ fontWeight: 700 }}>{option.text}</span>
      {selected && <span className="material-symbols-outlined" style={{ marginLeft: 'auto', color: 'var(--secondary)' }}>{locked ? 'lock' : 'check_circle'}</span>}
    </button>
  );
}

import { Link } from 'react-router-dom';
import { StatusBadge } from '../common/StatusBadge';
import { formatDate } from '../../utils/formatters';

export function QuestionCard({ question, onDelete }) {
  return (
    <article className="surface-card interactive question-card">
      <div className="question-card-header">
        <div>
          <StatusBadge status={question.active ? 'ACTIVE' : 'INACTIVE'} />
          <h2 className="headline-md" style={{ margin: '12px 0 6px' }}>{question.questionText}</h2>
          <div className="label-sm muted">{question.options?.length || 0} answers · Updated {formatDate(question.updatedAt)}</div>
        </div>
        <span className="material-symbols-outlined" style={{ color: question.imageUrl ? 'var(--secondary)' : 'var(--outline)' }}>{question.imageUrl ? 'image' : 'hide_image'}</span>
      </div>
      {question.imageUrl && <img className="question-card-image" src={question.imageUrl} alt={question.imageContext || 'Question context'} />}
      <div className="options-preview">
        {(question.options || []).slice(0, 4).map((option) => (
          <div className={`option-preview ${option.id === question.correctOptionId ? 'correct' : ''}`} key={option.id}>
            <strong>{option.id}</strong><span>{option.text}</span>{option.id === question.correctOptionId && <span className="material-symbols-outlined" style={{ marginLeft: 'auto', fontSize: 18 }}>check_circle</span>}
          </div>
        ))}
      </div>
      <div className="card-actions">
        <Link className="btn btn-outline" to={`/admin/questions/${question.questionId}/edit`}><span className="material-symbols-outlined">edit</span>Edit</Link>
        {question.active && <button className="btn btn-ghost" onClick={() => onDelete(question)}><span className="material-symbols-outlined">delete</span>Remove</button>}
      </div>
    </article>
  );
}

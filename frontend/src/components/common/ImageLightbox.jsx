import { useEffect } from 'react';

export function ImageLightbox({ imageUrl, context, onClose }) {
  useEffect(() => {
    if (!imageUrl) return undefined;
    const onKey = (event) => event.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [imageUrl, onClose]);

  if (!imageUrl) return null;
  return (
    <div className="image-lightbox" role="dialog" aria-modal="true" aria-label="Question image preview" onMouseDown={(event) => event.target === event.currentTarget && onClose?.()}>
      <button className="btn btn-icon image-lightbox-close" onClick={onClose} aria-label="Close image"><span className="material-symbols-outlined">close</span></button>
      <figure>
        <img src={imageUrl} alt={context || 'Question context'} />
        {context && <figcaption>{context}</figcaption>}
      </figure>
    </div>
  );
}

export const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);

export function publicationHTML(publication) {
  const p = publication;
  const citation = [p.journal, p.year, p.volume, p.pages].filter(Boolean).join(' · ');
  return `${p.type ? `<p class="output-kind">Research feature · ${escapeHTML(p.type)}</p>` : ''}
    <a class="publication-title" href="${escapeHTML(p.url)}">${escapeHTML(p.title)}</a>
    <p class="publication-meta">${escapeHTML(p.authors)}</p>
    <p class="publication-meta">${escapeHTML(citation)}${p.doi ? ` · DOI: ${escapeHTML(p.doi)}` : ''}</p>`;
}

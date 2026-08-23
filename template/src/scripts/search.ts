import Fuse, { type IFuseOptions, type FuseResult } from 'fuse.js';

interface SearchRecord {
  id: string;
  type: 'service' | 'location' | 'blog' | 'career' | 'faq' | 'page';
  title: string;
  excerpt: string;
  body: string;
  url: string;
  category: string;
  tags?: string[];
}

const fuseOptions: IFuseOptions<SearchRecord> = {
  keys: [
    { name: 'title', weight: 0.5 },
    { name: 'excerpt', weight: 0.25 },
    { name: 'body', weight: 0.1 },
    { name: 'category', weight: 0.1 },
    { name: 'tags', weight: 0.05 },
  ],
  threshold: 0.35,
  distance: 200,
  minMatchCharLength: 2,
  includeScore: true,
};

const GROUP_ORDER: SearchRecord['type'][] = ['service', 'location', 'faq', 'blog', 'career', 'page'];

const GROUP_LABELS: Record<SearchRecord['type'], string> = {
  service: 'Services',
  location: 'Locations',
  faq: 'FAQs',
  blog: 'Blog',
  career: 'Careers',
  page: 'Pages',
};

const BADGE_CLASSES: Record<SearchRecord['type'], string> = {
  service: 'bg-primary/10 text-primary',
  location: 'bg-secondary/10 text-secondary',
  blog: 'bg-accent/10 text-accent',
  career: 'bg-warning/10 text-warning',
  faq: 'bg-info/10 text-info',
  page: 'bg-neutral-200 text-neutral-600',
};

// Singleton index loader
let indexPromise: Promise<Fuse<SearchRecord>> | null = null;

function loadIndex(): Promise<Fuse<SearchRecord>> {
  if (!indexPromise) {
    indexPromise = fetch('/search-index.json')
      .then((res) => res.json())
      .then((data: SearchRecord[]) => new Fuse(data, fuseOptions));
  }
  return indexPromise;
}

function initSearch() {
  const input = document.getElementById('search-input') as HTMLInputElement | null;
  if (!input) return;

  const resultsList = document.getElementById('search-results') as HTMLUListElement;
  const emptyState = document.getElementById('search-empty-state') as HTMLElement;
  const noResults = document.getElementById('search-no-results') as HTMLElement;
  const loading = document.getElementById('search-loading') as HTMLElement;
  const liveRegion = document.getElementById('search-live-region') as HTMLElement;
  const template = document.getElementById('search-result-template') as HTMLTemplateElement;

  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  let fuseInstance: Fuse<SearchRecord> | null = null;

  function showState(state: 'empty' | 'results' | 'no-results' | 'loading') {
    emptyState.classList.toggle('hidden', state !== 'empty');
    resultsList.classList.toggle('hidden', state !== 'results');
    noResults.classList.toggle('hidden', state !== 'no-results');
    loading.classList.toggle('hidden', state !== 'loading');
  }

  function getResultItems(): HTMLElement[] {
    return Array.from(resultsList.querySelectorAll<HTMLElement>('li[role="option"]'));
  }

  function setActiveResult(el: HTMLElement | null) {
    getResultItems().forEach((item) => item.removeAttribute('data-active'));
    if (el) {
      el.setAttribute('data-active', 'true');
      input!.setAttribute('aria-activedescendant', el.id);
      el.focus();
    } else {
      input!.removeAttribute('aria-activedescendant');
    }
  }

  function renderResults(records: FuseResult<SearchRecord>[]) {
    resultsList.innerHTML = '';

    if (records.length === 0) {
      showState('no-results');
      liveRegion.textContent = 'No results found';
      return;
    }

    // Group by type
    const grouped = new Map<SearchRecord['type'], SearchRecord[]>();
    for (const { item } of records) {
      const bucket = grouped.get(item.type) ?? [];
      bucket.push(item);
      grouped.set(item.type, bucket);
    }

    let resultIndex = 0;

    for (const type of GROUP_ORDER) {
      const items = grouped.get(type);
      if (!items || items.length === 0) continue;

      // Group heading
      const heading = document.createElement('li');
      heading.setAttribute('role', 'presentation');
      heading.className = 'search-result-group-heading';
      heading.textContent = GROUP_LABELS[type];
      resultsList.appendChild(heading);

      for (const record of items) {
        const clone = template.content.cloneNode(true) as DocumentFragment;
        const li = clone.querySelector('li') as HTMLLIElement;
        const anchor = clone.querySelector('a') as HTMLAnchorElement;
        const badge = clone.querySelector('.search-result-badge') as HTMLElement;
        const titleEl = clone.querySelector('.search-result-title') as HTMLElement;
        const excerptEl = clone.querySelector('.search-result-excerpt') as HTMLElement;

        const id = `search-result-${resultIndex++}`;
        li.id = id;
        anchor.href = record.url;
        badge.textContent = record.category;
        badge.className = `search-result-badge ${BADGE_CLASSES[record.type]}`;
        titleEl.textContent = record.title;
        excerptEl.textContent = record.excerpt;

        // Keyboard: Enter navigates
        li.addEventListener('keydown', (e: KeyboardEvent) => {
          if (e.key === 'Enter') {
            window.location.href = record.url;
          } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            focusNextResult(li);
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            focusPrevResult(li);
          }
        });

        resultsList.appendChild(clone);
      }
    }

    showState('results');
    liveRegion.textContent = `${records.length} result${records.length !== 1 ? 's' : ''} found`;
  }

  function focusNextResult(current: HTMLElement) {
    const items = getResultItems();
    const idx = items.indexOf(current);
    if (idx < items.length - 1) setActiveResult(items[idx + 1]);
  }

  function focusPrevResult(current: HTMLElement) {
    const items = getResultItems();
    const idx = items.indexOf(current);
    if (idx > 0) {
      setActiveResult(items[idx - 1]);
    } else {
      setActiveResult(null);
      input!.focus();
    }
  }

  async function runSearch(query: string) {
    if (query.length < 2) {
      showState('empty');
      liveRegion.textContent = '';
      return;
    }

    if (!fuseInstance) {
      showState('loading');
      fuseInstance = await loadIndex();
    }

    const results = fuseInstance.search(query, { limit: 20 });
    renderResults(results);
  }

  // Input handler with debounce
  input.addEventListener('input', () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => runSearch(input.value.trim()), 180);
  });

  // Arrow down from input focuses first result
  input.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const items = getResultItems();
      if (items.length > 0) setActiveResult(items[0]);
    }
  });

  // Modal open: load index, clear state, focus input
  window.addEventListener('modal:open:search-modal', () => {
    loadIndex().then((fuse) => { fuseInstance = fuse; }).catch(() => {});
    input.value = '';
    resultsList.innerHTML = '';
    showState('empty');
    liveRegion.textContent = '';
    requestAnimationFrame(() => input.focus());
  });

  // Modal close: cancel pending debounce
  window.addEventListener('modal:close:search-modal', () => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      debounceTimer = null;
    }
  });

  // Initial state
  showState('empty');
}

// Cmd/Ctrl+K global shortcut
document.addEventListener('keydown', (e: KeyboardEvent) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent('modal:open:search-modal'));
  }
});

// Header search triggers — delegated so a single listener covers the desktop
// and mobile buttons and survives Astro view-transition swaps (no re-binding).
document.addEventListener('click', (e) => {
  const trigger = (e.target as HTMLElement).closest('[data-search-trigger]');
  if (trigger) {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent('modal:open:search-modal'));
  }
});

document.addEventListener('DOMContentLoaded', initSearch);
document.addEventListener('astro:after-swap', initSearch);

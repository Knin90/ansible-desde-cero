/**
 * navigation.ts
 * Sticky nav: IntersectionObserver drives active-link highlight;
 * click handler smooth-scrolls and sets focus to the section heading.
 */

export function initNavigation(): void {
  const navLinks = Array.from(
    document.querySelectorAll<HTMLAnchorElement>('a.nav-link')
  );

  if (navLinks.length === 0) return;

  // Map section id → nav link
  const linkMap = new Map<string, HTMLAnchorElement>();
  for (const link of navLinks) {
    const href = link.getAttribute('href');
    if (href?.startsWith('#')) {
      linkMap.set(href.slice(1), link);
    }
  }

  const sections = Array.from(
    document.querySelectorAll<HTMLElement>('main section[id]')
  );

  // Track which section is most visible
  const visibilityRatio = new Map<string, number>();

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        visibilityRatio.set(entry.target.id, entry.intersectionRatio);
      }

      // Pick the section with the highest intersection ratio
      let topId = '';
      let topRatio = 0;
      for (const [id, ratio] of visibilityRatio) {
        if (ratio > topRatio) {
          topRatio = ratio;
          topId = id;
        }
      }

      // Update active classes
      for (const [id, link] of linkMap) {
        link.classList.toggle('active', id === topId && topRatio > 0);
      }
    },
    {
      rootMargin: '-10% 0px -60% 0px',
      threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
    }
  );

  for (const section of sections) {
    visibilityRatio.set(section.id, 0);
    observer.observe(section);
  }

  // Smooth-scroll + focus on click
  for (const link of navLinks) {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href?.startsWith('#')) return;

      const target = document.getElementById(href.slice(1));
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });

      // Set focus to the first heading inside the section
      const heading = target.querySelector<HTMLElement>('h2, h3');
      if (heading) {
        heading.tabIndex = -1;
        heading.focus({ preventScroll: true });
      }
    });
  }
}

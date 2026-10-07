import Reveal from './Reveal';
import SplitText from './SplitText';
import './SectionHeader.css';

export default function SectionHeader({ eyebrow, title, lead, align = 'left', id, children }) {
  return (
    <header className={`section-header section-header--${align}`}>
      {eyebrow && (
        <Reveal variant="fade" className="eyebrow">
          <span className="eyebrow__dot" aria-hidden="true" />
          {eyebrow}
        </Reveal>
      )}
      <SplitText as="h2" id={id} text={title} className="section-header__title" />
      {lead && (
        <Reveal as="p" delay={0.15} className="section-header__lead">
          {lead}
        </Reveal>
      )}
      {children}
    </header>
  );
}

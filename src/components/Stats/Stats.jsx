import CountUp from '../ui/CountUp';
import { RevealGroup, RevealItem } from '../ui/Reveal';
import { siteConfig } from '../../config/siteConfig';
import './Stats.css';

/** Solo cifras publicadas por la empresa (ver siteConfig.stats). */
export default function Stats() {
  return (
    <section className="stats theme-dark" aria-label="Tucargo en cifras">
      <div className="container">
        <RevealGroup as="dl" className="stats__grid">
          {siteConfig.stats.map((s) => (
            <RevealItem key={s.label} className="stats__item">
              <dt className="stats__label">{s.label}</dt>
              <dd className="stats__value">
                {s.prefix && <span className="stats__affix">{s.prefix}</span>}
                <CountUp to={s.value} from={s.value > 1000 && !s.format ? s.value - 40 : 0} format={s.format} />
                {s.suffix && <span className="stats__affix">{s.suffix}</span>}
              </dd>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}

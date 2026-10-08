import { Plane, Ship, Container, Heart, ArrowRight } from 'lucide-react';
import SectionHeader from '../ui/SectionHeader';
import Button from '../ui/Button';
import { RevealGroup, RevealItem } from '../ui/Reveal';
import { InstagramIcon } from '../ui/BrandIcons';
import Flag from '../ui/Flag';
import { instagramTiles } from '../../data/content';
import { siteConfig } from '../../config/siteConfig';
import './Instagram.css';

const tileIcons = { air: Plane, sea: Ship, container: Container, family: Heart };

function TileArt({ tile }) {
  if (tile.kind === 'brand') {
    return (
      <img
        className="ig-tile__logo"
        src={`${import.meta.env.BASE_URL}${tile.image}`}
        alt=""
        width="256"
        height="256"
        loading="lazy"
        decoding="async"
      />
    );
  }
  if (tile.image) {
    return <img src={`${import.meta.env.BASE_URL}${tile.image}`} alt={tile.title} loading="lazy" decoding="async" />;
  }
  if (tile.kind === 'route') {
    return (
      <div className="ig-tile__route">
        <span>
          <Flag code="de" size={22} /> Alemania
        </span>
        <ArrowRight size={22} aria-hidden="true" />
        <span>
          <Flag code="ve" size={22} /> Venezuela
        </span>
      </div>
    );
  }
  const Icon = tileIcons[tile.kind];
  return (
    <div className="ig-tile__art">
      <Icon size={56} strokeWidth={1.2} aria-hidden="true" />
    </div>
  );
}

export default function Instagram() {
  const ig = siteConfig.social.instagram;
  return (
    <section className="instagram section theme-white" aria-labelledby="ig-title">
      <div className="container">
        <div className="instagram__head">
          <SectionHeader
            id="ig-title"
            eyebrow={ig.handle}
            title="Síguenos en Instagram"
            lead="Salidas, novedades, recargos y consejos para enviar. Todo lo que pasa en Tucargo, primero en Instagram."
          />
          <Button href={ig.url} variant="primary" iconLeft={<InstagramIcon size={18} />}>
            Ver Instagram
          </Button>
        </div>
        <RevealGroup className="instagram__grid" stagger={0.06}>
          {instagramTiles.map((t) => (
            <RevealItem key={t.id} variant="scale">
              <a
                href={ig.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`ig-tile ig-tile--${t.kind}`}
                aria-label={`${t.title} — ver en Instagram ${ig.handle}`}
              >
                <TileArt tile={t} />
                <span className="ig-tile__brand" aria-hidden="true">
                  TUCARGO
                </span>
                <span className="ig-tile__title">{t.title}</span>
                <span className="ig-tile__overlay" aria-hidden="true">
                  <InstagramIcon size={28} />
                </span>
              </a>
            </RevealItem>
          ))}
        </RevealGroup>
        <p className="instagram__note">Composición gráfica inspirada en la identidad de {ig.handle}.</p>
      </div>
    </section>
  );
}

import { lazy, Suspense } from 'react';
import { MotionConfig } from 'framer-motion';
import Header from './components/Header/Header';
import Hero from './components/Hero/Hero';
import Connection from './components/Connection/Connection';
import Stats from './components/Stats/Stats';
import WhatsAppButton from './components/WhatsAppButton/WhatsAppButton';

// Code splitting: todo lo que está bajo el primer pliegue se carga en chunks aparte.
const Services = lazy(() => import('./components/Services/Services'));
const ShippingComparison = lazy(() => import('./components/ShippingComparison/ShippingComparison'));
const Rates = lazy(() => import('./components/Rates/Rates'));
const ShippingCalculator = lazy(() => import('./components/ShippingCalculator/ShippingCalculator'));
const HowItWorks = lazy(() => import('./components/HowItWorks/HowItWorks'));
const Tracking = lazy(() => import('./components/Tracking/Tracking'));
const RouteMap = lazy(() => import('./components/RouteMap/RouteMap'));
const About = lazy(() => import('./components/About/About'));
const WhyTucargo = lazy(() => import('./components/WhyTucargo/WhyTucargo'));
const Testimonials = lazy(() => import('./components/Testimonials/Testimonials'));
const Contact = lazy(() => import('./components/Contact/Contact'));
const FAQ = lazy(() => import('./components/FAQ/FAQ'));
const Instagram = lazy(() => import('./components/Instagram/Instagram'));
const Footer = lazy(() => import('./components/Footer/Footer'));

/** Ancla estable para la navegación aunque la sección todavía se esté cargando. */
function Anchor({ id, children, minHeight = '60vh' }) {
  return (
    <div id={id} className="anchor">
      <Suspense fallback={<div style={{ minHeight }} aria-busy="true" />}>{children}</Suspense>
    </div>
  );
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <a href="#main" className="skip-link">
        Saltar al contenido
      </a>
      <Header />
      <main id="main">
        <div id="inicio">
          <Hero />
        </div>
        <div id="conexion">
          <Connection />
          <Stats />
        </div>
        <Anchor id="servicios">
          <Services />
        </Anchor>
        <Anchor id="envios">
          <ShippingComparison />
        </Anchor>
        <Anchor id="tarifas">
          <Rates />
        </Anchor>
        <Anchor id="calculadora">
          <ShippingCalculator />
        </Anchor>
        <Anchor id="como-funciona">
          <HowItWorks />
        </Anchor>
        <Anchor id="seguimiento">
          <Tracking />
        </Anchor>
        <Anchor id="ruta">
          <RouteMap />
        </Anchor>
        <Anchor id="nosotros">
          <About />
          <WhyTucargo />
          <Testimonials />
        </Anchor>
        <Anchor id="contacto">
          <Contact />
        </Anchor>
        <Anchor id="faq">
          <FAQ />
        </Anchor>
        <Anchor id="instagram" minHeight="40vh">
          <Instagram />
        </Anchor>
      </main>
      <Suspense fallback={null}>
        <Footer />
      </Suspense>
      <WhatsAppButton />
    </MotionConfig>
  );
}

import { lazy, useEffect } from 'react';
import { useMediaQuery } from './hooks/useMediaQuery';
import { DESKTOP_MOTION_QUERY } from './hooks/useMotionPreference';
import { LazyMotion, MotionConfig, domAnimation } from 'framer-motion';
import Header from './components/Header/Header';
import Hero from './components/Hero/Hero';
import Connection from './components/Connection/Connection';
import Stats from './components/Stats/Stats';
import WhatsAppButton from './components/WhatsAppButton/WhatsAppButton';
import DeferredSection from './components/ui/DeferredSection';
import ScrollProgress from './components/ScrollProgress/ScrollProgress';
import MobileActionBar from './components/MobileActionBar/MobileActionBar';
import { initAnchorNavigation, initSmoothScroll } from './lib/scroll';

// Code splitting: todo lo que está bajo el primer pliegue se carga en chunks aparte.
const Distance = lazy(() => import('./components/Distance/Distance'));
const Services = lazy(() => import('./components/Services/Services'));
const Marquee = lazy(() => import('./components/Marquee/Marquee'));
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

export default function App() {
  const desktopMotion = useMediaQuery(DESKTOP_MOTION_QUERY);
  useEffect(() => {
    const off = initAnchorNavigation();
    initSmoothScroll();
    return off;
  }, []);

  return (
    <LazyMotion features={domAnimation} strict>
    <MotionConfig reducedMotion={desktopMotion ? 'never' : 'user'}>
      <a href="#main" className="skip-link">
        Saltar al contenido
      </a>
      <ScrollProgress />
      <Header />
      <main id="main">
        <div id="inicio">
          <Hero />
        </div>
        <div id="conexion">
          <Connection />
        </div>
        <DeferredSection id="distancia" minHeight="100vh">
          <Distance />
        </DeferredSection>
        <Stats />
        <DeferredSection id="servicios">
          <Services />
        </DeferredSection>
        <DeferredSection minHeight="180px">
          <Marquee />
        </DeferredSection>
        <DeferredSection id="envios">
          <ShippingComparison />
        </DeferredSection>
        <DeferredSection id="tarifas">
          <Rates />
        </DeferredSection>
        <DeferredSection id="calculadora">
          <ShippingCalculator />
        </DeferredSection>
        <DeferredSection id="como-funciona">
          <HowItWorks />
        </DeferredSection>
        <DeferredSection id="seguimiento">
          <Tracking />
        </DeferredSection>
        <DeferredSection id="ruta">
          <RouteMap />
        </DeferredSection>
        <DeferredSection id="nosotros">
          <About />
          <WhyTucargo />
          <Testimonials />
        </DeferredSection>
        <DeferredSection id="contacto">
          <Contact />
        </DeferredSection>
        <DeferredSection id="faq">
          <FAQ />
        </DeferredSection>
        <DeferredSection id="instagram" minHeight="40vh">
          <Instagram />
        </DeferredSection>
      </main>
      <DeferredSection minHeight="40vh">
        <Footer />
      </DeferredSection>
      <WhatsAppButton />
      <MobileActionBar />
    </MotionConfig>
    </LazyMotion>
  );
}

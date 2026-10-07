import { whatsappLink } from '../config/siteConfig';

/**
 * Envío de solicitudes de cotización.
 * Proveedor configurable con VITE_FORM_PROVIDER: formspree | emailjs | supabase | api.
 * Sin proveedor configurado, la solicitud se envía por WhatsApp (no se simula un servidor).
 */
const env = import.meta.env;
export const FORM_PROVIDER = (env.VITE_FORM_PROVIDER || 'whatsapp').toLowerCase();

const typeLabels = { air: 'Aéreo', sea: 'Marítimo', unsure: 'No lo sé todavía' };

export function buildQuoteMessage(d) {
  return [
    'Hola Tucargo, quisiera solicitar una cotización:',
    `• Nombre: ${d.firstName} ${d.lastName}`,
    `• Email: ${d.email}`,
    `• WhatsApp: ${d.whatsapp}`,
    `• Ciudad de origen: ${d.city}`,
    `• Destino: ${d.destinationLabel}`,
    `• Tipo de envío: ${typeLabels[d.shippingType] ?? d.shippingType}`,
    d.weight ? `• Peso aprox.: ${d.weight} kg` : null,
    d.message ? `• Mensaje: ${d.message}` : null,
  ]
    .filter(Boolean)
    .join('\n');
}

async function postJSON(url, body, headers = {}) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...headers },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Error ${res.status}`);
  return res;
}

const providers = {
  formspree: (d) => postJSON(`https://formspree.io/f/${env.VITE_FORMSPREE_ID}`, d),
  emailjs: (d) =>
    postJSON('https://api.emailjs.com/api/v1.0/email/send', {
      service_id: env.VITE_EMAILJS_SERVICE_ID,
      template_id: env.VITE_EMAILJS_TEMPLATE_ID,
      user_id: env.VITE_EMAILJS_PUBLIC_KEY,
      template_params: { ...d, summary: buildQuoteMessage(d) },
    }),
  supabase: (d) =>
    postJSON(
      `${env.VITE_SUPABASE_URL}/rest/v1/${env.VITE_SUPABASE_TABLE || 'quote_requests'}`,
      {
        first_name: d.firstName,
        last_name: d.lastName,
        email: d.email,
        whatsapp: d.whatsapp,
        city: d.city,
        destination: d.destinationLabel,
        shipping_type: d.shippingType,
        weight: d.weight || null,
        message: d.message || null,
      },
      {
        apikey: env.VITE_SUPABASE_ANON_KEY,
        Authorization: `Bearer ${env.VITE_SUPABASE_ANON_KEY}`,
        Prefer: 'return=minimal',
      },
    ),
  api: (d) => postJSON(env.VITE_QUOTE_API_URL, d),
};

/**
 * @returns {Promise<{ channel: 'server' } | { channel: 'whatsapp', url: string }>}
 */
export async function submitQuote(data) {
  const send = providers[FORM_PROVIDER];
  if (!send) {
    return { channel: 'whatsapp', url: whatsappLink(buildQuoteMessage(data)) };
  }
  await send(data);
  return { channel: 'server' };
}

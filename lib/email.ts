import nodemailer from "nodemailer";

interface TicketEmailPayload {
  to: string;
  name: string | null;
  ticket: {
    id: string;
    ticketNumber: string | null;
    qrCode: string;
    quantity: number;
    ticketType: string;
    reference: string | null;
    event?: {
      title: string | null;
      date: Date | string | null;
      location: string | null;
    } | null;
  };
}

function getTransport() {
  const host = process.env.EMAIL_HOST;
  const port = process.env.EMAIL_PORT
    ? parseInt(process.env.EMAIL_PORT, 10)
    : 587;
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!host || !user || !pass) {
    throw new Error("EMAIL_HOST, EMAIL_USER ou EMAIL_PASS non configurés");
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

export async function sendTicketEmail({ to, name, ticket }: TicketEmailPayload) {
  const from = process.env.EMAIL_FROM || "PASS AVENIR <no-reply@pass-avenir.local>";
  const title = "PASS AVENIR – Journée découverte des métiers";
  const dateStr = "Samedi 28 mars 2026 à 09h00";
  const location = "Palais des Sports et de la Culture Mahamasina";
  const locationUrl =
    "https://www.google.com/maps/place/Palais+des+Sports+et+de+la+Culture/@-18.9212659,47.521495,16.05z/data=!4m6!3m5!1s0x21f07e0a8558d041:0xe0c64c428dd75a7b!8m2!3d-18.9206085!4d47.5269832!16s%2Fg%2F1tlnssxm";

  const ticketNumber = ticket.ticketNumber || ticket.id.slice(0, 8).toUpperCase();

  // QR code public image (basé sur le token qrCode)
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=10&data=${encodeURIComponent(
    ticket.qrCode,
  )}`;

  const subject = `Votre billet PASS AVENIR - ${ticketNumber}`;

  const html = `
  <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #0f172a;">
    <h1 style="font-size: 20px; margin-bottom: 8px;">Bonjour ${name || ""}</h1>
    <p style="font-size: 14px; line-height: 1.6; margin-bottom: 16px;">
      Merci pour votre participation à <strong>PASS AVENIR</strong>. Votre achat de billet a été <strong>validé</strong>.
    </p>

    <div style="border-radius: 12px; border: 1px solid #e2e8f0; padding: 16px; margin-bottom: 16px; background: #f8fafc;">
      <h2 style="font-size: 16px; margin-top: 0; margin-bottom: 8px;">Détails du billet</h2>
      <p style="font-size: 14px; margin: 4px 0;"><strong>Événement :</strong> ${title}</p>
      <p style="font-size: 14px; margin: 4px 0;"><strong>Date :</strong> ${dateStr}</p>
      <p style="font-size: 14px; margin: 4px 0;">
        <strong>Lieu :</strong> ${location}
        <br />
        <a href="${locationUrl}" style="color: #0f766e; text-decoration: underline;">
          Ouvrir dans Google Maps
        </a>
      </p>
      <p style="font-size: 14px; margin: 4px 0;"><strong>N° de billet :</strong> ${ticketNumber}</p>
      ${
        ticket.reference
          ? `<p style=\"font-size: 14px; margin: 4px 0;\"><strong>Référence Mvola :</strong> ${
              ticket.reference
            }</p>`
          : ""
      }
    </div>

    <p style="font-size: 14px; line-height: 1.6; margin-bottom: 12px;">
      Présentez ce QR code à l'entrée de l'événement :
    </p>

    <div style="text-align: center; margin: 16px 0;">
      <img src="${qrImageUrl}" alt="QR Code billet PASS AVENIR" style="max-width: 260px; height: auto;" />
    </div>

    <p style="font-size: 13px; color: #64748b; margin-top: 16px;">
      Nous avons hâte de vous recevoir.
      <br />
      L'équipe PASS AVENIR
    </p>
  </div>
  `;

  const text = `Bonjour ${name || ""},\n\nVotre billet PASS AVENIR a été validé.\n\nN° de billet: ${ticketNumber}\nÉvénement: ${title}\nDate: ${dateStr}\nLieu: ${location}\nMaps: ${locationUrl}\nRéférence: ${ticket.reference || "-"}\n\nConservez cet email et présentez le QR code reçu pour accéder à l'événement.`;

  const transporter = getTransport();

  await transporter.sendMail({
    from,
    to,
    subject,
    text,
    html,
  });
}

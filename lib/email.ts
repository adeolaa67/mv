import { Resend } from "resend";
import { siteContent } from "./content";

function getResend() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is missing — set it in .env.local.");
  }
  return new Resend(apiKey);
}

function getFromAddress() {
  const from = process.env.EMAIL_FROM;
  if (!from) {
    throw new Error("EMAIL_FROM is missing — set it in .env.local.");
  }
  return from;
}

// Business's own inbox, from the same contact list rendered on the site —
// no separate admin-email env var needed, this is already the one address
// customers are told to reach the business at.
function getAdminEmail() {
  return siteContent.contact.find((c) => c.icon === "mail")?.label;
}

type BookingConfirmation = {
  date: string;
  slot: string;
  categorySlug: string;
  subOption: string;
  customerName: string;
  customerEmail: string;
  amountPence: number;
};

// Called from the webhook handler after the Firestore write succeeds. Errors
// here are logged and swallowed by the caller — a failed email shouldn't
// turn an otherwise-successful payment into a Stripe-retried webhook, since
// the booking write itself is already done and is idempotent, not the email.
export async function sendBookingConfirmationEmails(booking: BookingConfirmation) {
  const resend = getResend();
  const from = getFromAddress();
  const categoryName =
    siteContent.categories.find((c) => c.slug === booking.categorySlug)?.name ?? booking.categorySlug;

  const summary = `${booking.subOption} (${categoryName}) on ${booking.date} at ${booking.slot}`;
  const amount = `£${(booking.amountPence / 100).toFixed(2)}`;

  await resend.emails.send({
    from,
    to: booking.customerEmail,
    subject: `Booking confirmed — ${booking.date} at ${booking.slot}`,
    text: `Hi ${booking.customerName},\n\nYour payment of ${amount} has gone through and your appointment is booked and paid in full:\n\n${summary}\n\nSee you then!\n\n— ${siteContent.brand.name}`,
  });

  const adminEmail = getAdminEmail();
  if (adminEmail) {
    await resend.emails.send({
      from,
      to: adminEmail,
      subject: `New booking — ${booking.date} at ${booking.slot}`,
      text: `New confirmed booking:\n\n${summary}\n\nCustomer: ${booking.customerName}\nEmail: ${booking.customerEmail}`,
    });
  }
}

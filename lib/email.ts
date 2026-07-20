import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOrderEmail(order: any) {
  await resend.emails.send({
    from: "NA KIRRAAK ADDA <onboarding@resend.dev>",
    to: "nakirraakadda2026@gmail.com",
    subject: "🍕 New Order Received",
    html: `
      <h2>New Order</h2>
      <p><b>Name:</b> ${order.customerName}</p>
      <p><b>Phone:</b> ${order.phone}</p>
      <p><b>Address:</b> ${order.address}</p>
      <p><b>Payment:</b> ${order.paymentMethod}</p>
      <p><b>Total:</b> ₹${order.grandTotal}</p>
    `,
  });
}
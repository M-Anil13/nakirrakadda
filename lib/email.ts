import { Resend } from "resend";

let resend: any = null;

try {
  if (process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
} catch (error) {
  console.log("Resend API key not configured");
}

export async function sendOrderEmail(order: any) {
  if (!resend) {
    console.log("Email service not configured. Order details:", order);
    return;
  }

  const itemsHtml = order.cartItems
    .map(
      (item: any, index: number) => `
        <tr>
          <td style="padding:8px;border:1px solid #ddd;">${index + 1}</td>
          <td style="padding:8px;border:1px solid #ddd;">${item.name}</td>
          <td style="padding:8px;border:1px solid #ddd;text-align:center;">${item.quantity}</td>
          <td style="padding:8px;border:1px solid #ddd;text-align:right;">₹${item.price}</td>
          <td style="padding:8px;border:1px solid #ddd;text-align:right;">₹${item.price * item.quantity}</td>
        </tr>
      `
    )
    .join("");

  await resend.emails.send({
    from: "NA KIRRAAK ADDA <onboarding@resend.dev>",
    to: "nakirraakadda2026@gmail.com",
    subject: `🍕 New Order #${order.orderId}`,

    html: `
      <div style="font-family:Arial,sans-serif;max-width:700px">

        <h1 style="color:#d35400;">🍕 NEW ORDER RECEIVED</h1>

        <p><b>Order ID:</b> ${order.orderId}</p>
        <p><b>Customer:</b> ${order.customerName}</p>
        <p><b>Phone:</b> ${order.phone}</p>
        <p><b>Address:</b> ${order.address}</p>
        <p><b>Payment:</b> ${order.paymentMethod}</p>

        <h2>Items Ordered</h2>

        <table style="border-collapse:collapse;width:100%;">
          <tr style="background:#f5f5f5;">
            <th style="padding:8px;border:1px solid #ddd;">#</th>
            <th style="padding:8px;border:1px solid #ddd;">Item</th>
            <th style="padding:8px;border:1px solid #ddd;">Qty</th>
            <th style="padding:8px;border:1px solid #ddd;">Price</th>
            <th style="padding:8px;border:1px solid #ddd;">Total</th>
          </tr>

          ${itemsHtml}
        </table>

        <h2 style="margin-top:20px;">
          Grand Total: ₹${order.grandTotal}
        </h2>

        <p><b>Status:</b> ${order.status}</p>

      </div>
    `,
  }).catch((error: any) => console.log("Failed to send email:", error));
}
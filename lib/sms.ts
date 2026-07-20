export async function sendOrderSMS(order: any) {
  const apiKey = process.env.FAST2SMS_API_KEY;

  const message = `🍕 NA KIRRAAK ADDA

Hi ${order.customerName},

Your order has been received successfully.

Order ID: #${order.id || "Pending"}
Status: Received ✅

Track your order:
https://na-kirraak-adda-ten.vercel.app/track?id=${order.id || ""}`;

  await fetch("https://www.fast2sms.com/dev/bulkV2", {
    method: "POST",
    headers: {
      authorization: apiKey!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      route: "q",
      message,
      language: "english",
      flash: 0,
      numbers: order.phone,
    }),
  });
}
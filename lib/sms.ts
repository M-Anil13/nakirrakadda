export async function sendOrderSMS(order: any) {
  const apiKey = process.env.FAST2SMS_API_KEY;

  if (!apiKey) {
    console.error("FAST2SMS_API_KEY is missing");
    return;
  }

  const orderId = order.orderId || order.id || Date.now().toString();

  const message = `🍕 NA KIRRAAK ADDA

Hi ${order.customerName},

Your order has been received successfully.

Order ID: #${orderId}

Status: Received ✅

Track your order:
https://na-kirraak-adda-ten.vercel.app/track?id=${orderId}

Thank you for ordering with NA KIRRAAK ADDA ❤️`;

  try {
    const response = await fetch("https://www.fast2sms.com/dev/bulkV2", {
      method: "POST",
      headers: {
        authorization: apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        route: "q",
        sender_id: "YOUR_SENDER_ID",
        message: message,
        language: "english",
        flash: 0,
        numbers: order.phone,
      }),
    });

    const result = await response.json();
    console.log("SMS Sent:", result);
  } catch (error) {
    console.error("SMS Error:", error);
  }
}
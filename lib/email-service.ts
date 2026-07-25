import nodemailer from "nodemailer";
import { getEmailConfig } from "./admin-db";

interface SendOrderEmailParams {
  adminEmail?: string;
  order: {
    id?: string;
    customerName: string;
    phone: string;
    address: string;
    items: any[];
    subtotal: number;
    gst: number;
    deliveryCharge: number;
    grandTotal: number;
    paymentMethod: string;
  };
}

export async function sendAdminOrderNotificationEmail({ order }: SendOrderEmailParams) {
  try {
    const config = getEmailConfig();
    const adminEmail = config.adminEmail || "nakirraakadda2026@gmail.com";
    const smtpHost = config.smtpHost || "smtp.gmail.com";
    const smtpPort = Number(config.smtpPort) || 587;
    const smtpUser = config.smtpUser || "nakirraakadda2026@gmail.com";
    const smtpPass = config.smtpPass || "";
    const senderName = config.senderName || "NA KIRRAAK ADDA";

    const itemsListHtml = (order.items || [])
      .map(
        (item: any) =>
          `<tr style="border-bottom: 1px solid #333;">
            <td style="padding: 10px; color: #ffffff;">${item.name}</td>
            <td style="padding: 10px; text-align: center; color: #ff6b00; font-weight: bold;">x${item.qty}</td>
            <td style="padding: 10px; text-align: right; color: #ffffff;">₹${((Number(item.price) || 0) * (Number(item.qty) || 1)).toFixed(0)}</td>
          </tr>`
      )
      .join("");

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; background-color: #0d0a08; padding: 24px; border-radius: 16px; color: #ffffff; max-width: 600px; margin: 0 auto; border: 1px solid #ff6b00;">
        <div style="text-align: center; padding-bottom: 16px; border-bottom: 1px solid #333333;">
          <h2 style="color: #ff6b00; margin: 0; font-size: 24px; font-weight: 900;">🚨 NEW ORDER RECEIVED!</h2>
          <p style="color: #aaaaaa; font-size: 12px; margin-top: 4px;">${senderName} — Instant Admin Notification</p>
        </div>

        <div style="background: #1a1511; border-radius: 12px; padding: 16px; margin: 16px 0; border: 1px solid #333333;">
          <p style="margin: 6px 0; font-size: 14px;">👤 <strong>Customer Name:</strong> <span style="color: #ff6b00; font-weight: bold;">${order.customerName}</span></p>
          <p style="margin: 6px 0; font-size: 14px;">📱 <strong>Phone Number:</strong> <a href="tel:${order.phone}" style="color: #ff6b00; font-weight: bold;">${order.phone}</a></p>
          <p style="margin: 6px 0; font-size: 14px;">📍 <strong>Delivery Address:</strong> ${order.address}</p>
          <p style="margin: 6px 0; font-size: 14px;">💳 <strong>Payment Method:</strong> ${order.paymentMethod}</p>
        </div>

        <h3 style="color: #ffffff; border-bottom: 1px solid #333333; padding-bottom: 8px; margin-top: 20px;">🛒 Ordered Items</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
          <thead>
            <tr style="background: #221c17; color: #aaaaaa; text-align: left; font-size: 12px;">
              <th style="padding: 10px;">ITEM</th>
              <th style="padding: 10px; text-align: center;">QTY</th>
              <th style="padding: 10px; text-align: right;">PRICE</th>
            </tr>
          </thead>
          <tbody>
            ${itemsListHtml}
          </tbody>
        </table>

        <div style="background: #1a1511; padding: 16px; border-radius: 12px; font-size: 14px; border: 1px solid #333333;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px; color: #ccc;">
            <span>Subtotal:</span> <span>₹${(order.subtotal || 0).toFixed(0)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px; color: #ccc;">
            <span>GST (5%):</span> <span>₹${(order.gst || 0).toFixed(0)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px; color: #ccc;">
            <span>Delivery Fee:</span> <span>₹${(order.deliveryCharge || 0).toFixed(0)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; border-top: 1px solid #333333; padding-top: 8px; font-weight: bold; font-size: 18px; color: #10b981;">
            <span>GRAND TOTAL:</span> <span>₹${(order.grandTotal || 0).toFixed(0)}</span>
          </div>
        </div>
      </div>
    `;

    if (smtpPass) {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: { user: smtpUser, pass: smtpPass },
      });

      await transporter.sendMail({
        from: `"${senderName}" <${smtpUser}>`,
        to: adminEmail,
        subject: `🚨 NEW ORDER — ${order.customerName} (₹${(order.grandTotal || 0).toFixed(0)})`,
        html: emailHtml,
      });
      console.log(`[Admin Order Email] Notification sent to ${adminEmail}`);
    }
  } catch (error) {
    console.error("Error sending admin order email notification:", error);
  }
}

export async function sendOrderStatusUpdateEmail({
  orderId,
  customerName,
  phone,
  status,
  total,
}: {
  orderId: string;
  customerName: string;
  phone: string;
  status: string;
  total: number;
}) {
  try {
    const config = getEmailConfig();
    const adminEmail = config.adminEmail || "nakirraakadda2026@gmail.com";
    const smtpHost = config.smtpHost || "smtp.gmail.com";
    const smtpPort = Number(config.smtpPort) || 587;
    const smtpUser = config.smtpUser || "nakirraakadda2026@gmail.com";
    const smtpPass = config.smtpPass || "";
    const senderName = config.senderName || "NA KIRRAAK ADDA";

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; background-color: #0d0a08; padding: 24px; border-radius: 16px; color: #ffffff; max-width: 500px; margin: 0 auto; border: 1px solid #ff6b00;">
        <h3 style="color: #ff6b00; margin-top: 0;">📦 ORDER STATUS UPDATE</h3>
        <p style="font-size: 14px; color: #dddddd;">
          Order ID: <strong>${orderId}</strong><br/>
          Customer: <strong>${customerName}</strong> (📞 ${phone})<br/>
          Order Total: <strong>₹${total}</strong>
        </p>
        <div style="background: #19140f; padding: 14px; border-radius: 10px; border: 1px solid #ff6b00; font-size: 16px; font-weight: bold; text-align: center; color: #10b981; margin: 16px 0;">
          New Status: ${status}
        </div>
        <p style="font-size: 12px; color: #888888;">Updated from ${senderName} Admin Control Panel.</p>
      </div>
    `;

    if (smtpPass) {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: { user: smtpUser, pass: smtpPass },
      });

      await transporter.sendMail({
        from: `"${senderName}" <${smtpUser}>`,
        to: adminEmail,
        subject: `🔔 ORDER UPDATE: ${orderId} is now "${status}"`,
        html: emailHtml,
      });
      console.log(`[Status Update Email] Alert sent to ${adminEmail}`);
    }
  } catch (error) {
    console.error("Error sending status update email:", error);
  }
}

export async function sendPasswordResetOtpEmail({
  email,
  otpCode,
}: {
  email: string;
  otpCode: string;
}) {
  try {
    const config = getEmailConfig();
    const smtpHost = config.smtpHost || "smtp.gmail.com";
    const smtpPort = Number(config.smtpPort) || 587;
    const smtpUser = config.smtpUser || "nakirraakadda2026@gmail.com";
    const smtpPass = config.smtpPass || "";
    const senderName = config.senderName || "NA KIRRAAK ADDA";

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; background-color: #0d0a08; padding: 24px; border-radius: 16px; color: #ffffff; max-width: 500px; margin: 0 auto; border: 1px solid #ff6b00;">
        <h2 style="color: #ff6b00; margin-top: 0; text-align: center;">🔐 Password Reset Verification Code</h2>
        <p style="font-size: 14px; color: #dddddd;">You requested a password reset for your ${senderName} account.</p>
        <div style="background: #19140f; padding: 18px; border-radius: 12px; border: 1px border #ff6b00; font-size: 28px; font-weight: 900; letter-spacing: 6px; text-align: center; color: #ff6b00; margin: 20px 0;">
          ${otpCode}
        </div>
        <p style="font-size: 12px; color: #aaaaaa;">This verification OTP code is valid for 10 minutes. If you did not request this, please ignore this email.</p>
      </div>
    `;

    if (smtpPass) {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: { user: smtpUser, pass: smtpPass },
      });

      await transporter.sendMail({
        from: `"${senderName}" <${smtpUser}>`,
        to: email,
        subject: `🔐 Your Password Reset Verification Code: ${otpCode}`,
        html: emailHtml,
      });
      console.log(`[OTP Reset Email] Sent code to ${email}`);
    }
  } catch (error) {
    console.error("Error sending password reset OTP email:", error);
  }
}

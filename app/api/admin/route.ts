import {
  verifyAdminLogin,
  verifyAdminToken,
  getAllOrders,
  getOrder,
  updateOrderStatus,
  assignOrderStaff,
  getPaytmConfig,
  updatePaytmConfig,
  getEmployees,
  createEmployee,
  deleteEmployee,
  getRoles,
  addRole,
  updateRolePermissions,
  deleteRole,
  getEmailConfig,
  saveEmailConfig,
} from "@/lib/admin-db";
import { sendOrderStatusUpdateEmail } from "@/lib/email-service";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, email, username, identifier, password, token, orderId, status, staffName, paytmData, employeeData, employeeId, roleData, roleId, emailData } = body;

    if (action === "login") {
      const loginId = identifier || username || email || "";
      const result = verifyAdminLogin(loginId, password);
      if (!result) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      }
      return NextResponse.json({ token: result.token, admin: result.admin });
    }

    if (action === "verify") {
      const admin = verifyAdminToken(token);
      if (!admin) {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
      }
      return NextResponse.json({ admin });
    }

    if (action === "getOrders") {
      const admin = verifyAdminToken(token);
      if (!admin) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      return NextResponse.json(getAllOrders());
    }

    if (action === "updateOrderStatus") {
      const admin = verifyAdminToken(token);
      if (!admin) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      updateOrderStatus(orderId, status);
      const updatedOrder = getOrder(orderId);
      if (updatedOrder) {
        sendOrderStatusUpdateEmail({
          orderId,
          customerName: updatedOrder.customerName,
          phone: updatedOrder.phone,
          status,
          total: updatedOrder.total,
        }).catch(() => {});
      }
      return NextResponse.json({ success: true });
    }

    if (action === "assignStaff") {
      const admin = verifyAdminToken(token);
      if (!admin) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      assignOrderStaff(orderId, staffName);
      return NextResponse.json({ success: true, orders: getAllOrders() });
    }

    // Email Server Settings actions
    if (action === "getEmailConfig") {
      return NextResponse.json(getEmailConfig());
    }

    if (action === "saveEmailConfig") {
      const admin = verifyAdminToken(token);
      if (!admin) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const updated = saveEmailConfig(emailData);
      return NextResponse.json({ success: true, config: updated });
    }

    // Paytm Business Config actions
    if (action === "getPaytmConfig") {
      return NextResponse.json(getPaytmConfig());
    }

    if (action === "savePaytmConfig") {
      const admin = verifyAdminToken(token);
      if (!admin) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const updated = updatePaytmConfig(paytmData);
      return NextResponse.json({ success: true, config: updated });
    }

    // Employee Staff Management actions
    if (action === "getEmployees") {
      return NextResponse.json(getEmployees());
    }

    if (action === "createEmployee") {
      const admin = verifyAdminToken(token);
      if (!admin) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const employees = createEmployee(employeeData);
      return NextResponse.json({ success: true, employees });
    }

    if (action === "deleteEmployee") {
      const admin = verifyAdminToken(token);
      if (!admin) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      deleteEmployee(employeeId);
      return NextResponse.json({ success: true, employees: getEmployees() });
    }

    // Role & Permission Management actions
    if (action === "getRoles") {
      return NextResponse.json(getRoles());
    }

    if (action === "addRole") {
      const admin = verifyAdminToken(token);
      if (!admin) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const roles = addRole(roleData);
      return NextResponse.json({ success: true, roles });
    }

    if (action === "updateRole") {
      const admin = verifyAdminToken(token);
      if (!admin) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const roles = updateRolePermissions(roleId, roleData);
      return NextResponse.json({ success: true, roles });
    }

    if (action === "deleteRole") {
      const admin = verifyAdminToken(token);
      if (!admin) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      deleteRole(roleId);
      return NextResponse.json({ success: true, roles: getRoles() });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Admin API Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

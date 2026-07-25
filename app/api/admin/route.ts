import { verifyAdminLogin, verifyAdminToken, getAllOrders, getOrder, updateOrderStatus } from '@/lib/admin-db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { action, email, password, token, orderId, status } = await request.json();

    if (action === 'login') {
      const result = verifyAdminLogin(email, password);
      if (!result) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      }
      return NextResponse.json({ token: result.token, admin: result.admin });
    }

    if (action === 'verify') {
      const admin = verifyAdminToken(token);
      if (!admin) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
      }
      return NextResponse.json({ admin });
    }

    if (action === 'getOrders') {
      const admin = verifyAdminToken(token);
      if (!admin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      return NextResponse.json(getAllOrders());
    }

    if (action === 'updateOrderStatus') {
      const admin = verifyAdminToken(token);
      if (!admin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      updateOrderStatus(orderId, status);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

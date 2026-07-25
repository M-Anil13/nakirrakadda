"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string | null;
}

interface Order {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  total: number;
  status: string;
  createdAt: number;
  updatedAt: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [activeTab, setActiveTab] = useState<"products" | "orders">("products");
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "Pizza",
    image: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem("adminToken");
    if (!savedToken) {
      router.push("/admin/login");
      return;
    }
    setToken(savedToken);
    loadProducts();
    loadOrders();
  }, [router]);

  const loadProducts = async () => {
    try {
      const response = await fetch("/api/products");
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Error loading products:", error);
    }
  };

  const loadOrders = async () => {
    const savedToken = localStorage.getItem("adminToken");
    if (!savedToken) return;

    try {
      const response = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "getOrders", token: savedToken }),
      });
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error("Error loading orders:", error);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const method = editingId ? "PUT" : "POST";
      const body = editingId
        ? { id: editingId, ...formData, price: parseFloat(formData.price) }
        : { ...formData, price: parseFloat(formData.price) };

      const response = await fetch("/api/products", {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        setFormData({
          name: "",
          description: "",
          price: "",
          category: "Pizza",
          image: "",
        });
        setEditingId(null);
        loadProducts();
      }
    } catch (error) {
      console.error("Error saving product:", error);
    }
    setLoading(false);
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      await fetch(`/api/products?id=${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      loadProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const handleEditProduct = (product: Product) => {
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      image: product.image || "",
    });
    setEditingId(product.id);
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    const savedToken = localStorage.getItem("adminToken");
    if (!savedToken) return;

    try {
      await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "updateOrderStatus",
          token: savedToken,
          orderId,
          status,
        }),
      });
      loadOrders();
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminName");
    router.push("/admin/login");
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/40 p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold">NA KIRRAAK ADDA - Admin</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-full border border-orange-500/40 text-orange-300 hover:bg-orange-500/10"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-4 mb-6 border-b border-white/10">
          <button
            onClick={() => setActiveTab("products")}
            className={`px-4 py-3 font-semibold border-b-2 transition ${
              activeTab === "products"
                ? "border-orange-500 text-orange-400"
                : "border-transparent text-zinc-400 hover:text-white"
            }`}
          >
            Products Management
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-4 py-3 font-semibold border-b-2 transition ${
              activeTab === "orders"
                ? "border-orange-500 text-orange-400"
                : "border-transparent text-zinc-400 hover:text-white"
            }`}
          >
            Order Management
          </button>
        </div>

        {/* Products Tab */}
        {activeTab === "products" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Product Form */}
            <div className="rounded-[2rem] border border-orange-500/20 bg-zinc-950/90 p-6">
              <h2 className="text-xl font-bold mb-4">
                {editingId ? "Edit Product" : "Add New Product"}
              </h2>
              <form onSubmit={handleAddProduct} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-zinc-300 mb-2">
                    Product Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full rounded-xl border border-white/10 bg-black/60 px-3 py-2 text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-zinc-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full rounded-xl border border-white/10 bg-black/60 px-3 py-2 text-white min-h-24"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-zinc-300 mb-2">
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    className="w-full rounded-xl border border-white/10 bg-black/60 px-3 py-2 text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-zinc-300 mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full rounded-xl border border-white/10 bg-black/60 px-3 py-2 text-white"
                  >
                    <option>Pizza</option>
                    <option>Burger</option>
                    <option>Sandwich</option>
                    <option>Hot Beverages</option>
                    <option>Cold Beverages</option>
                    <option>Snacks & Fast Food</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-zinc-300 mb-2">
                    Image URL
                  </label>
                  <input
                    type="text"
                    value={formData.image}
                    onChange={(e) =>
                      setFormData({ ...formData, image: e.target.value })
                    }
                    className="w-full rounded-xl border border-white/10 bg-black/60 px-3 py-2 text-white"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 rounded-full bg-orange-500 px-4 py-2 font-semibold text-black hover:bg-orange-400 disabled:opacity-50"
                  >
                    {loading ? "Saving..." : "Save Product"}
                  </button>
                  {editingId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(null);
                        setFormData({
                          name: "",
                          description: "",
                          price: "",
                          category: "Pizza",
                          image: "",
                        });
                      }}
                      className="flex-1 rounded-full border border-orange-500/40 px-4 py-2 font-semibold text-orange-300 hover:bg-orange-500/10"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Products List */}
            <div className="lg:col-span-2 space-y-3">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="rounded-xl border border-white/10 bg-black/60 p-4"
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">{product.name}</h3>
                      <p className="text-sm text-zinc-400">{product.description}</p>
                      <div className="mt-2 flex gap-2 text-sm">
                        <span className="text-orange-400">₹{product.price}</span>
                        <span className="text-zinc-500">{product.category}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditProduct(product)}
                        className="px-3 py-1 rounded-full border border-orange-500/40 text-orange-300 hover:bg-orange-500/10 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="px-3 py-1 rounded-full border border-red-500/40 text-red-300 hover:bg-red-500/10 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Recent Orders</h2>
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="rounded-xl border border-white/10 bg-black/60 p-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-zinc-400">Customer</p>
                      <p className="font-semibold text-white">{order.customerName}</p>
                      <p className="text-sm text-zinc-500">{order.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-zinc-400">Order Details</p>
                      <p className="font-semibold text-white">Total: ₹{order.total}</p>
                      <p className="text-sm text-zinc-500">
                        Order ID: {order.id.slice(0, 12)}...
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-zinc-400">Address</p>
                      <p className="text-sm text-white">{order.address}</p>
                    </div>
                    <div>
                      <p className="text-sm text-zinc-400 mb-2">Order Status</p>
                      <select
                        value={order.status}
                        onChange={(e) =>
                          handleUpdateOrderStatus(order.id, e.target.value)
                        }
                        className="px-3 py-2 rounded-full border border-orange-500/40 bg-black/60 text-white text-sm"
                      >
                        <option>Received</option>
                        <option>Preparing</option>
                        <option>Ready for Pickup</option>
                        <option>Out for Delivery</option>
                        <option>Delivered</option>
                        <option>Cancelled</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

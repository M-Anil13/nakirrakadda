"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Address {
  id: string;
  label: string;
  lat: number;
  lng: number;
  address: string;
  isDefault: boolean;
}

export default function AddressesPage() {
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    label: "",
    address: "",
    lat: 0,
    lng: 0,
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      router.push("/auth/login");
      return;
    }
    fetchAddresses();
  }, [token, router]);

  const fetchAddresses = async () => {
    try {
      const response = await fetch("/api/addresses", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setAddresses(data);
    } catch (err) {
      console.error("Error fetching addresses:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/addresses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setFormData({ label: "", address: "", lat: 0, lng: 0 });
        setShowForm(false);
        fetchAddresses();
      }
    } catch (err) {
      console.error("Error adding address:", err);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await fetch("/api/addresses", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id, setAsDefault: true }),
      });
      fetchAddresses();
    } catch (err) {
      console.error("Error setting default:", err);
    }
  };

  if (loading) return <div className="text-center py-10 text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#050505]">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-[#1B1712] rounded-lg p-8 border border-[#FF6B00] mb-6">
          <h1 className="text-3xl font-bold text-[#FFC145] mb-6">My Addresses</h1>

          {addresses.length === 0 ? (
            <p className="text-gray-400">No addresses saved yet.</p>
          ) : (
            <div className="space-y-4 mb-6">
              {addresses.map((addr) => (
                <div key={addr.id} className="bg-[#050505] p-4 rounded border border-[#FF6B00]/50">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-[#FFC145] font-semibold">{addr.label}</h3>
                    {addr.isDefault && <span className="text-xs bg-[#FF6B00] text-white px-2 py-1 rounded">Default</span>}
                  </div>
                  <p className="text-gray-400 mb-2">{addr.address}</p>
                  <p className="text-xs text-gray-500 mb-2">
                    Lat: {addr.lat}, Lng: {addr.lng}
                  </p>
                  {!addr.isDefault && (
                    <button
                      onClick={() => handleSetDefault(addr.id)}
                      className="text-sm text-[#FFC145] hover:underline"
                    >
                      Set as Default
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          <button
            onClick={() => setShowForm(!showForm)}
            className="w-full bg-[#FF6B00] text-white py-2 rounded font-semibold hover:bg-[#FFC145] hover:text-[#050505] transition"
          >
            {showForm ? "Cancel" : "Add New Address"}
          </button>
        </div>

        {showForm && (
          <div className="bg-[#1B1712] rounded-lg p-8 border border-[#FF6B00]">
            <h2 className="text-xl font-bold text-[#FFC145] mb-4">Add Address</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Label (e.g., Home, Work, Other)"
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                className="w-full px-4 py-2 bg-[#050505] text-white border border-[#FF6B00] rounded"
                required
              />
              <input
                type="text"
                placeholder="Full Address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-2 bg-[#050505] text-white border border-[#FF6B00] rounded"
                required
              />
              <input
                type="number"
                placeholder="Latitude"
                step="0.0001"
                value={formData.lat || ""}
                onChange={(e) => setFormData({ ...formData, lat: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 bg-[#050505] text-white border border-[#FF6B00] rounded"
                required
              />
              <input
                type="number"
                placeholder="Longitude"
                step="0.0001"
                value={formData.lng || ""}
                onChange={(e) => setFormData({ ...formData, lng: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 bg-[#050505] text-white border border-[#FF6B00] rounded"
                required
              />
              <button
                type="submit"
                className="w-full bg-[#FF6B00] text-white py-2 rounded font-semibold hover:bg-[#FFC145] hover:text-[#050505] transition"
              >
                Save Address
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

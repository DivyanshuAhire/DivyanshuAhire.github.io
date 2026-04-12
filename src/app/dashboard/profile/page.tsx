"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { User, Mail, Shield, Wallet, Clock, CheckCircle, Phone, MapPin } from "lucide-react";

export default function ProfilePage() {
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newAddress, setNewAddress] = useState("");

  useEffect(() => {
    fetchProfile();
    fetchOrders();
  }, [authUser]);

  const fetchProfile = async () => {
    const res = await fetch("/api/user/profile");
    if (res.ok) {
      const data = await res.json();
      setProfile(data);
      setNewName(data.name);
      setNewPhone(data.phone || "");
      setNewAddress(data.address || "");
    }
    setLoading(false);
  };

  const fetchOrders = async () => {
    const res = await fetch("/api/orders");
    if (res.ok) setOrders(await res.json());
  };

  const handleUpdate = async () => {
    const res = await fetch("/api/user/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName, phone: newPhone, address: newAddress }),
    });
    if (res.ok) {
      toast.success("Profile updated");
      setIsEditing(false);
      fetchProfile();
    } else {
      toast.error("Failed to update profile");
    }
  };

  const refundableOrders = orders.filter(o => o.renterId?._id === authUser?.id && o.depositRefundStatus !== "Pending");
  const totalRefundable = refundableOrders.reduce((sum, o) => sum + (o.depositRefundStatus === "Available" ? o.securityDeposit : 0), 0);
  const totalLocked = orders.filter(o => o.renterId?._id === authUser?.id && o.depositRefundStatus === "Pending")
                            .reduce((sum, o) => sum + o.securityDeposit, 0);

  if (loading) return <div className="text-center py-24 text-gray-400 font-medium">Loading profile...</div>;
  if (!profile) return <div className="text-center py-24 text-red-500 font-bold">Please login to view profile.</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 p-12 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
           <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border-2 border-white/50 shadow-inner">
             <User size={48} className="text-white" />
           </div>
           <div className="text-center md:text-left">
              <h1 className="text-4xl font-black mb-2">{profile.name}</h1>
              <p className="text-indigo-100 font-medium flex items-center gap-2 justify-center md:justify-start">
                <Mail size={16} /> {profile.email}
              </p>
           </div>
        </div>
        <div className="absolute right-[-10%] top-[-20%] w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="md:col-span-1 border-gray-100 shadow-sm rounded-3xl overflow-hidden bg-white">
           <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Shield size={18} className="text-indigo-600" /> Account Details
              </CardTitle>
           </CardHeader>
           <CardContent className="pt-6 space-y-5">
              {!isEditing ? (
                 <>
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1 block">Full Name</label>
                        <p className="text-gray-900 font-bold text-lg">{profile.name}</p>
                      </div>
                      <div>
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1 block">Phone Number</label>
                        <p className="text-gray-900 font-bold text-md flex items-center gap-2">
                          <Phone size={14} className="text-indigo-600" />
                          {profile.phone || "Not set"}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1 block">House Address</label>
                        <p className="text-gray-900 font-medium text-sm leading-relaxed flex items-start gap-2">
                          <MapPin size={14} className="text-indigo-600 mt-1 shrink-0" />
                          {profile.address || "Not set"}
                        </p>
                        <p className="text-[10px] text-gray-400 font-bold mt-1">Visible to buyer after payment.</p>
                      </div>
                    </div>
                    <Button variant="outline" onClick={() => setIsEditing(true)} className="w-full rounded-xl h-12 font-bold hover:bg-gray-50 mt-4">Edit Profile</Button>
                 </>
              ) : (
                 <div className="space-y-5">
                    <div>
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1 block">Full Name</label>
                      <Input value={newName} onChange={(e) => setNewName(e.target.value)} className="h-12 rounded-xl" placeholder="Full Name" />
                    </div>
                    <div>
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1 block">Phone Number</label>
                      <Input value={newPhone} onChange={(e) => setNewPhone(e.target.value)} className="h-12 rounded-xl" placeholder="Phone Number" />
                    </div>
                    <div>
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1 block">House Address</label>
                      <textarea 
                        value={newAddress} 
                        onChange={(e) => setNewAddress(e.target.value)} 
                        className="w-full min-h-[100px] p-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="House Address (Shared after payment)"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleUpdate} className="flex-1 bg-indigo-600 rounded-xl h-11 font-bold">Save Changes</Button>
                      <Button variant="ghost" onClick={() => setIsEditing(false)} className="rounded-xl h-11 font-bold">Cancel</Button>
                    </div>
                 </div>
              )}
              <div className="h-px bg-gray-100 my-4"></div>
              <div>
                 <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1 block">Role</label>
                 <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-black border border-indigo-100 uppercase">{profile.role}</span>
              </div>
           </CardContent>
        </Card>

        <Card className="md:col-span-2 border-transparent shadow-xl rounded-3xl overflow-hidden bg-white border border-gray-100">
           <CardHeader className="bg-indigo-600 text-white pb-6 pt-8 px-8">
              <CardTitle className="text-2xl font-black flex items-center gap-3">
                <Wallet size={24} /> Financial Summary
              </CardTitle>
              <CardDescription className="text-indigo-100 font-medium opacity-90">Manage your deposits and earnings</CardDescription>
           </CardHeader>
           <CardContent className="p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                 <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 text-center sm:text-left">
                    <div className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2 justify-center sm:justify-start">
                       <Clock size={14} /> Locked in Rentals
                    </div>
                    <div className="text-3xl font-black text-gray-900">₹{totalLocked}</div>
                    <p className="text-[10px] text-gray-500 mt-2 font-bold leading-tight">These deposits are held for active or ongoing rentals.</p>
                 </div>
                 <div className="bg-green-50/50 rounded-3xl p-6 border border-green-100 text-center sm:text-left relative overflow-hidden group">
                    <div className="relative z-10">
                       <div className="text-xs font-black text-green-600 uppercase tracking-widest mb-2 flex items-center gap-2 justify-center sm:justify-start">
                          <CheckCircle size={14} /> Refundable Balance
                       </div>
                       <div className="text-3xl font-black text-green-600">₹{totalRefundable}</div>
                       <p className="text-[10px] text-green-700/70 mt-2 font-bold leading-tight">Amount available to withdraw to your bank account.</p>
                    </div>
                    <div className="absolute right-[-10%] bottom-[-10%] text-green-100 group-hover:scale-110 transition-transform">
                       <Wallet size={80} />
                    </div>
                 </div>
              </div>

              <div className="mt-8 space-y-4">
                 <h3 className="font-bold text-gray-900 flex items-center gap-2">Recent Deposit Activity</h3>
                 {refundableOrders.length === 0 ? (
                    <p className="text-sm text-gray-400 italic">No deposit history found.</p>
                 ) : (
                    <div className="space-y-3">
                       {refundableOrders.slice(0, 5).map((o: any) => (
                          <div key={o._id} className="flex justify-between items-center p-4 bg-white border border-gray-100 rounded-2xl hover:shadow-sm transition-shadow">
                             <div>
                                <div className="text-sm font-bold text-gray-900">{o.listingId?.title || "Rental Item"}</div>
                                <div className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">ID: {o._id.slice(-8)}</div>
                             </div>
                             <div className="text-right">
                                <div className="text-sm font-black text-indigo-600">₹{o.securityDeposit}</div>
                                <div className={`text-[10px] font-bold px-2 py-0.5 rounded-md inline-block ${
                                   o.depositRefundStatus === "Completed" ? "bg-green-100 text-green-700" : 
                                   o.depositRefundStatus === "Requested" ? "bg-orange-100 text-orange-700" : "bg-indigo-100 text-indigo-700"
                                }`}>
                                   {o.depositRefundStatus}
                                </div>
                             </div>
                          </div>
                       ))}
                    </div>
                 )}
              </div>
           </CardContent>
        </Card>
      </div>
    </div>
  );
}

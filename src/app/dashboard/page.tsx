"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function UnifiedDashboard() {
  const { user, loading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (user && user.role === "USER") {
      fetchOrders();
    } else if (!loading) {
      setFetching(false);
    }
  }, [user, loading]);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders");
      if (res.ok) {
        setOrders(await res.json());
      }
    } finally {
      setFetching(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, status: string) => {
    const res = await fetch(`/api/orders/${orderId}`, {
       method: "PUT",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify({ status })
    });
    if (res.ok) {
       toast.success(`Order marked as ${status}`);
       fetchOrders();
    } else {
       toast.error("Failed to update status");
    }
  };

  if (loading || fetching) return <div className="text-center py-24 font-medium text-gray-500">Loading dashboard...</div>;
  if (!user || user.role !== "USER") return <div className="text-center py-24 font-bold text-red-500">Access Denied. User account required.</div>;

  const myRentedClothes = orders.filter((o: any) => o.renterId?._id === user.id);
  const incomingRequests = orders.filter((o: any) => o.ownerId === user.id);

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-16">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-gradient-to-br from-indigo-700 to-purple-800 p-10 rounded-[2rem] text-white shadow-xl relative overflow-hidden">
         <div className="relative z-10">
           <h1 className="text-3xl md:text-5xl font-black mb-3 tracking-tight">My Dashboard</h1>
           <p className="text-indigo-100 font-medium text-lg opacity-90">Manage the clothes you are renting out and track items you've rented.</p>
         </div>
         <Link href="/dashboard/add-listing" className="relative z-10 w-full md:w-auto">
            <Button className="w-full bg-white text-indigo-700 hover:bg-gray-50 hover:shadow-lg font-black rounded-xl h-14 px-8 shadow-sm transition-all text-md border-0">
               + Add New Listing
            </Button>
         </Link>
         <div className="absolute right-0 top-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl"></div>
       </div>

       {/* SECTION: PUBLISHING HUB (Incoming Requests) */}
       <div>
          <h2 className="text-2xl font-black text-gray-900 mb-6 border-l-4 border-indigo-600 pl-4">Incoming Booking Requests (Sales)</h2>
          {incomingRequests.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm">
             <div className="text-gray-500 font-medium">No booking requests on your items yet. List more clothes!</div>
          </div>
          ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             {incomingRequests.map((order: any) => (
                <Card key={order._id} className="overflow-hidden bg-white hover:shadow-xl transition-shadow border-gray-100 shadow-sm rounded-3xl p-8 flex flex-col">
                   <div className="flex justify-between items-start mb-6">
                      <div className="max-w-[70%]">
                         <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">{order.listingId?.title || "Listing Removed"}</h3>
                         <div className="text-sm font-semibold text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg inline-block">
                            {new Date(order.startDate).toLocaleDateString()} - {new Date(order.endDate).toLocaleDateString()}
                         </div>
                      </div>
                      <div className="text-right">
                         <div className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Your Earnings</div>
                         <div className="text-3xl font-black text-green-500">₹{order.ownerEarning}</div>
                      </div>
                   </div>
                   
                   <div className="bg-gradient-to-r from-gray-50 to-white p-5 rounded-2xl mb-6 border border-gray-100 flex-grow">
                      <div className="text-sm font-bold text-gray-900 mb-2">Renter Details</div>
                      <div className="text-gray-700 font-medium mb-1">{order.renterId?.name}</div>
                      <div className="text-gray-500 text-sm mb-3">Email: {order.renterId?.email}</div>
                      <div className="inline-block bg-indigo-50 text-indigo-700 px-3 py-1 rounded-md text-xs font-bold border border-indigo-100">
                         Delivery: {order.deliveryType}
                      </div>
                   </div>

                   <div className="mt-auto">
                      <div className="flex flex-wrap gap-3 items-center justify-between bg-white pt-4 border-t border-gray-50">
                         <div className="flex gap-2">
                            <span className="px-4 py-2 bg-gray-50 text-gray-600 text-xs font-bold rounded-xl border border-gray-200">Payment: {order.paymentStatus}</span>
                            <span className="px-4 py-2 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-xl border border-indigo-100">Status: {order.status}</span>
                         </div>
                         {order.paymentStatus === "Paid" && order.status === "Accepted" && (
                            <Button onClick={() => handleUpdateStatus(order._id, 'Delivered')} className="bg-indigo-600 hover:bg-indigo-700 rounded-xl h-11 text-sm font-bold shadow-md">Mark Delivered</Button>
                         )}
                         {order.status === "Delivered" && (
                            <Button onClick={() => handleUpdateStatus(order._id, 'Returned')} className="bg-purple-600 hover:bg-purple-700 rounded-xl h-11 text-sm font-bold shadow-md">Mark Returned</Button>
                         )}
                         {order.status === "Returned" && (
                            <Button onClick={() => handleUpdateStatus(order._id, 'Completed')} className="bg-green-600 hover:bg-green-700 rounded-xl h-11 text-sm font-bold shadow-md">Complete Order</Button>
                         )}
                      </div>
                   </div>
                </Card>
             ))}
          </div>
          )}
       </div>

       {/* SECTION: RENTING HUB (Purchases) */}
       <div>
          <h2 className="text-2xl font-black text-gray-900 mb-6 border-l-4 border-purple-600 pl-4 mt-8">My Rented Clothes (Purchases)</h2>
          {myRentedClothes.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm">
             <div className="text-gray-500 font-medium">You haven't rented any clothes yet.</div>
          </div>
          ) : (
          <div className="space-y-4">
             {myRentedClothes.map((order: any) => (
                <Card key={order._id} className="overflow-hidden bg-white border border-gray-100 hover:shadow-md transition-shadow shadow-sm rounded-3xl p-6">
                   <div className="flex flex-col md:flex-row gap-6 items-center">
                     <div className="w-full md:w-32 md:h-32 bg-gray-100 rounded-2xl overflow-hidden shrink-0 flex items-center justify-center relative">
                       {order.listingId?.images?.[0] ? (
                          <img src={order.listingId.images[0]} alt="img" className="w-full h-full object-cover" />
                       ) : (
                          <div className="text-xs text-gray-400 font-medium">No Image</div>
                       )}
                     </div>
                     <div className="flex-1 w-full text-center md:text-left">
                        <h3 className="text-xl font-bold text-gray-900 mb-1">{order.listingId?.title || "Listing Removed"}</h3>
                        <p className="text-sm font-semibold text-gray-500 mb-3 bg-gray-50 inline-block px-3 py-1 rounded-md mt-1">
                           {new Date(order.startDate).toLocaleDateString()} &mdash; {new Date(order.endDate).toLocaleDateString()}
                        </p>
                        {order.listingId?.location?.address && (order.paymentStatus === "Paid" || order.totalPrice === 0) && (
                           <div className="text-xs bg-indigo-50 text-indigo-800 px-3 py-2 rounded-xl font-bold border border-indigo-100 flex items-center gap-2 mb-3 text-left">
                             📍 Pickup/Mail: {order.listingId.location.address}
                           </div>
                        )}
                        <div className="flex justify-center md:justify-start gap-3">
                           <span className="px-3 py-1.5 bg-purple-50 text-purple-700 text-xs font-bold rounded-lg border border-purple-100">Status: {order.status}</span>
                           <span className="px-3 py-1.5 bg-green-50 text-green-700 text-xs font-bold rounded-lg border border-green-100">Payment: {order.paymentStatus}</span>
                        </div>
                     </div>
                     <div className="text-center md:text-right w-full md:w-auto mt-4 md:mt-0 bg-gray-50 md:bg-transparent p-4 md:p-0 rounded-2xl">
                        <div className="text-xs text-gray-500 font-black mb-1 uppercase tracking-widest">Total Paid</div>
                        <div className="text-2xl font-black text-purple-600">₹{order.totalPrice}</div>
                     </div>
                   </div>
                </Card>
             ))}
          </div>
          )}
       </div>

    </div>
  );
}

"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useJsApiLoader, Autocomplete } from "@react-google-maps/api";

const libraries: "places"[] = ["places"];
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function AddListing() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Casual");
  const [size, setSize] = useState("M");
  const [pricePerDay, setPricePerDay] = useState("");
  const [deposit, setDeposit] = useState("");
  
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState(0);
  const [lng, setLng] = useState(0);
  const [autocompleteRef, setAutocompleteRef] = useState<google.maps.places.Autocomplete | null>(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries,
  });

  const onPlaceChanged = () => {
    if (autocompleteRef !== null) {
      const place = autocompleteRef.getPlace();
      if (place.geometry?.location) {
        setAddress(place.formatted_address || place.name || "");
        setLat(place.geometry.location.lat());
        setLng(place.geometry.location.lng());
      }
    }
  };
  
  const [images, setImages] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files));
    }
  };

  const uploadImagesToCloudinary = async () => {
    const uploadedUrls: string[] = [];
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "demo_cloud";
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "unsigned_preset";

    for (const file of images) {
       const formData = new FormData();
       formData.append("file", file);
       formData.append("upload_preset", uploadPreset);
       
       try {
         const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
           method: "POST",
           body: formData,
         });
         const data = await res.json();
         if (data.secure_url) {
           uploadedUrls.push(data.secure_url);
         }
       } catch (err) {
         console.error("Cloudinary upload failed", err);
       }
    }
    return uploadedUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setUploading(true);

    try {
      let imageUrls = await uploadImagesToCloudinary();
      if (imageUrls.length === 0 && images.length > 0) {
        toast.warning("Cloudinary upload failed (using fallback images)");
        imageUrls = ["https://images.unsplash.com/photo-1515347619362-e6168051780d", "https://images.unsplash.com/photo-1549298240-0d8e60513026"];
      }

      const payload = {
        ownerId: user.id,
        title,
        description,
        category,
        size,
        pricePerDay: Number(pricePerDay),
        deposit: Number(deposit),
        location: { address, lat, lng },
        images: imageUrls,
      };

      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
         toast.success("Listing created successfully!");
         router.push("/dashboard");
      } else {
         const errorData = await res.json();
         toast.error(errorData.error || "Failed to create listing");
      }
    } catch (err) {
      toast.error("Error creating listing");
    } finally {
      setUploading(false);
    }
  };

  if(!user) return <div className="text-center py-20 font-bold text-gray-500">Access Denied. User account required.</div>;

  return (
    <div className="max-w-3xl mx-auto">
      <Card className="border border-gray-100 shadow-xl rounded-3xl overflow-hidden">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-8 text-white relative">
           <h1 className="text-3xl font-black mb-2 relative z-10">List your Item</h1>
           <p className="text-indigo-100 relative z-10">Earn money by renting your unused designer clothes.</p>
           <div className="absolute top-0 right-0 w-48 h-48 bg-white opacity-10 rounded-full blur-2xl"></div>
        </div>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="font-semibold text-gray-700">Title</Label>
                <Input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="E.g. Designer Red Sherwani" className="h-12 bg-gray-50 border-gray-200" />
              </div>
              <div className="space-y-2">
                <Label className="font-semibold text-gray-700">Category</Label>
                <Select value={category} onValueChange={(val) => val && setCategory(val)}>
                  <SelectTrigger className="h-12 bg-gray-50 border-gray-200"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Casual">Casual</SelectItem>
                    <SelectItem value="Ethnic">Ethnic</SelectItem>
                    <SelectItem value="Formal">Formal</SelectItem>
                    <SelectItem value="Party">Party</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="font-semibold text-gray-700">Description</Label>
              <Textarea required value={description} onChange={(e) => setDescription(e.target.value)} className="min-h-32 bg-gray-50 border-gray-200" placeholder="Describe the material, condition, and any specific details..." />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="space-y-2">
                 <Label className="font-semibold text-gray-700">Size</Label>
                 <Select value={size} onValueChange={(val) => val && setSize(val)}>
                  <SelectTrigger className="h-12 bg-gray-50 border-gray-200"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="S">S</SelectItem>
                    <SelectItem value="M">M</SelectItem>
                    <SelectItem value="L">L</SelectItem>
                    <SelectItem value="XL">XL</SelectItem>
                  </SelectContent>
                 </Select>
               </div>
               <div className="space-y-2">
                 <Label className="font-semibold text-gray-700">Price per Day (₹)</Label>
                 <Input type="number" required value={pricePerDay} onChange={(e) => setPricePerDay(e.target.value)} className="h-12 bg-gray-50 border-gray-200" />
               </div>
               <div className="space-y-2">
                 <Label className="font-semibold text-gray-700">Security Deposit (₹)</Label>
                 <Input type="number" required value={deposit} onChange={(e) => setDeposit(e.target.value)} className="h-12 bg-gray-50 border-gray-200" />
               </div>
            </div>

            <div className="space-y-2">
               <Label className="font-semibold text-gray-700">Pickup Location</Label>
               {isLoaded ? (
                 <Autocomplete
                   onLoad={(ref) => setAutocompleteRef(ref)}
                   onPlaceChanged={onPlaceChanged}
                 >
                   <Input placeholder="Search for your street or city..." value={address} onChange={(e)=>setAddress(e.target.value)} required className="h-12 bg-gray-50 border-gray-200" />
                 </Autocomplete>
               ) : (
                 <Input placeholder="Loading map services..." disabled className="h-12 bg-gray-50 border-gray-200" />
               )}
            </div>

            <div className="space-y-2">
               <Label className="font-semibold text-gray-700">Images</Label>
               <Input type="file" multiple accept="image/*" onChange={handleImageChange} className="h-12 px-0 file:h-full file:mr-4 file:px-6 file:rounded-l-md file:bg-indigo-50 file:text-indigo-700 file:border-0 hover:file:bg-indigo-100 cursor-pointer bg-gray-50 border border-gray-200" />
               <p className="text-xs text-gray-400">Uses Cloudinary. Multiple images allowed.</p>
            </div>

            <Button type="submit" disabled={uploading} className="w-full h-14 text-lg bg-indigo-600 hover:bg-indigo-700 rounded-xl mt-4 shadow-lg shadow-indigo-600/20">
               {uploading ? "Publishing Listing..." : "Publish Listing"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

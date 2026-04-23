"use client";

import { useState } from "react";
import { createRoom } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { Plus, Check } from "lucide-react";

export default function AddRoomForm({ 
  hotels, 
  amenities 
}: { 
  hotels: { id: string, name: string }[],
  amenities: { id: string, name: string }[]
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const toggleAmenity = (id: string) => {
    setSelectedAmenities(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    // Convert basic fields to object
    const data: any = Object.fromEntries(formData.entries());
    // Add selected amenities array
    data.amenityIds = selectedAmenities;

    try {
      await createRoom(data);
      router.push("/dashboard/rooms");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Failed to create room. Please check your inputs.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Hotel Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Target Property</label>
          <select 
            name="hotelId" 
            required 
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
          >
            {hotels.map(h => (
              <option key={h.id} value={h.id}>{h.name}</option>
            ))}
          </select>
        </div>

        {/* Room Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Room Title / Name</label>
          <input 
            name="title" 
            type="text" 
            placeholder="e.g. Deluxe King Suite" 
            required 
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
          <select 
            name="category" 
            required 
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="STANDARD">Standard</option>
            <option value="DELUXE">Deluxe</option>
            <option value="PREMIUM">Premium</option>
            <option value="SUITE">Suite</option>
          </select>
        </div>

        {/* Stay Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Stay Classification</label>
          <select 
            name="stayType" 
            required 
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="SHORT">Short Stay (Hourly)</option>
            <option value="LONG">Long Stay (24hr+)</option>
          </select>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
        <textarea 
          name="description" 
          rows={3} 
          placeholder="Describe the room features, bed type, etc..." 
          className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
        ></textarea>
      </div>

      {/* Amenities Selection */}
      <div className="border-t border-gray-100 pt-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Room Amenities</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {amenities.map(amenity => (
            <button
              key={amenity.id}
              type="button"
              onClick={() => toggleAmenity(amenity.id)}
              className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-semibold transition-all ${
                selectedAmenities.includes(amenity.id)
                ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                : 'bg-white border-gray-200 text-gray-600 hover:border-blue-400'
              }`}
            >
              <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                selectedAmenities.includes(amenity.id) ? 'bg-white border-white' : 'bg-gray-50 border-gray-300'
              }`}>
                {selectedAmenities.includes(amenity.id) && <Check className="w-3 h-3 text-blue-600" />}
              </div>
              {amenity.name}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-100 pt-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Pricing & Inventory</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">3hr Price</label>
            <input name="price3hr" type="number" step="0.1" className="w-full p-3 border border-gray-300 rounded-xl" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">6hr Price</label>
            <input name="price6hr" type="number" step="0.1" className="w-full p-3 border border-gray-300 rounded-xl" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">12hr Price</label>
            <input name="price12hr" type="number" step="0.1" className="w-full p-3 border border-gray-300 rounded-xl" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">24hr Price</label>
            <input name="price24hr" type="number" step="0.1" required className="w-full p-3 border border-gray-300 rounded-xl" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Quantity</label>
            <input name="quantity" type="number" min="1" defaultValue="1" required className="w-full p-3 border border-gray-300 rounded-xl" />
          </div>
        </div>
      </div>

      {/* Room Media */}
      <div className="border-t border-gray-100 pt-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Room Media</h3>
        <div className="p-6 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center">
          {preview ? (
            <div className="mb-4 relative w-full max-w-xs h-48 rounded-xl overflow-hidden shadow-md">
              <img src={preview} alt="Room Preview" className="w-full h-full object-cover" />
              <button 
                type="button" 
                onClick={() => { setPreview(null); (document.getElementById('roomImage') as HTMLInputElement).value = ''; }}
                className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700 transition"
              >
                <Plus className="w-4 h-4 rotate-45" />
              </button>
            </div>
          ) : null}
          <input 
            type="file" 
            name="roomImage" 
            accept="image/*" 
            className="hidden" 
            id="roomImage"
            onChange={handleImageChange}
          />
          <label htmlFor="roomImage" className="cursor-pointer bg-blue-50 text-blue-600 px-6 py-2 rounded-lg font-bold hover:bg-blue-100 transition mb-2">
            {preview ? "Change Photo" : "Choose Photo"}
          </label>
          <p className="text-sm text-gray-500">Upload a high-quality photo of the room (e.g. .jpg, .png)</p>
        </div>
      </div>

      <div className="pt-4 flex justify-end">
        <button 
          type="submit" 
          disabled={loading}
          className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? "Creating..." : "Save Room"}
        </button>
      </div>
    </form>
  );
}

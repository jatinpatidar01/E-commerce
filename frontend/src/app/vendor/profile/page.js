"use client";

import { useEffect, useState } from "react";
import vendorService from "@/services/vendor.service";
export default function VendorProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
useEffect(() => {
  async function loadProfile() {
    try {
      const data = await vendorService.getProfile();
      setProfile(data?.vendor || data);
    } catch (error) {
      console.error("Failed to load profile:", error);
    } finally {
      setLoading(false);
    }
  }
   
  loadProfile();
}, []);
  if (loading) {
    return <div className="p-6">Loading profile...</div>;
  }

  return (
    <div className="max-w-2xl p-6 mx-auto">
      <h1 className="text-2xl font-bold">
        Vendor Profile
      </h1>

      <div className="p-6 mt-6 space-y-4 bg-white border rounded-xl">
        <div>
          <p className="text-sm text-gray-500">
            Business Name
          </p>

          <p className="mt-1 font-semibold">
            {profile?.businessName || "—"}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500">
            Vendor ID
          </p>

          <p className="mt-1">
            {profile?.id || "—"}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500">
            Created At
          </p>

          <p className="mt-1">
            {profile?.createdAt
              ? new Date(
                  profile.createdAt
                ).toLocaleDateString()
              : "—"}
          </p>
        </div>
      </div>
    </div>
  );
}

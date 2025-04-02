"use client";

import { useState } from "react";
import Image from "next/image";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useToastContext } from "@/providers/toast-provider"; // Import your custom toast

export default function SettingsPage() {
  const router = useRouter();
  const toast = useToastContext(); // Use your custom toast system

  const { data: user } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      const res = await fetch("/api/auth/user");
      if (!res.ok) throw new Error("Failed to fetch user data");
      return res.json();
    },
  });

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    currentPassword: "",
    newPassword: "",
    favouriteTopic: user?.favouriteTopic || "",
    profilePicture: null as File | null,
  });

  const [previewImage, setPreviewImage] = useState<string | null>(
    user?.profilePicture || null
  );

  const updateUser = useMutation({
    mutationFn: async (data: FormData) => {
      console.log("Form Data", data);

      try {
        const res = await fetch("/api/user/update", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        const newData = await res.json();
        if (!res.ok) {
          throw new Error(newData.message || "Failed to update profile");
        }
        return newData;
      } catch (error) {
        // toast.error(error.message);
        throw error;
      }
    },
    onSuccess: () => {
      toast.success("Profile updated successfully!");
      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, profilePicture: file }));
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    data.append("name", formData.name);
    data.append("email", formData.email);
    if (formData.currentPassword && formData.newPassword) {
      data.append("currentPassword", formData.currentPassword);
      data.append("newPassword", formData.newPassword);
    }
    data.append("favouriteTopic", formData.favouriteTopic);
    if (formData.profilePicture) {
      data.append("profilePicture", formData.profilePicture);
    }

    // console.log(data);
    updateUser.mutate(data);
  };

  return (
    <div className='mx-auto px-4 py-8 max-w-4xl'>
      <h2 className='mb-4 font-bold text-2xl'>Settings</h2>
      <form onSubmit={handleSubmit} className='space-y-6'>
        {/* Profile Picture Upload */}
        <div className='flex items-center space-x-4'>
          <div className='relative border rounded-full w-20 h-20 overflow-hidden'>
            {previewImage ? (
              <Image
                src={previewImage}
                alt='Profile'
                fill
                className='object-cover'
              />
            ) : (
              <div className='flex justify-center items-center bg-gray-100 w-full h-full text-gray-500'>
                {user?.name?.charAt(0)}
              </div>
            )}
          </div>
          <input type='file' accept='image/*' onChange={handleFileChange} />
        </div>

        {/* Name Field */}
        <div>
          <label className='block text-gray-700'>Name</label>
          <input
            type='text'
            name='name'
            value={formData.name}
            onChange={handleChange}
            className='px-3 py-2 border rounded w-full'
            required
          />
        </div>

        {/* Email Field */}
        <div>
          <label className='block text-gray-700'>Email</label>
          <input
            type='email'
            name='email'
            value={formData.email}
            onChange={handleChange}
            className='px-3 py-2 border rounded w-full'
            required
          />
        </div>

        {/* Password Fields */}
        <div className='gap-4 grid grid-cols-2'>
          <div>
            <label className='block text-gray-700'>Current Password</label>
            <input
              type='password'
              name='currentPassword'
              value={formData.currentPassword}
              onChange={handleChange}
              className='px-3 py-2 border rounded w-full'
            />
          </div>
          <div>
            <label className='block text-gray-700'>New Password</label>
            <input
              type='password'
              name='newPassword'
              value={formData.newPassword}
              onChange={handleChange}
              className='px-3 py-2 border rounded w-full'
            />
          </div>
        </div>

        {/* Favourite Topic Field */}
        <div>
          <label className='block text-gray-700'>Favourite Topic</label>
          <select
            name='favouriteTopic'
            value={formData.favouriteTopic}
            onChange={handleChange}
            className='px-3 py-2 border rounded w-full'
          >
            <option value='math'>Math</option>
            <option value='science'>Science</option>
            <option value='history'>History</option>
          </select>
        </div>

        {/* XP, Rank & Level (Read-Only) */}
        <div className='gap-4 grid grid-cols-3'>
          <div>
            <label className='block text-gray-700'>XP</label>
            <input
              type='text'
              value={user?.xp}
              className='bg-gray-100 px-3 py-2 border rounded w-full'
              disabled
            />
          </div>
          <div>
            <label className='block text-gray-700'>Rank</label>
            <input
              type='text'
              value={user?.rank}
              className='bg-gray-100 px-3 py-2 border rounded w-full'
              disabled
            />
          </div>
          <div>
            <label className='block text-gray-700'>Level</label>
            <input
              type='text'
              value={user?.level}
              className='bg-gray-100 px-3 py-2 border rounded w-full'
              disabled
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type='submit'
          className='bg-pink-500 hover:bg-pink-600 px-4 py-2 rounded text-white'
        >
          Update Profile
        </button>
      </form>
    </div>
  );
}

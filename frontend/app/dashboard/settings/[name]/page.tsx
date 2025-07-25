"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useToastContext } from "@/providers/toast-provider"; // Import your custom toast

export default function SettingsPage() {
  const toast = useToastContext(); // Use your custom toast system
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const { name } = useParams();

  const fetchUser = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/user/profile/${name}`);
      const data = await res.json();
      if (!res.ok) throw new Error("Failed to fetch user data");
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      } else {
        throw new Error("Failed to fetch user data");
      }
    }
  };

  const { data: authUser } = useQuery({
    queryKey: ["authUser"],
    queryFn: fetchUser,
  });
  const { data: user } = useQuery({
    queryKey: ["userProfile"],
    queryFn: fetchUser,
  });

  const [formData, setFormData] = useState({
    name: authUser?.name || "",
    email: authUser?.email || "",
    currentPassword: "",
    newPassword: "",
    favouriteTopic: authUser?.favouriteTopic || "",
    profilePicture: null as File | null,
  });

  // Wait for user data before rendering form
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
        favouriteTopic: user.favouriteTopic || "",
      }));
      setPreviewImage(user.profilePicture || null);
      setIsLoading(false);
    }
  }, [user]);

  const [previewImage, setPreviewImage] = useState<string | null>(
    user?.profilePicture || null
  );

  const { mutate: updateUser, isPending: isUpdatingProfile } = useMutation({
    mutationFn: async (data: FormData) => {
      console.log("Form Data", data);

      try {
        const res = await fetch("/api/user/update", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...formData,
            profilePicture: previewImage || undefined,
          }),
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
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ["authUser"] }),
        queryClient.invalidateQueries({ queryKey: ["userProfile"] }),
      ]);
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
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewImage(reader.result as string); // Set the preview image
        setFormData((prev) => ({ ...prev, profilePicture: file })); // Update profile picture in form data
      };
      reader.readAsDataURL(file);
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

    // Append profilePicture only if it's not null or undefined
    if (formData.profilePicture) {
      data.append("profilePicture", formData.profilePicture);
    } else if (previewImage) {
      data.append("profilePicture", previewImage); // assuming previewImage is a string URL
    }

    // console.log(data);
    updateUser(data);
  };

  if (isLoading) {
    return (
      <div className='mx-auto px-4 md:px-6 py-8 md:py-12 max-w-6xl container'>
        <div className='flex justify-center items-center h-64'>
          <div className='border-pink-500 border-t-2 border-b-2 rounded-full w-12 h-12 animate-spin'></div>
        </div>
      </div>
    );
  }

  return (
    <div className='mx-auto px-4 py-8 max-w-4xl'>
      <h2 className='mb-4 font-bold text-2xl'>Settings</h2>
      <form onSubmit={handleSubmit} className='space-y-6'>
        {/* Profile Picture Upload */}
        <div className='flex sm:flex-row flex-col items-center gap-4 w-full'>
          <div className='group relative shadow-md border-2 border-gray-300 rounded-full w-24 sm:w-20 h-24 sm:h-20 overflow-hidden transition-all duration-300'>
            {previewImage ? (
              <Image
                src={previewImage}
                alt='Profile'
                fill
                className='object-cover'
              />
            ) : (
              <div className='flex justify-center items-center bg-gradient-to-br from-gray-200 to-gray-100 w-full h-full font-semibold text-gray-600 text-4xl'>
                {user?.name?.charAt(0)}
              </div>
            )}

            {/* Overlay when hovering */}
            <label className='absolute inset-0 flex justify-center items-center bg-black bg-opacity-30 opacity-0 group-hover:opacity-100 backdrop-blur-sm font-medium text-white text-xs transition-opacity duration-300 cursor-pointer'>
              Change
              <input
                type='file'
                accept='image/*'
                onChange={handleFileChange}
                className='hidden'
              />
            </label>
          </div>

          {/* Styled file input with dashed border */}
          <label className='px-4 py-2 border-2 border-gray-400 hover:border-gray-600 border-dashed rounded-xl w-full sm:w-auto text-gray-600 hover:text-gray-800 text-sm transition duration-200 cursor-pointer'>
            Upload a New Photo
            <input
              type='file'
              accept='image/*'
              onChange={handleFileChange}
              className='hidden'
            />
          </label>
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
          {isUpdatingProfile ? (
            <div className='flex justify-center items-center'>
              <div className='border-amber-50 border-t-2 border-b-2 rounded-full w-5 h-5 animate-spin'></div>
            </div>
          ) : (
            "Update Profile"
          )}
        </button>
      </form>
    </div>
  );
}

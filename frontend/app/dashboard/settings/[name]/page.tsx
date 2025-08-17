"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useToastContext } from "@/providers/toast-provider"; // Import your custom toast
import {
  User,
  Camera,
  Shield,
  Award,
  Settings,
  Star,
  Sparkles,
} from "lucide-react";

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

  const getInitials = (name: string) =>
    name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);

  if (isLoading) {
    return (
      <div className='flex justify-center items-center bg-gradient-to-br from-slate-50 via-white to-pink-50/30 min-h-screen'>
        <div className='relative'>
          <div className='absolute -inset-4 bg-gradient-to-r from-pink-300 to-purple-300 opacity-20 rounded-full blur'></div>
          <div className='relative bg-white/80 shadow-xl backdrop-blur-sm p-8 border border-pink-200/50 rounded-2xl'>
            <div className='flex items-center space-x-3'>
              <div className='relative'>
                <div className='border-pink-500 border-t-4 border-r-4 rounded-full w-8 h-8 animate-spin'></div>
                <div className='absolute inset-0 border-2 border-pink-200 rounded-full'></div>
              </div>
              <span className='font-medium text-gray-700'>
                Loading settings...
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-gradient-to-br from-slate-50 via-white to-pink-50/30 min-h-screen'>
      {/* Background Pattern */}
      <div className='absolute inset-0 opacity-5 pointer-events-none'>
        <div
          className='top-0 left-0 absolute w-full h-full'
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, #ec4899 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        ></div>
      </div>

      <div className='relative mx-auto px-4 py-8 md:py-12 max-w-4xl'>
        {/* Header */}
        <div className='mb-12'>
          <div className='inline-flex items-center bg-gradient-to-r from-pink-100 to-purple-100 mb-4 px-4 py-2 border border-pink-200/50 rounded-full font-medium text-pink-600 text-sm'>
            <Settings className='mr-2 w-4 h-4' />
            Account Settings
          </div>
          <h2 className='bg-clip-text bg-gradient-to-r from-gray-900 to-gray-700 mb-2 font-bold text-transparent text-4xl md:text-5xl tracking-tight'>
            Settings
          </h2>
          <p className='text-gray-600 text-lg'>
            Manage your account information and preferences.
          </p>
        </div>

        {/* Settings Form */}
        <div className='relative'>
          <div className='absolute -inset-1 bg-gradient-to-r from-pink-300 to-purple-300 opacity-0 group-hover:opacity-25 rounded-2xl transition duration-300 blur'></div>
          <div className='relative bg-white/80 shadow-lg backdrop-blur-sm p-8 border border-pink-100/50 rounded-2xl'>
            <form onSubmit={handleSubmit} className='space-y-8'>
              {/* Profile Picture Upload */}
              <div className='space-y-4'>
                <h3 className='flex items-center font-semibold text-gray-900 text-lg'>
                  <Camera className='mr-2 w-5 h-5 text-pink-500' />
                  Profile Picture
                </h3>
                <div className='flex sm:flex-row flex-col items-center gap-6 w-full'>
                  <div className='group relative'>
                    <div className='absolute -inset-2 bg-gradient-to-r from-pink-400 to-purple-400 opacity-0 group-hover:opacity-20 rounded-full transition duration-300 blur'></div>
                    <div className='relative shadow-lg border-4 border-white rounded-full w-24 sm:w-20 h-24 sm:h-20 overflow-hidden group-hover:scale-105 transition-all duration-300'>
                      {previewImage ? (
                        <Image
                          src={previewImage}
                          alt='Profile'
                          fill
                          className='object-cover'
                        />
                      ) : (
                        <div className='flex justify-center items-center bg-gradient-to-br from-pink-100 to-purple-100 w-full h-full font-bold text-pink-600 text-2xl sm:text-4xl'>
                          {getInitials(user?.name || "")}
                        </div>
                      )}

                      {/* Overlay when hovering */}
                      <label className='absolute inset-0 flex justify-center items-center bg-black/40 opacity-0 group-hover:opacity-100 backdrop-blur-sm font-medium text-white text-xs transition-all duration-300 cursor-pointer'>
                        <Camera className='mr-1 w-4 h-4' />
                        Change
                        <input
                          type='file'
                          accept='image/*'
                          onChange={handleFileChange}
                          className='hidden'
                        />
                      </label>
                    </div>
                  </div>

                  {/* Styled file input with dashed border */}
                  <label className='group inline-flex relative justify-center items-center bg-gradient-to-r from-pink-500 hover:from-pink-600 to-purple-600 hover:to-purple-700 shadow-lg hover:shadow-xl px-6 py-3 rounded-xl w-full sm:w-auto overflow-hidden font-semibold text-white transition-all duration-300 cursor-pointer'>
                    <div className='absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transition-transform translate-x-[-100%] group-hover:translate-x-[100%] duration-700'></div>
                    <Sparkles className='mr-2 w-4 h-4' />
                    Upload New Photo
                    <input
                      type='file'
                      accept='image/*'
                      onChange={handleFileChange}
                      className='hidden'
                    />
                  </label>
                </div>
              </div>

              {/* Personal Information */}
              <div className='space-y-6'>
                <h3 className='flex items-center font-semibold text-gray-900 text-lg'>
                  <User className='mr-2 w-5 h-5 text-pink-500' />
                  Personal Information
                </h3>

                {/* Name Field */}
                <div className='space-y-2'>
                  <label className='block font-medium text-gray-700'>
                    Name
                  </label>
                  <input
                    type='text'
                    name='name'
                    value={formData.name}
                    onChange={handleChange}
                    className='bg-white/50 backdrop-blur-sm px-4 py-3 border border-pink-200/50 focus:border-pink-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/50 w-full transition-all duration-300'
                    required
                  />
                </div>

                {/* Email Field */}
                <div className='space-y-2'>
                  <label className='block font-medium text-gray-700'>
                    Email
                  </label>
                  <input
                    type='email'
                    name='email'
                    value={formData.email}
                    onChange={handleChange}
                    className='bg-white/50 backdrop-blur-sm px-4 py-3 border border-pink-200/50 focus:border-pink-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/50 w-full transition-all duration-300'
                    required
                  />
                </div>

                {/* Favourite Topic Field */}
                <div className='space-y-2'>
                  <label className='block font-medium text-gray-700'>
                    Favourite Topic
                  </label>
                  <select
                    name='favouriteTopic'
                    value={formData.favouriteTopic}
                    onChange={handleChange}
                    className='bg-white/50 backdrop-blur-sm px-4 py-3 border border-pink-200/50 focus:border-pink-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/50 w-full transition-all duration-300'
                  >
                    <option value='math'>Math</option>
                    <option value='science'>Science</option>
                    <option value='history'>History</option>
                  </select>
                </div>
              </div>

              {/* Security Settings */}
              <div className='space-y-6'>
                <h3 className='flex items-center font-semibold text-gray-900 text-lg'>
                  <Shield className='mr-2 w-5 h-5 text-pink-500' />
                  Security Settings
                </h3>

                {/* Password Fields */}
                <div className='gap-4 grid grid-cols-1 md:grid-cols-2'>
                  <div className='space-y-2'>
                    <label className='block font-medium text-gray-700'>
                      Current Password
                    </label>
                    <input
                      type='password'
                      name='currentPassword'
                      value={formData.currentPassword}
                      onChange={handleChange}
                      className='bg-white/50 backdrop-blur-sm px-4 py-3 border border-pink-200/50 focus:border-pink-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/50 w-full transition-all duration-300'
                      placeholder='Enter current password'
                    />
                  </div>
                  <div className='space-y-2'>
                    <label className='block font-medium text-gray-700'>
                      New Password
                    </label>
                    <input
                      type='password'
                      name='newPassword'
                      value={formData.newPassword}
                      onChange={handleChange}
                      className='bg-white/50 backdrop-blur-sm px-4 py-3 border border-pink-200/50 focus:border-pink-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/50 w-full transition-all duration-300'
                      placeholder='Enter new password'
                    />
                  </div>
                </div>
              </div>

              {/* Account Stats (Read-Only) */}
              <div className='space-y-6'>
                <h3 className='flex items-center font-semibold text-gray-900 text-lg'>
                  <Award className='mr-2 w-5 h-5 text-pink-500' />
                  Account Statistics
                </h3>

                {/* XP, Rank & Level (Read-Only) */}
                <div className='gap-4 grid grid-cols-1 md:grid-cols-3'>
                  <div className='group relative'>
                    <div className='absolute -inset-1 bg-gradient-to-r from-blue-300 to-blue-400 opacity-0 group-hover:opacity-20 rounded-xl transition duration-300 blur'></div>
                    <div className='relative space-y-2'>
                      <label className='block font-medium text-gray-700'>
                        XP
                      </label>
                      <div className='flex items-center bg-gradient-to-r from-blue-50 to-blue-100 px-4 py-3 border border-blue-200/50 rounded-xl'>
                        <Star className='mr-2 w-5 h-5 text-blue-500' />
                        <span className='font-bold text-blue-700'>
                          {user?.xp}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className='group relative'>
                    <div className='absolute -inset-1 bg-gradient-to-r from-amber-300 to-amber-400 opacity-0 group-hover:opacity-20 rounded-xl transition duration-300 blur'></div>
                    <div className='relative space-y-2'>
                      <label className='block font-medium text-gray-700'>
                        Rank
                      </label>
                      <div className='flex items-center bg-gradient-to-r from-amber-50 to-amber-100 px-4 py-3 border border-amber-200/50 rounded-xl'>
                        <Award className='mr-2 w-5 h-5 text-amber-500' />
                        <span className='font-bold text-amber-700'>
                          {user?.rank}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className='group relative'>
                    <div className='absolute -inset-1 bg-gradient-to-r from-purple-300 to-purple-400 opacity-0 group-hover:opacity-20 rounded-xl transition duration-300 blur'></div>
                    <div className='relative space-y-2'>
                      <label className='block font-medium text-gray-700'>
                        Level
                      </label>
                      <div className='flex items-center bg-gradient-to-r from-purple-50 to-purple-100 px-4 py-3 border border-purple-200/50 rounded-xl'>
                        <Sparkles className='mr-2 w-5 h-5 text-purple-500' />
                        <span className='font-bold text-purple-700'>
                          {user?.level}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className='flex justify-end pt-6'>
                <button
                  type='submit'
                  disabled={isUpdatingProfile}
                  className='group inline-flex relative justify-center items-center bg-gradient-to-r from-pink-500 hover:from-pink-600 disabled:from-gray-400 to-purple-600 hover:to-purple-700 disabled:to-gray-500 shadow-lg hover:shadow-xl px-8 py-4 rounded-xl overflow-hidden font-semibold text-white transition-all duration-300 disabled:cursor-not-allowed'
                >
                  <div className='absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transition-transform translate-x-[-100%] group-hover:translate-x-[100%] duration-700'></div>
                  {isUpdatingProfile ? (
                    <div className='flex items-center'>
                      <div className='relative mr-3'>
                        <div className='border-white border-t-2 border-r-2 rounded-full w-5 h-5 animate-spin'></div>
                        <div className='absolute inset-0 border-2 border-white/30 rounded-full'></div>
                      </div>
                      Updating Profile...
                    </div>
                  ) : (
                    <>
                      <Settings className='mr-2 w-4 h-4' />
                      Update Profile
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

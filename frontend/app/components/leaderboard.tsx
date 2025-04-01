import { Award, Trophy, Medal } from "lucide-react";
import Image from "next/image";

// This would normally come from your MongoDB database
const leaderboardData = [
  {
    id: 1,
    name: "Alex Johnson",
    level: 12,
    xp: 3450,
    profilePicture: "/images/placeholder.png?height=40&width=40",
  },
  {
    id: 2,
    name: "Sarah Williams",
    level: 10,
    xp: 2980,
    profilePicture: "/images/placeholder.png?height=40&width=40",
  },
  {
    id: 3,
    name: "Michael Brown",
    level: 9,
    xp: 2750,
    profilePicture: "/images/placeholder.png?height=40&width=40",
  },
  {
    id: 4,
    name: "Emily Davis",
    level: 8,
    xp: 2400,
    profilePicture: "/images/placeholder.png?height=40&width=40",
  },
  {
    id: 5,
    name: "David Miller",
    level: 7,
    xp: 2100,
    profilePicture: "/images/placeholder.png?height=40&width=40",
  },
];

export default function Leaderboard() {
  return (
    <div className='bg-white rounded-lg'>
      <div className='p-4 border-pink-100 border-b'>
        <h3 className='flex items-center font-semibold'>
          <Trophy className='mr-2 w-5 h-5 text-pink-500' />
          Top Kwiklys
        </h3>
      </div>
      <div className='p-4'>
        <div className='space-y-4'>
          {leaderboardData.map((user, index) => (
            <div key={user.id} className='flex justify-between items-center'>
              <div className='flex items-center gap-3'>
                <div className='flex justify-center items-center bg-pink-100 rounded-full w-8 h-8 text-pink-500'>
                  {index === 0 ? (
                    <Trophy className='w-4 h-4' />
                  ) : index === 1 ? (
                    <Medal className='w-4 h-4' />
                  ) : index === 2 ? (
                    <Award className='w-4 h-4' />
                  ) : (
                    <span className='font-bold text-sm'>{index + 1}</span>
                  )}
                </div>
                <div className='flex items-center gap-2'>
                  <div className='relative rounded-full w-8 h-8 overflow-hidden'>
                    <Image
                      src={user.profilePicture || "/placeholder.svg"}
                      alt={user.name}
                      fill
                      className='object-cover'
                    />
                  </div>
                  <span className='font-medium'>{user.name}</span>
                </div>
              </div>
              <div className='flex items-center gap-2'>
                <div className='flex items-center text-pink-500'>
                  <Award className='mr-1 w-4 h-4' />
                  <span className='font-medium'>Lvl {user.level}</span>
                </div>
                <span className='text-gray-500 text-sm'>{user.xp} XP</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import { GripVertical } from "lucide-react";

export default function DragIndicator() {
  return (
    <div className='flex flex-col justify-center items-center hover:bg-gray-100 active:bg-gray-200 -m-2 p-2 rounded-md'>
      <GripVertical className='w-6 h-6 text-gray-400' />
      {/* <span className='mt-1 text-gray-400 text-xs'>Drag</span> */}
    </div>
  );
}

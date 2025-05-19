import { StatsTabsProps } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FaUsers, FaBookOpen, FaCalendarAlt } from "react-icons/fa";



export function StatsTabs({ totalStudents, totalClasses, attendanceToday }: StatsTabsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Total Students Card */}
      <Card className="border-none !p-4 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center pb-2 gap-3">
          <div className="w-9 h-9 rounded-md bg-emerald-500 flex items-center justify-center">
            <FaUsers className="w-5 h-5 text-white" />
          </div>
          <CardTitle className="text-sm font-medium text-gray-500">
            Total Students
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalStudents}</div>
        </CardContent>
      </Card>

      {/* Start Classes Card */}
      <Card className="border-none !p-4 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center pb-2 gap-3">
          <div className="w-9 h-9 rounded-md bg-emerald-500 flex items-center justify-center">
            <FaBookOpen className="w-5 h-5 text-white" />
          </div>
          <CardTitle className="text-sm font-medium text-gray-500">
            Total Classes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalClasses}</div>
        </CardContent>
      </Card>

      {/* Attendance Today Card */}
      <Card className="border-none !p-4 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center pb-2 gap-3">
          <div className="w-9 h-9 rounded-md bg-emerald-500 flex items-center justify-center">
            <FaCalendarAlt className="w-5 h-5 text-white" />
          </div>
          <CardTitle className="text-sm font-medium text-gray-500">
            Attendance Today
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{attendanceToday}</div>
        </CardContent>
      </Card>
    </div>
  );
}
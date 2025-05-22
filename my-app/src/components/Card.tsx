import type React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface DashboardCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  value: string | number
  icon?: React.ReactNode
}

const DashboardCard = ({ title, value, icon, className, ...props }: DashboardCardProps) => {
  return (
    <Card className={cn("overflow-hidden border rounded-lg shadow-sm w-[30%] h-[7rem] bg-[#fff]", className)} {...props}>
      <CardContent className="px-6">
        <div className="flex items-start">
          {icon && (
            <div className="mr-3 flex h-8 w-8 rounded-lg items-center justify-center bg-[#258094] text-white">{icon}</div>
          )}
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
          </div>
        </div>
        <h3 className="mt-[1px] text-3xl font-bold">{value}</h3>
      </CardContent>
    </Card>
  )
}


export default DashboardCard;
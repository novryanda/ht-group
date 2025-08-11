import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";

const recentActivities = [
  {
    id: 1,
    user: "Ahmad Rizki",
    action: "Menyelesaikan WO-2024-001",
    time: "2 menit yang lalu",
    avatar: "/avatars/01.png",
  },
  {
    id: 2,
    user: "Siti Nurhaliza",
    action: "Membuat invoice INV-2024-045",
    time: "15 menit yang lalu",
    avatar: "/avatars/02.png",
  },
  {
    id: 3,
    user: "Budi Santoso",
    action: "Approve payroll run Januari 2024",
    time: "1 jam yang lalu",
    avatar: "/avatars/03.png",
  },
  {
    id: 4,
    user: "Maya Sari",
    action: "Update progress Job JOB-2024-012",
    time: "2 jam yang lalu",
    avatar: "/avatars/04.png",
  },
  {
    id: 5,
    user: "Dedi Kurniawan",
    action: "Posting journal entry JE-2024-089",
    time: "3 jam yang lalu",
    avatar: "/avatars/05.png",
  },
];

export function RecentActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Aktivitas Terbaru</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {recentActivities.map((activity) => (
            <div key={activity.id} className="flex items-center">
              <Avatar className="h-9 w-9">
                <AvatarImage src={activity.avatar} alt="Avatar" />
                <AvatarFallback>
                  {activity.user
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="ml-4 space-y-1">
                <p className="text-sm font-medium leading-none">
                  {activity.user}
                </p>
                <p className="text-sm text-muted-foreground">
                  {activity.action}
                </p>
                <p className="text-xs text-muted-foreground">
                  {activity.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

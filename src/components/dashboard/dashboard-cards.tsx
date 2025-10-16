import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Progress } from "~/components/ui/progress";
import { Badge } from "~/components/ui/badge";
import {
  Wrench,
  Briefcase,
  Users,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  Building2
} from "lucide-react";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export function DashboardCards() {
  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Work Orders Aktif
          </CardTitle>
          <Wrench className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">67</div>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary" className="text-xs">
              <CheckCircle className="h-3 w-3 mr-1" />
              45 Completed
            </Badge>
            <Badge variant="outline" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              14 Pending
            </Badge>
            <Badge variant="destructive" className="text-xs">
              <AlertTriangle className="h-3 w-3 mr-1" />
              8 Overdue
            </Badge>
          </div>
          <div className="flex items-center gap-1 mt-2">
            <TrendingUp className="h-3 w-3 text-green-500" />
            <p className="text-xs text-muted-foreground">
              +12% dari bulan lalu
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Projects Berjalan
          </CardTitle>
          <Briefcase className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">23</div>
          <div className="mt-2 space-y-1">
            <div className="flex justify-between text-xs">
              <span>Progress rata-rata</span>
              <span>68%</span>
            </div>
            <Progress value={68} className="h-2" />
          </div>
          <div className="flex items-center gap-1 mt-2">
            <TrendingUp className="h-3 w-3 text-green-500" />
            <p className="text-xs text-muted-foreground">
              +5% dari bulan lalu
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Karyawan</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">156</div>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center gap-1">
              <Building2 className="h-3 w-3 text-blue-500" />
              <span className="text-xs">PT NILO: 68</span>
            </div>
            <div className="flex items-center gap-1">
              <Building2 className="h-3 w-3 text-green-500" />
              <span className="text-xs">PT ZTA: 35</span>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center gap-1">
              <Building2 className="h-3 w-3 text-yellow-500" />
              <span className="text-xs">PT TAM: 28</span>
            </div>
            <div className="flex items-center gap-1">
              <Building2 className="h-3 w-3 text-purple-500" />
              <span className="text-xs">PT HTK: 25</span>
            </div>
          </div>
          <div className="flex items-center gap-1 mt-2">
            <TrendingUp className="h-3 w-3 text-green-500" />
            <p className="text-xs text-muted-foreground">
              +2 karyawan baru bulan ini
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Revenue Bulan Ini
          </CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(3200000000)}</div>
          <div className="mt-2 space-y-1">
            <div className="flex justify-between text-xs">
              <span>Target: {formatCurrency(2800000000)}</span>
              <span className="text-green-600 font-medium">114%</span>
            </div>
            <Progress value={114} className="h-2" />
          </div>
          <div className="flex items-center gap-1 mt-2">
            <TrendingUp className="h-3 w-3 text-green-500" />
            <p className="text-xs text-muted-foreground">
              +18% dari bulan lalu
            </p>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

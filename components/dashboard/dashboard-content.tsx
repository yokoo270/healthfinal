@@ .. @@
import { LogOut, User, Activity, Target, TrendingUp, MessageCircle, Bot, BarChart3, Home, Flame, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { QuickLogModal } from "@/components/tracking/quick-log-modal"
-import { UsageIndicator } from "@/components/subscription/usage-indicator"
import { ExportModal } from "@/components/data-export/export-modal"

export function DashboardContent() {
@@ .. @@
      <main className="container mx-auto px-4 py-8">
-        <div className="mb-8">
-          <UsageIndicator />
-        </div>
-
        {/* AI Coach Section */}
        <div className="mb-8">
@@ .. @@
              <Link href="/analytics">
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Analytics
                </Button>
              </Link>
-              <Link href="/subscription">
-                <Button variant="outline" className="w-full justify-start bg-transparent">
-                  <TrendingUp className="w-4 h-4 mr-2" />
-                  Upgrade Plan
-                </Button>
-              </Link>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Activity className="w-4 h-4 mr-2" />
                Start AI Workout
              </Button>
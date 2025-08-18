@@ .. @@
export type SubscriptionPlan = "free" | "basic" | "premium" | "pro"

-interface PlanLimits {
-  aiMessagesPerDay: number
-  workoutGenerationsPerMonth: number
-  nutritionPlansPerMonth: number
-  analyticsAccess: boolean
-  prioritySupport: boolean
-  customMealPlans: boolean
-  apiAccess: boolean
-  exportData: boolean
-}
-
interface Subscription {
  plan: SubscriptionPlan
  status: "active" | "cancelled" | "expired"
  startDate: string
  endDate?: string
-  limits: PlanLimits
+  paypalSubscriptionId?: string
}

interface WorkoutEntry {
@@ .. @@
  date: string
  weight?: number // kg
}

-interface UsageStats {
-  aiMessagesToday: number
-  workoutGenerationsThisMonth: number
-  nutritionPlansThisMonth: number
-  lastResetDate: string
-}
-
interface User {
@@ .. @@
  currentStreak?: number
  longestStreak?: number
  subscription?: Subscription
-  usageStats?: UsageStats
}

interface AuthContextType {
@@ .. @@
  getTodayStats: () => DailyStats | null
  getWeekStats: () => { workouts: number; calories: number; goalsAchieved: number }
-  upgradePlan: (plan: SubscriptionPlan) => Promise<boolean>
-  canUseFeature: (feature: keyof PlanLimits) => boolean
-  getRemainingUsage: () => { aiMessages: number; workoutGenerations: number; nutritionPlans: number }
-  incrementUsage: (type: "aiMessage" | "workoutGeneration" | "nutritionPlan") => void
}

-const PLAN_CONFIGS: Record<SubscriptionPlan, PlanLimits> = {
-  free: {
-    aiMessagesPerDay: 5,
-    workoutGenerationsPerMonth: 2,
-    nutritionPlansPerMonth: 1,
-    analyticsAccess: false,
-    prioritySupport: false,
-    customMealPlans: false,
-    apiAccess: false,
-    exportData: false,
-  },
-  basic: {
-    aiMessagesPerDay: 50,
-    workoutGenerationsPerMonth: 10,
-    nutritionPlansPerMonth: 5,
-    analyticsAccess: true,
-    prioritySupport: false,
-    customMealPlans: false,
-    apiAccess: false,
-    exportData: true,
-  },
-  premium: {
-    aiMessagesPerDay: 200,
-    workoutGenerationsPerMonth: 50,
-    nutritionPlansPerMonth: 20,
-    analyticsAccess: true,
-    prioritySupport: true,
-    customMealPlans: true,
-    apiAccess: false,
-    exportData: true,
-  },
-  pro: {
-    aiMessagesPerDay: -1, // unlimited
-    workoutGenerationsPerMonth: -1, // unlimited
-    nutritionPlansPerMonth: -1, // unlimited
-    analyticsAccess: true,
-    prioritySupport: true,
-    customMealPlans: true,
-    apiAccess: true,
-    exportData: true,
-  },
-}
-
const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
@@ .. @@
  const createDefaultSubscription = (): Subscription => ({
    plan: "free",
    status: "active",
    startDate: new Date().toISOString(),
-    limits: PLAN_CONFIGS.free,
  })

-  const createDefaultUsageStats = (): UsageStats => ({
-    aiMessagesToday: 0,
-    workoutGenerationsThisMonth: 0,
-    nutritionPlansThisMonth: 0,
-    lastResetDate: new Date().toISOString(),
-  })
-
  const login = async (email: string, password: string): Promise<boolean> => {
@@ .. @@
          currentStreak: 0,
          longestStreak: 0,
          subscription: createDefaultSubscription(),
-          usageStats: createDefaultUsageStats(),
        }
        localStorage.setItem("isAuthenticated", "true")
@@ .. @@
          currentStreak: 0,
          longestStreak: 0,
          subscription: createDefaultSubscription(),
-          usageStats: createDefaultUsageStats(),
        }
        localStorage.setItem("isAuthenticated", "true")
@@ .. @@
    }
  }

-  const upgradePlan = async (plan: SubscriptionPlan): Promise<boolean> => {
-    try {
-      // Simulate payment processing
-      await new Promise((resolve) => setTimeout(resolve, 2000))
-
-      if (user) {
-        const newSubscription: Subscription = {
-          plan,
-          status: "active",
-          startDate: new Date().toISOString(),
-          endDate: plan === "free" ? undefined : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
-          limits: PLAN_CONFIGS[plan],
-        }
-
-        const updatedUser = {
-          ...user,
-          subscription: newSubscription,
-          usageStats: createDefaultUsageStats(), // Reset usage stats on plan change
-        }
-
-        setUser(updatedUser)
-        localStorage.setItem("user", JSON.stringify(updatedUser))
-        return true
-      }
-      return false
-    } catch (error) {
-      console.error("Plan upgrade error:", error)
-      return false
-    }
-  }
-
-  const canUseFeature = (feature: keyof PlanLimits): boolean => {
-    if (!user?.subscription) return false
-
-    const limits = user.subscription.limits
-    return (
-      limits[feature] === true || limits[feature] === -1 || (typeof limits[feature] === "number" && limits[feature] > 0)
-    )
-  }
-
-  const getRemainingUsage = () => {
-    if (!user?.subscription || !user?.usageStats) {
-      return { aiMessages: 0, workoutGenerations: 0, nutritionPlans: 0 }
-    }
-
-    const limits = user.subscription.limits
-    const usage = user.usageStats
-
-    return {
-      aiMessages: limits.aiMessagesPerDay === -1 ? -1 : Math.max(0, limits.aiMessagesPerDay - usage.aiMessagesToday),
-      workoutGenerations:
-        limits.workoutGenerationsPerMonth === -1
-          ? -1
-          : Math.max(0, limits.workoutGenerationsPerMonth - usage.workoutGenerationsThisMonth),
-      nutritionPlans:
-        limits.nutritionPlansPerMonth === -1
-          ? -1
-          : Math.max(0, limits.nutritionPlansPerMonth - usage.nutritionPlansThisMonth),
-    }
-  }
-
-  const incrementUsage = (type: "aiMessage" | "workoutGeneration" | "nutritionPlan") => {
-    if (!user?.usageStats) return
-
-    const today = new Date().toISOString().split("T")[0]
-    const currentMonth = new Date().toISOString().substring(0, 7) // YYYY-MM
-
-    // Reset daily/monthly counters if needed
-    const updatedUsage = { ...user.usageStats }
-    const lastResetDate = new Date(user.usageStats.lastResetDate)
-    const now = new Date()
-
-    // Reset daily counter
-    if (lastResetDate.toISOString().split("T")[0] !== today) {
-      updatedUsage.aiMessagesToday = 0
-    }
-
-    // Reset monthly counters
-    if (lastResetDate.toISOString().substring(0, 7) !== currentMonth) {
-      updatedUsage.workoutGenerationsThisMonth = 0
-      updatedUsage.nutritionPlansThisMonth = 0
-    }
-
-    // Increment usage
-    switch (type) {
-      case "aiMessage":
-        updatedUsage.aiMessagesToday += 1
-        break
-      case "workoutGeneration":
-        updatedUsage.workoutGenerationsThisMonth += 1
-        break
-      case "nutritionPlan":
-        updatedUsage.nutritionPlansThisMonth += 1
-        break
-    }
-
-    updatedUsage.lastResetDate = now.toISOString()
-
-    const updatedUser = { ...user, usageStats: updatedUsage }
-    setUser(updatedUser)
-    localStorage.setItem("user", JSON.stringify(updatedUser))
-  }
-
  const addWorkout = (workout: Omit<WorkoutEntry, "id">) => {
@@ .. @@
        updateDailyStats,
        getTodayStats,
        getWeekStats,
-        upgradePlan,
-        canUseFeature,
-        getRemainingUsage,
-        incrementUsage,
      }}
    >
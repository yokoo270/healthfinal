"use client"
import { useState } from "react"
import { useAuth } from "@/components/auth/auth-provider"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { User, Target, Activity, Calendar, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function ProfilePage() {
  const { user, updateUser, getWeekStats } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    age: user?.age || "",
    height: user?.height || "",
    weight: user?.weight || "",
    sex: user?.sex || "",
    fitnessLevel: user?.fitnessLevel || "",
    goals: user?.goals || "",
    bio: user?.bio || "",
  })

  const weekStats = getWeekStats()
  const totalWorkouts = user?.workoutHistory?.length || 0
  const totalHours = user?.workoutHistory?.reduce((sum, workout) => sum + workout.duration, 0) / 60 || 0
  const goalsProgress = user?.userGoals?.length ? Math.round((user.userGoals.filter(g => g.completed).length / user.userGoals.length) * 100) : 0

  const handleSave = () => {
    updateUser(formData)
    setIsEditing(false)
  }

  const calculateBMI = () => {
    if (formData.height && formData.weight) {
      const heightM = Number.parseFloat(formData.height) / 100
      const weightKg = Number.parseFloat(formData.weight)
      return (weightKg / (heightM * heightM)).toFixed(1)
    }
    return "N/A"
  }

  const getBMICategory = (bmi: string) => {
    const bmiNum = Number.parseFloat(bmi)
    if (bmiNum < 18.5) return { category: "Underweight", color: "text-blue-500" }
    if (bmiNum < 25) return { category: "Normal", color: "text-green-500" }
    if (bmiNum < 30) return { category: "Overweight", color: "text-yellow-500" }
    return { category: "Obese", color: "text-red-500" }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="mb-8">
            <div className="flex items-center space-x-4 mb-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Dashboard
                </Button>
              </Link>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              👤 Your Profile
            </h1>
            <p className="text-muted-foreground mt-2">Manage your personal information and fitness preferences</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Personal Information */}
            <Card className="glow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Personal Information
                </CardTitle>
                <CardDescription>Your basic profile details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sex">Sex</Label>
                    <Select
                      value={formData.sex}
                      onValueChange={(value) => setFormData({ ...formData, sex: value })}
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select sex" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    disabled={!isEditing}
                    placeholder="Tell us about yourself..."
                  />
                </div>
              </CardContent>
            </Card>

            {/* Physical Stats */}
            <Card className="glow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Physical Stats
                </CardTitle>
                <CardDescription>Your body measurements and metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="height">Height (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      value={formData.height}
                      onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                {/* BMI Calculator */}
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">BMI:</span>
                    <span className="text-2xl font-bold">{calculateBMI()}</span>
                  </div>
                  {calculateBMI() !== "N/A" && (
                    <div className="mt-2">
                      <span className={`text-sm ${getBMICategory(calculateBMI()).color}`}>
                        {getBMICategory(calculateBMI()).category}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Fitness Preferences */}
            <Card className="glow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Fitness Preferences
                </CardTitle>
                <CardDescription>Your fitness level and goals</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fitnessLevel">Fitness Level</Label>
                  <Select
                    value={formData.fitnessLevel}
                    onValueChange={(value) => setFormData({ ...formData, fitnessLevel: value })}
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your fitness level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Beginner">Beginner</SelectItem>
                      <SelectItem value="Intermediate">Intermediate</SelectItem>
                      <SelectItem value="Advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="goals">Primary Goals</Label>
                  <Textarea
                    id="goals"
                    value={formData.goals}
                    onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                    disabled={!isEditing}
                    placeholder="What are your fitness goals?"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Activity Summary */}
            <Card className="glow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Activity Summary
                </CardTitle>
                <CardDescription>Your recent activity overview</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-primary">{totalWorkouts}</div>
                    <div className="text-sm text-muted-foreground">Total Workouts</div>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-secondary">{totalHours.toFixed(1)}</div>
                    <div className="text-sm text-muted-foreground">Hours Trained</div>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-accent">0</div>
                    <div className="text-sm text-muted-foreground">Weight Change (kg)</div>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-primary">{goalsProgress}%</div>
                    <div className="text-sm text-muted-foreground">Goal Progress</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 flex justify-end gap-4">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} className="glow-primary">
                  Save Changes
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)} className="glow-primary">
                Edit Profile
              </Button>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}

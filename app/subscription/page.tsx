"use client"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { PlanUpgrade } from "@/components/subscription/plan-upgrade"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function SubscriptionPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
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
              💳 Subscription Plans
            </h1>
            <p className="text-muted-foreground mt-2">Choose the perfect plan for your fitness journey</p>
          </div>

          <PlanUpgrade />
          
          <div className="mt-12 text-center">
            <p className="text-sm text-muted-foreground">
              All plans include secure payment processing and can be cancelled anytime.
            </p>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}

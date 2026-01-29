"use client"

import { LanguageProvider } from "@/lib/language-context"
import { AuthProvider } from "@/lib/auth-context"
import { SponsorProvider } from "@/lib/sponsor-context"
import { MessagingProvider } from "@/lib/messaging-context"
import { StripeProvider } from "@/lib/stripe-context"
import { CRMProvider } from "@/lib/crm-context"
import { AnalyticsProvider } from "@/lib/analytics-context"
import { ForumsProvider } from "@/lib/forums-context"
import type { ReactNode } from "react"

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <SponsorProvider>
        <MessagingProvider>
          <StripeProvider>
            <CRMProvider>
              <AnalyticsProvider>
                <ForumsProvider>
                  <LanguageProvider>{children}</LanguageProvider>
                </ForumsProvider>
              </AnalyticsProvider>
            </CRMProvider>
          </StripeProvider>
        </MessagingProvider>
      </SponsorProvider>
    </AuthProvider>
  )
}

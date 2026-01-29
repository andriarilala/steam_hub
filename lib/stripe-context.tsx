"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

export interface PaymentInfo {
  cardNumber: string
  expiryDate: string
  cvv: string
}

export interface TicketOrder {
  id: string
  ticketType: "standard" | "vip" | "student" | "virtual"
  quantity: number
  price: number
  total: number
  status: "pending" | "completed" | "failed"
  createdAt: string
}

interface StripeContextType {
  processPayment: (paymentInfo: PaymentInfo, ticketType: string, quantity: number) => Promise<TicketOrder>
  isProcessing: boolean
  lastOrder: TicketOrder | null
}

const StripeContext = createContext<StripeContextType | undefined>(undefined)

const ticketPrices: Record<string, number> = {
  standard: 50,
  vip: 150,
  student: 25,
  virtual: 20,
}

export function StripeProvider({ children }: { children: ReactNode }) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [lastOrder, setLastOrder] = useState<TicketOrder | null>(null)

  const processPayment = async (
    paymentInfo: PaymentInfo,
    ticketType: "standard" | "vip" | "student" | "virtual",
    quantity: number
  ): Promise<TicketOrder> => {
    setIsProcessing(true)

    try {
      // Simulate Stripe API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Validate card (simple demo validation)
      if (
        !paymentInfo.cardNumber ||
        paymentInfo.cardNumber.length < 13 ||
        !paymentInfo.expiryDate ||
        !paymentInfo.cvv ||
        paymentInfo.cvv.length < 3
      ) {
        throw new Error("Invalid payment information")
      }

      const price = ticketPrices[ticketType] || 0
      const total = price * quantity

      const order: TicketOrder = {
        id: `order_${Date.now()}`,
        ticketType,
        quantity,
        price,
        total,
        status: "completed",
        createdAt: new Date().toISOString(),
      }

      setLastOrder(order)
      setIsProcessing(false)

      return order
    } catch (error) {
      setIsProcessing(false)
      throw error
    }
  }

  return (
    <StripeContext.Provider value={{ processPayment, isProcessing, lastOrder }}>
      {children}
    </StripeContext.Provider>
  )
}

export function useStripe() {
  const context = useContext(StripeContext)
  if (context === undefined) {
    throw new Error("useStripe must be used within StripeProvider")
  }
  return context
}

"use client"

import React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import {
  Check,
  CreditCard,
  Calendar,
  MapPin,
  Users,
  Star,
  Shield,
  ArrowRight,
  Ticket,
  Clock,
  Gift,
  Wifi,
  Coffee,
  Award,
} from "lucide-react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { useLanguage } from "@/lib/language-context"
import { useAuth } from "@/lib/auth-context"
import { useStripe } from "@/lib/stripe-context"

type TicketType = "standard" | "vip" | "student" | "virtual"

interface TicketOption {
  type: TicketType
  nameKey: string
  priceKey: string
  descKey: string
  price: number
  features: string[]
  popular?: boolean
}

const ticketOptions: TicketOption[] = [
  {
    type: "student",
    nameKey: "register.student",
    priceKey: "register.studentPrice",
    descKey: "register.studentDesc",
    price: 25,
    features: [
      "Access to all keynotes and panels",
      "Networking sessions",
      "Digital badge & certificate",
      "Access to community platform",
    ],
  },
  {
    type: "standard",
    nameKey: "register.standard",
    priceKey: "register.standardPrice",
    descKey: "register.standardDesc",
    price: 50,
    features: [
      "Access to all sessions & workshops",
      "Networking sessions",
      "Digital badge & certificate",
      "Access to community platform",
      "Event materials & swag bag",
    ],
    popular: true,
  },
  {
    type: "vip",
    nameKey: "register.vip",
    priceKey: "register.vipPrice",
    descKey: "register.vipDesc",
    price: 150,
    features: [
      "All Standard benefits",
      "VIP reserved seating",
      "Exclusive VIP sessions",
      "Lunch & refreshments included",
      "VIP networking lounge access",
      "1-on-1 mentorship session",
      "Priority partner meetings",
    ],
  },
  {
    type: "virtual",
    nameKey: "register.virtual",
    priceKey: "register.virtualPrice",
    descKey: "register.virtualDesc",
    price: 20,
    features: [
      "Live stream of all sessions",
      "On-demand replay access (30 days)",
      "Digital badge & certificate",
      "Virtual networking rooms",
      "Access to community platform",
    ],
  },
]

export default function RegisterPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const { isAuthenticated } = useAuth()

  const [step, setStep] = useState(1)
  const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)
  const [registrationComplete, setRegistrationComplete] = useState(false)

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    organization: "",
    jobTitle: "",
    country: "",
    dietaryRestrictions: "",
    specialNeeds: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
    cardName: "",
  })

  const selectedTicketData = ticketOptions.find((t) => t.type === selectedTicket)
  const subtotal = selectedTicketData ? selectedTicketData.price * quantity : 0
  const fees = Math.round(subtotal * 0.05)
  const total = subtotal + fees

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleTicketSelect = (type: TicketType) => {
    setSelectedTicket(type)
  }

  const handleNext = () => {
    if (step === 1 && !selectedTicket) return
    setStep(step + 1)
  }

  const handleBack = () => {
    setStep(step - 1)
  }

  const { processPayment, isProcessing: stripeProcessing } = useStripe()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    try {
      const paymentInfo = {
        cardNumber: formData.cardNumber,
        expiryDate: formData.expiry,
        cvv: formData.cvv,
      }

      const order = await processPayment(paymentInfo, selectedTicket as any, quantity)

      if (order.status === "completed") {
        setIsProcessing(false)
        setRegistrationComplete(true)
      }
    } catch (error) {
      setIsProcessing(false)
      alert("Payment failed. Please check your details and try again.")
    }
  }

  if (registrationComplete) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="pt-24 pb-16">
          <div className="max-w-lg mx-auto px-4 text-center">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-4">{t("register.success")}</h1>
            <p className="text-foreground/70 mb-8">{t("register.successDesc")}</p>

            <div className="bg-card border border-border rounded-xl p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <span className="text-foreground/70">Ticket Type</span>
                <span className="font-medium text-foreground">{selectedTicketData?.nameKey && t(selectedTicketData.nameKey)}</span>
              </div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-foreground/70">Quantity</span>
                <span className="font-medium text-foreground">{quantity}</span>
              </div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-foreground/70">Reference</span>
                <span className="font-mono text-foreground">PA-2025-{Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <span className="font-semibold text-foreground">Total Paid</span>
                <span className="font-bold text-primary text-xl">${total} USD</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/dashboard"
                className="flex-1 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/agenda"
                className="flex-1 border border-border px-6 py-3 rounded-lg font-medium hover:bg-muted transition-colors text-center"
              >
                View Agenda
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="pt-24 pb-16">
        {/* Hero */}
        <section className="relative py-16 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">{t("register.title")}</h1>
              <p className="text-xl text-foreground/70 mb-8">{t("register.subtitle")}</p>

              {/* Event Info */}
              <div className="flex flex-wrap justify-center gap-6 text-sm">
                <div className="flex items-center gap-2 text-foreground/70">
                  <Calendar className="w-5 h-5 text-primary" />
                  <span>March 15-16, 2025</span>
                </div>
                <div className="flex items-center gap-2 text-foreground/70">
                  <MapPin className="w-5 h-5 text-primary" />
                  <span>Accra, Ghana</span>
                </div>
                <div className="flex items-center gap-2 text-foreground/70">
                  <Users className="w-5 h-5 text-primary" />
                  <span>10,000+ Expected</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Progress Steps */}
        <div className="max-w-4xl mx-auto px-4 mb-12">
          <div className="flex items-center justify-center">
            {[
              { num: 1, label: "Select Ticket" },
              { num: 2, label: "Your Details" },
              { num: 3, label: "Payment" },
            ].map((s, index) => (
              <div key={s.num} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${
                      s.num < step
                        ? "bg-primary text-primary-foreground"
                        : s.num === step
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground/50"
                    }`}
                  >
                    {s.num < step ? <Check className="w-5 h-5" /> : s.num}
                  </div>
                  <span className="text-xs mt-2 text-foreground/70 hidden sm:block">{s.label}</span>
                </div>
                {index < 2 && (
                  <div className={`w-16 sm:w-24 h-0.5 mx-2 ${s.num < step ? "bg-primary" : "bg-border"}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4">
          {/* Step 1: Select Ticket */}
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-6 text-center">{t("register.selectTicket")}</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {ticketOptions.map((ticket) => (
                  <div
                    key={ticket.type}
                    onClick={() => handleTicketSelect(ticket.type)}
                    className={`relative bg-card border rounded-xl p-6 cursor-pointer transition-all ${
                      selectedTicket === ticket.type
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-border hover:border-primary/50"
                    } ${ticket.popular ? "ring-2 ring-amber-500/20" : ""}`}
                  >
                    {ticket.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="bg-amber-500 text-white text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1">
                          <Star className="w-3 h-3" /> Popular
                        </span>
                      </div>
                    )}

                    <div className="text-center mb-4">
                      <h3 className="text-lg font-bold text-foreground">{t(ticket.nameKey)}</h3>
                      <p className="text-3xl font-bold text-primary mt-2">{t(ticket.priceKey)}</p>
                      <p className="text-sm text-foreground/50 mt-1">{t(ticket.descKey)}</p>
                    </div>

                    <ul className="space-y-2">
                      {ticket.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-foreground/70">
                          <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {selectedTicket === ticket.type && (
                      <div className="absolute top-4 right-4">
                        <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-primary-foreground" />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {selectedTicket && (
                <div className="mt-8 max-w-md mx-auto">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-foreground/70">Quantity</span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-muted"
                      >
                        -
                      </button>
                      <span className="font-medium text-foreground w-8 text-center">{quantity}</span>
                      <button
                        onClick={() => setQuantity(Math.min(10, quantity + 1))}
                        className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-muted"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleNext}
                    className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                  >
                    {t("register.checkout")}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Personal Details */}
          {step === 2 && (
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-foreground mb-6">Your Details</h2>
              <form className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">First Name *</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Last Name *</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Organization</label>
                    <input
                      type="text"
                      name="organization"
                      value={formData.organization}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Job Title</label>
                    <input
                      type="text"
                      name="jobTitle"
                      value={formData.jobTitle}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Country *</label>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                  >
                    <option value="">Select your country</option>
                    <option value="GH">Ghana</option>
                    <option value="NG">Nigeria</option>
                    <option value="KE">Kenya</option>
                    <option value="ZA">South Africa</option>
                    <option value="MG">Madagascar</option>
                    <option value="SN">Senegal</option>
                    <option value="CI">Cote d'Ivoire</option>
                    <option value="TZ">Tanzania</option>
                    <option value="RW">Rwanda</option>
                    <option value="ET">Ethiopia</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Dietary Restrictions (Optional)
                  </label>
                  <input
                    type="text"
                    name="dietaryRestrictions"
                    value={formData.dietaryRestrictions}
                    onChange={handleChange}
                    placeholder="e.g., Vegetarian, Halal, Gluten-free"
                    className="w-full px-4 py-3 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex-1 border border-border py-3 rounded-lg font-medium hover:bg-muted transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="flex-1 bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                  >
                    Continue to Payment
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Step 3: Payment */}
          {step === 3 && (
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Payment Form */}
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-6">{t("register.paymentMethod")}</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="flex gap-4 mb-6">
                    <button
                      type="button"
                      className="flex-1 border-2 border-primary bg-primary/5 rounded-lg p-4 flex items-center justify-center gap-2"
                    >
                      <CreditCard className="w-5 h-5 text-primary" />
                      <span className="font-medium">Card</span>
                    </button>
                    <button
                      type="button"
                      className="flex-1 border border-border rounded-lg p-4 flex items-center justify-center gap-2 hover:border-primary/50 transition-colors"
                    >
                      <Image src="/paypal-logo.png" alt="PayPal" width={60} height={20} className="opacity-50" />
                    </button>
                    <button
                      type="button"
                      className="flex-1 border border-border rounded-lg p-4 flex items-center justify-center gap-2 hover:border-primary/50 transition-colors"
                    >
                      <span className="text-sm font-medium text-foreground/70">Mobile Money</span>
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Name on Card</label>
                    <input
                      type="text"
                      name="cardName"
                      value={formData.cardName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">{t("register.cardNumber")}</label>
                    <div className="relative">
                      <input
                        type="text"
                        name="cardNumber"
                        value={formData.cardNumber}
                        onChange={handleChange}
                        placeholder="1234 5678 9012 3456"
                        required
                        className="w-full px-4 py-3 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                      />
                      <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">{t("register.expiry")}</label>
                      <input
                        type="text"
                        name="expiry"
                        value={formData.expiry}
                        onChange={handleChange}
                        placeholder="MM/YY"
                        required
                        className="w-full px-4 py-3 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">{t("register.cvv")}</label>
                      <input
                        type="text"
                        name="cvv"
                        value={formData.cvv}
                        onChange={handleChange}
                        placeholder="123"
                        required
                        className="w-full px-4 py-3 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-foreground/70">
                    <Shield className="w-4 h-4 text-green-500" />
                    <span>{t("register.secure")} - Your payment information is encrypted</span>
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="flex-1 border border-border py-3 rounded-lg font-medium hover:bg-muted transition-colors"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="flex-1 bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isProcessing ? (
                        <span className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      ) : (
                        <>
                          {t("register.pay")} ${total} USD
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Order Summary */}
              <div>
                <div className="bg-card border border-border rounded-xl p-6 sticky top-24">
                  <h3 className="text-lg font-bold text-foreground mb-4">Order Summary</h3>

                  {selectedTicketData && (
                    <div className="space-y-4 pb-4 border-b border-border">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-foreground">{t(selectedTicketData.nameKey)} Pass</p>
                          <p className="text-sm text-foreground/50">{t(selectedTicketData.descKey)}</p>
                        </div>
                        <p className="font-medium text-foreground">${selectedTicketData.price}</p>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-foreground/70">Quantity</span>
                        <span className="text-foreground">{quantity}</span>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2 py-4 border-b border-border">
                    <div className="flex items-center justify-between">
                      <span className="text-foreground/70">Subtotal</span>
                      <span className="text-foreground">${subtotal} USD</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-foreground/70">Processing Fee</span>
                      <span className="text-foreground">${fees} USD</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <span className="font-bold text-foreground">Total</span>
                    <span className="text-2xl font-bold text-primary">${total} USD</span>
                  </div>

                  {/* Event Details */}
                  <div className="mt-6 pt-6 border-t border-border">
                    <h4 className="font-medium text-foreground mb-3">Event Details</h4>
                    <div className="space-y-2 text-sm text-foreground/70">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>March 15-16, 2025</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>8:00 AM - 9:00 PM (Both Days)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>International Convention Center, Accra</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

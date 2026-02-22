"use client"

import { useState, useEffect, useRef } from "react"
import { MessageCircle, X, Send, Bot, User, Phone, HelpCircle, Calendar, Ticket, Building } from "lucide-react"
import { useLanguage } from "@/lib/language-context"

interface Message {
  id: string
  type: "bot" | "user"
  text: string
  options?: QuickOption[]
}

interface QuickOption {
  id: string
  label: string
  action: string
}

const initialMessage: Message = {
  id: "1",
  type: "bot",
  text: "Hello! I'm PASS AVENIR's virtual assistant. How can I help you today?",
  options: [
    { id: "1", label: "Event Information", action: "event_info" },
    { id: "2", label: "Registration Help", action: "registration" },
    { id: "3", label: "Sponsorship", action: "sponsorship" },
    { id: "4", label: "Contact Team", action: "contact" },
  ],
}

const botResponses: Record<string, Message> = {
  event_info: {
    id: "",
    type: "bot",
    text: "PASS AVENIR 2025 takes place on March 15-16 at the International Convention Center in Accra, Ghana. It's Africa's premier talent and opportunity summit connecting 10,000+ young talents with leading institutions and companies. What would you like to know more about?",
    options: [
      { id: "1", label: "Agenda & Sessions", action: "agenda" },
      { id: "2", label: "Venue & Location", action: "venue" },
      { id: "3", label: "Who Should Attend", action: "audience" },
      { id: "4", label: "Back to Menu", action: "menu" },
    ],
  },
  registration: {
    id: "",
    type: "bot",
    text: "Great! Registration is now open for PASS AVENIR 2025. We offer several ticket types:\n\n- Student Pass: 3000 AR\n- Standard Pass: 3000 AR\n- VIP Pass: 3000 AR\n- Virtual Pass: 3000 AR\n\nWould you like to register now or learn more about each ticket type?",
    options: [
      { id: "1", label: "Register Now", action: "register_now" },
      { id: "2", label: "Ticket Details", action: "ticket_details" },
      { id: "3", label: "Group Discounts", action: "group_discounts" },
      { id: "4", label: "Back to Menu", action: "menu" },
    ],
  },
  sponsorship: {
    id: "",
    type: "bot",
    text: "Interested in sponsoring PASS AVENIR? We offer partnership packages starting from €25,000 to €200,000+, with options for custom partnerships. Benefits include booth presence, speaking opportunities, brand visibility, and access to Africa's top talent pool.",
    options: [
      { id: "1", label: "View Packages", action: "sponsor_packages" },
      { id: "2", label: "Download Prospectus", action: "download_prospectus" },
      { id: "3", label: "Contact Sales Team", action: "contact_sales" },
      { id: "4", label: "Back to Menu", action: "menu" },
    ],
  },
  contact: {
    id: "",
    type: "bot",
    text: "You can reach our team through:\n\n- Email: info@passavenir.com\n- Phone: +233 XX XXX XXXX\n- WhatsApp: +233 XX XXX XXXX\n\nOr would you prefer to speak directly with someone?",
    options: [
      { id: "1", label: "Open WhatsApp", action: "whatsapp" },
      { id: "2", label: "Send Email", action: "email" },
      { id: "3", label: "Contact Form", action: "contact_form" },
      { id: "4", label: "Back to Menu", action: "menu" },
    ],
  },
  agenda: {
    id: "",
    type: "bot",
    text: "The event features 2 days of inspiring content:\n\nDay 1: Opening Keynotes, Panels, Workshops, Talent Showcase\nDay 2: Career Fair, Pitch Competition, Awards, Closing Celebration\n\nOver 50 sessions covering technology, innovation, careers, and more!",
    options: [
      { id: "1", label: "View Full Agenda", action: "full_agenda" },
      { id: "2", label: "Speaker Lineup", action: "speakers" },
      { id: "3", label: "Back to Menu", action: "menu" },
    ],
  },
  venue: {
    id: "",
    type: "bot",
    text: "PASS AVENIR 2025 will be held at the International Convention Center in Accra, Ghana. The venue offers world-class facilities including:\n\n- Main auditorium (5,000 seats)\n- Exhibition halls\n- Workshop rooms\n- Networking lounges\n- Outdoor spaces\n\nConveniently located in the heart of Accra with easy access to hotels and transport.",
    options: [
      { id: "1", label: "Hotels Nearby", action: "hotels" },
      { id: "2", label: "Getting There", action: "transport" },
      { id: "3", label: "Back to Menu", action: "menu" },
    ],
  },
  audience: {
    id: "",
    type: "bot",
    text: "PASS AVENIR welcomes:\n\n- Students & Young Professionals looking for opportunities\n- Companies & Recruiters seeking talent\n- Institutions & Government promoting programs\n- Mentors & Experts sharing knowledge\n- Sponsors & Partners building visibility\n\nWhich describes you best?",
    options: [
      { id: "1", label: "I'm a Student/Professional", action: "for_students" },
      { id: "2", label: "I'm from a Company", action: "for_companies" },
      { id: "3", label: "I want to Sponsor", action: "sponsorship" },
      { id: "4", label: "Back to Menu", action: "menu" },
    ],
  },
  menu: {
    id: "",
    type: "bot",
    text: "What else can I help you with?",
    options: [
      { id: "1", label: "Event Information", action: "event_info" },
      { id: "2", label: "Registration Help", action: "registration" },
      { id: "3", label: "Sponsorship", action: "sponsorship" },
      { id: "4", label: "Contact Team", action: "contact" },
    ],
  },
  register_now: {
    id: "",
    type: "bot",
    text: "Let me redirect you to our registration page where you can select your ticket and complete your registration securely.",
    options: [
      { id: "1", label: "Go to Registration", action: "redirect_register" },
      { id: "2", label: "Back to Menu", action: "menu" },
    ],
  },
  whatsapp: {
    id: "",
    type: "bot",
    text: "Opening WhatsApp to connect you with our team...",
    options: [
      { id: "1", label: "Back to Menu", action: "menu" },
    ],
  },
  default: {
    id: "",
    type: "bot",
    text: "I'm not sure I understood that. Let me help you with some options:",
    options: [
      { id: "1", label: "Event Information", action: "event_info" },
      { id: "2", label: "Registration Help", action: "registration" },
      { id: "3", label: "Sponsorship", action: "sponsorship" },
      { id: "4", label: "Contact Team", action: "contact" },
    ],
  },
}

export function ChatbotWidget() {
  const { language } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([initialMessage])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleOptionClick = (action: string) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      text: botResponses[action]?.options?.find((o) => o.action === action)?.label || action,
    }

    // Handle special actions
    if (action === "redirect_register") {
      window.location.href = "/register"
      return
    }
    if (action === "whatsapp") {
      window.open("https://wa.me/233XXXXXXXX?text=Hello!%20I%20have%20a%20question%20about%20PASS%20AVENIR", "_blank")
    }
    if (action === "full_agenda") {
      window.location.href = "/agenda"
      return
    }
    if (action === "contact_form") {
      window.location.href = "/contact"
      return
    }
    if (action === "sponsor_packages") {
      window.location.href = "/partners"
      return
    }

    setMessages((prev) => [...prev, userMessage])
    setIsTyping(true)

    // Simulate bot typing
    setTimeout(() => {
      const botResponse = botResponses[action] || botResponses.default
      const newBotMessage: Message = {
        ...botResponse,
        id: (Date.now() + 1).toString(),
      }
      setMessages((prev) => [...prev, newBotMessage])
      setIsTyping(false)
    }, 800)
  }

  const handleSendMessage = () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      text: inputValue,
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsTyping(true)

    // Simple keyword matching
    setTimeout(() => {
      let response = botResponses.default
      const lowerInput = inputValue.toLowerCase()

      if (lowerInput.includes("register") || lowerInput.includes("ticket") || lowerInput.includes("sign up")) {
        response = botResponses.registration
      } else if (lowerInput.includes("sponsor") || lowerInput.includes("partner")) {
        response = botResponses.sponsorship
      } else if (lowerInput.includes("contact") || lowerInput.includes("email") || lowerInput.includes("phone")) {
        response = botResponses.contact
      } else if (lowerInput.includes("event") || lowerInput.includes("when") || lowerInput.includes("where")) {
        response = botResponses.event_info
      } else if (lowerInput.includes("agenda") || lowerInput.includes("schedule") || lowerInput.includes("session")) {
        response = botResponses.agenda
      }

      const newBotMessage: Message = {
        ...response,
        id: (Date.now() + 1).toString(),
      }
      setMessages((prev) => [...prev, newBotMessage])
      setIsTyping(false)
    }, 1000)
  }

  const openWhatsApp = () => {
    window.open("https://wa.me/233XXXXXXXX?text=Hello!%20I%20have%20a%20question%20about%20PASS%20AVENIR", "_blank")
  }

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        {/* WhatsApp Button */}
        <button
          onClick={openWhatsApp}
          className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg hover:bg-green-600 transition-colors"
          aria-label="Contact via WhatsApp"
        >
          <Phone className="w-6 h-6 text-white" />
        </button>

        {/* Chatbot Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all ${
            isOpen ? "bg-foreground text-background" : "bg-primary text-primary-foreground"
          }`}
          aria-label={isOpen ? "Close chat" : "Open chat"}
        >
          {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
        </button>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[360px] h-[500px] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-primary p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-foreground/20 rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-primary-foreground">PASS AVENIR Assistant</h3>
              <p className="text-xs text-primary-foreground/70">Online | Typically replies instantly</p>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-primary-foreground/10 rounded">
              <X className="w-5 h-5 text-primary-foreground" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`flex gap-2 max-w-[85%] ${message.type === "user" ? "flex-row-reverse" : ""}`}>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.type === "user" ? "bg-primary" : "bg-muted"
                    }`}
                  >
                    {message.type === "user" ? (
                      <User className="w-4 h-4 text-primary-foreground" />
                    ) : (
                      <Bot className="w-4 h-4 text-foreground" />
                    )}
                  </div>
                  <div>
                    <div
                      className={`px-4 py-2.5 rounded-2xl text-sm whitespace-pre-line ${
                        message.type === "user"
                          ? "bg-primary text-primary-foreground rounded-br-sm"
                          : "bg-muted text-foreground rounded-bl-sm"
                      }`}
                    >
                      {message.text}
                    </div>
                    {message.options && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {message.options.map((option) => (
                          <button
                            key={option.id}
                            onClick={() => handleOptionClick(option.action)}
                            className="px-3 py-1.5 bg-background border border-border rounded-full text-xs font-medium hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="flex gap-2">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    <Bot className="w-4 h-4 text-foreground" />
                  </div>
                  <div className="px-4 py-3 bg-muted rounded-2xl rounded-bl-sm">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2.5 bg-muted border border-border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

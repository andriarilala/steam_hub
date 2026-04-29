"use client"

import { useState, useEffect, useRef } from "react"
import { MessageCircle, X, Send, Bot, User } from "lucide-react"

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
  text: "Bonjour, je suis l'assistant AERO EXPO 2026. Comment puis-je vous aider ?",
  options: [
    { id: "1", label: "Infos sur l'événement", action: "event_info" },
    { id: "2", label: "Comment participer", action: "registration" },
    { id: "3", label: "Contact / aide", action: "contact" },
  ],
}

const botResponses: Record<string, Message> = {
  event_info: {
    id: "",
    type: "bot",
    text:
      "AERO EXPO 2026 – La technologie au cœur de l'aéronautique. C'est la 2ème édition du salon dédié aux métiers de l'aéronautique, aux technologies innovantes et aux rencontres avec des professionnels du secteur.\n\n📅 30 & 31 Mai 2026\n📍 Escadron Hélicoptère Ivato, ex-bani",
    options: [
      { id: "1", label: "Programme du salon", action: "agenda" },
      { id: "2", label: "Lieu et accès", action: "venue" },
      { id: "3", label: "Qui peut venir ?", action: "audience" },
      { id: "4", label: "Revenir au menu", action: "menu" },
    ],
  },
  registration: {
    id: "",
    type: "bot",
    text:
      "Pour participer, il suffit de payer ton billet par Mvola puis de remplir le formulaire ‘Participer’ sur le site avec ton nom, ton email et la référence de paiement.",
    options: [
      { id: "1", label: "Ouvrir la page Participer", action: "register_now" },
      { id: "2", label: "Revenir au menu", action: "menu" },
    ],
  },
  contact: {
    id: "",
    type: "bot",
    text:
      "Pour toute question sur l’événement, tu peux nous contacter :\n\n- Email : steamhubinitiative@gmail.com\n- Infoline : +261 38 57 53 87 / +261 34 97 59 468\n- Facebook : ww.facebook.com/SteamHub\n\nSouhaites-tu revenir au menu ?",
    options: [
      { id: "1", label: "Revenir au menu", action: "menu" },
    ],
  },
  agenda: {
    id: "",
    type: "bot",
    text:
      "Le salon AERO EXPO 2026 propose :\n\n🛩️ Expositions d'aéronefs et drones\n🔧 Ateliers techniques et métiers de l'aéronautique\n🎤 Conférences sur les technologies innovantes\n🤝 Rencontres avec des professionnels et entreprises du secteur\n✈️ Démonstrations et simulations de vol",
    options: [
      { id: "1", label: "Infos pratiques", action: "venue" },
      { id: "2", label: "Revenir au menu", action: "menu" },
    ],
  },
  venue: {
    id: "",
    type: "bot",
    text:
      "📍 Lieu : Escadron Hélicoptère Ivato, ex-bani\n\nLe site dispose d'ample espace pour les expositions, les ateliers et les rencontres. Parking disponible sur place.\n\n🕘 Ouverture : 9h00",
    options: [
      { id: "1", label: "Programme", action: "agenda" },
      { id: "2", label: "Revenir au menu", action: "menu" },
    ],
  },
  audience: {
    id: "",
    type: "bot",
    text:
      "AERO EXPO 2026 s'adresse à tous :\n\n✈️ Passionnés d'aviation\n🎓 Étudiants en aéronautique\n🔧 Professionnels du secteur\n🏢 Entreprises et industriels\n👨‍👩‍👧‍👦 Grand public curieux de découvrir les métiers de l'air",
    options: [
      { id: "1", label: "Comment participer", action: "registration" },
      { id: "2", label: "Revenir au menu", action: "menu" },
    ],
  },
  menu: {
    id: "",
    type: "bot",
    text: "Que veux-tu savoir sur AERO EXPO 2026 ?",
    options: [
      { id: "1", label: "Infos sur l'événement", action: "event_info" },
      { id: "2", label: "Comment participer", action: "registration" },
      { id: "3", label: "Contact / aide", action: "contact" },
    ],
  },
  register_now: {
    id: "",
    type: "bot",
    text: "Je t’ouvre la page de participation pour acheter ton billet.",
    options: [
      { id: "1", label: "Aller sur Participer", action: "redirect_register" },
      { id: "2", label: "Revenir au menu", action: "menu" },
    ],
  },
  default: {
    id: "",
    type: "bot",
    text: "Je ne suis pas sûr d’avoir bien compris. Voici quelques options pour t’aider :",
    options: [
      { id: "1", label: "Infos sur l’événement", action: "event_info" },
      { id: "2", label: "Comment participer", action: "registration" },
      { id: "3", label: "Contact / aide", action: "contact" },
    ],
  },
}

export function ChatbotWidget() {
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
      window.location.href = "/participer"
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

      if (lowerInput.includes("participer") || lowerInput.includes("billet") || lowerInput.includes("inscription")) {
        response = botResponses.registration
      } else if (lowerInput.includes("contact") || lowerInput.includes("email") || lowerInput.includes("téléphone")) {
        response = botResponses.contact
      } else if (lowerInput.includes("événement") || lowerInput.includes("event") || lowerInput.includes("où") || lowerInput.includes("quand")) {
        response = botResponses.event_info
      } else if (lowerInput.includes("programme") || lowerInput.includes("agenda") || lowerInput.includes("journée")) {
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

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        {/* Chatbot Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all ${isOpen ? "bg-foreground text-background" : "bg-primary text-primary-foreground"
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
              <h3 className="font-bold text-primary-foreground">Assistant AERO EXPO 2026</h3>
              <p className="text-xs text-primary-foreground/70">En ligne · Réponses rapides</p>
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
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${message.type === "user" ? "bg-primary" : "bg-muted"
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
                      className={`px-4 py-2.5 rounded-2xl text-sm whitespace-pre-line ${message.type === "user"
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
                placeholder="Écris ton message..."
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

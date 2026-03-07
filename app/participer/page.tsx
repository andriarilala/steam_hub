"use client"

import { useState, type FormEvent } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Loader2 } from "lucide-react"

type PurchaseStatus = "idle" | "submitting" | "success" | "error"

export default function ParticiperPage() {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [mvolaRef, setMvolaRef] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [status, setStatus] = useState<PurchaseStatus>("idle")
  const [errorMessage, setErrorMessage] = useState("")

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setStatus("submitting")
    setErrorMessage("")

    try {
      const res = await fetch("/api/tickets/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          transactionRef: mvolaRef,
          quantity,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error((data as any)?.message || "Une erreur est survenue.")
      }

      setStatus("success")
      setFullName("")
      setEmail("")
      setMvolaRef("")
      setQuantity(1)
    } catch (err: any) {
      setStatus("error")
      setErrorMessage(err.message || "Impossible d’enregistrer votre demande.")
    }
  }

  const hasSubmittedSuccessfully = status === "success"

  const UNIT_PRICE = 3000
  const totalPrice = quantity * UNIT_PRICE

  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      <Navigation />

      <section className="px-4 sm:px-6 lg:px-8 pt-24 pb-16 flex-1">
        <div className="max-w-2xl mx-auto">
          {!hasSubmittedSuccessfully ? (
            <>
              <h1 className="text-3xl sm:text-4xl font-black mb-4">Participer à PASS AVENIR</h1>
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm sm:text-base font-medium">Nombre de billets</span>
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-10 h-10 rounded-md border border-slate-700 hover:bg-slate-800 font-bold text-lg text-slate-100 transition-colors"
                  >
                    −
                  </button>
                  <span className="text-xl font-bold text-white w-8 text-center">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                    className="w-10 h-10 rounded-md border border-slate-700 hover:bg-slate-800 font-bold text-lg text-slate-100 transition-colors"
                  >
                    +
                  </button>
                </div>
                <div className="mt-2 text-xs sm:text-sm text-slate-200/90">
                  Montant à payer :
                  {" "}
                  <span className="font-semibold text-emerald-300">
                    {totalPrice.toLocaleString("fr-FR")} Ariary
                  </span>
                </div>
              </div>

              <p className="text-sm sm:text-base text-slate-200/90 mb-4">
                Achat par Mvola à envoyer au <span className="font-semibold">034 58 144 56</span> au nom de
                {" "}
                <span className="font-semibold">Heriniaina Mariano</span>.
              </p>
              <p className="text-sm sm:text-base text-slate-200/80 mb-8">
                Une fois le paiement effectué, remplissez ce formulaire avec votre nom complet, votre adresse email et
                la référence de la transaction Mvola afin que nous puissions vérifier votre paiement et générer votre
                billet.
              </p>

              <div className="bg-slate-900/70 border border-slate-800 rounded-lg p-6 sm:p-8 shadow-xl">
                <h2 className="text-xl sm:text-2xl font-bold mb-4">Informations billet</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium mb-1">
                    Nom complet
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full rounded-md border border-slate-700 bg-slate-950/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Nom et prénom"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-1">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-md border border-slate-700 bg-slate-950/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="ton.email@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="mvolaRef" className="block text-sm font-medium mb-1">
                    Référence transaction Mvola
                  </label>
                  <input
                    id="mvolaRef"
                    type="text"
                    required
                    value={mvolaRef}
                    onChange={(e) => setMvolaRef(e.target.value)}
                    className="w-full rounded-md border border-slate-700 bg-slate-950/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Ex : MV123456789"
                  />
                  <p className="mt-1 text-xs text-slate-400">
                    Indique la référence exacte affichée dans ton SMS Mvola.
                  </p>
                </div>

                  {status === "error" && (
                    <p className="text-sm text-red-400">
                      {errorMessage || "Une erreur est survenue. Merci de réessayer."}
                    </p>
                  )}

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={status === "submitting"}
                      className="inline-flex items-center justify-center px-6 py-2.5 rounded-md bg-emerald-500 text-slate-950 font-semibold text-sm shadow-lg hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                    >
                      {status === "submitting" ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Envoi en cours...
                        </>
                      ) : (
                        "Valider"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </>
          ) : (
            <div className="mt-8 bg-emerald-500/10 border border-emerald-500/40 text-emerald-100 rounded-lg p-6 sm:p-8 text-center">
              <h2 className="text-xl sm:text-2xl font-bold mb-3">Merci pour votre achat !</h2>
              <p className="text-sm sm:text-base mb-2">
                Nous vous remercions, nous avons hâte de vous recevoir.
              </p>
              <p className="text-sm sm:text-base">
                Le billet vous sera envoyé par mail après validation de votre référence Mvola.
              </p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}

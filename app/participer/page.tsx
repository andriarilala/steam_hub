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
              <h1 className="text-3xl sm:text-4xl font-black mb-4 bg-gradient-to-r from-emerald-300 via-sky-300 to-emerald-200 bg-clip-text text-transparent">
                Participer à PASS AVENIR
              </h1>
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
                Achat par Mvola à envoyer au
                {" "}
                <span className="font-semibold text-white">034 58 144 56</span>
                {" "}
                au nom de
                {" "}
                <span className="font-semibold text-emerald-100">Heriniaina Mariano</span>.
              </p>
              <p className="text-sm sm:text-base text-slate-200/80 mb-8">
                Une fois le paiement effectué, remplissez ce formulaire avec votre
                {" "}
                <span className="font-semibold text-white">nom complet</span>, votre
                {" "}
                <span className="font-semibold text-white">adresse email</span>
                {" "}
                et la
                {" "}
                <span className="font-semibold text-white">référence de la transaction Mvola</span>
                {" "}
                afin que nous puissions vérifier votre paiement et générer votre billet.
              </p>

              <div className="bg-slate-900/70 border border-slate-800 rounded-lg p-6 sm:p-8 shadow-xl">
                <h2 className="text-xl sm:text-2xl font-bold mb-4 text-emerald-200">Informations billet</h2>

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
            <>
              <div className="mt-8 rounded-lg p-6 sm:p-8 text-center bg-gradient-to-r from-emerald-900/70 via-slate-900/80 to-emerald-900/70 border border-emerald-500/50 shadow-xl">
                <h2 className="text-xl sm:text-2xl font-bold mb-3 text-white">
                  Merci pour votre achat !
                </h2>
                <p className="text-sm sm:text-base mb-2 text-[#D1FAE5]">
                  Nous vous remercions chaleureusement, nous avons hâte de vous recevoir.
                </p>
                <p className="text-sm sm:text-base text-[#D1FAE5]">
                  Le billet vous sera envoyé par mail après validation de votre référence Mvola.
                </p>
              </div>

              <div className="mt-6 bg-slate-900/80 border border-[#3B82F6] rounded-lg p-6 sm:p-7 shadow-xl text-left">
                <div className="mb-3">
                  <h3 className="text-lg sm:text-xl font-bold text-white animate-pulse-zoom text-center">
                    Doublez la valeur de votre billet ! – Offre de bourses
                  </h3>
                </div>

                <p className="text-sm sm:text-base text-[#E5E7EB] mb-4">
                  Félicitations ! En tant que participant au PASS AVENIR, vous pouvez tenter de gagner
                  {" "}
                  1 des 3 bourses offertes aux visiteurs
                  {" "}
                  par
                  {" "}
                  <a
                    href="https://www.facebook.com/profile.php?id=61582094332677"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#22D3EE] hover:text-cyan-200 underline-offset-2 hover:underline"
                  >
                    ILC - Institute of Languages and Careers
                  </a>
                  {" "}
                  au choix : cours de langues (English &amp; Deutsch) ou formation aux métiers du numérique.
                </p>

                <div className="space-y-2 text-sm sm:text-base text-slate-100/90">
                  <p className="mb-1 font-semibold text-[#E5E7EB]">Pour participer :</p>
                  <p className="text-slate-100">
                    <span className="text-[#FBBF24]">✓</span>
                    {" "}
                    Suivez notre page Facebook :
                    {" "}
                    <a
                      href="https://www.facebook.com/profile.php?id=100081934650238"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#22D3EE] hover:text-cyan-200 underline-offset-2 hover:underline"
                    >
                      STEAM Hub
                    </a>
                    .
                  </p>
                  <p className="text-slate-200">
                    <span className="text-[#FBBF24]">✓</span>
                    {" "}
                    Mentionnez 5 amis dans les commentaires de la publication officielle de PASS AVENIR en
                    indiquant le métier qui te passionne.
                  </p>
                  <p className="text-slate-200">
                    <span className="text-[#FBBF24]">✓</span>
                    {" "}
                    Partagez la publication.
                  </p>
                </div>

                <div className="mt-4 text-sm sm:text-base text-slate-100">
                  <p className="mb-1 font-semibold text-[#E5E7EB]">Publication officielle :</p>
                  <a
                    href="https://www.facebook.com/share/p/16KujUbxNE/"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#22D3EE] hover:text-cyan-200 underline underline-offset-2 break-all"
                  >
                    https://www.facebook.com/share/p/16KujUbxNE/
                  </a>
                </div>

                <p className="mt-4 text-sm text-center text-emerald-100 font-semibold tracking-wide">
                  Tirage au sort pendant l’événement – bonne chance à vous !
                </p>
              </div>
            </>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}

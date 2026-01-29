import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"

export default function NotFound() {
  return (
    <main className="min-h-screen bg-background flex flex-col">
      <Navigation />

      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center">
          <div className="text-8xl font-bold text-primary mb-4">404</div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Page Not Found</h1>
          <p className="text-foreground/70 mb-8">
            The page you're looking for doesn't exist or has been moved. Let's get you back on track.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/" className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-bold hover:opacity-90 transition-opacity">
              Back to Home
            </Link>
            <Link href="/community" className="border-2 border-primary text-primary px-6 py-3 rounded-lg font-bold hover:bg-primary/5 transition-colors">
              Explore Community
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}

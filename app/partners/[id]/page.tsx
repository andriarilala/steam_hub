import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { ArrowLeft, MapPin, Globe } from "lucide-react"

interface PartnerProfile {
  id: string
  name: string
  category: string
  tagline: string
  logo: string
  description: string
  vision: string
  impact: string
  locations: string[]
  website: string
  opportunities: OpportunityItem[]
  testimonials: Testimonial[]
  contact: string
}

interface OpportunityItem {
  title: string
  description: string
  level: string
}

interface Testimonial {
  quote: string
  author: string
  role: string
}

const partnerData: Record<string, PartnerProfile> = {
  "1": {
    id: "1",
    name: "TechCorp Africa",
    logo: "TC",
    category: "Technology",
    tagline: "Building Africa's Tech Future",
    description:
      "Leading technology company with operations across 15 African countries, dedicated to developing innovative solutions that drive digital transformation and create employment opportunities for young African talent.",
    vision:
      "We believe Africa's digital future is built by African technologists. Our mission is to discover, develop, and deploy the continent's tech talent to solve global challenges.",
    impact:
      "Empowering 50,000+ young technologists across Africa through education, employment, and entrepreneurship programs.",
    locations: ["Lagos", "Accra", "Nairobi", "Johannesburg", "Cairo"],
    website: "www.techcorpafrica.com",
    opportunities: [
      {
        title: "Graduate Program",
        description:
          "2-year structured program for recent graduates combining mentorship, hands-on projects, and career development. Competitive salary and benefits.",
        level: "Entry Level",
      },
      {
        title: "Technical Internship",
        description:
          "6-month internships in software development, data science, cloud infrastructure, and product design. Potential for full-time conversion.",
        level: "Student",
      },
      {
        title: "Tech Mentorship",
        description:
          "One-on-one mentorship from senior engineers and product leaders. Open to all, free of charge. Monthly group sessions and quarterly summits.",
        level: "All Levels",
      },
      {
        title: "Innovation Challenges",
        description:
          "Annual hackathons and innovation competitions. Winners receive funding, mentorship, and potential acquisition opportunities.",
        level: "All Levels",
      },
    ],
    testimonials: [
      {
        quote:
          "TechCorp gave me my first opportunity in tech. The mentorship I received shaped my entire career trajectory. Now I'm leading a team of engineers.",
        author: "Amara Okafor",
        role: "Senior Software Engineer",
      },
      {
        quote:
          "The graduate program was transformative. I went from bootcamp grad to confident technologist in 2 years. Highly recommend.",
        author: "Chisom Nwosu",
        role: "Product Manager",
      },
    ],
    contact: "careers@techcorpafrica.com",
  },
}

export default function PartnerDetailPage({ params }: { params: { id: string } }) {
  const partner = partnerData[params.id] || partnerData["1"]

  return (
    <main className="min-h-screen bg-background">
      <Navigation />

      {/* Back Button */}
      <div className="bg-card border-b border-border sticky top-16 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/partners"
            className="inline-flex items-center gap-2 text-secondary hover:text-primary transition-colors font-bold"
          >
            <ArrowLeft size={20} /> Back to Partners
          </Link>
        </div>
      </div>

      {/* Header */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-card border-b border-border">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8 items-start">
          <div className="w-32 h-32 bg-primary rounded-sm flex items-center justify-center flex-shrink-0">
            <span className="text-primary-foreground font-bold text-4xl">{partner.logo}</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-secondary uppercase tracking-wider mb-2">{partner.category}</p>
            <h1 className="text-5xl font-bold text-foreground mb-2">{partner.name}</h1>
            <p className="text-xl italic text-foreground/70 mb-6">{partner.tagline}</p>
            <p className="text-lg text-foreground/80 leading-relaxed">{partner.description}</p>
          </div>
        </div>
      </section>

      {/* Key Info */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 border border-border rounded-sm">
            <p className="text-sm font-bold text-secondary mb-2">IMPACT</p>
            <p className="text-lg font-bold text-foreground">{partner.impact}</p>
          </div>
          <div className="p-6 border border-border rounded-sm">
            <div className="flex items-start gap-3 mb-3">
              <MapPin size={20} className="text-secondary flex-shrink-0 mt-1" />
              <div>
                <p className="text-sm font-bold text-secondary mb-2">LOCATIONS</p>
                <p className="text-foreground">{partner.locations.join(", ")}</p>
              </div>
            </div>
          </div>
          <div className="p-6 border border-border rounded-sm">
            <div className="flex items-start gap-3">
              <Globe size={20} className="text-secondary flex-shrink-0 mt-1" />
              <div>
                <p className="text-sm font-bold text-secondary mb-2">WEBSITE</p>
                <a href={`https://${partner.website}`} className="text-primary hover:underline">
                  {partner.website}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold mb-6">Our Vision</h2>
          <p className="text-lg leading-relaxed">{partner.vision}</p>
        </div>
      </section>

      {/* Opportunities */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-card">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-foreground">Opportunities at {partner.name}</h2>
          <div className="space-y-8">
            {partner.opportunities.map((opp, idx) => (
              <div
                key={idx}
                className="bg-background p-8 rounded-sm border border-border hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-foreground mb-2">{opp.title}</h3>
                    <p className="inline-block px-3 py-1 bg-muted text-foreground text-sm font-bold rounded">
                      {opp.level}
                    </p>
                  </div>
                </div>
                <p className="text-foreground/80 leading-relaxed mb-6">{opp.description}</p>
                <button className="bg-secondary text-secondary-foreground px-6 py-2 rounded-sm font-bold hover:opacity-90 transition-opacity">
                  Learn More & Apply
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-foreground">Stories from Our Community</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {partner.testimonials.map((testimonial, idx) => (
              <div key={idx} className="p-8 border border-border rounded-sm bg-card">
                <p className="text-lg italic text-foreground/80 mb-6">"{testimonial.quote}"</p>
                <div>
                  <p className="font-bold text-foreground">{testimonial.author}</p>
                  <p className="text-sm text-foreground/60">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-secondary">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6 text-secondary-foreground">Ready to Explore Opportunities?</h2>
          <p className="text-lg text-secondary-foreground/90 mb-8">
            Get in touch with {partner.name} directly or browse all available opportunities.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={`mailto:${partner.contact}`}
              className="bg-primary text-primary-foreground px-8 py-3 rounded-sm font-bold hover:opacity-90 transition-opacity"
            >
              Contact {partner.name}
            </a>
            <Link
              href="/agenda"
              className="border-2 border-secondary-foreground text-secondary-foreground px-8 py-3 rounded-sm font-bold hover:bg-secondary-foreground/10 transition-colors"
            >
              See Their Sessions
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}

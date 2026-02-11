import { Link } from "react-router-dom";
import { CalendarHeart, Phone, MapPin, Clock, Star, Shield, Users, Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import heroImage from "@/assets/hero-clinic.jpg";

const services = [
  {
    icon: Smile,
    title: "Ortodoncia",
    description: "Brackets metálicos, estéticos y alineadores invisibles para una sonrisa perfecta.",
  },
  {
    icon: Shield,
    title: "Odontología General",
    description: "Limpiezas, restauraciones, endodoncias y cuidado preventivo integral.",
  },
  {
    icon: Star,
    title: "Estética Dental",
    description: "Blanqueamiento, carillas y diseño de sonrisa con tecnología de vanguardia.",
  },
  {
    icon: Users,
    title: "Odontopediatría",
    description: "Atención especializada para los más pequeños en un ambiente cálido y amigable.",
  },
];

const testimonials = [
  {
    name: "María G.",
    text: "Excelente atención, me sentí muy cómoda desde la primera consulta. ¡Mi sonrisa cambió por completo!",
    rating: 5,
  },
  {
    name: "Carlos R.",
    text: "Profesionales de primer nivel. El tratamiento de ortodoncia fue rápido y sin complicaciones.",
    rating: 5,
  },
  {
    name: "Ana P.",
    text: "El mejor lugar para llevar a mis hijos. Las doctoras son muy pacientes y cariñosas.",
    rating: 5,
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="border-b border-border bg-card/90 backdrop-blur-sm sticky top-0 z-20">
        <div className="container max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <CalendarHeart className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold font-display text-foreground">
              Clínica Orthodonto
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#servicios" className="hover:text-foreground transition-colors">Servicios</a>
            <a href="#nosotros" className="hover:text-foreground transition-colors">Nosotros</a>
            <a href="#testimonios" className="hover:text-foreground transition-colors">Testimonios</a>
            <a href="#contacto" className="hover:text-foreground transition-colors">Contacto</a>
          </nav>
          <Button asChild size="sm">
            <Link to="/agendar">Agendar Cita</Link>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Interior moderno de la Clínica Orthodonto"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/40" />
        </div>
        <div className="relative container max-w-6xl mx-auto px-4 py-24 md:py-36">
          <div className="max-w-xl">
            <h1 className="text-4xl md:text-5xl font-bold font-display text-foreground leading-tight mb-4">
              Tu sonrisa perfecta comienza aquí
            </h1>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              En Clínica Orthodonto combinamos tecnología avanzada con un trato humano y cercano
              para ofrecerte la mejor experiencia en salud dental.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild size="lg" className="text-base px-8">
                <Link to="/agendar">
                  <CalendarHeart className="w-5 h-5 mr-2" />
                  Agendar Cita
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-base">
                <a href="#servicios">Conocer Servicios</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-primary text-primary-foreground py-10">
        <div className="container max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: "10+", label: "Años de experiencia" },
            { value: "5,000+", label: "Pacientes atendidos" },
            { value: "98%", label: "Satisfacción" },
            { value: "2", label: "Especialistas" },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-3xl md:text-4xl font-bold font-display">{stat.value}</p>
              <p className="text-sm opacity-85 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Services */}
      <section id="servicios" className="py-20">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-display text-foreground mb-3">
              Nuestros Servicios
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Ofrecemos una atención integral para toda la familia con los más altos estándares.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service) => (
              <Card key={service.title} className="group hover:shadow-md transition-shadow border-border">
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                    <service.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-semibold font-display text-foreground mb-2">{service.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="nosotros" className="py-20 bg-muted/50">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold font-display text-foreground mb-4">
                ¿Por qué elegirnos?
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Con más de 10 años de trayectoria, nos hemos consolidado como referentes en
                ortodoncia y salud dental. Nuestro equipo de especialistas se mantiene en constante
                actualización para brindarte tratamientos con tecnología de punta.
              </p>
              <ul className="space-y-3">
                {[
                  "Equipos de última generación",
                  "Protocolos de bioseguridad certificados",
                  "Planes de financiamiento flexibles",
                  "Atención personalizada y sin prisas",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-foreground">
                    <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                      <Star className="w-3 h-3 text-accent-foreground" />
                    </div>
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-card rounded-2xl border border-border p-8 shadow-sm">
              <h3 className="font-semibold font-display text-foreground mb-4 text-lg">Horario de Atención</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Lunes a Viernes</span>
                  <span className="text-foreground font-medium">8:00 AM – 6:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sábados</span>
                  <span className="text-foreground font-medium">8:00 AM – 12:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Domingos</span>
                  <span className="text-foreground font-medium">Cerrado</span>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-border">
                <Button asChild className="w-full">
                  <Link to="/agendar">
                    <CalendarHeart className="w-4 h-4 mr-2" />
                    Reservar tu Cita Ahora
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonios" className="py-20">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-display text-foreground mb-3">
              Lo que dicen nuestros pacientes
            </h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <Card key={t.name} className="border-border">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-3">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-warning text-warning" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed italic">
                    "{t.text}"
                  </p>
                  <p className="text-sm font-semibold text-foreground">{t.name}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact / CTA */}
      <section id="contacto" className="py-20 bg-muted/50">
        <div className="container max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold font-display text-foreground mb-4">
            ¿Lista para tu nueva sonrisa?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Agenda tu cita hoy y da el primer paso hacia la sonrisa que siempre soñaste.
          </p>
          <Button asChild size="lg" className="text-base px-10 mb-10">
            <Link to="/agendar">
              <CalendarHeart className="w-5 h-5 mr-2" />
              Agendar Cita
            </Link>
          </Button>

          <div className="grid sm:grid-cols-3 gap-6 mt-8 max-w-3xl mx-auto">
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Phone className="w-5 h-5 text-primary" />
              </div>
              <p className="text-sm font-medium text-foreground">+58 212-555-0100</p>
              <p className="text-xs text-muted-foreground">Llámanos</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <p className="text-sm font-medium text-foreground">Av. Principal, Centro Médico</p>
              <p className="text-xs text-muted-foreground">Ubícanos</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <p className="text-sm font-medium text-foreground">Lun – Vie: 8am – 6pm</p>
              <p className="text-xs text-muted-foreground">Horario</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8">
        <div className="container max-w-6xl mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            © 2025 Clínica Orthodonto. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}

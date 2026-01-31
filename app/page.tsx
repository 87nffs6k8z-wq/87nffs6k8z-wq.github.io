import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { LinksGrid } from "@/components/LinksGrid";
import { Schedule } from "@/components/Schedule";
import { Highlights } from "@/components/Highlights";
import { Footer } from "@/components/Footer";
import { Container } from "@/components/Container";
import { Section } from "@/components/Section";

export default function Page() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Container>
          <Section id="links" title="Access Nodes" subtitle="Official outbound channels">
            <LinksGrid />
          </Section>

          <Section id="schedule" title="Broadcast Schedule" subtitle="Operational hours (subject to market volatility)">
            <Schedule />
          </Section>

          <Section id="highlights" title="Highlights" subtitle="Curated assets from the G Corp archive">
            <Highlights />
          </Section>
        </Container>
      </main>
      <Footer />
    </>
  );
}
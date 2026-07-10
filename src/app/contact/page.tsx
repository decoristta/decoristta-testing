import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Contact Us | Decoristta",
  description: "Get in touch with Decoristta.",
};

export default function ContactPage() {
  return (
    <>
      <Header />
      <main style={{ backgroundColor: 'var(--color-light-bg)', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem' }}>
        <div style={{ maxWidth: '600px', width: '100%', textAlign: 'center', backgroundColor: 'white', padding: '4rem', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '3rem', color: 'var(--color-text-dark)', marginBottom: '1.5rem' }}>
            Contact Us
          </h1>
          <p style={{ color: '#555', fontFamily: 'var(--font-sans)', fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '2rem' }}>
            We'd love to hear from you. Whether you have a question about our products, need assistance with an order, or just want to share your styling stories, our team is ready to help.
          </p>
          
          <div style={{ borderTop: '1px solid #eaeaea', paddingTop: '2rem', marginTop: '2rem' }}>
            <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '1.2rem', color: 'var(--color-text-dark)', marginBottom: '0.5rem', fontWeight: 500 }}>
              Email Us
            </h3>
            <a 
              href="mailto:info@decoristta.com" 
              style={{ fontSize: '1.3rem', color: 'var(--color-gold)', textDecoration: 'none', fontWeight: 600, transition: 'color 0.2s' }}
            >
              info@decoristta.com
            </a>
            <p style={{ color: '#888', fontSize: '0.9rem', marginTop: '1rem' }}>
              We aim to respond to all inquiries within 24-48 business hours.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

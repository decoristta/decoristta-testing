import Image from "next/image";
import styles from "./page.module.css";

export const metadata = {
  title: "About Us | Decoristta",
  description: "Every home has a story. We simply help you tell yours. Learn about Decoristta and our journey.",
};

export default function AboutPage() {
  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <div className={styles.heroBackground}>
          <Image 
            src="/images/hero-1.png" 
            alt="Beautiful Home Interior" 
            fill 
            className={styles.heroImage} 
            priority
          />
          <div className={styles.heroOverlay} />
        </div>
        <div className={styles.heroContent}>
          <h1 className={styles.title}>Our Story</h1>
          <p className={styles.subtitle}>Every home has a story. We simply help you tell yours.</p>
        </div>
      </section>

      <section className={styles.storySection}>
        <div className={styles.container}>
          <div className={styles.textContent}>
            <p className={styles.leadParagraph}>
              Some homes make you pause the moment you walk in. Not because they&apos;re the biggest or the most expensive—but because every corner feels intentional. A vase placed just right. A clock that quietly becomes the heart of the room. A candle holder that catches the evening light. The smallest details often leave the biggest impression.
            </p>
            
            <p>That belief is what inspired <strong>Decoristta</strong>.</p>
            
            <p>
              We created Decoristta for people who believe a home is more than four walls. It&apos;s where laughter echoes through hallways, celebrations become memories, quiet mornings begin, and ordinary moments become unforgettable.
            </p>
            
            <h2 className={styles.sectionHeading}>To us, home décor isn&apos;t about filling empty spaces. It&apos;s about creating a feeling.</h2>
            
            <p>
              Every piece we curate is chosen with purpose—balancing timeless elegance, modern design, exceptional craftsmanship, and everyday functionality. We spend countless hours selecting products that don&apos;t just look beautiful, but feel like they belong in homes where stories are constantly unfolding.
            </p>
            
            <p>
              Whether it&apos;s a statement clock that transforms a blank wall, a sculptural showpiece that sparks conversation, or a carefully crafted vase that brightens a forgotten corner, every Decoristta piece is meant to become a part of your everyday life.
            </p>
          </div>
        </div>
      </section>

      <section className={styles.visionSection}>
        <div className={styles.container}>
          <div className={styles.visionBox}>
            <h2 className={styles.visionTitle}>Luxury lives in thoughtful details.</h2>
            <p>It lives in the warmth of a beautifully styled home.<br/>In the comfort of spaces that reflect your personality.<br/>In the joy of walking into a room that truly feels like yours.</p>
            
            <div className={styles.divider} />
            
            <p className={styles.visionText}>
              Our vision is simple—to make beautifully curated, premium home décor accessible to those who appreciate timeless design and meaningful living.
            </p>
            <p className={styles.strongText}>At Decoristta, we don&apos;t just sell home décor.</p>
            <p className={styles.strongText}>We help you create spaces you&apos;ll love coming home to.</p>
            <p className={styles.strongText}>Because every beautiful home begins with a story.</p>
            <p className={styles.strongText}>And we&apos;d be honoured to become a small part of yours.</p>
            
            <p className={styles.welcome}>Welcome to Decoristta.<br/>Style Your Story.</p>
          </div>
        </div>
      </section>

      <section className={styles.foundersSection}>
        <div className={styles.container}>
          <div className={styles.grid}>
            <div className={styles.imageColumn}>
              <div className={styles.founderImageContainer}>
                <Image src="/images/hero-2.png" alt="Founders Inspiration" fill className={styles.founderImage} />
              </div>
            </div>
            <div className={styles.textColumn}>
              <h2 className={styles.foundersTitle}>Our Founders&apos; Story</h2>
              <h3 className={styles.foundersSubtitle}>A decade of friendship. One shared dream.</h3>
              
              <p>Some businesses begin with market research. Ours began with conversations.</p>
              
              <p>Long before Decoristta existed, there were simply two friends who shared a love for beautiful homes, thoughtful interiors, and the little details that make a space feel warm, welcoming, and personal.</p>
              
              <p>For more than ten years, our friendship has been built on countless conversations over coffee, endless ideas, shared dreams, and a mutual appreciation for timeless design. We found ourselves constantly exchanging inspiration, discovering unique décor pieces, imagining beautifully styled homes, and dreaming about creating something meaningful together.</p>
              
              <p>Slowly, that dream became impossible to ignore.</p>
              
              <p>We noticed that while beautiful home décor existed, finding thoughtfully curated pieces that combined elegance, quality, and affordability wasn&apos;t always easy. We wanted to build a brand that made premium décor feel approachable—where every product was chosen with intention rather than simply added to a catalogue.</p>
              
              <p>And so, <strong>Decoristta</strong> was born.</p>
              
              <p>As founders, we each bring different strengths to the table, but we share one common vision: to create collections that inspire beautiful living.</p>
              
              <p>Every product you see has been carefully selected as if it were going into our own homes. If it doesn&apos;t meet our standards for quality, craftsmanship, design, and timeless appeal, it doesn&apos;t become a part of Decoristta.</p>
              
              <p>Our journey is still in its early chapters, and every order, every message, every customer who chooses Decoristta becomes a part of our story.</p>
              
              <p className={styles.closing}>More than anything, we hope that the pieces we curate become part of yours.<br/><br/>Years from now, we hope you&apos;ll look at a clock on your wall, a vase on your console, or a candle holder glowing on a quiet evening and remember not just where you bought it—but the memories created around it.<br/><br/>That is the home we dream of helping you build.<br/><br/>Thank you for believing in us.<br/>Thank you for supporting a dream built on friendship, trust, and a shared love for beautiful homes.<br/><br/>Welcome to the Decoristta family.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

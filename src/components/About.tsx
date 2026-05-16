import { LineageTimeline } from './LineageTimeline'
import { Arsenal } from './Arsenal'

export function About() {
  return (
    <section id="about" className="deck-section">
      <div className="bio-section">
        <div className="bio-left">
          <h1 className="bio-heading">
            Building systems
            <br />
            that <em>reason.</em>
          </h1>
          <blockquote className="bio-quote">
            “I build intelligent systems that understand language, reason across documents,
            and make decisions at scale.”
          </blockquote>
          <p className="bio-para">
            With a foundation in deep learning and a focus on Large Language Models, I bridge
            the gap between academic research and production-grade AI. My work in Dubai’s
            thriving tech ecosystem involves architecting scalable data pipelines and
            deploying generative agents that solve complex enterprise challenges.
          </p>
          <p className="bio-para">
            I believe AI should not be a black box but a transparent, reasoning partner. My
            approach combines rigorous statistical methods with the latest advances in neural
            architectures to ensure precision and reliability in every deployment.
          </p>
        </div>

        <LineageTimeline />
      </div>

      <Arsenal />
    </section>
  )
}

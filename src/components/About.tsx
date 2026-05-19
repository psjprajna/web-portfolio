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
            “I build AI systems that ship — to federal infrastructure, frontier-model
            training pipelines, and real users.”
          </blockquote>
          <p className="bio-para">
            AI/ML Engineer with direct experience inside OpenAI&rsquo;s frontier LLM
            training pipeline (SFT + RLHF/PPO/DPO at Scale AI) and 3+ years building
            production AI systems on U.S. federal infrastructure for the U.S. Department of
            Transportation / NHTSA.
          </p>
          <p className="bio-para">
            Specialise in RAG pipeline engineering (hybrid retrieval, RAGAS evaluation,
            LangFuse observability), multi-agent architectures (LangGraph, ReAct), and
            end-to-end MLOps from MLflow tracking to drift monitoring and FastAPI
            deployment. Now Dubai-based, available immediately.
          </p>
        </div>

        <LineageTimeline />
      </div>

      <Arsenal />
    </section>
  )
}

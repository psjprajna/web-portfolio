export function Arsenal() {
  return (
    <div className="arsenal-section">
      <div>
        <p className="arsenal-label">Arsenal</p>
        <div className="arsenal-heading-row">
          <h2 className="arsenal-title">Technical Stack</h2>
          <span className="arsenal-sub">Tools of the trade &amp; expertise areas</span>
        </div>
        <div className="arsenal-rule" />
      </div>

      <div className="skill-grid">
        <SkillCard
          dot="d-gold"
          eyebrow="GenAI"
          num="01"
          title="LLM & GenAI"
          keywords="LangChain, LlamaIndex, Claude API, OpenAI API, Prompt Engineering"
          icon={
            <svg className="card-icon" viewBox="0 0 24 24">
              <circle cx="4" cy="12" r="2" />
              <circle cx="20" cy="7" r="2" />
              <circle cx="20" cy="17" r="2" />
              <circle cx="12" cy="12" r="2.5" />
              <line x1="6" y1="12" x2="9.5" y2="12" />
              <line x1="14.5" y1="11.5" x2="18.1" y2="8" />
              <line x1="14.5" y1="12.5" x2="18.1" y2="16" />
            </svg>
          }
        />
        <SkillCard
          dot="d-ink"
          eyebrow="Core ML"
          num="02"
          title="ML & Deep Learning"
          keywords="PyTorch, TensorFlow, Scikit-learn, Transformers, Computer Vision, NLP"
          icon={
            <svg className="card-icon" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          }
        />
        <SkillCard
          dot="d-terra"
          eyebrow="Ops"
          num="03"
          title="MLOps"
          keywords="Docker, Kubernetes, MLflow, DVC, AWS/GCP AI Platform, CI/CD for ML"
          icon={
            <svg className="card-icon" viewBox="0 0 24 24">
              <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
              <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
              <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
            </svg>
          }
        />
        <SkillCard
          dot="d-ink"
          eyebrow="Data"
          num="04"
          title="Data Engineering"
          keywords="Apache Spark, SQL, NoSQL, Airflow, ETL Pipelines, Snowflake"
          icon={
            <svg className="card-icon" viewBox="0 0 24 24">
              <ellipse cx="12" cy="5" rx="8" ry="2.5" />
              <path d="M4 5v4c0 1.38 3.58 2.5 8 2.5s8-1.12 8-2.5V5" />
              <path d="M4 13c0 1.38 3.58 2.5 8 2.5s8-1.12 8-2.5V9" />
              <path d="M4 17c0 1.38 3.58 2.5 8 2.5s8-1.12 8-2.5v-4" />
            </svg>
          }
        />
        <SkillCard
          dot="d-gold"
          eyebrow="Retrieval"
          num="05"
          title="Retrieval & RAG"
          keywords="pgvector, Azure AI Search, Pinecone, Milvus, Embedding Models"
          icon={
            <svg className="card-icon" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
              <line x1="8" y1="11" x2="14" y2="11" />
              <line x1="11" y1="8" x2="11" y2="14" />
            </svg>
          }
        />
        <SkillCard
          dot="d-terra"
          eyebrow="Infra"
          num="06"
          title="Cloud & Infra"
          keywords="Azure, Cloudflare Workers, Supabase, Docker, FastAPI"
          icon={
            <svg className="card-icon" viewBox="0 0 24 24">
              <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
            </svg>
          }
        />
      </div>
    </div>
  )
}

interface SkillCardProps {
  dot: 'd-gold' | 'd-ink' | 'd-terra'
  eyebrow: string
  num: string
  title: string
  keywords: string
  icon: React.ReactNode
}

function SkillCard({ dot, eyebrow, num, title, keywords, icon }: SkillCardProps) {
  return (
    <div className="skill-card">
      <div className="card-top-row">
        <div className="card-dot-wrap">
          <span className={`card-dot ${dot}`} aria-hidden="true" />
          <span className="card-dot-label">{eyebrow}</span>
        </div>
        <span className="card-num">{num}</span>
      </div>
      {icon}
      <p className="card-cat">{title}</p>
      <p className="card-kw">{keywords}</p>
    </div>
  )
}

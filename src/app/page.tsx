import Link from "next/link";

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-24 text-center">
        <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 text-sm text-slate-500 dark:text-slate-400 mb-8 animate-fade-in shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          New: Automated allocation now live for 2025/26
        </div>

        <h1 className="text-gradient font-display font-bold text-5xl md:text-7xl leading-[1.1] mb-6 animate-fade-in">
          Modern Dormitory<br />Allocation for CTBE
        </h1>

        <p className="text-slate-600 dark:text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 animate-fade-in-delay">
          Say goodbye to manual errors and delays. Experience a transparent,
          automated, and fair way to manage student housing at the College of
          Technology and Built Environment.
        </p>

        <div className="flex items-center justify-center gap-4 animate-fade-in-delay-2">
          <Link href="/portal" className="btn-primary">
            Apply for Housing
          </Link>
          <Link href="/admin" className="btn-ghost">
            Admin Dashboard
          </Link>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-20 animate-fade-in-delay-2">
          {[
            { value: "4,250+", label: "Students Housed" },
            { value: "3", label: "Dormitory Buildings" },
            { value: "170", label: "Total Rooms" },
            { value: "99%", label: "Allocation Accuracy" },
          ].map((stat) => (
            <div key={stat.label} className="glass rounded-2xl p-6 shadow-sm">
              <div className="font-display text-3xl font-bold text-blue-500 dark:text-blue-400 mb-1">{stat.value}</div>
              <div className="text-slate-500 dark:text-slate-400 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="text-center mb-14">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Everything you need for modern dorm management
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            A complete suite of tools for students, administrators, and maintenance staff.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <FeatureCard
            icon="⚡"
            title="Automated Allocation"
            description="Smart assignment based on gender, academic program, and year of study. Prevents overbooking and enforces university policies."
            badge="Core Feature"
            badgeClass="badge-blue"
          />
          <FeatureCard
            icon="📊"
            title="Real-time Tracking"
            description="Instant visibility into room occupancy across all buildings. Admins and students can check availability at any time."
            badge="Live Data"
            badgeClass="badge-green"
          />
          <FeatureCard
            icon="🛠️"
            title="Maintenance Portal"
            description="Submit repair tickets digitally with issue categorization. Staff track progress and close issues with full audit history."
            badge="Ticketing"
            badgeClass="badge-yellow"
          />
          <FeatureCard
            icon="🔒"
            title="Role-based Access"
            description="Separate portals for students, proctors, and administrators. Secure authentication powered by Supabase Auth."
            badge="Security"
            badgeClass="badge-blue"
          />
          <FeatureCard
            icon="⚖️"
            title="Fair & Transparent"
            description="Eliminates bias and privilege in assignments. Every decision is logged for accountability and dispute resolution."
            badge="Compliance"
            badgeClass="badge-green"
          />
          <FeatureCard
            icon="📈"
            title="Reports & Analytics"
            description="Generate occupancy reports, maintenance summaries, and allocation history to support data-driven housing decisions."
            badge="Insights"
            badgeClass="badge-yellow"
          />
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="glass rounded-3xl p-10 md:p-16 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <div className="w-64 h-64 border-[32px] border-blue-500 rounded-full" />
          </div>
          
          <h2 className="font-display text-3xl font-bold mb-12 text-center">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: "01", title: "Register", desc: "Create your account with your university Student ID." },
              { step: "02", title: "Apply", desc: "Submit your housing application with building and floor preferences." },
              { step: "03", title: "Get Allocated", desc: "The system assigns you a room based on availability and your profile." },
              { step: "04", title: "Move In", desc: "Receive your room details and move in. Report any issues through the portal." },
            ].map((item) => (
              <div key={item.step} className="text-center relative z-10">
                <div className="text-blue-500 dark:text-blue-400 font-display text-5xl font-bold opacity-20 mb-3">{item.step}</div>
                <h3 className="font-display font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  badge,
  badgeClass,
}: {
  icon: string;
  title: string;
  description: string;
  badge: string;
  badgeClass: string;
}) {
  return (
    <div className="glass glass-hover rounded-2xl p-7 flex flex-col gap-4 cursor-default shadow-sm group">
      <div className="text-4xl group-hover:scale-110 transition-transform duration-300 w-fit">{icon}</div>
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display font-semibold text-xl">{title}</h3>
        <span className={badgeClass}>{badge}</span>
      </div>
      <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{description}</p>
    </div>
  );
}


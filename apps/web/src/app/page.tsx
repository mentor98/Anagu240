import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
      <div className="max-w-2xl mx-auto text-center px-6">
        {/* Logo / Brand */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-white tracking-tight">Anagu</h1>
          <p className="text-primary-light mt-2 text-lg font-medium">
            Land Administration Framework
          </p>
        </div>

        {/* Description */}
        <p className="text-blue-100 text-base mb-10 leading-relaxed">
          An integrated Blockchain–GIS–NFT–Community Verification Oracle–MQTT
          framework for land title registration, verification, and lawful revocation
          under Nigeria's Land Use Act (1978).
        </p>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/dashboard"
            className="btn-secondary text-center text-base px-8 py-3"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/(auth)/login"
            className="bg-white text-primary px-8 py-3 rounded-lg font-medium
                       hover:bg-blue-50 transition-colors text-center text-base"
          >
            Sign In
          </Link>
        </div>

        {/* System status cards */}
        <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "GIS Verification",    icon: "🗺️",  desc: "Spatial parcel validation" },
            { label: "NFT Titles",           icon: "🏛️",  desc: "Blockchain tokenisation" },
            { label: "Oracle",               icon: "🔍",  desc: "Ownership verification" },
            { label: "MQTT Sync",            icon: "📡",  desc: "Real-time events" },
          ].map((item) => (
            <div
              key={item.label}
              className="bg-white/10 backdrop-blur rounded-xl p-4 text-white"
            >
              <div className="text-2xl mb-2">{item.icon}</div>
              <div className="text-sm font-semibold">{item.label}</div>
              <div className="text-xs text-blue-200 mt-1">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

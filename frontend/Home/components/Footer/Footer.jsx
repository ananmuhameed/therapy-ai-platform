export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-[rgb(var(--primary))] via-blue-400 to-blue-300 text-white pt-16 pb-8 px-6 transition-colors">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">

        {/* Brand */}
        <div>
          <h2 className="text-2xl font-semibold  bg-clip-text text-white">
            TherapyAi
          </h2>
          <p className="mt-4 text-sm text-blue-100 leading-relaxed">
            A secure, modern platform connecting patients with licensed therapists
            using cutting-edge technology.
          </p>
        </div>

        {/* Links */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-white">Platform</h3>
          <ul className="space-y-2 text-sm text-blue-100">
            <li className="hover:text-white cursor-pointer">Home</li>
            <li className="hover:text-white cursor-pointer">Plans</li>
            <li className="hover:text-white cursor-pointer">Security</li>
            <li className="hover:text-white cursor-pointer">About Us</li>
          </ul>
        </div>

        {/* Resources */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-white">Resources</h3>
          <ul className="space-y-2 text-sm text-blue-50">
            <li className="hover:text-white cursor-pointer">Help Center</li>
            <li className="hover:text-white cursor-pointer">Privacy Policy</li>
            <li className="hover:text-white cursor-pointer">Terms of Service</li>
            <li className="hover:text-white cursor-pointer">Contact</li>
          </ul>
        </div>

        {/* Suggestions / Complaints */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-white">Your Feedback</h3>
          <p className="text-sm text-blue-50 mb-3">
            Have a suggestion or complaint? We’d love to hear from you.
          </p>

          <textarea
            rows="3"
            placeholder="Write your message..."
            className="w-full px-4 py-2 rounded-lg bg-white text-slate-900 outline-none resize-none mb-3"
          />

          <button className="w-full bg-black/20 hover:bg-black/30 py-2 rounded-2xl text-white transition">
            Send
          </button>
        </div>

      </div>

      {/* Divider */}
      <div className="border-t border-white/20 mt-12 pt-6 text-center text-sm text-white/70">
        © {new Date().getFullYear()} TherapyAi. All rights reserved.
      </div>
    </footer>
  );
}

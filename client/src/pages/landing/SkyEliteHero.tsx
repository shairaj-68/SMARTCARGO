import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const menuItems = ['Start', 'Story', 'Rates', 'Benefits', 'FAQ'];

export default function SkyEliteHero() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="relative h-screen overflow-hidden">

        {/* ── Video Background ── */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_091828_e240eb17-6edc-4129-ad9d-98678e3fd238.mp4"
        />

        {/* Subtle overlay to ensure text legibility without killing the video */}
        <div className="absolute inset-0 bg-white/10" />

        {/* ── Content Wrapper ── */}
        <div className="relative z-10 h-full flex flex-col">

          {/* ── Navigation ── */}
          <nav className="w-full max-w-7xl mx-auto px-8 py-6">
            <div className="flex items-center justify-between">
              {/* Brand */}
              <motion.span
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="text-2xl font-semibold text-gray-900 tracking-tight select-none"
              >
                SkyElite
              </motion.span>

              {/* Desktop nav */}
              <motion.div
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="hidden md:flex items-center gap-8"
              >
                {menuItems.map((item, i) => (
                  <motion.a
                    key={item}
                    href={`#${item.toLowerCase()}`}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * i + 0.3, duration: 0.4 }}
                    className="text-gray-900 hover:text-gray-600 transition-colors text-sm font-medium"
                  >
                    {item}
                  </motion.a>
                ))}
              </motion.div>

              {/* Mobile hamburger */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="md:hidden text-gray-900 hover:text-gray-600 transition-colors p-1"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </motion.button>
            </div>

            {/* Mobile dropdown */}
            <AnimatePresence>
              {mobileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.97 }}
                  transition={{ duration: 0.2 }}
                  className="md:hidden mt-4 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-white/60 overflow-hidden"
                >
                  {menuItems.map((item) => (
                    <a
                      key={item}
                      href={`#${item.toLowerCase()}`}
                      className="block px-6 py-3.5 text-gray-900 hover:text-gray-600 hover:bg-gray-50/80 transition-colors text-sm font-medium border-b border-gray-100 last:border-0"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item}
                    </a>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </nav>

          {/* ── Hero Content ── */}
          <div className="flex-1 flex items-center justify-center -mt-20">
            <div className="text-center px-4">

              {/* Label */}
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.55 }}
                className="text-sm font-semibold text-gray-600 tracking-[0.2em] uppercase mb-5"
              >
                PRIVATE JETS
              </motion.p>

              {/* Main heading */}
              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="text-center leading-none"
              >
                <span className="block text-6xl md:text-7xl lg:text-8xl font-normal text-gray-500 leading-none tracking-tighter">
                  Premium.
                </span>
                <span
                  className="block text-6xl md:text-7xl lg:text-8xl font-normal leading-none tracking-tighter"
                  style={{ color: '#202A36', marginTop: '-10px' }}
                >
                  Accessible.
                </span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.55 }}
                className="text-lg md:text-xl text-gray-600 mt-7 mb-8 max-w-2xl mx-auto"
              >
                Your dedication deserves recognition.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="flex gap-4 justify-center flex-wrap"
              >
                <button className="px-7 py-2.5 rounded-full bg-gray-300 text-gray-800 text-sm font-medium hover:bg-gray-400 transition-colors">
                  Discover
                </button>
                <button
                  className="px-7 py-2.5 rounded-full text-white text-sm font-medium transition-colors"
                  style={{ backgroundColor: '#202A36' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1a2229')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#202A36')}
                >
                  Book Now
                </button>
              </motion.div>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}

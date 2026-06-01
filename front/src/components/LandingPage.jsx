import React, { useState } from 'react';
import { ArrowRight, CheckCircle, BarChart3, Users, MessageSquare, Briefcase, TrendingUp, Globe } from 'lucide-react';
import { useLanguage } from "../context/LanguageContext";

function LandingPage() {

  const {t} = useLanguage();

  const [activeTab, setActiveTab] = useState('graduates');

  const handleSignup = () => {
    window.location.href = '/signup';
  };

  const handleLogin = () => {
    window.location.href = '/login';
  };

  const handleAbout = () => {
    window.location.href = '/about';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950  m-0 p-0">
      {/* Navigation Header */}
      {/* <nav className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">MS</span>
              </div>
              <h1 className="text-2xl font-bold text-white">MySaarthi</h1>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handleLogin}
                className="px-6 py-2 text-white hover:text-blue-400 transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={handleSignup}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav> */}

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-4 pb-20 min-h-screen flex items-center">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-1 sm:px-6 lg:px-8 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8 order-2 lg:order-1">
              <div className="space-y-6">
                {/* <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/20 to-blue-400/10 border border-blue-500/40 rounded-full hover:border-blue-400/60 transition-all duration-300">
                  <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
                  <span className="text-blue-300 font-semibold text-sm">Trusted by 5000+ Graduates</span>
                </div> */}

                <h1 className="text-6xl sm:text-7xl font-black text-white leading-tight tracking-tight">
                 {t.l2}
                  <span className="block bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-600 bg-clip-text text-transparent drop-shadow-lg">{t.l3}</span>
                  <span className="text-white">{t.l4}</span>
                </h1>

                <p className="text-lg text-gray-300 leading-relaxed max-w-lg">
                  {t.l1}
                </p>

                <div className="space-y-4 pt-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-500/30 flex items-center justify-center">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    </div>
                    <span className="text-gray-300">{t.l5}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-500/30 flex items-center justify-center">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    </div>
                    <span className="text-gray-300">{t.l6}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-500/30 flex items-center justify-center">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    </div>
                    <span className="text-gray-300">{t.l7}</span>
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-8">
                <button
                  onClick={handleSignup}
                  className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold rounded-lg shadow-xl hover:shadow-2xl hover:shadow-blue-500/40 transition-all duration-300 transform hover:scale-105 relative overflow-hidden"
                >
                  <span className="relative z-10">{t.l8}</span>
                  <ArrowRight size={20} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
                <button
                  onClick={handleLogin}
                  className="inline-flex items-center justify-center px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg border-2 border-white/20 hover:border-white/40 transition-all duration-300 backdrop-blur-sm"
                >
                  {t.l9}
                </button>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/10">
                <div className="space-y-1">
                  <div className="text-4xl font-black bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent">5000+</div>
                  <p className="text-xs sm:text-sm text-gray-400 font-medium">{t.l10}</p>
                </div>
                <div className="space-y-1">
                  <div className="text-4xl font-black bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent">92%</div>
                  <p className="text-xs sm:text-sm text-gray-400 font-medium">{t.l11}</p>
                </div>
                <div className="space-y-1">
                  <div className="text-4xl font-black bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent">200+</div>
                  <p className="text-xs sm:text-sm text-gray-400 font-medium">{t.l12}</p>
                </div>
              </div>
            </div>

            {/* Right Visual - Hero Cards */}
            <div className="relative h-96 sm:h-[500px] order-1 lg:order-2 hidden lg:block perspective">
              {/* Main Card - Center */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-72 h-80 bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl p-8 shadow-2xl border border-slate-600 hover:border-blue-500/50 transition-all duration-500 hover:shadow-blue-500/20 hover:shadow-2xl transform hover:-translate-y-2 group">
                  <div className="space-y-6 h-full flex flex-col justify-between">
                    <div>
                      <div className="text-5xl mb-4">📊</div>
                      <h4 className="font-bold text-white text-xl mb-2">{t.l13}</h4>
                      <p className="text-gray-400 text-sm mb-4">{t.l14}</p>
                    </div>
                    <div className="space-y-3">
                      <div className="w-full bg-slate-600 rounded-full h-2">
                        <div className="bg-gradient-to-r from-blue-400 to-blue-500 h-2 rounded-full w-4/5"></div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-blue-300 font-semibold">{t.l15}</span>
                        <span className="text-2xl font-black text-blue-400">85%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Interest Score Card - Top Right */}
              <div className="absolute top-0 right-0 w-64 h-72 bg-gradient-to-br from-blue-600/20 to-slate-800 rounded-2xl p-6 shadow-xl border border-blue-500/30 hover:border-blue-400/60 transition-all duration-500 hover:shadow-blue-500/30 transform hover:-translate-y-3 hover:scale-105">
                <div className="space-y-4 h-full flex flex-col justify-between">
                  <div>
                    <div className="text-4xl mb-3">❤️</div>
                    <h4 className="font-bold text-white text-lg mb-1">{t.l16}</h4>
                    <p className="text-gray-300 text-xs">{t.l17}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm text-gray-300">{t.l18}</div>
                    <div className="w-full bg-slate-600/50 rounded-full h-2">
                      <div className="bg-gradient-to-r from-cyan-400 to-blue-500 h-2 rounded-full w-3/4"></div>
                    </div>
                    <div className="text-right text-blue-300 font-semibold text-sm">78%</div>
                  </div>
                </div>
              </div>

              {/* Growth Path Card - Bottom Left */}
              <div className="absolute bottom-0 left-0 w-64 h-72 bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl p-6 shadow-xl border border-slate-600 hover:border-emerald-500/50 transition-all duration-500 hover:shadow-emerald-500/20 transform hover:translate-y-3 hover:scale-105">
                <div className="space-y-4 h-full flex flex-col justify-between">
                  <div>
                    <div className="text-4xl mb-3">🚀</div>
                    <h4 className="font-bold text-white text-lg mb-1">{t.l19}</h4>
                    <p className="text-gray-300 text-xs">{t.l20}</p>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-slate-600/50 rounded-lg p-3 border border-slate-500">
                      <p className="text-white font-semibold text-sm mb-1">{t.l21}</p>
                      <p className="text-emerald-300 text-xs">{t.l22}</p>
                    </div>
                    <button className="w-full py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded-lg text-xs font-semibold transition-colors">
                      {t.l23}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Introduction */}
      <section className="py-20 bg-slate-800/30 border-t border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">{t.l24}</h2>
            <p className="text-xl text-gray-400">{t.l25}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-8 border border-slate-700 hover:border-blue-500/50 transition-all duration-300">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <BarChart3 size={24} className="text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-white">{t.l13}</h3>
              </div>
              <p className="text-gray-400">{t.l26}</p>
            </div>

            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-8 border border-slate-700 hover:border-blue-500/50 transition-all duration-300">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <TrendingUp size={24} className="text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-white">{t.l27}</h3>
              </div>
              <p className="text-gray-400">{t.l28}</p>
            </div>

            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-8 border border-slate-700 hover:border-blue-500/50 transition-all duration-300">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <MessageSquare size={24} className="text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-white">{t.l29}</h3>
              </div>
              <p className="text-gray-400">{t.l30}</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">{t.l31}</h2>
            <p className="text-xl text-gray-400">{t.l32}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { 
                num: '01', 
                title: t.l35, 
                desc: t.l36,
                icon: '📋'
              },
              { 
                num: '02', 
                title: t.l37, 
                desc: t.l38,
                icon: '✏️'
              },
              { 
                num: '03', 
                title: t.l39, 
                desc: t.l40,
                icon: '📊'
              },
              { 
                num: '04', 
                title: t.l41, 
                desc: t.l42,
                icon: '👨‍💼'
              }
            ].map((step, idx) => (
              <div key={idx} className="relative group">
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-8 border border-slate-700 hover:border-blue-500/50 transition-all duration-300 h-full">
                  <div className="text-5xl mb-4">{step.icon}</div>
                  <div className="text-3xl font-bold text-blue-400 mb-3">{step.num}</div>
                  <h3 className="text-lg font-semibold text-white mb-3">{step.title}</h3>
                  <p className="text-gray-400 text-sm">{step.desc}</p>
                </div>
                {idx < 3 && <div className="hidden lg:flex absolute -right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-blue-500/20 rounded-full items-center justify-center text-blue-400">→</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Target Audience Tabs */}
      <section className="py-20 bg-slate-800/30 border-t border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">{t.l33}</h2>
            <p className="text-xl text-gray-400">{t.l34}</p>
          </div>

          {/* Tab Buttons */}
          <div className="flex gap-4 mb-12 justify-center flex-wrap">
            {[
              { id: 'graduates', label: t.l43 },
              { id: 'mba', label: t.l44 },
              { id: 'career-switch', label: t.l45 }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-12 border border-slate-700">
            {activeTab === 'graduates' && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-white">{t.l43}</h3>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <p className="text-gray-300 mb-6">{t.t15}</p>
                    <ul className="space-y-3">
                      {[
                        t.t16,
                        t.t17,
                        t.t18,
                        t.t19
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <CheckCircle size={20} className="text-blue-400 flex-shrink-0 mt-1" />
                          <span className="text-gray-300">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-slate-900 rounded-lg p-6 border border-slate-600">
                    <h4 className="text-lg font-semibold text-white mb-4">{t.t13}</h4>
                    <div className="space-y-3">
                      {[t.t7, t.t8, t.t9, t.t10, t.t11, t.t12].map((field, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <span className="text-gray-400">{field}</span>
                          <div className="w-24 h-2 bg-slate-700 rounded-full">
                            <div className="h-2 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full" style={{width: `${70 + i * 5}%`}}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'mba' && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-white">{t.l44}</h3>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <p className="text-gray-300 mb-6">{t.t20}</p>
                    <ul className="space-y-3">
                      {[
                        t.t21,
                        t.t22,
                        t.t23,
                        t.t24
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <CheckCircle size={20} className="text-blue-400 flex-shrink-0 mt-1" />
                          <span className="text-gray-300">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-slate-900 rounded-lg p-6 border border-slate-600">
                    <h4 className="text-lg font-semibold text-white mb-4">{t.t13}</h4>
                    <div className="space-y-3">
                      {[t.t1, t.t2, t.t3, t.t4, t.t5, t.t6].map((field, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <span className="text-gray-400">{field}</span>
                          <div className="w-24 h-2 bg-slate-700 rounded-full">
                            <div className="h-2 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full" style={{width: `${75 + i * 4}%`}}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'career-switch' && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-white">{t.l45}</h3>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <p className="text-gray-300 mb-6">{t.t25}</p>
                    <ul className="space-y-3">
                      {[
                        t.t26,
                        t.t27,
                        t.t28,
                        t.t29
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <CheckCircle size={20} className="text-blue-400 flex-shrink-0 mt-1" />
                          <span className="text-gray-300">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-slate-900 rounded-lg p-6 border border-slate-600">
                    <h4 className="text-lg font-semibold text-white mb-4">{t.t14}</h4>
                    <div className="space-y-3">
                      {[t.c14, t.c15, t.c16, t.c17,t.c18,t.c19].map((field, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                          <span className="text-gray-400">{field}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">{t.c1}</h2>
            <p className="text-xl text-gray-400">{t.c2}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: '📊', title: t.l13, desc: t.c3 },
              { icon: '❤️', title: t.c4, desc: t.c5 },
              { icon: '👨‍💼', title: t.c6, desc: t.c7 },
              { icon: '📚', title: t.c8, desc: t.c9 },
              { icon: '🎯', title: t.c10, desc: t.c11 },
              { icon: '🤝', title: t.c12, desc: t.c13 }
            ].map((feature, idx) => (
              <div key={idx} className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-8 border border-slate-700 hover:border-blue-500/50 transition-all duration-300 group hover:shadow-lg hover:shadow-blue-500/10">
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      {/* <section className="py-20 bg-slate-800/30 border-t border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Trusted by Graduates Nationwide</h2>
            <p className="text-xl text-gray-400">Success stories from students and professionals</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: 'Arjun Sharma', role: 'B.Tech Graduate', company: 'Google', quote: 'MySaarthi helped me realize I was better suited for product management than pure development. The clarity score was a game-changer.' },
              { name: 'Priya Desai', role: 'MBA Graduate', company: 'Deloitte', quote: 'The assessment results aligned perfectly with my strengths. The counseling sessions provided invaluable insights for my transition.' },
              { name: 'Rohit Kumar', role: 'Career Switcher', company: 'Startup', quote: 'MySaarthi gave me the confidence to switch from finance to technology. The roadmap and support made the transition smooth.' }
            ].map((testimonial, idx) => (
              <div key={idx} className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-8 border border-slate-700">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-400">★</span>
                  ))}
                </div>
                <p className="text-gray-300 mb-6 italic">"{testimonial.quote}"</p>
                <div className="border-t border-slate-600 pt-4">
                  <p className="font-semibold text-white">{testimonial.name}</p>
                  <p className="text-sm text-gray-400">{testimonial.role} at {testimonial.company}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* FAQ Section */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">{t.l50}</h2>
            {/* <p className="text-xl text-gray-400">Everything you need to know</p> */}
          </div>

          <div className="space-y-6">
            {[
              { q: t.l51, a: t.l52 },
              { q: t.l53, a: t.l54 },
              { q: t.l55, a: t.l56 },
              { q: t.l57, a: t.l58 },
              { q: t.l59, a: t.l60 }
            ].map((faq, idx) => (
              <div key={idx} className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700">
                <h4 className="text-lg font-semibold text-white mb-3">{faq.q}</h4>
                <p className="text-gray-400">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-600/20 to-blue-500/10 border-t border-slate-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">{t.l46}</h2>
          <p className="text-xl text-gray-300 mb-8"> {t.l47} </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleSignup}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-200 transform hover:scale-105"
            >
              <span>{t.l48}</span>
              <ArrowRight size={20} />
            </button>
            <button
              onClick={handleLogin}
              className="inline-flex items-center justify-center px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg border border-slate-600 transition-all duration-200"
            >
              {t.l49}
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-700 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">MS</span>
                </div>
                <h3 className="text-lg font-bold text-white">MySaarthi</h3>
                
              </div>
              {/* <div>
                <h2 className="text-lg font-bold text-white">Mail: contactus@mysaarthi.co</h2>
              </div> */}
              <p className="text-gray-400 text-sm">Career guidance platform for graduates</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-blue-400 transition">Assessments</a></li>
                <li><a href="#" className="hover:text-blue-400 transition">Counseling</a></li>
                <li><a href="#" className="hover:text-blue-400 transition">Resources</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-blue-400 transition">About</a></li>
                <li><a href="#" className="hover:text-blue-400 transition">Blog</a></li>
                <li><a href="#" className="hover:text-blue-400 transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-blue-400 transition">Privacy</a></li>
                <li><a href="#" className="hover:text-blue-400 transition">Terms</a></li>
                <li><a href="#" className="hover:text-blue-400 transition">Disclaimer</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-700 pt-8">
            <p className="text-center text-gray-400 text-sm">© 2026 MySaarthi. All rights reserved. Career guidance is a complement to formal education and professional advice.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
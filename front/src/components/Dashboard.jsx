import React, { useState, useEffect } from "react";
// import AssessmentSection from "./Assignment.jsx"
// import ScoreCard from "./ScoreCard.jsx"
// import AdminMessagesToUser from "../AdminMessagesToUser.jsx";
import { useNavigate } from "react-router-dom";

import { API_BASE } from "../environment.jsx";
import { useLanguage } from "../context/LanguageContext";

function Dashboard() {

  const {t} = useLanguage();
  
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  // console.log("FULL PROFILE:", user);

  // Mock auth token - replace with your actual auth context
  const token = localStorage.getItem("token") || "demo-token";

  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        const [pRes, qRes] = await Promise.all([
          fetch(`${API_BASE}/profiles/me`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE}/questions`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const res = await fetch(`${API_BASE}/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        setUser(data);

        if (pRes.ok) {
          const pData = await pRes.json();
          // console.log("PROFILE FROM API:", pData);
          setProfile(pData);
        }

        if (qRes.ok) {
          const qData = await qRes.json();
          setQuestions(qData);
        }} catch (err) {
          console.error("Dashboard fetch error:", err);
        } finally {
          setLoading(false);
        }
      };

    fetchData();
  }, [token]);

  const navigateToProfile = () => {
    // Replace with your routing logic
    window.location.href = "/profile/create";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="animate-pulse space-y-6">
            <div className="h-48 bg-gray-200 rounded-xl"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 h-96 bg-gray-200 rounded-xl"></div>
              <div className="h-64 bg-gray-200 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
           {t.Welcomeback} {profile?.name}
          </h1>
          <p className="text-lg text-gray-600">
            {t.d1}
          </p>
        </div>

        {profile ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Profile Card */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                
                {/* Banner with Edit Button */}
                <div className="relative">
                  <img
                    src={"https://images.unsplash.com/photo-1557683316-973673baf926"}
                    alt="banner"
                    className="w-full h-48 object-cover"
                  />                
                  <button
                    onClick={navigateToProfile}
                    className="absolute top-4 right-4 bg-white p-2 rounded-full hover:bg-gray-100 transition-colors shadow-lg"
                  >
                    <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                </div>

                <div className="relative pt-20 pb-6 px-6">
                  {/* Avatar */}
                  <img
                    src={"https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                    alt="profile"
                    className="absolute -top-16 left-6 w-28 h-28 rounded-full border-4 border-white shadow-lg object-cover"
                  />

                  {/* Name and Headline */}
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">
                      {profile?.name || user?.name}
                    </h2>
                    <p className="text-gray-600 mb-2">
                      {profile.headline || "Add a professional headline"}
                    </p>
                    <p><b>Email:</b> {user.email}</p>
                    <p><b>Phone:</b> {user.phone}</p>
                    
                    {(profile.city || profile.country) && (
                      <div className="flex items-center gap-1 text-gray-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-sm">
                          {[profile.city, profile.country].filter(Boolean).join(", ")}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* About */}
                  {profile.about && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {profile.about}
                      </p>
                    </div>
                  )}

                  <hr className="my-6" />

                  {/* Profession */}
                  {/* {profile.profession && (                    
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-2">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        
                        <h3 className="text-sm font-bold text-gray-900">Profession</h3>
                      </div>
                      <p className="text-sm text-gray-600">{profile.profession}</p>
                    </div>
                  )} */}

                  {/* Experience */}
                  {Array.isArray(profile.experience) && profile.experience.length > 0 && (
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-3">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <h3 className="text-sm font-bold text-gray-900">{t.experience}</h3>
                      </div>
                      
                      <div className="space-y-4">
                        {profile.experience.map((exp, idx) => (
                          <div 
                            key={exp._id || idx} 
                            className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-600"
                          >
                            <h4 className="font-semibold text-gray-900">{exp.title}</h4>
                            <p className="text-sm text-gray-600">
                              {exp.company} {exp.location && `• ${exp.location}`}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {exp.startDate} – {exp.currentlyWorking ? "Present" : exp.endDate}
                            </p>
                            {exp.description && (
                              <p className="text-sm text-gray-700 mt-2">
                                {exp.description}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Skills */}
                  {profile.skills?.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-sm font-bold text-gray-900 mb-3">{t.skills}</h3>
                      <div className="flex flex-wrap gap-2">
                        {profile.skills.map((skill, i) => (
                          <span 
                            key={i} 
                            className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Interests */}
                  {profile.interests?.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-sm font-bold text-gray-900 mb-3">{t.interests}</h3>
                      <div className="flex flex-wrap gap-2">
                        {profile.interests.map((interest, i) => (
                          <span 
                            key={i} 
                            className="px-3 py-1 border border-gray-300 text-gray-700 rounded-full text-xs font-medium"
                          >
                            {interest}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Education */}
                  {Array.isArray(profile.education) && profile.education.length > 0 && (
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-3">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path d="M12 14l9-5-9-5-9 5 9 5z" />
                          <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                        </svg>
                        <h3 className="text-sm font-bold text-gray-900">{t.education}</h3>
                      </div>
                      
                      <div className="space-y-4">
                        {profile.education.map((edu, idx) => (
                          <div 
                            key={edu._id || idx} 
                            className="bg-gray-50 rounded-lg p-4"
                          >
                            <h4 className="font-semibold text-gray-900">{edu.school}</h4>
                            <p className="text-sm text-gray-600">{edu.degree}</p>
                            {edu.fieldOfStudy && (
                              <p className="text-sm text-gray-500">{edu.fieldOfStudy}</p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                              {edu.startDate} – {edu.endDate || "Present"}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Certifications */}
                  {Array.isArray(profile.certifications) && profile.certifications.length > 0 && (
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-3">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                        <h3 className="text-sm font-bold text-gray-900">{t.certifications}</h3>
                      </div>
                      
                      <div className="space-y-2">
                        {profile.certifications.map((cert, idx) => (
                          <div key={cert._id || idx} className="bg-gray-50 rounded-lg p-3">
                            <p className="font-semibold text-sm text-gray-900">{cert.name}</p>
                            <p className="text-xs text-gray-600">{cert.issuingOrganization}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Projects */}
                  {Array.isArray(profile.projects) && profile.projects.length > 0 && (
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-3">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        <h3 className="text-sm font-bold text-gray-900">{t.projects}</h3>
                      </div>
                      
                      <div className="space-y-2">
                        {profile.projects.map((proj, idx) => (
                          <div key={proj._id || idx} className="bg-gray-50 rounded-lg p-3">
                            <p className="font-semibold text-sm text-gray-900">{proj.name}</p>
                            {proj.description && (
                              <p className="text-xs text-gray-600 mt-1">{proj.description}</p>
                            )}
                            {proj.link && (
                              <a href={proj.link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline mt-1 inline-block">
                                View Project →
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Achievements */}
                  {Array.isArray(profile.achievements) && profile.achievements.length > 0 && (
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-3">
                        <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 00 14.628 15h-4.256a3.374 3.374 0 00-1.064-2.927l-.548-.547z" />
                        </svg>
                        <h3 className="text-sm font-bold text-gray-900">{t.Achievements}</h3>
                      </div>
                      
                      <div className="space-y-3">
                        {profile.achievements.map((achievement, idx) => (
                          <div 
                            key={achievement._id || idx} 
                            className="bg-gray-50 rounded-lg p-4 border-l-4 border-yellow-500"
                          >
                            <h4 className="font-semibold text-gray-900">{achievement.title}</h4>
                            {achievement.issuer && (
                              <p className="text-sm text-gray-600">{achievement.issuer}</p>
                            )}
                            {achievement.date && (
                              <p className="text-xs text-gray-500 mt-1">{achievement.date}</p>
                            )}
                            {achievement.description && (
                              <p className="text-sm text-gray-700 mt-2">
                                {achievement.description}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Achievements as string fallback */}
                  {typeof profile.achievements === 'string' && profile.achievements && (
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-2">
                        <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 00 14.628 15h-4.256a3.374 3.374 0 00-1.064-2.927l-.548-.547z" />
                        </svg>
                        <h3 className="text-sm font-bold text-gray-900">{t.Achievements}</h3>
                      </div>
                      <p className="text-sm text-gray-600">{profile.achievements}</p>
                    </div>
                  )}

                  {/* Courses */}
                  {Array.isArray(profile.courses) && profile.courses.length > 0 && (
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-3">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C6.248 6.253 2 10.541 2 15.5S6.248 24.747 12 24.747s10-4.288 10-9.247S17.752 6.253 12 6.253z" />
                        </svg>
                        <h3 className="text-sm font-bold text-gray-900">{t.Courses}</h3>
                      </div>
                      
                      <div className="space-y-2">
                        {profile.courses.map(course => (
                          <div 
                            key={course._id || Math.random()} 
                            className="bg-gray-50 rounded-lg p-3"
                          >
                            <p className="font-semibold text-sm text-gray-900">{course.name}</p>
                            {course.institution && (
                              <p className="text-xs text-gray-600">{course.institution}</p>
                            )}
                            {course.completionDate && (
                              <p className="text-xs text-gray-500 mt-1">{course.completionDate}</p>
                            )}
                            {course.url && (
                              <a 
                                href={course.url} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-xs text-blue-600 hover:underline mt-1 inline-block"
                              >
                                View Course →
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Languages */}
                  {Array.isArray(profile.languages) && profile.languages.length > 0 && (
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-3">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                        </svg>
                        <h3 className="text-sm font-bold text-gray-900">{t.languages}</h3>
                      </div>
                      
                      <div className="space-y-2">
                        {profile.languages.map(lang => (
                          <div 
                            key={lang._id || Math.random()} 
                            className="flex items-center justify-between bg-gray-50 rounded-lg p-3"
                          >
                            <p className="font-semibold text-sm text-gray-900">
                              {lang.language || lang.name}
                            </p>
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                              {lang.proficiency || "Proficient"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}


                  {/* Volunteering */}
                  {Array.isArray(profile.volunteering) && profile.volunteering.length > 0 && (
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-3">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="text-sm font-bold text-gray-900">{t.volunteering}</h3>
                      </div>
                      
                      <div className="space-y-3">
                        {profile.volunteering.map((vol, idx) => (
                          <div 
                            key={vol._id || idx} 
                            className="bg-gray-50 rounded-lg p-4"
                          >
                            <h4 className="font-semibold text-gray-900">{vol.role}</h4>
                            {vol.organization && (
                              <p className="text-sm text-gray-600">{vol.organization}</p>
                            )}
                            {vol.cause && (
                              <p className="text-sm text-gray-500">{vol.cause}</p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                              {vol.startDate} – {vol.currentlyVolunteering ? "Present" : vol.endDate}
                            </p>
                            {vol.description && (
                              <p className="text-sm text-gray-700 mt-2">
                                {vol.description}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Publications */}
                  {Array.isArray(profile.publications) && profile.publications.length > 0 && (
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-3">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C6.248 6.253 2 10.541 2 15.5S6.248 24.747 12 24.747s10-4.288 10-9.247S17.752 6.253 12 6.253z" />
                        </svg>
                        <h3 className="text-sm font-bold text-gray-900">{t.Publications}</h3>
                      </div>
                      
                      <div className="space-y-3">
                        {profile.publications.map((pub, idx) => (
                          <div 
                            key={pub._id || idx} 
                            className="bg-gray-50 rounded-lg p-4"
                          >
                            <h4 className="font-semibold text-gray-900">{pub.title}</h4>
                            {pub.publisher && (
                              <p className="text-sm text-gray-600">{pub.publisher}</p>
                            )}
                            {pub.publicationDate && (
                              <p className="text-xs text-gray-500 mt-1">{pub.publicationDate}</p>
                            )}
                            {pub.description && (
                              <p className="text-sm text-gray-700 mt-2">
                                {pub.description}
                              </p>
                            )}
                            {pub.url && (
                              <a 
                                href={pub.url} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-xs text-blue-600 hover:underline mt-2 inline-block"
                              >
                                Read Publication →
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Patents */}
                  {Array.isArray(profile.patents) && profile.patents.length > 0 && (
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-3">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h3 className="text-sm font-bold text-gray-900">{t.Patents}</h3>
                      </div>
                      
                      <div className="space-y-3">
                        {profile.patents.map((pat, idx) => (
                          <div 
                            key={pat._id || idx} 
                            className="bg-gray-50 rounded-lg p-4"
                          >
                            <h4 className="font-semibold text-gray-900">{pat.title}</h4>
                            {pat.number && (
                              <p className="text-sm text-gray-600">Patent #{pat.number}</p>
                            )}
                            {pat.filingDate && (
                              <p className="text-xs text-gray-500 mt-1">Filed: {pat.filingDate}</p>
                            )}
                            {pat.issuanceDate && (
                              <p className="text-xs text-gray-500">Issued: {pat.issuanceDate}</p>
                            )}
                            {pat.description && (
                              <p className="text-sm text-gray-700 mt-2">
                                {pat.description}
                              </p>
                            )}
                            {pat.url && (
                              <a 
                                href={pat.url} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-xs text-blue-600 hover:underline mt-2 inline-block"
                              >
                                View Patent →
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Honors & Awards */}
                  {Array.isArray(profile.honors) && profile.honors.length > 0 && (
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-3">
                        <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1m-16 0H3m15.364 6.364l-.707-.707M6.343 6.343l-.707.707m12.728 0l-.707-.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        <h3 className="text-sm font-bold text-gray-900">{t.HonorsAwards}</h3>
                      </div>
                      
                      <div className="space-y-3">
                        {profile.honors.map((hon, idx) => (
                          <div 
                            key={hon._id || idx} 
                            className="bg-gray-50 rounded-lg p-4 border-l-4 border-yellow-500"
                          >
                            <h4 className="font-semibold text-gray-900">{hon.title}</h4>
                            {hon.issuer && (
                              <p className="text-sm text-gray-600">{hon.issuer}</p>
                            )}
                            {hon.date && (
                              <p className="text-xs text-gray-500 mt-1">{hon.date}</p>
                            )}
                            {hon.description && (
                              <p className="text-sm text-gray-700 mt-2">
                                {hon.description}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              
              {/* Social Links Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  <h3 className="text-sm font-bold text-gray-900">{t.ConnectWithMe}</h3>
                </div>
                
                <div className="space-y-2">
                  {[
                    { url: profile.github, label: 'GitHub', icon: '🐙' },
                    { url: profile.linkedin, label: 'LinkedIn', icon: '💼' },
                    { url: profile.twitter, label: 'Twitter', icon: '🐦' },
                    { url: profile.youtube, label: 'YouTube', icon: '📺' },
                    { url: profile.website, label: 'Website', icon: '🌐' },
                    { url: profile.portfolio, label: 'Portfolio', icon: '💼' }
                  ].filter(item => item.url).map((item, i) => (
                    <a
                      key={i}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </a>
                  ))}
                  
                  {![profile.github, profile.linkedin, profile.twitter, 
                      profile.youtube, profile.website, profile.portfolio].some(Boolean) && (
                    <p className="text-sm text-gray-500 text-center py-4">
                      {t.p15}
                    </p>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-sm font-bold text-gray-900 mb-4">{t.QuickActions}</h3>
                <div className="space-y-2">
                  <button
                    onClick={navigateToProfile}
                    className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    {t.EditProfile}
                  </button>
                </div>
              </div>

              {/* Profile Completion */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
                <h3 className="text-sm font-bold text-gray-900 mb-2">{t.ProfileStrength}</h3>
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>{t.Completion}</span>
                    <span>
                      {Math.round(
                        (([profile.name, profile.headline, profile.about, profile.profilePicture].filter(Boolean).length +
                          (profile.experience?.length > 0 ? 1 : 0) +
                          (profile.skills?.length > 0 ? 1 : 0)) / 6) * 100
                      )}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ 
                        width: `${Math.round(
                          (([profile.name, profile.headline, profile.about, profile.profilePicture].filter(Boolean).length +
                            (profile.experience?.length > 0 ? 1 : 0) +
                            (profile.skills?.length > 0 ? 1 : 0)) / 6) * 100
                        )}%` 
                      }}
                    ></div>
                  </div>
                </div>

              </div>
              
              <button
                onClick={() => navigate("/messages")}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg"
              >
                {t.ViewMessages}
              </button>


              {/* <AssessmentSection /> */}
              {/* <ScoreCard /> */}
            </div>
          </div>
        ) : (
          // No Profile State
          <div className="bg-white rounded-xl shadow-sm border-2 border-dashed border-gray-300 p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome! Let's create your profile
              </h2>
              <p className="text-gray-600 mb-6">
                Build your professional presence and showcase your skills
              </p>
              <button
                onClick={navigateToProfile}
                className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Create Profile
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}



export default Dashboard;
import React, { useEffect, useState, useRef } from "react";
import validateBasicInfo from "./valid/validateBasicInfo.jsx";
import validateEducation from "./valid/validateEducation.jsx";
import validateExperience from "./valid/validateExperience.jsx";
import { validateCertification, validateProject } from "./valid/validateCertsProjects.jsx"

import { API_BASE } from "../environment.jsx";

import { useLanguage } from "../context/LanguageContext";

export default function ProfileWizard() {

  const {t} = useLanguage();

  const skillOptions = [
  t.python,
  t.java,
  t.javascript,
  t.typescript,
  t.c,
  t.cpp,
  t.csharp,
  t.go,
  t.rust,
  t.kotlin,
  t.swift,
  t.php,
  t.ruby,
  t.r,
  t.scala,

  t.html,
  t.css,
  t.sass,
  t.tailwind,
  t.bootstrap,

  t.react,
  t.nextjs,
  t.vue,
  t.nuxt,
  t.angular,
  t.svelte,

  t.node,
  t.express,
  t.nestjs,
  t.django,
  t.flask,
  t.fastapi,
  t.springboot,
  t.laravel,

  t.restapi,
  t.graphql,
  t.websockets,

  t.mysql,
  t.postgresql,
  t.mongodb,
  t.redis,
  t.sqlite,
  t.firebase,

  t.aws,
  t.azure,
  t.gcp,
  t.docker,
  t.kubernetes,
  t.cicd,
  t.devops,

  t.ai,
  t.ml,
  t.dl,
  t.datascience,
  t.nlp,
  t.computervision,

  t.cybersecurity,
  t.blockchain,
  t.web3,
  t.smartcontracts,

  t.android,
  t.ios,
  t.reactnative,
  t.flutter,

  t.testing,
  t.unittesting,
  t.jest,
  t.cypress,
  t.selenium,

  t.git,
  t.github,
  t.gitlab,
  t.linux,
  t.bash,

  t.agile,
  t.scrum,
  t.systemdesign,
];

  const interestOptions = [
  t.webdevelopment,
  t.frontenddevelopment,
  t.backenddevelopment,
  t.fullstackdevelopment,

  t.ai,
  t.ml,
  t.dl,
  t.datascience,

  t.uiuxdesign,
  t.productdesign,
  t.graphicdesign,

  t.cloudcomputing,
  t.devops,
  t.sre,

  t.mobileappdevelopment,
  t.androiddevelopment,
  t.iosdevelopment,
  t.crossplatformdevelopment,

  t.blockchain,
  t.web3,
  t.cybersecurity,

  t.gamedevelopment,
  t.arvr,

  t.automation,
  t.testingqa,

  t.opensource,
  t.systemdesign,
  t.competitiveprogramming,

  t.startupentrepreneurship,
  t.freelancing,

  t.researchinnovation,
];

 const steps = [
  t.basicInfo,
  t.experience,
  t.education,
  t.skillsInterests,
  t.certificationsProjects,
  t.languagesSocials,
  t.honorsCoursesPatentsVolunteering,
  t.reviewSubmit,
];


  const proficiencyOptions = [
  t.elementary,
  t.limited,
  t.professional,
  t.fluent,
  t.native,
];


  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");
  const [profile, setProfile] = useState({
    name: "",
    headline: "",
    about: "",
    profilePicture: "",
    bannerImage: "",
    country: "",
    city: "",
    // profession: "",
    experience: [],
    education: [],
    certifications: [],
    projects: [],
    languages: [],
    skills: [],
    interests: [],
    website: "",
    github: "",
    linkedin: "",
    twitter: "",
    honors: [],
    courses: [],
    patents: [],
    volunteering: [],
    // openToWork: {
    //   status: false,
    //   jobTitles: [],
    //   locations: [],
    //   remotePreference: "partial",
    // },
  });

  const token = localStorage.getItem("token") || "demo-token";

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/profiles/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setProfile((p) => ({ ...p, ...data }));
      }
    } catch (err) {
      setError("Failed to load profile");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const api = async (path, opts = {}) => {
    opts.headers = opts.headers || {};
    if (!(opts.body instanceof FormData)) {
      opts.headers["Content-Type"] = "application/json";
    }
    opts.headers["Authorization"] = `Bearer ${token}`;
    const res = await fetch(`${API_BASE}${path}`, opts);
    const contentType = res.headers.get("content-type") || "";
    const data = contentType.includes("application/json")
      ? await res.json().catch(() => null)
      : await res.text().catch(() => null);
    if (!res.ok) throw new Error((data && data.error) || res.statusText || "API error");
    return data;
  };

  const saveBasic = async (payload) => {
    return api("/profiles/me/basic", {
      method: "PUT",
      body: payload instanceof FormData ? payload : JSON.stringify(payload),
    });
  };

  const saveSkills = async (skills) => {
    return api("/profiles/me/skills", {
      method: "PUT",
      body: JSON.stringify({ skills }),
    });
  };

  const saveInterests = async (interests) => {
    return api("/profiles/me/interests", {
      method: "PUT",
      body: JSON.stringify({ interests }),
    });
  };

  // const saveOpenToWork = async (openToWork) => {
  //   return api("/profiles/me/open-to-work", {
  //     method: "PUT",
  //     body: JSON.stringify(openToWork),
  //   });
  // };

  const pushListItem = async (path, item) => {
    return api(path, {
      method: "POST",
      body: JSON.stringify(item),
    });
  };

  const updateListItemById = async (pathWithId, item) => {
    return api(pathWithId, {
      method: "PUT",
      body: JSON.stringify(item),
    });
  };

  const deleteListItemById = async (pathWithId) => {
    return api(pathWithId, { method: "DELETE" });
  };

  const addExperience = async (exp) => {
    const data = await pushListItem("/profiles/me/experience", exp);
    setProfile((p) => ({ ...p, experience: data }));
  };

  const updateExperience = async (id, exp) => {
    await updateListItemById(`/profiles/me/experience/${id}`, exp);
    await fetchProfile();
  };

  const deleteExperience = async (id) => {
    const data = await deleteListItemById(`/profiles/me/experience/${id}`);
    setProfile((p) => ({ ...p, experience: data }));
  };

  const addEducation = async (edu) => {
    const data = await pushListItem("/profiles/me/education", edu);
    setProfile((p) => ({ ...p, education: data }));
  };

  const updateEducation = async (id, edu) => {
    await updateListItemById(`/profiles/me/education/${id}`, edu);
    await fetchProfile();
  };

  const deleteEducation = async (id) => {
    const data = await deleteListItemById(`/profiles/me/education/${id}`);
    setProfile((p) => ({ ...p, education: data }));
  };

  const addCertification = async (cert) => {
    const data = await pushListItem("/profiles/me/certifications", cert);
    setProfile((p) => ({ ...p, certifications: data }));
  };

  const addProject = async (proj) => {
    const data = await pushListItem("/profiles/me/projects", proj);
    setProfile((p) => ({ ...p, projects: data }));
  };

  const addLanguage = async (lang) => {
    const data = await pushListItem("/profiles/me/languages", lang);
    setProfile((p) => ({ ...p, languages: data }));
  };

  const updateCertification = async (id, updates) => {
    const data = await updateListItem(
      `/profiles/me/certifications/${id}`,
      updates
    );
    setProfile((p) => ({ ...p, certifications: data }));
  };

  const updateProject = async (id, updates) => {
    const data = await updateListItem(
      `/profiles/me/projects/${id}`,
      updates
    );
    setProfile((p) => ({ ...p, projects: data }));
  };

  const updateLanguage = async (id, updates) => {
    const data = await updateListItem(
      `/profiles/me/languages/${id}`,
      updates
    );
    setProfile((p) => ({ ...p, languages: data }));
  };

  const deleteCertification = async (id) => {
    const data = await deleteListItem(
      `/profiles/me/certifications/${id}`
    );
    setProfile((p) => ({ ...p, certifications: data }));
  };

  const deleteProject = async (id) => {
    const data = await deleteListItem(
      `/profiles/me/projects/${id}`
    );
    setProfile((p) => ({ ...p, projects: data }));
  };

  const deleteLanguage = async (id) => {
    const data = await deleteListItem(
      `/profiles/me/languages/${id}`
    );
    setProfile((p) => ({ ...p, languages: data }));
  };


  const addHonor = async (hon) => {
    const data = await pushListItem("/profiles/me/honors", hon);
    setProfile((p) => ({ ...p, honors: data }));
  };

  const updateHonor = async (id, hon) => {
    await updateListItemById(`/profiles/me/honors/${id}`, hon);
    await fetchProfile();
  };

  const deleteHonor = async (id) => {
    const data = await deleteListItemById(`/profiles/me/honors/${id}`);
    setProfile((p) => ({ ...p, honors: data }));
  };

  const addCourse = async (course) => {
    const data = await pushListItem("/profiles/me/courses", course);
    setProfile((p) => ({ ...p, courses: data }));
  };

  const updateCourse = async (id, course) => {
    await updateListItemById(`/profiles/me/courses/${id}`, course);
    await fetchProfile();
  };

  const deleteCourse = async (id) => {
    const data = await deleteListItemById(`/profiles/me/courses/${id}`);
    setProfile((p) => ({ ...p, courses: data }));
  };

  const addPatent = async (pat) => {
    const data = await pushListItem("/profiles/me/patents", pat);
    setProfile((p) => ({ ...p, patents: data }));
  };

  const updatePatent = async (id, pat) => {
    await updateListItemById(`/profiles/me/patents/${id}`, pat);
    await fetchProfile();
  };

  const deletePatent = async (id) => {
    const data = await deleteListItemById(`/profiles/me/patents/${id}`);
    setProfile((p) => ({ ...p, patents: data }));
  };

  const addVolunteering = async (vol) => {
    const data = await pushListItem("/profiles/me/volunteering", vol);
    setProfile((p) => ({ ...p, volunteering: data }));
  };

  const updateVolunteering = async (id, vol) => {
    await updateListItemById(`/profiles/me/volunteering/${id}`, vol);
    await fetchProfile();
  };

  const deleteVolunteering = async (id) => {
    const data = await deleteListItemById(`/profiles/me/volunteering/${id}`);
    setProfile((p) => ({ ...p, volunteering: data }));
  };

  const next = async () => {
    setError("");
    setSuccess("");
    try {
      if (activeStep === 3) {
        await saveSkills(profile.skills || []);
        await saveInterests(profile.interests || []);
        setSuccess("Skills and interests saved!");
      } else if (activeStep === 7) {
        setSuccess("Profile saved!");
      }
      setActiveStep((s) => Math.min(s + 1, steps.length - 1));
    } catch (err) {
      setError("Save failed: " + err.message);
      console.error(err);
    }
  };

  const back = () => {
    setError("");
    setSuccess("");
    setActiveStep((s) => Math.max(s - 1, 0));
  };

  const finish = async () => {
    setError("");
    setSuccess("");
    try {
      await api("/profiles/me", {
        method: "PUT",
        body: JSON.stringify(profile),
      });
      setSuccess("Profile saved successfully!");
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1500);
    } catch (err) {
      setError("Final save failed: " + err.message);
    }
  };

  const BasicInfoStep = () => {
    
    const [local, setLocal] = useState({
      name: profile?.name || "",
      // profession: profile?.profession || "",
      headline: profile?.headline || "",
      about: profile?.about || "",
      country: profile?.country || "",
      city: profile?.city || "",
      profilePicture: profile?.profilePicture || "",
      bannerImage: profile?.bannerImage || "",
      _profilePictureFile: null,
      _bannerFile: null,
    });


    useEffect(() => {
   
    if (profile) {
      setLocal((prev) => ({
        ...prev,
        // Don't overwrite if user already has a value
        name: prev.name || profile.name || "",
        // profession: prev.profession || profile.profession || "",
        headline: prev.headline || profile.headline || "",
        about: prev.about || profile.about || "",
        country: prev.country || profile.country || "",
        city: prev.city || profile.city || "",
        // Keep existing logic for images
        profilePicture: prev._profilePictureFile ? prev.profilePicture : (prev.profilePicture || profile.profilePicture || ""),
        bannerImage: prev._bannerFile ? prev.bannerImage : (prev.bannerImage || profile.bannerImage || ""),
      }));
    }
  }, [profile]);


    const saveBasicInfo = async () => {
    const errors = validateBasicInfo(local);

    if (Object.keys(errors).length > 0) {
      setErrors(errors);
      setError("Please fix the highlighted errors");
      return;
    }

    try {
      // Check if profession has a value
      // if (!local.profession || local.profession.trim() === "") {
      //   setError("Profession is required");
      //   return;
      // }

      const payload = {
          name: local.name.trim(),
          // profession: local.profession.trim(),
          headline: local.headline.trim(),
          about: local.about.trim(),
          country: local.country.trim(),
          city: local.city.trim(),
        };

        // console.log("Saving basic info:", payload);

        await saveBasic(payload);
        setSuccess("Basic info saved!");
        setProfile((p) => ({ ...p, ...payload }));
        await fetchProfile();
      } catch (err) {
        setError("Failed to save: " + err.message);
        console.error("Save error:", err);
      }
    };

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-12">
            <label className="block text-sm font-medium mb-1">{t.name} *</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={local.name}
              onChange={(e) => setLocal({ ...local, name: e.target.value })}
              required
            />
            {errors.name && (
              <p className="text-sm text-red-600 mt-1">{errors.name}</p>
            )}
          </div>


          {/* <div className="md:col-span-4">
            <label className="block text-sm font-medium mb-1">Profession</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={local.profession}
              onChange={(e) =>
                  setLocal((prev) => ({
                    ...prev,
                    profession: e.target.value,
              }))
            }
            >
            <option value="">Select...</option>
              {[
                "Student",
                "Fresher",
                "Intern",
                "Engineer",
                "Developer",
                "Designer",
                "Manager",
                "Analyst",
                "Consultant",
                "Freelancer",
                "Entrepreneur",
                "Other"
              ].map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            {errors.profession && (
              <p className="text-sm text-red-600 mt-1">{errors.profession}</p>
            )}
          </div> */}



          <div className="md:col-span-12">
            <label className="block text-sm font-medium mb-1">{t.Headline} *</label>
            <input
              type="text"
              placeholder={t.p5}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={local.headline}
              onChange={(e) => setLocal({ ...local, headline: e.target.value })}
            />
            {errors.headline && (
              <p className="text-sm text-red-600 mt-1">{errors.headline}</p>
            )}
          </div>

          <div className="md:col-span-12">
            <label className="block text-sm font-medium mb-1">{t.About} *</label>
            <textarea
              rows={4}
              placeholder={t.p4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={local.about}
              onChange={(e) => setLocal({ ...local, about: e.target.value })}
            />
            {errors.about && (
              <p className="text-sm text-red-600 mt-1">{errors.about}</p>
            )}
          </div>

          <div className="md:col-span-3">
            <label className="block text-sm font-medium mb-1">{t.Country} *</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={local.country}
              onChange={(e) => setLocal({ ...local, country: e.target.value })}
              required
            />
            {errors.country && (
              <p className="text-sm text-red-600 mt-1">{errors.country}</p>
            )}
          </div>

          <div className="md:col-span-3">
            <label className="block text-sm font-medium mb-1">{t.City} *</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={local.city}
              onChange={(e) => setLocal({ ...local, city: e.target.value })}
              required
            />
            {errors.city && (
              <p className="text-sm text-red-600 mt-1">{errors.city}</p>
            )}
          </div>

          {/* <div className="md:col-span-6">
            <label className="block text-sm font-medium mb-1">Profile picture</label>
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-full bg-gray-200 bg-cover bg-center"
                style={{ backgroundImage: local.profilePicture ? `url(${local.profilePicture})` : "none" }}
              />
              <label className="px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                Upload
                <input
                  hidden
                  accept="image/*"
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setLocal({
                        ...local,
                        _profilePictureFile: file,
                        profilePicture: URL.createObjectURL(file),
                      });
                    }
                  }}
                />
              </label>
            </div>
          </div>

          <div className="md:col-span-6">
            <label className="block text-sm font-medium mb-1">Banner image</label>
            <div className="flex items-center gap-4">
              <div
                className="w-40 h-16 bg-gray-200 bg-cover bg-center rounded"
                style={{ backgroundImage: local.bannerImage ? `url(${local.bannerImage})` : "none" }}
              />
              <label className="px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                Upload
                <input
                  hidden
                  accept="image/*"
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setLocal({
                        ...local,
                        _bannerFile: file,
                        bannerImage: URL.createObjectURL(file),
                      });
                    }
                  }}
                />
              </label>
            </div>
          </div> */}

          <div className="md:col-span-12">
            <button
              onClick={saveBasicInfo}
              className="w-full bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
             {t.p3}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const ExperienceStep = () => {
    const [errors, setErrors] = useState({});

    const [local, setLocal] = useState({
      title: "",
      company: "",
      startDate: "",
      endDate: "",
      currentlyWorking: false,
      location: "",
      description: "",
    });
    const [editingId, setEditingId] = useState(null);

    const save = async () => {
  const validationErrors = validateExperience(local);
  setErrors(validationErrors);

  if (Object.keys(validationErrors).length > 0) {
    return; // ❌ stop submit
  }

  try {
    if (editingId) {
      await updateExperience(editingId, local);
    } else {
      await addExperience(local);
    }

    setLocal({
      title: "",
      company: "",
      startDate: "",
      endDate: "",
      currentlyWorking: false,
      location: "",
      description: "",
    });

    setEditingId(null);
    setErrors({});
    setSuccess("Experience saved!");
  } catch (err) {
    setError(err.message);
  }
};


    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">{t.workExperience}</h3>
          <button
            onClick={() => {
              setEditingId(null);
              setLocal({
                title: "",
                company: "",
                startDate: "",
                endDate: "",
                currentlyWorking: false,
                location: "",
                description: "",
              });
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <span className="text-xl">+</span> {t.addExperience}
          </button>
        </div>

        <div className="space-y-2 mb-6">

        {Array.isArray(profile.experience) &&
          profile.experience.map((exp) => (
            <div key={exp._id} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-bold">{exp.title}</h4>
                  <p className="text-sm text-gray-600">
                    {exp.company} • {exp.location}
                  </p>
                  <p className="text-xs text-gray-500">
                    {exp.startDate ? new Date(exp.startDate).toLocaleDateString() : ""} -{" "}
                    {exp.currentlyWorking ? "Present" : exp.endDate ? new Date(exp.endDate).toLocaleDateString() : ""}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingId(exp._id);
                      setLocal(exp);
                    }}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={async () => {
                      if (window.confirm("Delete this experience?")) {
                        await deleteExperience(exp._id);
                      }
                    }}
                    className="text-red-600 hover:text-red-800"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              {exp.description && <p className="text-sm mt-2">{exp.description}</p>}
            </div>
          ))}
        </div>

        <hr className="my-6" />

        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold mb-4">{editingId ? t.editExperience : t.addNewExperience}</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t.title} *</label>
              <input
                type="text"
                className={`w-full px-3 py-2 border rounded-lg ${
                  errors.title ? "border-red-500" : "border-gray-300"
                }`}
                value={local.title}
                onChange={(e) => setLocal({ ...local, title: e.target.value })}
                placeholder={t.p7}
              />
              {errors.title && <p className="text-sm text-red-600 mt-1">{errors.title}</p>}

            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t.company} *</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                value={local.company}
                onChange={(e) => setLocal({ ...local, company: e.target.value })}
                required
                placeholder={t.d2}
              />
              {errors.company && (
                <p className="text-sm text-red-600 mt-1">{errors.company}</p>
              )}

            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t.startDate}</label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                value={local.startDate}
                onChange={(e) => setLocal({ ...local, startDate: e.target.value })}
                placeholder="Current"
              />

            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t.endDate}</label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                disabled={local.currentlyWorking}
                value={local.endDate}
                onChange={(e) => setLocal({ ...local, endDate: e.target.value })}
              />

            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t.location}</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                value={local.location}
                onChange={(e) => setLocal({ ...local, location: e.target.value })}
              />

            </div>
            <div className="flex items-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={local.currentlyWorking}
                  onChange={(e) => setLocal({ ...local, currentlyWorking: e.target.checked, endDate: "" })}
                  className="w-4 h-4"
                />
                <span className="text-sm">{t.p6}</span>
              </label>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">{t.description}</label>
              <textarea
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                value={local.description}
                onChange={(e) => setLocal({ ...local, description: e.target.value })}
              />

            </div>
            <div className="md:col-span-2 text-right">
              <button onClick={save} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                {editingId ? t.update : t.add}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const EducationStep = () => {
    const [errors, setErrors] = useState({});
    const [local, setLocal] = useState({
      school: "",
      degree: "",
      fieldOfStudy: "",
      startDate: "",
      endDate: "",
      description: "",
    });
    const [editingId, setEditingId] = useState(null);

    const save = async () => {
    const validationErrors = validateEducation(local);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return; // ❌ stop submit
    }

    try {
      if (editingId) {
        await updateEducation(editingId, local);
      } else {
        await addEducation(local);
      }

      setLocal({
        school: "",
        degree: "",
        fieldOfStudy: "",
        startDate: "",
        endDate: "",
        description: "",
      });
      setEditingId(null);
      setErrors({});
      setSuccess("Education saved!");
    } catch (err) {
      setError(err.message);
    }
  };


    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">{t.education}</h3>
          <button
            onClick={() => {
              setEditingId(null);
              setLocal({
                school: "",
                degree: "",
                fieldOfStudy: "",
                startDate: "",
                endDate: "",
                description: "",
              });
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <span className="text-xl">+</span> {t.addEducation}
          </button>
        </div>

        <div className="space-y-2 mb-6">
          {profile.education?.map((edu) => (
            <div key={edu._id} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-bold">
                    {edu.school} — {edu.degree}
                  </h4>
                  <p className="text-sm text-gray-600">{edu.fieldOfStudy}</p>
                  <p className="text-xs text-gray-500">
                    {edu.startDate ? new Date(edu.startDate).toLocaleDateString() : ""} -{" "}
                    {edu.endDate ? new Date(edu.endDate).toLocaleDateString() : ""}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingId(edu._id);
                      setLocal(edu);
                    }}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={async () => {
                      if (window.confirm("Delete this education?")) {
                        await deleteEducation(edu._id);
                      }
                    }}
                    className="text-red-600 hover:text-red-800"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              {edu.description && <p className="text-sm mt-2">{edu.description}</p>}
            </div>
          ))}
        </div>

        <hr className="my-6" />

        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold mb-4">{editingId ? t.editEducation : t.addNewEducation}</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t.school} *</label>
              <input
                type="text"
                className={`w-full px-3 py-2 border rounded-lg ${
                  errors.school ? "border-red-500" : "border-gray-300"
                }`}
                value={local.school}
                onChange={(e) =>
                  setLocal({ ...local, school: e.target.value })
                }
              />
              {errors.school && (
                <p className="text-sm text-red-600 mt-1">{errors.school}</p>
              )}

            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t.degree} *</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                value={local.degree}
                onChange={(e) => setLocal({ ...local, degree: e.target.value })}
              />
              {errors.degree && (
                <p className="text-sm text-red-600 mt-1">{errors.degree}</p>
              )}

            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t.fieldOfStudy} *</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                value={local.fieldOfStudy}
                onChange={(e) => setLocal({ ...local, fieldOfStudy: e.target.value })}
              />
              {errors.fieldOfStudy && (
                <p className="text-sm text-red-600 mt-1">{errors.fieldOfStudy}</p>
              )}

            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t.startDate} *</label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                value={local.startDate}
                onChange={(e) => setLocal({ ...local, startDate: e.target.value })}
              />
              {errors.startDate && (
                <p className="text-sm text-red-600 mt-1">{errors.startDate}</p>
              )}

            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t.endDate} *</label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                value={local.endDate}
                onChange={(e) => setLocal({ ...local, endDate: e.target.value })}
              />
              {errors.endDate && (
                <p className="text-sm text-red-600 mt-1">{errors.endDate}</p>
              )}

            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">{t.description}</label>
              <textarea
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                value={local.description}
                onChange={(e) => setLocal({ ...local, description: e.target.value })}
              />
            </div>
            <div className="md:col-span-2 text-right">
              <button onClick={save} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                {editingId ? t.update: t.add}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const SkillsInterestsStep = () => {
    const [customSkill, setCustomSkill] = useState("");
    const [customInterest, setCustomInterest] = useState("");

    const toggleSkill = (s) => {
      setProfile((p) => {
        const has = (p.skills || []).includes(s);
        const skills = has ? p.skills.filter((x) => x !== s) : [...(p.skills || []), s];
        return { ...p, skills };
      });
    };

    const toggleInterest = (i) => {
      setProfile((p) => {
        const has = (p.interests || []).includes(i);
        const interests = has ? p.interests.filter((x) => x !== i) : [...(p.interests || []), i];
        return { ...p, interests };
      });
    };

    const addCustomSkill = () => {
      if (customSkill.trim()) {
        setProfile((p) => ({ ...p, skills: [...(p.skills || []), customSkill.trim()] }));
        setCustomSkill("");
      }
    };

    const addCustomInterest = () => {
      if (customInterest.trim()) {
        setProfile((p) => ({ ...p, interests: [...(p.interests || []), customInterest.trim()] }));
        setCustomInterest("");
      }
    };

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold mb-3">{t.skills}</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {skillOptions.map((s) => (
              <button
                key={s}
                onClick={() => toggleSkill(s)}
                className={`px-4 py-2 rounded-full border ${
                  (profile.skills || []).includes(s)
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300"
                } hover:opacity-80`}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {(profile.skills || [])
              .filter((s) => !skillOptions.includes(s))
              .map((s) => (
                <div
                  key={s}
                  className="px-4 py-2 rounded-full bg-blue-600 text-white flex items-center gap-2"
                >
                  {s}
                  <button onClick={() => toggleSkill(s)} className="hover:text-red-200">
                    ×
                  </button>
                </div>
              ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add custom skill"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
              value={customSkill}
              onChange={(e) => setCustomSkill(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") addCustomSkill();
              }}
            />
            <button onClick={addCustomSkill} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              {t.add}
            </button>
          </div>
        </div>

        <hr />

        <div>
          <h3 className="text-xl font-semibold mb-3">{t.interests}</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {interestOptions.map((i) => (
              <button
                key={i}
                onClick={() => toggleInterest(i)}
                className={`px-4 py-2 rounded-full border ${
                  (profile.interests || []).includes(i)
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300"
                } hover:opacity-80`}
              >
                {i}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {(profile.interests || [])
              .filter((i) => !interestOptions.includes(i))
              .map((i) => (
                <div
                  key={i}
                  className="px-4 py-2 rounded-full bg-blue-600 text-white flex items-center gap-2"
                >
                  {i}
                  <button onClick={() => toggleInterest(i)} className="hover:text-red-200">
                    ×
                  </button>
                </div>
              ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add custom interest"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
              value={customInterest}
              onChange={(e) => setCustomInterest(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") addCustomInterest();
              }}
            />
            <button onClick={addCustomInterest} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              {t.add}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const CertsProjectsStep = () => {
  const [certErrors, setCertErrors] = useState({});
  const [projErrors, setProjErrors] = useState({});

  const [localCert, setLocalCert] = useState({
    name: "",
    issuingOrganization: "",
    issueDate: "",
    credentialUrl: "",
  });
  const [editingCertId, setEditingCertId] = useState(null);

  const [localProj, setLocalProj] = useState({
    name: "",
    description: "",
    link: "",
    technologies: "",
  });
  const [editingProjId, setEditingProjId] = useState(null);

  // API functions for certifications
  const addCertification = async (cert) => {
    const data = await pushListItem("/profiles/me/certifications", cert);
    setProfile((p) => ({ ...p, certifications: data }));
  };

  const updateCertification = async (id, cert) => {
    await updateListItemById(`/profiles/me/certifications/${id}`, cert);
    await fetchProfile();
  };

  const deleteCertification = async (id) => {
    const data = await deleteListItemById(`/profiles/me/certifications/${id}`);
    setProfile((p) => ({ ...p, certifications: data }));
  };

  // API functions for projects
  const addProject = async (proj) => {
    const data = await pushListItem("/profiles/me/projects", proj);
    setProfile((p) => ({ ...p, projects: data }));
  };

  const updateProject = async (id, proj) => {
    await updateListItemById(`/profiles/me/projects/${id}`, proj);
    await fetchProfile();
  };

  const deleteProject = async (id) => {
    const data = await deleteListItemById(`/profiles/me/projects/${id}`);
    setProfile((p) => ({ ...p, projects: data }));
  };

  const saveCert = async () => {
    const errors = validateCertification(localCert);
    setCertErrors(errors);

    if (Object.keys(errors).length > 0) return;

    try {
      if (editingCertId) {
        await updateCertification(editingCertId, localCert);
        setSuccess("Certification updated!");
      } else {
        await addCertification(localCert);
        setSuccess("Certification added!");
      }

      setLocalCert({
        name: "",
        issuingOrganization: "",
        issueDate: "",
        credentialUrl: "",
      });
      setEditingCertId(null);
      setCertErrors({});
    } catch (err) {
      setError(err.message);
    }
  };


  const saveProj = async () => {
    const errors = validateProject(localProj);
    setProjErrors(errors);

    if (Object.keys(errors).length > 0) return;

    try {
      const payload = {
        ...localProj,
        technologies: localProj.technologies
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      };

      if (editingProjId) {
        await updateProject(editingProjId, payload);
        setSuccess("Project updated!");
      } else {
        await addProject(payload);
        setSuccess("Project added!");
      }

      setLocalProj({
        name: "",
        description: "",
        link: "",
        technologies: "",
      });
      setEditingProjId(null);
      setProjErrors({});
    } catch (err) {
      setError(err.message);
    }
  };



  return (
    <div className="space-y-6">
      {/* ==================== CERTIFICATIONS ==================== */}
      <div>
        <h3 className="text-xl font-semibold mb-3">{t.certifications}</h3>
        <div className="space-y-2 mb-4">
          {profile.certifications?.map((c) => (
            <div key={c._id || c.name} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-semibold">{c.name}</p>
                  <p className="text-sm text-gray-600">{c.issuingOrganization}</p>
                  {c.issueDate && (
                    <p className="text-xs text-gray-500">
                      Issued: {new Date(c.issueDate).toLocaleDateString()}
                    </p>
                  )}
                  {c.credentialUrl && (
                    <p className="text-xs text-blue-600">
                      <a href={c.credentialUrl} target="_blank" rel="noopener noreferrer" className="underline">
                        View Credential
                      </a>
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingCertId(c._id);
                      setLocalCert(c);
                    }}
                    className="text-blue-600 hover:text-blue-800 text-lg"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={async () => {
                      if (window.confirm("Delete this certification?")) {
                        await deleteCertification(c._id);
                      }
                    }}
                    className="text-red-600 hover:text-red-800 text-lg"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="border border-gray-200 rounded-lg p-4">
          <p className="font-medium mb-3">
            {editingCertId ? t.editCertification : t.addCertification}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t.name} *</label>
              <input
                type="text"
                placeholder="e.g., AWS Certified Solutions Architect"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                value={localCert.name}
                onChange={(e) => setLocalCert({ ...localCert, name: e.target.value })}
              />
              {certErrors.name && (
                <p className="text-xs text-red-600 mt-1">{certErrors.name}</p>
              )}

            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t.Organization} *</label>
              <input
                type="text"
                placeholder="e.g., Amazon Web Services"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                value={localCert.issuingOrganization}
                onChange={(e) => setLocalCert({ ...localCert, issuingOrganization: e.target.value })}
              />
              {certErrors.issuingOrganization && (
                <p className="text-xs text-red-600 mt-1">{certErrors.issuingOrganization}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t.IssueDate} *</label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                value={localCert.issueDate}
                onChange={(e) => setLocalCert({ ...localCert, issueDate: e.target.value })}
              />
              {certErrors.issueDate && (
                <p className="text-xs text-red-600 mt-1">{certErrors.issueDate}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t.CredentialURL} *</label>
              <input
                type="url"
                placeholder="https://credentials.example.com/..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                value={localCert.credentialUrl}
                onChange={(e) => setLocalCert({ ...localCert, credentialUrl: e.target.value })}
              />
              {certErrors.credentialUrl && (
                <p className="text-xs text-red-600 mt-1">{certErrors.credentialUrl}</p>
              )}
            </div>
            <div className="md:col-span-2 text-right">
              <div className="flex gap-2 justify-end">
                {editingCertId && (
                  <button
                    onClick={() => {
                      setEditingCertId(null);
                      setLocalCert({
                        name: "",
                        issuingOrganization: "",
                        issueDate: "",
                        credentialUrl: "",
                      });
                    }}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    {t.cancel}
                  </button>
                )}
                <button
                  onClick={saveCert}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  {editingCertId ? t.update : t.add} {t.certifications}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <hr />

      {/* ==================== PROJECTS ==================== */}
      <div>
        <h3 className="text-xl font-semibold mb-3">{t.projects}</h3>
        <div className="space-y-2 mb-4">
          {profile.projects?.map((p) => (
            <div key={p._id || p.name} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-semibold">{p.name}</p>
                  <p className="text-sm text-gray-600">{p.description}</p>
                  {p.link && (
                    <p className="text-xs text-blue-600 mt-1">
                      <a href={p.link} target="_blank" rel="noopener noreferrer" className="underline">
                        {p.link}
                      </a>
                    </p>
                  )}
                  {p.technologies && p.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {p.technologies.map((tech) => (
                        <span
                          key={tech}
                          className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingProjId(p._id);
                      setLocalProj({
                        ...p,
                        technologies: Array.isArray(p.technologies)
                          ? p.technologies.join(", ")
                          : p.technologies,
                      });
                    }}
                    className="text-blue-600 hover:text-blue-800 text-lg"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={async () => {
                      if (window.confirm("Delete this project?")) {
                        await deleteProject(p._id);
                      }
                    }}
                    className="text-red-600 hover:text-red-800 text-lg"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="border border-gray-200 rounded-lg p-4">
          <p className="font-medium mb-3">
            {editingProjId ? t.EditProject : t.AddProject}
          </p>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t.ProjectName} *</label>
              <input
                type="text"
                placeholder="e.g., E-Commerce Platform"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                value={localProj.name}
                onChange={(e) => setLocalProj({ ...localProj, name: e.target.value })}
              />
              {projErrors.name && (
                <p className="text-xs text-red-600 mt-1">{projErrors.name}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t.description}</label>
              <textarea
                rows={2}
                placeholder="Describe your project..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                value={localProj.description}
                onChange={(e) => setLocalProj({ ...localProj, description: e.target.value })}
              />
              {projErrors.description && (
                <p className="text-xs text-red-600 mt-1">{projErrors.description}</p>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t.ProjectLink}</label>
                <input
                  type="url"
                  placeholder="https://yourproject.com or github repo"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  value={localProj.link}
                  onChange={(e) => setLocalProj({ ...localProj, link: e.target.value })}
                />
                {projErrors.link && (
                <p className="text-xs text-red-600 mt-1">{projErrors.link}</p>
              )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t.Technologies}</label>
                <input
                  type="text"
                  placeholder="React, Node.js, MongoDB (comma separated)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  value={localProj.technologies}
                  onChange={(e) => setLocalProj({ ...localProj, technologies: e.target.value })}
                />
                {projErrors.technologies && (
                <p className="text-xs text-red-600 mt-1">{projErrors.technologies}</p>
              )}
              </div>
            </div>
            <div className="text-right">
              <div className="flex gap-2 justify-end">
                {editingProjId && (
                  <button
                    onClick={() => {
                      setEditingProjId(null);
                      setLocalProj({
                        name: "",
                        description: "",
                        link: "",
                        technologies: "",
                      });
                    }}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                   {t.cancel}
                  </button>
                )}
                <button
                  onClick={saveProj}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  {editingProjId ? t.update : t.add} {t.projects}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

  const LanguagesSocialsStep = () => {
  const [localLang, setLocalLang] = useState({ language: "", proficiency: "" });
  const [editingLangId, setEditingLangId] = useState(null);

  // API functions for languages
  const addLanguage = async (lang) => {
    const data = await pushListItem("/profiles/me/languages", lang);
    setProfile((p) => ({ ...p, languages: data }));
  };

  const updateLanguage = async (id, lang) => {
    await updateListItemById(`/profiles/me/languages/${id}`, lang);
    await fetchProfile();
  };

  const deleteLanguage = async (id) => {
    const data = await deleteListItemById(`/profiles/me/languages/${id}`);
    setProfile((p) => ({ ...p, languages: data }));
  };

  const saveLang = async () => {
    if (!localLang.language) {
      setError("Enter language name");
      return;
    }
    if (!localLang.proficiency) {
      setError("Select proficiency level");
      return;
    }
    try {
      if (editingLangId) {
        await updateLanguage(editingLangId, localLang);
        setSuccess("Language updated!");
      } else {
        await addLanguage(localLang);
        setSuccess("Language added!");
      }
      setLocalLang({ language: "", proficiency: "" });
      setEditingLangId(null);
    } catch (err) {
      setError(err.message);
    }
  };


  return (
    <div className="space-y-6">
      {/* ==================== LANGUAGES ==================== */}
      <div>
        <h3 className="text-xl font-semibold mb-3">{t.languages}</h3>
        <div className="space-y-2 mb-4">
          {profile.languages?.map((l) => (
            <div
              key={l._id || l.language}
              className="p-4 border border-gray-200 rounded-lg flex justify-between items-center"
            >
              <div>
                <p className="font-semibold">{l.language}</p>
                <p className="text-sm text-gray-600">{t.ProficiencyLevel}: {l.proficiency}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingLangId(l._id);
                    setLocalLang(l);
                  }}
                  className="text-blue-600 hover:text-blue-800 text-lg"
                >
                  ✏️
                </button>
                <button
                  onClick={async () => {
                    if (window.confirm("Delete this language?")) {
                      try {
                        await deleteLanguage(l._id);
                        setSuccess("Language deleted!");
                      } catch (err) {
                        setError(err.message);
                      }
                    }
                  }}
                  className="text-red-600 hover:text-red-800 text-lg"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="border border-gray-200 rounded-lg p-4">
          <p className="font-medium mb-3">
            {editingLangId ? t.editLanguage : t.addLanguage}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t.languages} *</label>
              <input
                type="text"
                placeholder={t.d3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                value={localLang.language}  
                onChange={(e) => setLocalLang({ ...localLang, language: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t.ProficiencyLevel} *</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                value={localLang.proficiency}
                onChange={(e) => setLocalLang({ ...localLang, proficiency: e.target.value })}
              >
                <option value="">{t.Selectproficiency}</option>
                {proficiencyOptions.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2 text-right">
              <div className="flex gap-2 justify-end">
                {editingLangId && (
                  <button
                    onClick={() => {
                      setEditingLangId(null);
                      setLocalLang({ language: "", proficiency: "" });
                    }}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    {t.cancel}
                  </button>
                )}
                <button
                  onClick={saveLang}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  {editingLangId ? t.update : t.add} {t.languages}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <hr />

      {/* ==================== SOCIAL LINKS ==================== */}
      <div>
          <h3 className="text-xl font-semibold mb-3">{t.socialLinks}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">GitHub</label>
              <input
                type="url"
                placeholder="https://github.com/username"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                value={profile.github || ""}
                onChange={(e) => setProfile({ ...profile, github: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">LinkedIn</label>
              <input
                type="url"
                placeholder="https://linkedin.com/in/username"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                value={profile.linkedin || ""}
                onChange={(e) => setProfile({ ...profile, linkedin: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">X.com</label>
              <input
                type="url"
                placeholder="https://X.com/username"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                value={profile.twitter || ""}
                onChange={(e) => setProfile({ ...profile, twitter: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Website / Portfolio</label>
              <input
                type="url"
                placeholder="https://yourwebsite.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                value={profile.website || ""}
                onChange={(e) => setProfile({ ...profile, website: e.target.value })}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const HonorsCoursesPatentsStep = () => {
    const [honor, setHonor] = useState({ title: "", issuer: "" });
    const [editingHonorId, setEditingHonorId] = useState(null);
    const [course, setCourse] = useState({ name: "" });
    const [editingCourseId, setEditingCourseId] = useState(null);
    const [patent, setPatent] = useState({ title: "" });
    const [editingPatentId, setEditingPatentId] = useState(null);
    const [vol, setVol] = useState({ role: "", organization: "" });
    const [editingVolId, setEditingVolId] = useState(null);

    const saveHonor = async () => {
      try {
        if (editingHonorId) {
          await updateHonor(editingHonorId, honor);
        } else {
          await addHonor(honor);
        }
        setHonor({ title: "", issuer: "" });
        setEditingHonorId(null);
        setSuccess("Honor saved!");
      } catch (err) {
        setError(err.message);
      }
    };

    const saveCourse = async () => {
      try {
        if (editingCourseId) {
          await updateCourse(editingCourseId, course);
        } else {
          await addCourse(course);
        }
        setCourse({ name: "" });
        setEditingCourseId(null);
        setSuccess("Course saved!");
      } catch (err) {
        setError(err.message);
      }
    };

    const savePatent = async () => {
      try {
        if (editingPatentId) {
          await updatePatent(editingPatentId, patent);
        } else {
          await addPatent(patent);
        }
        setPatent({ title: "" });
        setEditingPatentId(null);
        setSuccess("Patent saved!");
      } catch (err) {
        setError(err.message);
      }
    };

    const saveVol = async () => {
      try {
        if (editingVolId) {
          await updateVolunteering(editingVolId, vol);
        } else {
          await addVolunteering(vol);
        }
        setVol({ role: "", organization: "" });
        setEditingVolId(null);
        setSuccess("Volunteering saved!");
      } catch (err) {
        setError(err.message);
      }
    };

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold mb-3">{t.HonorsAwards}</h3>
          <div className="space-y-2 mb-4">
            {profile.honors?.map((h) => (
              <div key={h._id || h.title} className="p-3 border border-gray-200 rounded-lg flex justify-between items-center">
                <div>
                  <p className="font-semibold">{h.title}</p>
                  <p className="text-sm text-gray-600">{h.issuer}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingHonorId(h._id);
                      setHonor(h);
                    }}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={async () => {
                      if (window.confirm("Delete this honor?")) {
                        await deleteHonor(h._id);
                      }
                    }}
                    className="text-red-600 hover:text-red-800"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Title"
              className="px-3 py-2 border border-gray-300 rounded-lg"
              value={honor.title}
              onChange={(e) => setHonor({ ...honor, title: e.target.value })}
            />
            <input
              type="text"
              placeholder="Issuer"
              className="px-3 py-2 border border-gray-300 rounded-lg"
              value={honor.issuer}
              onChange={(e) => setHonor({ ...honor, issuer: e.target.value })}
            />
            <button
              onClick={saveHonor}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              {editingHonorId ? t.update : t.add}
            </button>
          </div>
        </div>

        <hr />

        <div>
          <h3 className="text-xl font-semibold mb-3">{t.Courses}</h3>
          <div className="space-y-2 mb-4">
            {profile.courses?.map((c) => (
              <div key={c._id || c.name} className="p-3 border border-gray-200 rounded-lg flex justify-between items-center">
                <p className="font-semibold">{c.name}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingCourseId(c._id);
                      setCourse(c);
                    }}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={async () => {
                      if (window.confirm("Delete this course?")) {
                        await deleteCourse(c._id);
                      }
                    }}
                    className="text-red-600 hover:text-red-800"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Course name"
              className="md:col-span-3 px-3 py-2 border border-gray-300 rounded-lg"
              value={course.name}
              onChange={(e) => setCourse({ ...course, name: e.target.value })}
            />
            <button
              onClick={saveCourse}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              {editingCourseId ? t.update : t.add}
            </button>
          </div>
        </div>

        <hr />

        <div>
          <h3 className="text-xl font-semibold mb-3">{t.Patents}</h3>
          <div className="space-y-2 mb-4">
            {profile.patents?.map((p) => (
              <div key={p._id || p.title} className="p-3 border border-gray-200 rounded-lg flex justify-between items-center">
                <p className="font-semibold">{p.title}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingPatentId(p._id);
                      setPatent(p);
                    }}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={async () => {
                      if (window.confirm("Delete this patent?")) {
                        await deletePatent(p._id);
                      }
                    }}
                    className="text-red-600 hover:text-red-800"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Patent title"
              className="md:col-span-3 px-3 py-2 border border-gray-300 rounded-lg"
              value={patent.title}
              onChange={(e) => setPatent({ ...patent, title: e.target.value })}
            />
            <button
              onClick={savePatent}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              {editingPatentId ? t.update : t.add}
            </button>
          </div>
        </div>

        <hr />

        <div>
          <h3 className="text-xl font-semibold mb-3">{t.Volunteering}</h3>
          <div className="space-y-2 mb-4">
            {profile.volunteering?.map((v) => (
              <div key={v._id || v.organization} className="p-3 border border-gray-200 rounded-lg flex justify-between items-center">
                <div>
                  <p className="font-semibold">{v.role}</p>
                  <p className="text-sm text-gray-600">@ {v.organization}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingVolId(v._id);
                      setVol(v);
                    }}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={async () => {
                      if (window.confirm("Delete this volunteering entry?")) {
                        await deleteVolunteering(v._id);
                      }
                    }}
                    className="text-red-600 hover:text-red-800"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Role"
              className="px-3 py-2 border border-gray-300 rounded-lg"
              value={vol.role}
              onChange={(e) => setVol({ ...vol, role: e.target.value })}
            />
            <input
              type="text"
              placeholder="Organization"
              className="px-3 py-2 border border-gray-300 rounded-lg"
              value={vol.organization}
              onChange={(e) => setVol({ ...vol, organization: e.target.value })}
            />
            <button
              onClick={saveVol}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              {editingVolId ? t.update : t.add}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const ReviewStep = () => (
  <div className="space-y-6">
    <h3 className="text-2xl font-bold">{t.reviewProfile}</h3>

    {/* BASIC INFO */}
    <div>
      <p className="text-sm font-medium text-gray-500 mb-2">{t.basicInfo}</p>
      <div className="p-4 border border-gray-200 rounded-lg">
        <div className="flex items-center gap-4 mb-3">
          <div
            className="w-14 h-14 rounded-full bg-gray-200 bg-cover bg-center"
            style={{ backgroundImage: profile.profilePicture ? `url(${profile.profilePicture})` : "none" }}
          />
          <div>
            <p className="font-bold text-lg">{profile.name || t.name}</p>
            <p className="text-sm text-gray-600">{profile.headline || "No headline"}</p>
            {/* <p className="text-sm text-gray-600">{profile.profession || "No profession"}</p> */}
            <p className="text-xs text-gray-500">{profile.city && profile.country ? `${profile.city}, ${profile.country}` : "Location not specified"}</p>
          </div>
        </div>
        <p className="text-sm text-gray-700">{profile.about || "No description"}</p>
      </div>
    </div>

    {/* EXPERIENCE */}
    <div>
      <p className="text-sm font-medium text-gray-500 mb-2">
        {t.experience} ({Array.isArray(profile.experience) ? profile.experience.length : 0})
      </p>
      {Array.isArray(profile.experience) && profile.experience.length > 0 ? (
        profile.experience.slice(0, 3).map((e) => (
          <div key={e._id || e.title} className="p-3 border border-gray-200 rounded-lg mb-2">
            <p className="font-semibold">{e.title}</p>
            <p className="text-sm text-gray-600">{e.company} • {e.location}</p>
            <p className="text-xs text-gray-500">
              {e.startDate ? new Date(e.startDate).toLocaleDateString() : ""} - {e.currentlyWorking ? "Present" : e.endDate ? new Date(e.endDate).toLocaleDateString() : ""}
            </p>
          </div>
        ))
      ) : (
        <p className="text-sm text-gray-600 italic">{t.p8}</p>
      )}
    </div>

    {/* EDUCATION */}
    <div>
      <p className="text-sm font-medium text-gray-500 mb-2">{t.education} ({profile.education?.length || 0})</p>
      {profile.education && profile.education.length > 0 ? (
        profile.education.slice(0, 3).map((e) => (
          <div key={e._id || e.school} className="p-3 border border-gray-200 rounded-lg mb-2">
            <p className="font-semibold">{e.school}</p>
            <p className="text-sm text-gray-600">{e.degree} in {e.fieldOfStudy}</p>
            <p className="text-xs text-gray-500">
              {e.startDate ? new Date(e.startDate).toLocaleDateString() : ""} - {e.endDate ? new Date(e.endDate).toLocaleDateString() : ""}
            </p>
          </div>
        ))
      ) : (
        <p className="text-sm text-gray-600 italic">{t.p9}</p>
      )}
    </div>

    {/* SKILLS */}
    <div>
      <p className="text-sm font-medium text-gray-500 mb-2">{t.skills} ({profile.skills?.length || 0})</p>
      {profile.skills && profile.skills.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {profile.skills.slice(0, 10).map((s) => (
            <span key={s} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              {s}
            </span>
          ))}
          {profile.skills.length > 10 && (
            <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
              +{profile.skills.length - 10} more
            </span>
          )}
        </div>
      ) : (
        <p className="text-sm text-gray-600 italic">{t.p10}</p>
      )}
    </div>

    {/* INTERESTS */}
    <div>
      <p className="text-sm font-medium text-gray-500 mb-2">{t.interests} ({profile.interests?.length || 0})</p>
      {profile.interests && profile.interests.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {profile.interests.slice(0, 8).map((i) => (
            <span key={i} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
              {i}
            </span>
          ))}
          {profile.interests.length > 8 && (
            <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
              +{profile.interests.length - 8} more
            </span>
          )}
        </div>
      ) : (
        <p className="text-sm text-gray-600 italic">{t.p11}</p>
      )}
    </div>

    {/* CERTIFICATIONS */}
    <div>
      <p className="text-sm font-medium text-gray-500 mb-2">{t.certifications} ({profile.certifications?.length || 0})</p>
      {profile.certifications && profile.certifications.length > 0 ? (
        profile.certifications.slice(0, 3).map((c) => (
          <div key={c._id || c.name} className="p-3 border border-gray-200 rounded-lg mb-2">
            <p className="font-semibold">{c.name}</p>
            <p className="text-sm text-gray-600">{c.issuingOrganization}</p>
          </div>
        ))
      ) : (
        <p className="text-sm text-gray-600 italic">{t.p12}</p>
      )}
    </div>

    {/* PROJECTS */}
    <div>
      <p className="text-sm font-medium text-gray-500 mb-2">{t.projects} ({profile.projects?.length || 0})</p>
      {profile.projects && profile.projects.length > 0 ? (
        profile.projects.slice(0, 3).map((p) => (
          <div key={p._id || p.name} className="p-3 border border-gray-200 rounded-lg mb-2">
            <p className="font-semibold">{p.name}</p>
            <p className="text-sm text-gray-600">{p.description}</p>
          </div>
        ))
      ) : (
        <p className="text-sm text-gray-600 italic">{t.p13}</p>
      )}
    </div>

    {/* LANGUAGES */}
    <div>
      <p className="text-sm font-medium text-gray-500 mb-2">{t.languages} ({profile.languages?.length || 0})</p>
      {profile.languages && profile.languages.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {profile.languages.map((l) => (
            <span key={l._id || l.language} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
              {l.language} — {l.proficiency}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-600 italic">{t.p14}</p>
      )}
    </div>

    {/* SOCIAL LINKS */}
    <div>
      <p className="text-sm font-medium text-gray-500 mb-2">{t.socialLinks}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {profile.github && (
          <a
            href={profile.github}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 border border-gray-200 rounded-lg text-blue-600 hover:bg-blue-50"
          >
            <p className="font-semibold">GitHub</p>
            <p className="text-xs text-gray-600 truncate">{profile.github}</p>
          </a>
        )}
        {profile.linkedin && (
          <a
            href={profile.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 border border-gray-200 rounded-lg text-blue-600 hover:bg-blue-50"
          >
            <p className="font-semibold">LinkedIn</p>
            <p className="text-xs text-gray-600 truncate">{profile.linkedin}</p>
          </a>
        )}
        {profile.twitter && (
          <a
            href={profile.twitter}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 border border-gray-200 rounded-lg text-blue-600 hover:bg-blue-50"
          >
            <p className="font-semibold">X.com (Twitter)</p>
            <p className="text-xs text-gray-600 truncate">{profile.twitter}</p>
          </a>
        )}
        {profile.website && (
          <a
            href={profile.website}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 border border-gray-200 rounded-lg text-blue-600 hover:bg-blue-50"
          >
            <p className="font-semibold">Website</p>
            <p className="text-xs text-gray-600 truncate">{profile.website}</p>
          </a>
        )}
      </div>
      {!profile.github && !profile.linkedin && !profile.twitter && !profile.website && (
        <p className="text-sm text-gray-600 italic">{t.p15}</p>
      )}
    </div>

    {/* HONORS & AWARDS */}
    <div>
      <p className="text-sm font-medium text-gray-500 mb-2">{t.HonorsAwards} ({profile.honors?.length || 0})</p>
      {profile.honors && profile.honors.length > 0 ? (
        profile.honors.slice(0, 3).map((h) => (
          <div key={h._id || h.title} className="p-3 border border-gray-200 rounded-lg mb-2">
            <p className="font-semibold">{h.title}</p>
            <p className="text-sm text-gray-600">{h.issuer}</p>
          </div>
        ))
      ) : (
        <p className="text-sm text-gray-600 italic">{t.p16}</p>
      )}
    </div>

    {/* COURSES */}
    <div>
      <p className="text-sm font-medium text-gray-500 mb-2">{t.Courses} ({profile.courses?.length || 0})</p>
      {profile.courses && profile.courses.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {profile.courses.slice(0, 5).map((c) => (
            <span key={c._id || c.name} className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
              {c.name}
            </span>
          ))}
          {profile.courses.length > 5 && (
            <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
              +{profile.courses.length - 5} more
            </span>
          )}
        </div>
      ) : (
        <p className="text-sm text-gray-600 italic">{t.p17}</p>
      )}
    </div>

    {/* PATENTS */}
    <div>
      <p className="text-sm font-medium text-gray-500 mb-2">{t.PATENTS} ({profile.patents?.length || 0})</p>
      {profile.patents && profile.patents.length > 0 ? (
        profile.patents.slice(0, 3).map((p) => (
          <div key={p._id || p.title} className="p-3 border border-gray-200 rounded-lg mb-2">
            <p className="font-semibold">{p.title}</p>
          </div>
        ))
      ) : (
        <p className="text-sm text-gray-600 italic">{t.p18}</p>
      )}
    </div>

    {/* VOLUNTEERING */}
    <div>
      <p className="text-sm font-medium text-gray-500 mb-2">{t.Volunteering} ({profile.volunteering?.length || 0})</p>
      {profile.volunteering && profile.volunteering.length > 0 ? (
        profile.volunteering.slice(0, 3).map((v) => (
          <div key={v._id || v.organization} className="p-3 border border-gray-200 rounded-lg mb-2">
            <p className="font-semibold">{v.role}</p>
            <p className="text-sm text-gray-600">@ {v.organization}</p>
          </div>
        ))
      ) : (
        <p className="text-sm text-gray-600 italic">{t.p2}</p>
      )}
    </div>
  </div>
);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-6">{t.p1}</h1>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 flex justify-between items-center">
            {error}
            <button onClick={() => setError("")} className="text-red-600 hover:text-red-800">
              ×
            </button>
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 flex justify-between items-center">
            {success}
            <button onClick={() => setSuccess("")} className="text-green-600 hover:text-green-800">
              ×
            </button>
          </div>
        )}

        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            {steps.map((label, idx) => (
              <div key={label} className="flex-1 text-center">
                <div
                  className={`mx-auto w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    idx === activeStep
                      ? "bg-blue-600 text-white"
                      : idx < activeStep
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {idx < activeStep ? "✓" : idx + 1}
                </div>
                <p className="text-xs mt-1 hidden md:block">{label}</p>
              </div>
            ))}
          </div>
          <div className="h-1 bg-gray-200 rounded-full">
            <div
              className="h-1 bg-blue-600 rounded-full transition-all"
              style={{ width: `${(activeStep / (steps.length - 1)) * 100}%` }}
            />
          </div>
        </div>

        <div className="min-h-96 mb-8">
          {activeStep === 0 && <BasicInfoStep />}
          {activeStep === 1 && <ExperienceStep />}
          {activeStep === 2 && <EducationStep />}
          {activeStep === 3 && <SkillsInterestsStep />}
          {activeStep === 4 && <CertsProjectsStep />}
          {activeStep === 5 && <LanguagesSocialsStep />}
          {activeStep === 6 && <HonorsCoursesPatentsStep />}
          {activeStep === 7 && <ReviewStep />}
        </div>

        <div className="flex justify-between">
          <button
            onClick={back}
            disabled={activeStep === 0}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← {t.Back}
          </button>

          {activeStep < steps.length - 1 ? (
            <button onClick={next} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              {t.Next} →
            </button>
          ) : (
            <button onClick={finish} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              {t.FinishSave}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
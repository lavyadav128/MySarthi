import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const skillOptions = [
  "Python",
  "Java",
  "JavaScript",
  "TypeScript",
  "C",
  "C++",
  "C#",
  "Go",
  "Rust",
  "Kotlin",
  "Swift",
  "PHP",
  "Ruby",
  "R",
  "Scala",

  "HTML",
  "CSS",
  "Sass",
  "Tailwind CSS",
  "Bootstrap",

  "React",
  "Next.js",
  "Vue.js",
  "Nuxt.js",
  "Angular",
  "Svelte",

  "Node.js",
  "Express.js",
  "NestJS",
  "Django",
  "Flask",
  "FastAPI",
  "Spring Boot",
  "Laravel",

  "REST API",
  "GraphQL",
  "WebSockets",

  "MySQL",
  "PostgreSQL",
  "MongoDB",
  "Redis",
  "SQLite",
  "Firebase",

  "AWS",
  "Azure",
  "Google Cloud",
  "Docker",
  "Kubernetes",
  "CI/CD",
  "DevOps",

  "AI",
  "Machine Learning",
  "Deep Learning",
  "Data Science",
  "NLP",
  "Computer Vision",

  "Cybersecurity",
  "Blockchain",
  "Web3",
  "Smart Contracts",

  "Android",
  "iOS",
  "React Native",
  "Flutter",

  "Testing",
  "Unit Testing",
  "Jest",
  "Cypress",
  "Selenium",

  "Git",
  "GitHub",
  "GitLab",
  "Linux",
  "Bash",

  "Agile",
  "Scrum",
  "System Design",
];

// const professionOptions = [
//   "Student",
//   "Fresher",
//   "Intern",
//   "Engineer",
//   "Developer",
//   "Designer",
//   "Manager",
//   "Analyst",
//   "Consultant",
//   "Freelancer",
//   "Entrepreneur",
//   "Other"
// ];

const interestOptions = [
  "Web Development",
  "Frontend Development",
  "Backend Development",
  "Full Stack Development",

  "Artificial Intelligence",
  "Machine Learning",
  "Deep Learning",
  "Data Science",

  "UI/UX Design",
  "Product Design",
  "Graphic Design",

  "Cloud Computing",
  "DevOps",
  "Site Reliability Engineering",

  "Mobile App Development",
  "Android Development",
  "iOS Development",
  "Cross-Platform Development",

  "Blockchain",
  "Web3",
  "Cybersecurity",

  "Game Development",
  "AR/VR",

  "Automation",
  "Testing & QA",

  "Open Source",
  "System Design",
  "Competitive Programming",

  "Startup & Entrepreneurship",
  "Freelancing",

  "Research & Innovation",
];

// ----------------------------------
// SUB-SCHEMAS
// ----------------------------------

const experienceSchema = new mongoose.Schema({
  title: String,
  company: String,
  employmentType: String, // Full-time, Part-time, Internship, Contract
  location: String,
  locationType: String, // Remote, On-site, Hybrid
  startDate: Date,
  endDate: Date,
  currentlyWorking: { type: Boolean, default: false },
  description: String
});

const educationSchema = new mongoose.Schema({
  school: String,
  degree: String,
  fieldOfStudy: String,
  startDate: Date,
  endDate: Date,
  grade: String,
  activities: String,
  description: String
});

const certificationSchema = new mongoose.Schema({
  name: String,
  issuingOrganization: String,
  issueDate: Date,
  expirationDate: Date,
  credentialId: String,
  credentialUrl: String
});

const projectSchema = new mongoose.Schema({
  name: String,
  description: String,
  link: String,
  technologies: [String]
});

const publicationSchema = new mongoose.Schema({
  title: String,
  publisher: String,
  publicationDate: Date,
  url: String,
  description: String
});

const volunteeringSchema = new mongoose.Schema({
  role: String,
  organization: String,
  cause: String,
  startDate: Date,
  endDate: Date,
  currentlyVolunteering: Boolean,
  description: String
});

const languageSchema = new mongoose.Schema({
  language: String,
  proficiency: String // Elementary, Limited, Professional, Fluent, Native
});

// const recommendationSchema = new mongoose.Schema({
//   fromName: String,
//   fromTitle: String,
//   message: String,
//   date: Date
// });

// ----------------------------------
// MAIN PROFILE SCHEMA
// ----------------------------------

const profileSchema = new mongoose.Schema({
  uuid: { type: String, default: uuidv4, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  // BASIC INFO
  name: String,
  headline: String, // "Frontend Developer at Google"
  about: String,
  profilePicture: String,
  bannerImage: String,

  // LOCATION
  country: String,
  city: String,
  address: String,

  // PROFESSION SINGLE SELECT
  // profession: { type: String, enum: professionOptions},

  // EXPERIENCE (multi-list)
  experience: { type: [experienceSchema], default: [] },


  // EDUCATION (multi-list)
  education: [educationSchema],

  // CERTIFICATIONS
  certifications: [certificationSchema],

  // SKILLS MULTI SELECT
  skills: [{ type: String, enum: skillOptions }],

  // INTERESTS MULTI SELECT
  interests: [{ type: String, enum: interestOptions }],

  // PROJECTS
  projects: [projectSchema],

  // PUBLICATIONS
  publications: [publicationSchema],

  // VOLUNTEERING
  volunteering: [volunteeringSchema],

  // LANGUAGES & PROFICIENCY
  languages: [languageSchema],

  // LINKS
  website: String,
  github: String,
  linkedin: String,
  twitter: String,
  portfolio: String,
  youtube: String,

  // RESUME & FILES
  resumeUrl: String,

  // OPEN TO WORK SETTINGS
  // openToWork: {
  //   status: { type: Boolean, default: false },
  //   jobTitles: [String],
  //   jobTypes: [String], // Full-time / Part-time / Contract
  //   locations: [String],
  //   remotePreference: String // yes/no/partial
  // },

  // RECOMMENDATIONS
  // recommendations: [recommendationSchema],

  // HONORS & AWARDS
  honors: [
    {
      title: String,
      issuer: String,
      date: Date,
      description: String
    }
  ],

  // COURSES
  courses: [
    {
      name: String,
      number: String,
      associatedWith: String
    }
  ],

  // PATENTS
  patents: [
    {
      title: String,
      office: String,
      patentNumber: String,
      issueDate: Date,
      description: String
    }
  ],

  // ACHIEVEMENTS & EXTRA
  achievements: String,
  // extra: String,

  createdAt: { type: Date, default: Date.now }
});

const Profile = mongoose.model("Profile", profileSchema);
export default Profile;

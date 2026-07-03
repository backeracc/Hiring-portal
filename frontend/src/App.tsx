/** @jsxRuntime classic */
import React, { useEffect, useRef, useState } from "react";
import {
  MapPin, ArrowRight,
  ArrowLeft, CheckCircle2, X, Upload,
} from "lucide-react";
import { auth } from './firebaseConfig';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { JOB_DETAILS, type JobDetail } from "./jobData";

/* ─── Brand Colors ─── */
const GOLD        = "#E8B33D";
const GOLD_DARK   = "#E8941A";
const GOLD_LIGHT  = "#F5D873";
const CREAM       = "#FFF8E7";
const CREAM_BORDER = "#ECE4CC";
const TEXT_DARK   = "#111827";
const TEXT_MUTED  = "#6B7280";
const OPENING_BLUE = "#2563EB";

/* ─── Types ─── */
type DeptKey = "all" | "web" | "marketing" | "graphics" | "qa" | "product" | "cybersecurity" | "management";
type View = "home" | "detail" | "apply";

interface Job {
  _id?: string;
  id?: string;
  title: string;
  dept: DeptKey | string;
  type: string;
  location: string;
  openings: number;
  image: string;
}

/* ─── Static Data ─── */
const JOBS: Job[] = [
  { title: "On-Site Marketing Intern",            dept: "Marketing",          type: "Full Time",  location: "Jabalpur", openings: 41 , image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=600&q=80" },
  { title: "Quality Assurance Intern",            dept: "QA",                 type: "Full Time",  location: "Remote",   openings: 14 , image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&q=80" },
  { title: "Product Management Intern",           dept: "Product Management", type: "Full Time",  location: "Remote",   openings: 13 , image: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=600&q=80" },
  { title: "Data Analyst Intern(+Marketing)",     dept: "Product Management", type: "Full Time",  location: "Remote",   openings: 2  , image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80" },
  { title: "Junior Social Media Management Intern",dept: "Marketing",         type: "Full Time",  location: "Remote",   openings: 10 , image: "https://images.unsplash.com/photo-1611926653458-09294b3142bf?w=600&q=80" },
  { title: "AI Web Developer Intern(+Marketing)", dept: "Web Development",    type: "Full Time",  location: "Remote",   openings: 18 , image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&q=80" },
  { title: "Cybersecurity Intern",                dept: "Cybersecurity",      type: "Full Time",  location: "Remote",   openings: 12 , image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&q=80" },
  { title: "Senior Manager",                      dept: "Management",         type: "Full Time",  location: "Jabalpur", openings: 1  , image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&q=80" },
  { title: "UI/UX Designer",                      dept: "UI/UX Design",       type: "Full Time",  location: "Remote", openings: 2, image: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=600&q=80" }, 
  { title: "AI Graphics Designer",                dept: "Graphics Design",    type: "Full Time",  location: "Remote",   openings: 13 , image: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=600&q=80" },
];

const DEPARTMENTS: { key: string; label: string }[] = [
  { key: "all",                label: "Explore All Roles"  },
  { key: "Web Development",    label: "Web Development"     },
  { key: "Marketing",          label: "Marketing"           },
  { key: "Graphics Design",    label: "Graphics Design"     },
  { key: "QA",                 label: "QA"                  },
  { key: "Product Management", label: "Product Management"  },
  { key: "Cybersecurity",      label: "Cybersecurity"       },
  { key: "Management",         label: "Management"          },
  { key: "Data Analyst",       label: "Data Analyst"        },
  { key: "UI/UX Design",       label: "UI/UX Design"        },
];

const STATS = [
  { value: "12+",  label: "Interns Onboarded",    image: "/internships.jpg" },
  { value: "40%",  label: "Convert to Full-time", image: "/Convert to Full time.jpg" },
  { value: "19+",  label: "Roles Open",           image: "/Opening-roles.jpg" },
  { value: "2024", label: "Founded",              image: "/found.png", imageHeight: "h-[220px]", imagePosition: "center 34%" },
];

const ABOUT_FEATURES = [
  { image: "/Local-Products.jpg", title: "Local Products", desc: "Curated marketplace for Jabalpur businesses." },
  { image: "/Community.jpg", title: "Community First", desc: "Built for and by the local community." },
  { image: "/Secure-Shopping.jpg", title: "Secure Shopping", desc: "Safe, trusted transactions guaranteed." },
  { image: "/fastdelivery.png", title: "Fast Delivery", desc: "Quick delivery within Jabalpur city.", imageHeight: "h-[220px]", imagePosition: "center 28%" },
];

const WHY_JOIN_CARDS = [
  { icon: "https://img.icons8.com/?size=96&id=avpbg1zsSmCi&format=png", title: "Real Projects", desc: "Work on live features used by real users in Jabalpur." },
  { icon: "https://img.icons8.com/?size=96&id=11169&format=png", title: "Certificate of Completion", desc: "Receive a verified certificate to showcase your achievement." },
  { icon: "https://img.icons8.com/?size=96&id=85933&format=png", title: "Career Growth", desc: "40% of interns convert to full-time roles." },
  { icon: "https://img.icons8.com/?size=96&id=EQmjQY0IQdmp&format=png", title: "Fun & Inclusive Culture", desc: "A small, welcoming team that celebrates every milestone." },
];

const CONTACTS = [
  { icon: "email",         label: "Founder",    value: "founder@localsm.com"     },
  { icon: "email",         label: "Management", value: "management@localsm.com"  },
  { icon: "place-marker",  label: "Address",    value: "Jabalpur, Madhya Pradesh" },
];

/* ─── Small UI Components ─── */

function Logo({ onHome }: { onHome?: () => void }) {
  return (
    <a
      href="#"
      onClick={(e) => { e.preventDefault(); onHome?.(); }}
      className="flex items-center gap-2"
    >
      <img
        src="/logo.png"
        alt="LocalSM"
        width={36}
        height={36}
        className="h-9 w-9 object-contain shrink-0"
      />
      <div className="flex items-baseline gap-1 leading-none">
        <span style={{ fontFamily: "'Berkshire Swash', serif", fontSize: "1.35rem", color: TEXT_DARK }}>Local</span>
        <span style={{ fontFamily: "'Berkshire Swash', serif", fontSize: "1.35rem", color: GOLD_DARK  }}>SM</span>
        <span style={{ fontFamily: "'Berkshire Swash', serif", fontSize: "1.30rem", color: TEXT_DARK }}>Hiring</span>

      </div>
    </a>
  );
}

function PillButton({
  variant, children, href, onClick, type: btnType,
}: {
  variant: "filled" | "outlined";
  children: React.ReactNode;
  href?: string;
  onClick?: (e: React.MouseEvent) => void;
  type?: "button" | "submit";
}) {
  const filled   : React.CSSProperties = { backgroundColor: GOLD,   color: TEXT_DARK };
  const outlined : React.CSSProperties = { border: `2px solid ${TEXT_DARK}`, backgroundColor: "#fff", color: TEXT_DARK };
  const base = "inline-block rounded-full px-6 py-2.5 text-sm font-semibold transition-all active:scale-95 cursor-pointer";
  const style = variant === "filled" ? filled : outlined;
  if (href) {
    return <a href={href} onClick={onClick} className={base} style={style}>{children}</a>;
  }
  return (
    <button type={btnType ?? "button"} onClick={onClick} className={base} style={style}>
      {children}
    </button>
  );
}

function Icon3D({ size, icon }: { size: number; icon: string }) {
  return (
    <img
      src={`https://img.icons8.com/3d-fluency/${size}/${icon}.png`}
      alt={icon} width={size} height={size} className="object-contain"
    />
  );
}

/* ─── Navbar ─── */
function Navbar({
  scrolled, onHome, mobileOpen, setMobileOpen,
}: {
  scrolled: boolean;
  onHome: () => void;
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
}) {
  const navLinks = [
    { label: "About",      href: "#about"      },
    { label: "Contact Us", href: "#contact-us" },
    { label: "Jobs",       href: "#open-roles" },
  ];

  const handleLink = (href: string) => {
    onHome();
    setMobileOpen(false);
    setTimeout(() => {
      const el = document.querySelector(href);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  return (
    <header
      className="sticky top-0 z-50 transition-shadow duration-300"
      style={{ backgroundColor: GOLD_LIGHT, boxShadow: scrolled ? "0 2px 16px rgba(0,0,0,0.08)" : "none" }}
    >
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
        <Logo onHome={onHome} />
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={(e) => { e.preventDefault(); handleLink(l.href); }}
              className="text-sm font-semibold transition-opacity hover:opacity-60 relative group"
              style={{ color: TEXT_DARK }}
            >
              {l.label}
              <span className="absolute -bottom-[6px] left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="block w-1.5 h-1.5 rounded-full" style={{ backgroundColor: TEXT_DARK }} />
              </span>
            </a>
          ))}
        </nav>
        <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke={TEXT_DARK} strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="5" x2="17" y2="5" />
            <line x1="3" y1="10" x2="17" y2="10" />
            <line x1="3" y1="15" x2="17" y2="15" />
          </svg>
        </button>
      </div>
      {mobileOpen && (
        <div className="md:hidden border-t px-6 py-4 space-y-3" style={{ borderColor: CREAM_BORDER, backgroundColor: GOLD_LIGHT }}>
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={(e) => { e.preventDefault(); handleLink(l.href); }}
              className="block text-sm font-semibold"
              style={{ color: TEXT_DARK }}
            >
              {l.label}
            </a>
          ))}
        </div>
      )}
    </header>
  );
}

/* ─── Application Form Modal ─── */
const fieldBase = "w-full px-3.5 py-2.5 rounded-lg text-sm outline-none transition-colors bg-white";
const fieldStyle: React.CSSProperties = { border: `1px solid ${CREAM_BORDER}`, color: TEXT_DARK };
const focusField = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => { e.target.style.borderColor = GOLD_DARK; };
const blurField  = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => { e.target.style.borderColor = CREAM_BORDER; };

function Field({ label, optional, children }: { label: string; optional?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-1.5" style={{ color: TEXT_DARK }}>
        {label}{" "}
        {optional
          ? <span className="font-normal" style={{ color: TEXT_MUTED }}>(optional)</span>
          : <span style={{ color: GOLD_DARK }}>*</span>}
      </label>
      {children}
    </div>
  );
}

function ApplyModal({ job, onClose }: { job: JobDetail; onClose: () => void }) {
  const [submitted, setSubmitted] = useState(false);
  const [fileName, setFileName] = useState("");
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const isUnpaid = job.compensation?.toLowerCase() === "unpaid";
  const [form, setForm] = useState({
    name: "", email: "", phone: "", linkedin: "", portfolio: "", github: "",
    location: "", expectedSalary: "", coverLetter: ""
  });
  const modalRef = useRef<HTMLDivElement>(null);
  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [field]: e.target.value });

  // Close on backdrop click
  const handleBackdrop = (e: React.MouseEvent) => {
    if (e.target === modalRef.current) onClose();
  };

  // Prevent scroll on body
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("jobId", (job as any)._id || (job as any).id || "");
    formData.append("name", form.name);
    formData.append("email", form.email);
    formData.append("phone", form.phone);
    formData.append("linkedin", form.linkedin);
    formData.append("portfolio", form.portfolio);
    formData.append("github", form.github);
    formData.append("location", form.location);
    formData.append("expectedSalary", form.expectedSalary);
    formData.append("coverLetter", form.coverLetter);
    const customAnswersArray = job.customQuestions.map((q, i) => ({
      question: q,
      answer: answers[i] || ""
    }));
    formData.append("customAnswers", JSON.stringify(customAnswersArray));

    const fileInput = e.currentTarget.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput && fileInput.files && fileInput.files[0]) {
      formData.append("resume", fileInput.files[0]);
    }

    try {
      const res = await fetch("/api/public/apply", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        alert("Failed to submit application");
      }
    } catch (err) {
      console.error(err);
      alert("Error submitting application");
    }
  };

  return (
    <div
      ref={modalRef}
      onClick={handleBackdrop}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(3px)" }}
    >
      <div
        className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl"
        style={{ backgroundColor: "#fff" }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: CREAM_BORDER, backgroundColor: "#fff" }}>
          <div>
            <p className="text-xs" style={{ color: TEXT_MUTED }}>Applying for</p>
            <h3 className="font-extrabold text-base leading-tight" style={{ color: TEXT_DARK }}>{job.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-gray-100"
            aria-label="Close"
          >
            <X className="w-4 h-4" style={{ color: TEXT_MUTED }} />
          </button>
        </div>

        {submitted ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-5" style={{ backgroundColor: CREAM }}>
              <CheckCircle2 className="w-9 h-9" style={{ color: GOLD_DARK }} />
            </div>
            <h3 className="text-xl font-extrabold mb-2" style={{ color: TEXT_DARK }}>Application Submitted!</h3>
            <p className="text-sm max-w-sm leading-relaxed mb-6" style={{ color: TEXT_MUTED }}>
              Thank you for applying to <strong>{job.title}</strong> at LocalSM. We'll review your application and get back to you soon.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-full text-sm font-semibold transition-all active:scale-95"
              style={{ backgroundColor: GOLD, color: TEXT_DARK }}
            >
              Back to Roles
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Full Name">
                <input type="text" required placeholder="Your name" value={form.name} onChange={set("name")}
                  className={fieldBase} style={fieldStyle} onFocus={focusField} onBlur={blurField} />
              </Field>
              <Field label="Email">
                <input type="email" required placeholder="you@example.com" value={form.email} onChange={set("email")}
                  className={fieldBase} style={fieldStyle} onFocus={focusField} onBlur={blurField} />
              </Field>
              <Field label="Phone Number">
                <input type="tel" required placeholder="+91 98765 43210" value={form.phone} onChange={set("phone")}
                  className={fieldBase} style={fieldStyle} onFocus={focusField} onBlur={blurField} />
              </Field>
              <Field label="Location">
                <input type="text" required placeholder="City, Country" value={form.location} onChange={set("location")}
                  className={fieldBase} style={fieldStyle} onFocus={focusField} onBlur={blurField} />
              </Field>
              <Field label="LinkedIn">
                <input type="url" required placeholder="linkedin.com/in/yourname" value={form.linkedin} onChange={set("linkedin")}
                  className={fieldBase} style={fieldStyle} onFocus={focusField} onBlur={blurField} />
              </Field>
              <Field label="Portfolio / GitHub" optional>
                <input type="url" placeholder="Link to your work" value={form.portfolio} onChange={set("portfolio")}
                  className={fieldBase} style={fieldStyle} onFocus={focusField} onBlur={blurField} />
              </Field>
            </div>

            {!isUnpaid && (
              <Field label="Expected Salary" optional>
                <input type="text" placeholder="e.g. $80,000/yr" value={form.expectedSalary} onChange={set("expectedSalary")}
                  className={fieldBase} style={fieldStyle} onFocus={focusField} onBlur={blurField} />
              </Field>
            )}

            <Field label="Resume">
              <label
                className="flex items-center gap-3 px-3.5 py-3 rounded-lg cursor-pointer"
                style={{ border: `1px dashed ${CREAM_BORDER}` }}
              >
                <Upload className="w-4 h-4 shrink-0" style={{ color: GOLD_DARK }} />
                <span className="text-sm truncate" style={{ color: fileName ? TEXT_DARK : TEXT_MUTED }}>
                  {fileName || "Upload PDF, DOC, or DOCX"}
                </span>
                <input
                  type="file"
                  required
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={(e) => setFileName(e.target.files?.[0]?.name || "")}
                />
              </label>
            </Field>

            <Field label="Cover Letter" optional>
              <textarea
                rows={3}
                placeholder="A few lines on why you'd be a great fit..."
                value={form.coverLetter}
                onChange={set("coverLetter")}
                className={`${fieldBase} resize-none`}
                style={fieldStyle}
                onFocus={focusField}
                onBlur={blurField}
              />
            </Field>

            {job.customQuestions.length > 0 && (
              <div className="space-y-5 pt-1 border-t" style={{ borderColor: CREAM_BORDER }}>
                {job.customQuestions.map((q, i) => (
                  <Field key={i} label={q}>
                    <textarea
                      required
                      rows={2}
                      placeholder="Your answer..."
                      value={answers[i] ?? ""}
                      onChange={(e) => setAnswers({ ...answers, [i]: e.target.value })}
                      className={`${fieldBase} resize-none`}
                      style={fieldStyle}
                      onFocus={focusField}
                      onBlur={blurField}
                    />
                  </Field>
                ))}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-full font-bold text-sm transition-all active:scale-95 hover:brightness-95"
              style={{ backgroundColor: GOLD, color: TEXT_DARK }}
            >
              Submit Application
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

/* ─── Simple section wrapper for the Job Detail page ─── */
function DetailSection({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="py-10 border-b last:border-b-0" style={{ borderColor: CREAM_BORDER }}>
      <h2 className="text-lg font-extrabold mb-1" style={{ color: TEXT_DARK }}>{title}</h2>
      {subtitle && <p className="text-xs mb-4" style={{ color: TEXT_MUTED }}>{subtitle}</p>}
      <div className={subtitle ? "" : "mt-4"}>{children}</div>
    </section>
  );
}

function DotList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2.5">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-3 text-sm" style={{ color: TEXT_MUTED }}>
          <span className="mt-2 w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: GOLD_DARK }} />
          {item}
        </li>
      ))}
    </ul>
  );
}

/* ─── Job Detail Page ─── */
function JobDetailPage({
  job,
  onBack,
  onApply,
}: {
  job: JobDetail;
  onBack: () => void;
  onApply: () => void;
}) {
  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, []);

  const SELECTION_STEPS = [
    { title: "Assessment", desc: "Submit your application and complete a short role-relevant assessment." },
    { title: "Interview",  desc: "A conversation with the team to get to know you and your skills better." },
    { title: "Final Selection", desc: "Shortlisted candidates receive an offer and onboarding details." },
  ];

  return (
    <div style={{ backgroundColor: "#fff" }}>
      {/* Header */}
      <div className="border-b" style={{ backgroundColor: CREAM, borderColor: CREAM_BORDER }}>
        <div className="max-w-3xl mx-auto px-6 py-14 sm:py-16">
          <button
            onClick={onBack}
            className="mb-5 inline-flex items-center gap-1.5 text-xs font-semibold transition-opacity hover:opacity-70 w-fit"
            style={{ color: TEXT_MUTED }}
          >
            <ArrowLeft className="w-4 h-4" /> Back to Open Roles
          </button>
          <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight mb-3" style={{ color: TEXT_DARK }}>{job.title}</h1>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs" style={{ color: TEXT_MUTED }}>
            <span className="capitalize">{job.dept}</span>
            <span>/</span>
            <span>{job.type}</span>
            <span>/</span>
            <span>{job.compensation}</span>
            {job.duration && (<><span>/</span><span>{job.duration}</span></>)}
            <span>/</span>
            <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" />{job.location}</span>
            <span
              className="ml-1 px-2.5 py-0.5 rounded-full text-[0.65rem] font-bold"
              style={{ backgroundColor: GOLD, color: TEXT_DARK }}
            >
              {job.openings} Opening{job.openings !== 1 ? "s" : ""}
            </span>
          </div>
          {/* Removed Apply button from header as requested */}
        </div>
      </div>

      {/* Body — single column, simple sections */}
      <div className="max-w-3xl mx-auto px-6">

        <DetailSection title="About the Role">
          <p className="text-sm leading-relaxed" style={{ color: TEXT_MUTED }}>{job.description}</p>
        </DetailSection>

        {job.skills && job.skills.length > 0 && (
          <DetailSection title="Skills Required">
            <div className="flex flex-wrap gap-2.5">
              {job.skills.map((skill, i) => (
                <span
                  key={i}
                  className="px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all hover:scale-105"
                  style={{ backgroundColor: CREAM, color: TEXT_DARK, border: `1px solid ${CREAM_BORDER}` }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </DetailSection>
        )}

        {job.customQuestions && job.customQuestions.length > 0 && (
          <DetailSection title="Application Questions">
            <p className="text-xs mb-4" style={{ color: TEXT_MUTED }}>
              You will be asked to answer these questions when submitting your application:
            </p>
            <ul className="space-y-3.5">
              {job.customQuestions.map((q, i) => (
                <li key={i} className="flex items-start gap-3.5 text-sm" style={{ color: TEXT_MUTED }}>
                  <span
                    className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ backgroundColor: GOLD, color: TEXT_DARK }}
                  >
                    {i + 1}
                  </span>
                  <span className="mt-0.5 leading-relaxed">{q}</span>
                </li>
              ))}
            </ul>
          </DetailSection>
        )}

      </div>

      {/* Action Section */}
      <div className="border-t" style={{ backgroundColor: CREAM, borderColor: CREAM_BORDER }}>
        <div className="max-w-3xl mx-auto px-6 py-16 text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-3" style={{ color: TEXT_DARK }}>Ready to Apply?</h2>
          <p className="max-w-md mx-auto leading-relaxed mb-7" style={{ color: TEXT_MUTED }}>
            Submit your information and resume for the {job.title} role. We'll review it and get back to you soon.
          </p>
          <PillButton variant="filled" onClick={onApply}>Apply for this Role</PillButton>
        </div>
      </div>
    </div>
  );
}

/* ─── Selection Process Page ─── */
interface SelectionProcessPageProps {
  job: JobDetail;
  onBack: () => void;
}

function SelectionProcessPage({ job, onBack }: SelectionProcessPageProps) {
  const [step, setStep] = useState<"verification" | "details" | "legal">("verification");
  
  // Verification states
  const [phone, setPhone] = useState("");
  const [phoneOtp, setPhoneOtp] = useState("");
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [phoneOtpVerified, setPhoneOtpVerified] = useState(false);
  const [phoneOtpError, setPhoneOtpError] = useState("");
  const [phoneConfirmationResult, setPhoneConfirmationResult] = useState<ConfirmationResult | null>(null);

  const [email, setEmail] = useState("");
  const [emailOtp, setEmailOtp] = useState("");
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailOtpVerified, setEmailOtpVerified] = useState(false);
  const [emailOtpError, setEmailOtpError] = useState("");

  // Application details state
  const [form, setForm] = useState({
    name: "",
    location: "",
    linkedin: "",
    portfolio: "",
    github: "",
    expectedSalary: "",
    coverLetter: ""
  });
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Legal Notice checkboxes
  const [agreedPolicy, setAgreedPolicy] = useState(false);
  const [agreedDeclaration, setAgreedDeclaration] = useState(false);
  const [legalError, setLegalError] = useState("");

  const isUnpaid = job.compensation?.toLowerCase() === "unpaid";

  const setupRecaptcha = () => {
    if (!(window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible'
      });
    }
  };

  const handleSendPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;
    try {
      setPhoneOtpError("");
      setupRecaptcha();
      const appVerifier = (window as any).recaptchaVerifier;
      const confirmationResult = await signInWithPhoneNumber(auth, phone, appVerifier);
      setPhoneConfirmationResult(confirmationResult);
      setPhoneOtpSent(true);
    } catch (error: any) {
      console.error(error);
      setPhoneOtpError(error.message || "Failed to send SMS OTP.");
    }
  };

  const handleVerifyPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneConfirmationResult) return;
    try {
      await phoneConfirmationResult.confirm(phoneOtp);
      setPhoneOtpVerified(true);
      setPhoneOtpError("");
    } catch (error: any) {
      setPhoneOtpError("Invalid OTP or expired.");
    }
  };

  const handleSendEmailOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    try {
      setEmailOtpError("");
      const res = await fetch('/api/public/send-email-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setEmailOtpSent(true);
      } else {
        setEmailOtpError(data.error || "Failed to send Email OTP.");
      }
    } catch (error: any) {
      setEmailOtpError("Network error. Please try again.");
    }
  };

  const handleVerifyEmailOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/public/verify-email-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: emailOtp })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setEmailOtpVerified(true);
        setEmailOtpError("");
      } else {
        setEmailOtpError(data.error || "Invalid OTP.");
      }
    } catch (error: any) {
      setEmailOtpError("Network error. Please try again.");
    }
  };

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeFile) {
      setSubmitError("Please upload your resume.");
      return;
    }
    setSubmitError("");
    setStep("legal");
  };

  const handleLegalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedPolicy || !agreedDeclaration) {
      setLegalError("Please accept both checkboxes to continue.");
      return;
    }
    setLegalError("");
    setSubmitting(true);

    const formData = new FormData();
    formData.append("jobId", (job as any)._id || (job as any).id || "");
    formData.append("name", form.name);
    formData.append("email", email);
    formData.append("phone", phone);
    formData.append("linkedin", form.linkedin);
    formData.append("portfolio", form.portfolio);
    formData.append("github", form.github);
    formData.append("location", form.location);
    formData.append("expectedSalary", form.expectedSalary);
    formData.append("coverLetter", form.coverLetter);

    const customAnswersArray = job.customQuestions.map((q, i) => ({
      question: q,
      answer: answers[i] || ""
    }));
    formData.append("customAnswers", JSON.stringify(customAnswersArray));
    formData.append("resume", resumeFile!);

    try {
      const res = await fetch("/api/public/apply", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        const text = await res.text();
        setLegalError(`Failed to submit application: ${text}`);
      }
    } catch (err) {
      console.error(err);
      setLegalError("Error submitting application. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const setField = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [field]: e.target.value });
  };

  const steps = [
    { id: "verification", label: "Dual Verification" },
    { id: "details", label: "Application Details" },
    { id: "legal", label: "Legal Notice" },
  ];

  return (
    <div className="min-h-screen py-12 px-6 bg-white">
      <div className="w-full max-w-5xl mx-auto">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="mb-8 inline-flex items-center gap-1.5 text-xs font-semibold transition-opacity hover:opacity-70 w-fit"
          style={{ color: TEXT_MUTED }}
        >
          <ArrowLeft className="w-4 h-4" /> Back to Job Details
        </button>

        {/* Title Block */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-extrabold mb-2" style={{ color: TEXT_DARK }}>Selection Process</h1>
          <p className="text-sm" style={{ color: TEXT_MUTED }}>
            Applying for <strong style={{ color: TEXT_DARK }}>{job.title}</strong>
          </p>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-between w-full mb-12 px-4">
          {steps.map((s, idx) => {
            const isActive = step === s.id;
            const isCompleted = 
              (s.id === "verification" && (step === "details" || step === "legal")) ||
              (s.id === "details" && step === "legal");
            
            return (
              <React.Fragment key={s.id}>
                {idx > 0 && (
                  <div 
                    className="flex-1 h-0.5 mx-2 transition-colors duration-300" 
                    style={{ backgroundColor: isCompleted ? GOLD_DARK : CREAM_BORDER }}
                  />
                )}
                <div className="flex flex-col items-center gap-1">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
                    style={{ 
                      backgroundColor: isCompleted ? GOLD_DARK : isActive ? GOLD : CREAM,
                      color: isCompleted ? "#fff" : isActive ? TEXT_DARK : TEXT_MUTED,
                      border: `2px solid ${isCompleted || isActive ? GOLD_DARK : CREAM_BORDER}`
                    }}
                  >
                    {isCompleted ? "✓" : idx + 1}
                  </div>
                  <span 
                    className="text-[0.65rem] sm:text-xs font-semibold whitespace-nowrap"
                    style={{ color: isActive || isCompleted ? TEXT_DARK : TEXT_MUTED }}
                  >
                    {s.label}
                  </span>
                </div>
              </React.Fragment>
            );
          })}
        </div>

        {/* Step 1: Dual Verification */}
        {step === "verification" && (
          <div className="w-full p-6 md:p-10 rounded-2xl border bg-white" style={{ borderColor: CREAM_BORDER }}>
            <h2 className="text-lg font-extrabold mb-8 text-center" style={{ color: TEXT_DARK }}>Step 1: Contact Verification</h2>
            <div id="recaptcha-container"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
              
              {/* Left Column: Email Verification */}
              <div className="flex flex-col space-y-4">
                <h3 className="font-bold text-md border-b pb-2" style={{ color: TEXT_DARK, borderColor: CREAM_BORDER }}>Email Address</h3>
                
                <form onSubmit={handleSendEmailOtp} className="space-y-4">
                  <Field label="Email">
                    <div className="flex flex-col gap-2">
                      <input
                        type="email"
                        required
                        disabled={emailOtpVerified}
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={fieldBase}
                        style={fieldStyle}
                        onFocus={focusField}
                        onBlur={blurField}
                      />
                      {!emailOtpVerified && (
                        <button
                          type="submit"
                          className="w-full py-2.5 rounded-lg text-sm font-semibold transition-all active:scale-95 hover:brightness-95"
                          style={{ backgroundColor: GOLD, color: TEXT_DARK }}
                        >
                          {emailOtpSent ? "Resend Email OTP" : "Send Email OTP"}
                        </button>
                      )}
                    </div>
                  </Field>
                </form>

                {emailOtpSent && !emailOtpVerified && (
                  <form onSubmit={handleVerifyEmailOtp} className="space-y-4 pt-2">
                    <Field label="Enter OTP from Email">
                      <div className="flex flex-col gap-2">
                        <input
                          type="text"
                          required
                          maxLength={6}
                          placeholder="6-digit OTP"
                          value={emailOtp}
                          onChange={(e) => setEmailOtp(e.target.value)}
                          className={fieldBase}
                          style={fieldStyle}
                          onFocus={focusField}
                          onBlur={blurField}
                        />
                        {emailOtpError && <p className="text-xs font-semibold text-red-600">{emailOtpError}</p>}
                        <button
                          type="submit"
                          className="w-full py-2.5 rounded-lg font-bold text-sm transition-all active:scale-95 hover:brightness-95"
                          style={{ backgroundColor: GOLD_DARK, color: "#fff" }}
                        >
                          Verify Email
                        </button>
                      </div>
                    </Field>
                  </form>
                )}

                {emailOtpVerified && (
                  <div className="p-3.5 rounded-lg flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm font-medium mt-2">
                    <span className="text-lg">✓</span> Email verified!
                  </div>
                )}
              </div>

              {/* Right Column: Mobile Verification */}
              <div className="flex flex-col space-y-4">
                <h3 className="font-bold text-md border-b pb-2" style={{ color: TEXT_DARK, borderColor: CREAM_BORDER }}>Mobile Number</h3>
                
                <form onSubmit={handleSendPhoneOtp} className="space-y-4">
                  <Field label="Phone">
                    <div className="flex flex-col gap-2">
                      <input
                        type="tel"
                        required
                        disabled={phoneOtpVerified}
                        placeholder="+1 234 567 8900"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className={fieldBase}
                        style={fieldStyle}
                        onFocus={focusField}
                        onBlur={blurField}
                      />
                      {!phoneOtpVerified && (
                        <button
                          type="submit"
                          className="w-full py-2.5 rounded-lg text-sm font-semibold transition-all active:scale-95 hover:brightness-95"
                          style={{ backgroundColor: GOLD, color: TEXT_DARK }}
                        >
                          {phoneOtpSent ? "Resend SMS OTP" : "Send SMS OTP"}
                        </button>
                      )}
                    </div>
                  </Field>
                </form>

                {phoneOtpSent && !phoneOtpVerified && (
                  <form onSubmit={handleVerifyPhoneOtp} className="space-y-4 pt-2">
                    <Field label="Enter OTP from SMS">
                      <div className="flex flex-col gap-2">
                        <input
                          type="text"
                          required
                          maxLength={6}
                          placeholder="6-digit OTP"
                          value={phoneOtp}
                          onChange={(e) => setPhoneOtp(e.target.value)}
                          className={fieldBase}
                          style={fieldStyle}
                          onFocus={focusField}
                          onBlur={blurField}
                        />
                        {phoneOtpError && <p className="text-xs font-semibold text-red-600">{phoneOtpError}</p>}
                        <button
                          type="submit"
                          className="w-full py-2.5 rounded-lg font-bold text-sm transition-all active:scale-95 hover:brightness-95"
                          style={{ backgroundColor: GOLD_DARK, color: "#fff" }}
                        >
                          Verify Mobile
                        </button>
                      </div>
                    </Field>
                  </form>
                )}

                {phoneOtpVerified && (
                  <div className="p-3.5 rounded-lg flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm font-medium mt-2">
                    <span className="text-lg">✓</span> Mobile verified!
                  </div>
                )}
              </div>
            </div>

            {/* Next Step Action */}
            <div className="mt-12 pt-6 border-t flex justify-center" style={{ borderColor: CREAM_BORDER }}>
              <button
                onClick={() => setStep("details")}
                disabled={!emailOtpVerified || !phoneOtpVerified}
                className="w-full md:w-1/2 py-3.5 rounded-full font-bold text-sm transition-all active:scale-95 hover:brightness-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: GOLD, color: TEXT_DARK }}
              >
                Proceed to Application Details <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Application Form */}
        {step === "details" && (
          <div className="w-full p-10 rounded-2xl border bg-white" style={{ borderColor: CREAM_BORDER }}>
            {submitted ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-5" style={{ backgroundColor: CREAM }}>
                  <CheckCircle2 className="w-9 h-9" style={{ color: GOLD_DARK }} />
                </div>
                <h3 className="text-xl font-extrabold mb-2" style={{ color: TEXT_DARK }}>Application Submitted!</h3>
                <p className="text-sm max-w-sm leading-relaxed mb-6" style={{ color: TEXT_MUTED }}>
                  Thank you for applying to <strong>{job.title}</strong>. Your verification phone number ({phone}) and email ({email}) have been recorded. We will review your application soon.
                </p>
                <button
                  onClick={onBack}
                  className="px-6 py-2.5 rounded-full text-sm font-semibold transition-all active:scale-95"
                  style={{ backgroundColor: GOLD, color: TEXT_DARK }}
                >
                  Back to Roles
                </button>
              </div>
            ) : (
              <form onSubmit={handleDetailsSubmit} className="space-y-6">
                <h2 className="text-lg font-extrabold mb-4 pb-2 border-b" style={{ color: TEXT_DARK, borderColor: CREAM_BORDER }}>
                  Step 3: Applicant Details
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Field label="Full Name">
                    <input type="text" required placeholder="Your name" value={form.name} onChange={setField("name")}
                      className={fieldBase} style={fieldStyle} onFocus={focusField} onBlur={blurField} />
                  </Field>
                  <Field label="Location">
                    <input type="text" required placeholder="City, Country" value={form.location} onChange={setField("location")}
                      className={fieldBase} style={fieldStyle} onFocus={focusField} onBlur={blurField} />
                  </Field>
                  
                  {/* Verified Phone */}
                  <Field label="Verified Phone Number">
                    <div className="relative flex items-center">
                      <input type="tel" disabled value={phone}
                        className={`${fieldBase} bg-gray-50 border-green-300 pr-10 cursor-not-allowed`} 
                        style={{ ...fieldStyle, border: '1px solid #A7F3D0', color: TEXT_DARK }} />
                      <span className="absolute right-3 text-green-600 text-xs font-bold flex items-center gap-0.5">
                        ✓ Verified
                      </span>
                    </div>
                  </Field>
                  
                  {/* Verified Email */}
                  <Field label="Verified Email Address">
                    <div className="relative flex items-center">
                      <input type="email" disabled value={email}
                        className={`${fieldBase} bg-gray-50 border-green-300 pr-10 cursor-not-allowed`} 
                        style={{ ...fieldStyle, border: '1px solid #A7F3D0', color: TEXT_DARK }} />
                      <span className="absolute right-3 text-green-600 text-xs font-bold flex items-center gap-0.5">
                        ✓ Verified
                      </span>
                    </div>
                  </Field>

                  <Field label="LinkedIn">
                    <input type="url" required placeholder="linkedin.com/in/yourname" value={form.linkedin} onChange={setField("linkedin")}
                      className={fieldBase} style={fieldStyle} onFocus={focusField} onBlur={blurField} />
                  </Field>
                  <Field label="Portfolio / GitHub" optional>
                    <input type="url" placeholder="Link to your work" value={form.portfolio} onChange={setField("portfolio")}
                      className={fieldBase} style={fieldStyle} onFocus={focusField} onBlur={blurField} />
                  </Field>
                </div>

                {!isUnpaid && (
                  <Field label="Expected Salary" optional>
                    <input type="text" placeholder="e.g. $80,000/yr" value={form.expectedSalary} onChange={setField("expectedSalary")}
                      className={fieldBase} style={fieldStyle} onFocus={focusField} onBlur={blurField} />
                  </Field>
                )}

                <Field label="Resume">
                  <label
                    className="flex items-center gap-3 px-3.5 py-3 rounded-lg cursor-pointer transition-colors hover:bg-gray-50"
                    style={{ border: `1px dashed ${CREAM_BORDER}` }}
                  >
                    <Upload className="w-4 h-4 shrink-0" style={{ color: GOLD_DARK }} />
                    <span className="text-sm truncate" style={{ color: fileName ? TEXT_DARK : TEXT_MUTED }}>
                      {fileName || "Upload PDF, DOC, or DOCX"}
                    </span>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setResumeFile(file);
                          setFileName(file.name);
                        }
                      }}
                    />
                  </label>
                </Field>

                <Field label="Cover Letter" optional>
                  <textarea
                    rows={3}
                    placeholder="A few lines on why you'd be a great fit..."
                    value={form.coverLetter}
                    onChange={setField("coverLetter")}
                    className={`${fieldBase} resize-none`}
                    style={fieldStyle}
                    onFocus={focusField}
                    onBlur={blurField}
                  />
                </Field>

                {job.customQuestions.length > 0 && (
                  <div className="space-y-5 pt-5 border-t" style={{ borderColor: CREAM_BORDER }}>
                    <h3 className="font-extrabold text-sm" style={{ color: TEXT_DARK }}>Additional Questions</h3>
                    {job.customQuestions.map((q, i) => (
                      <Field key={i} label={q}>
                        <textarea
                          required
                          rows={2}
                          placeholder="Your answer..."
                          value={answers[i] ?? ""}
                          onChange={(e) => setAnswers({ ...answers, [i]: e.target.value })}
                          className={`${fieldBase} resize-none`}
                          style={fieldStyle}
                          onFocus={focusField}
                          onBlur={blurField}
                        />
                      </Field>
                    ))}
                  </div>
                )}

                {submitError && (
                  <p className="text-sm font-semibold text-red-600">{submitError}</p>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep("verification")}
                    className="w-1/3 py-3 rounded-full font-bold text-sm transition-all active:scale-95 hover:bg-gray-50 border flex items-center justify-center gap-1"
                    style={{ borderColor: CREAM_BORDER, color: TEXT_DARK }}
                  >
                    <ArrowRight className="w-4 h-4 rotate-180" /> Back
                  </button>
                  <button
                    type="submit"
                    className="w-2/3 py-3 rounded-full font-bold text-sm transition-all active:scale-95 hover:brightness-95 flex items-center justify-center gap-1"
                    style={{ backgroundColor: GOLD, color: TEXT_DARK }}
                  >
                    Next: Legal Notice <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Step 4: Legal Notice */}
        {step === "legal" && (
          <div className="w-full p-10 rounded-2xl border bg-white" style={{ borderColor: CREAM_BORDER }}>
            {submitted ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-5" style={{ backgroundColor: CREAM }}>
                  <CheckCircle2 className="w-9 h-9" style={{ color: GOLD_DARK }} />
                </div>
                <h3 className="text-xl font-extrabold mb-2" style={{ color: TEXT_DARK }}>Application Submitted!</h3>
                <p className="text-sm max-w-sm leading-relaxed mb-6" style={{ color: TEXT_MUTED }}>
                  Thank you for applying to <strong>{job.title}</strong>. Your verification phone number ({phone}) and email ({email}) have been recorded. We will review your application soon.
                </p>
                <button
                  onClick={onBack}
                  className="px-6 py-2.5 rounded-full text-sm font-semibold transition-all active:scale-95"
                  style={{ backgroundColor: GOLD, color: TEXT_DARK }}
                >
                  Back to Roles
                </button>
              </div>
            ) : (
              <form onSubmit={handleLegalSubmit} className="space-y-6">
                <h2 className="text-lg font-extrabold mb-1 pb-2 border-b" style={{ color: TEXT_DARK, borderColor: CREAM_BORDER }}>
                  Step 4: Legal Notice
                </h2>
                <p className="text-xs leading-relaxed" style={{ color: TEXT_MUTED }}>
                  Please read the following documents carefully before submitting your application.
                </p>

                {/* Document Viewer */}
                <div className="rounded-xl overflow-hidden border" style={{ borderColor: CREAM_BORDER }}>
                  <div
                    className="flex items-center justify-between px-4 py-2.5"
                    style={{ backgroundColor: CREAM, borderBottom: `1px solid ${CREAM_BORDER}` }}
                  >
                    <span className="text-xs font-bold" style={{ color: TEXT_DARK }}>📄 LocalSM Recruitment & Assessment Policy</span>
                  </div>
                  <div className="w-full overflow-y-auto bg-white p-6 text-sm space-y-4" style={{ height: "400px", color: TEXT_DARK }}>
                    <h2 className="text-xl font-bold text-center mb-1">LocalSM Recruitment &amp; Assessment Policy</h2>
                    <div className="text-center mb-6">
                      <h3 className="font-bold text-lg">Combined Round 1 + Round 2 Paper Format</h3>
                      <p className="italic text-xs mt-1" style={{ color: TEXT_MUTED }}>Draft for internal use - review with local counsel before publishing</p>
                    </div>

                    <p>This policy applies to all LocalSM recruitment assessments conducted in paper form, whether the company uses a single combined paper or two labeled sections within the same paper. Round 1 is the basic screening section; Round 2 is the technical assessment section. LocalSM may change the format, sequence, difficulty, time limit, scoring, or instructions for any role or hiring cycle at its sole discretion.</p>

                    <section>
                      <h3 className="font-bold mb-2 mt-4" style={{ color: '#1e3a8a' }}>1. Acceptance of Policy</h3>
                      <p>By registering for, accessing, signing, attempting, or submitting any LocalSM recruitment assessment, the candidate acknowledges that this policy has been read, understood, and accepted. Participation is voluntary, but compliance is mandatory. If a candidate does not agree to these terms, the candidate must not take the assessment.</p>
                    </section>

                    <section>
                      <h3 className="font-bold mb-2 mt-4" style={{ color: '#1e3a8a' }}>2. Structure of the Assessment</h3>
                      <p>LocalSM may use either of the following structures, depending on the role:</p>
                      <ul className="list-disc pl-5 space-y-1 mt-2">
                        <li>A single paper containing both Round 1 and Round 2 as separate sections; or</li>
                        <li>Two separate rounds conducted on the same day or on different dates.</li>
                      </ul>
                      <p className="mt-2">Round 1 is a basic screening section intended to test fundamentals, clarity of thought, communication, and immediate role fit. Round 2 is a deeper assessment intended to test engineering judgment, architecture, reasoning, security awareness, product thinking, and problem solving under constraints.</p>
                      <p className="mt-2">The same paper format shall not be treated as a universal template for all roles. LocalSM may use a different paper, different scoring rules, or different question types for different positions or recruitment cycles.</p>
                    </section>

                    <section>
                      <h3 className="font-bold mb-2 mt-4" style={{ color: '#1e3a8a' }}>3. Candidate Duties</h3>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Work independently and honestly.</li>
                        <li>Follow every instruction exactly as written.</li>
                        <li>Write your name, email, date, and signature only in the designated fields.</li>
                        <li>Submit only your own original work.</li>
                        <li>Explain any written answer when asked.</li>
                        <li>Maintain professional conduct throughout the process.</li>
                      </ul>
                      <p className="mt-2">Candidates are responsible for ensuring that their answers are legible, complete, and submitted within the permitted time. Any answer that is unreadable, contradictory, copied, or unsupported by the candidate's own explanation may be treated as unreliable.</p>
                    </section>

                    <section>
                      <h3 className="font-bold mb-2 mt-4" style={{ color: '#1e3a8a' }}>4. Prohibited Conduct</h3>
                      <p>Unless LocalSM has expressly allowed it in writing for that specific assessment, the following are prohibited:</p>
                      <ul className="list-disc pl-5 space-y-1 mt-2">
                        <li>Using AI tools, internet search, notes, books, messaging apps, or any external assistance.</li>
                        <li>Communicating with another person during the assessment.</li>
                        <li>Copying answers from another candidate, the internet, books, AI, or any prepared material.</li>
                        <li>Using multiple devices, hidden devices, secondary browsers, or unauthorized storage media.</li>
                        <li>Attempting to photograph, record, transcribe, reproduce, or redistribute the paper or any part of it.</li>
                        <li>Impersonation, false identity, proxy attendance, or any attempt to take the assessment on behalf of someone else.</li>
                        <li>Tampering with the assessment environment, evidence, proctoring, or submission process.</li>
                      </ul>
                      <p className="mt-2">This list is illustrative, not exhaustive. Any conduct that LocalSM reasonably considers to compromise integrity, fairness, confidentiality, or authenticity may be treated as misconduct.</p>
                    </section>

                    <section>
                      <h3 className="font-bold mb-2 mt-4" style={{ color: '#1e3a8a' }}>5. Monitoring and Verification</h3>
                      <p>To protect assessment integrity, LocalSM may use reasonable verification measures, including identity checks, invigilation, webcam monitoring where remote, screen observation where applicable, timestamped submission logs, answer-sheet review, and follow-up technical questioning.</p>
                      <p className="mt-2">Candidates consent to such monitoring to the extent required for the assessment and permitted by applicable law. LocalSM may retain monitoring outputs, submissions, and review notes for recruitment integrity, dispute handling, and security purposes for as long as reasonably necessary and lawful.</p>
                    </section>

                    <section>
                      <h3 className="font-bold mb-2 mt-4" style={{ color: '#1e3a8a' }}>6. Evidence, Review, and Final Determination</h3>
                      <p>If LocalSM suspects a violation, it may review the paper, proctoring records, timestamps, metadata, answer consistency, identity evidence, and any other relevant material. LocalSM may also conduct a verification interview or require a re-explanation of any answer.</p>
                      <p className="mt-2">If LocalSM reasonably concludes that misconduct occurred, the candidate may be disqualified immediately without further rounds. LocalSM is not required to disclose every internal detection method, model, rule, or reviewer note.</p>
                    </section>

                    <section>
                      <h3 className="font-bold mb-2 mt-4" style={{ color: '#1e3a8a' }}>7. Consequences of Misconduct</h3>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Immediate termination of the assessment.</li>
                        <li>Disqualification from the current recruitment cycle.</li>
                        <li>Cancellation of any pending interview or assessment round.</li>
                        <li>Internal marking of the application as failed for integrity reasons.</li>
                        <li>Possible rejection of future applications where permitted by law and company policy.</li>
                        <li>Referral to appropriate authorities where the facts indicate fraud, impersonation, theft, unauthorized access, or other reportable misconduct.</li>
                      </ul>
                      <p className="mt-2">LocalSM may choose the severity of the response based on the nature of the conduct, the amount of assistance involved, whether the conduct was intentional, and whether the integrity of the entire assessment has been affected.</p>
                    </section>

                    <section>
                      <h3 className="font-bold mb-2 mt-4" style={{ color: '#1e3a8a' }}>8. Confidentiality and Intellectual Property</h3>
                      <p>All question papers, scenarios, datasets, scoring rubrics, answer keys, instructions, proctoring methods, and evaluation materials are confidential and remain the property of LocalSM.</p>
                      <ul className="list-disc pl-5 space-y-1 mt-2">
                        <li>Candidates must not share the paper or any part of it with anyone.</li>
                        <li>Candidates must not upload the paper to social media, websites, or AI tools.</li>
                        <li>Candidates must not use the paper to train, fine-tune, or prompt any model.</li>
                        <li>Candidates must not reproduce the paper in whole or in part.</li>
                      </ul>
                      <p className="mt-2">Unauthorized disclosure may result in disqualification and other remedies available under applicable law.</p>
                    </section>

                    <section>
                      <h3 className="font-bold mb-2 mt-4" style={{ color: '#1e3a8a' }}>9. Data Use, Privacy, and Retention</h3>
                      <p>LocalSM will collect and use only the information reasonably required for recruitment, assessment administration, fraud prevention, and internal verification. This may include the candidate's name, contact details, assessment responses, timestamps, submission history, and integrity-related notes.</p>
                      <p className="mt-2">Where a candidate has rights under applicable law, including rights relating to access, correction, erasure, grievance, and withdrawal of consent, LocalSM will handle those requests in accordance with law and subject to any lawful retention or verification obligation.</p>
                      <p className="mt-2">LocalSM will not retain recruitment data longer than necessary for the stated purpose, unless retention is required for legal compliance, dispute handling, audit, or security review.</p>
                    </section>

                    <section>
                      <h3 className="font-bold mb-2 mt-4" style={{ color: '#1e3a8a' }}>10. Legal Basis and Applicable Indian Law</h3>
                      <p>This policy is designed to operate consistently with Indian law and should be read together with the recruitment notice, assessment instructions, and any candidate consent or acknowledgement displayed on the platform.</p>
                      <div className="overflow-x-auto mt-4">
                        <table className="w-full border-collapse border" style={{ borderColor: CREAM_BORDER }}>
                          <thead style={{ backgroundColor: CREAM }}>
                            <tr>
                              <th className="border p-2 text-left" style={{ borderColor: CREAM_BORDER }}>Law / Instrument</th>
                              <th className="border p-2 text-left" style={{ borderColor: CREAM_BORDER }}>Relevant clauses</th>
                              <th className="border p-2 text-left" style={{ borderColor: CREAM_BORDER }}>Why it matters here</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td className="border p-2 font-semibold" style={{ borderColor: CREAM_BORDER }}>Digital Personal Data Protection Act, 2023</td>
                              <td className="border p-2" style={{ borderColor: CREAM_BORDER }}>Sections 4, 5, 6, 7, 8, 11, 12, 13, 15, 16, 17</td>
                              <td className="border p-2" style={{ borderColor: CREAM_BORDER }}>Covers lawful processing, notice, consent, security, rights, grievances, data retention, and exemptions.</td>
                            </tr>
                            <tr>
                              <td className="border p-2 font-semibold" style={{ borderColor: CREAM_BORDER }}>Digital Personal Data Protection Rules, 2025</td>
                              <td className="border p-2" style={{ borderColor: CREAM_BORDER }}>Notified by MeitY on 14 Nov 2025; apply as and when the relevant rules are in force</td>
                              <td className="border p-2" style={{ borderColor: CREAM_BORDER }}>Supports operational privacy, notice, and compliance handling for digital personal data.</td>
                            </tr>
                            <tr>
                              <td className="border p-2 font-semibold" style={{ borderColor: CREAM_BORDER }}>Information Technology Act, 2000</td>
                              <td className="border p-2" style={{ borderColor: CREAM_BORDER }}>Sections 4, 5, 43A, 66C, 66D, 67C</td>
                              <td className="border p-2" style={{ borderColor: CREAM_BORDER }}>Recognizes electronic records and signatures, supports reasonable security practices, and addresses identity theft and cheating by personation.</td>
                            </tr>
                            <tr>
                              <td className="border p-2 font-semibold" style={{ borderColor: CREAM_BORDER }}>Indian Contract Act, 1872</td>
                              <td className="border p-2" style={{ borderColor: CREAM_BORDER }}>Sections 10, 13, 14, 19, 23</td>
                              <td className="border p-2" style={{ borderColor: CREAM_BORDER }}>Supports acceptance of terms, consent, free consent, and lawful object/consideration.</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      <p className="text-xs mt-2" style={{ color: TEXT_MUTED }}>The above list is non-exhaustive. LocalSM should obtain a lawyer review before publishing this policy, especially if it uses webcam monitoring, biometric checks, image capture, data retention rules, or any third-party proctoring vendor.</p>
                    </section>

                    <section>
                      <h3 className="font-bold mb-2 mt-4" style={{ color: '#1e3a8a' }}>11. Candidate Declaration</h3>
                      <p>By signing or submitting the assessment, the candidate declares that: (a) the work is original; (b) no unauthorized help was used; (c) the candidate understood the rules; (d) LocalSM may verify the submission; and (e) a confirmed violation may lead to immediate disqualification.</p>
                    </section>

                    <section>
                      <h3 className="font-bold mb-2 mt-4" style={{ color: '#1e3a8a' }}>12. LocalSM Rights</h3>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Change the format, duration, or evaluation method without prior notice.</li>
                        <li>Reject any submission where authenticity cannot be reasonably verified.</li>
                        <li>Require a re-test, re-explanation, or follow-up interview.</li>
                        <li>Invalidate a result obtained through misconduct.</li>
                        <li>Keep internal records of confirmed integrity violations.</li>
                        <li>Decline future applications where permitted by law.</li>
                      </ul>
                      <p className="mt-2 font-semibold">Nothing in this policy creates a right to selection, a right to employment, or a right to appeal.</p>
                    </section>
                  </div>
                </div>

                {/* Checkboxes */}
                <div className="space-y-3 pt-2">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={agreedPolicy}
                      onChange={(e) => setAgreedPolicy(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded accent-yellow-500 cursor-pointer shrink-0"
                    />
                    <span className="text-sm leading-snug" style={{ color: TEXT_DARK }}>
                      I have read and understood the <strong>LocalSM Recruitment &amp; Assessment Policy</strong>.
                    </span>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={agreedDeclaration}
                      onChange={(e) => setAgreedDeclaration(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded accent-yellow-500 cursor-pointer shrink-0"
                    />
                    <span className="text-sm leading-snug" style={{ color: TEXT_DARK }}>
                      I agree to the <strong>Candidate Declaration</strong>, <strong>Privacy Policy</strong> and <strong>Assessment Rules</strong>.
                    </span>
                  </label>
                </div>

                {legalError && (
                  <p className="text-sm font-semibold text-red-600">{legalError}</p>
                )}

                <div className="flex gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => setStep("details")}
                    disabled={submitting}
                    className="w-1/3 py-3 rounded-full font-bold text-sm transition-all active:scale-95 hover:bg-gray-50 border flex items-center justify-center gap-1"
                    style={{ borderColor: CREAM_BORDER, color: TEXT_DARK }}
                  >
                    <ArrowRight className="w-4 h-4 rotate-180" /> Back
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-2/3 py-3 rounded-full font-bold text-sm transition-all active:scale-95 hover:brightness-95"
                    style={{ backgroundColor: GOLD, color: TEXT_DARK }}
                  >
                    {submitting ? "Submitting Application..." : "Submit Application"}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Home Page ─── */
function HomePage({
  activeDept,
  setActiveDept,
  onJobClick,
  jobs
}: {
  activeDept: DeptKey | string;
  setActiveDept: (d: DeptKey | string) => void;
  onJobClick: (title: string) => void;
  jobs: Job[];
}) {
  const filteredJobs = activeDept === "all" ? jobs : jobs.filter((j) => j.dept === activeDept);

  return (
    <>
      {/* ─── Hero ─── */}
      <section className="pt-20 pb-12" style={{ backgroundColor: CREAM }}>
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl sm:text-6xl font-extrabold leading-[1.08] mb-5" style={{ color: TEXT_DARK }}>
              Work with<br />
              <span style={{ fontFamily: "'EB Garamond', serif", color: GOLD_DARK, fontWeight: 400 }}>Us.</span>
            </h1>
            <p className="text-base sm:text-lg leading-relaxed mb-8 max-w-md" style={{ color: TEXT_MUTED }}>
              Find jobs that match your interests and abilities with a minimal, modern hiring experience.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <PillButton variant="outlined" href="#why-join">Get Started</PillButton>
              <PillButton variant="filled"   href="#open-roles">Explore Roles</PillButton>
            </div>
          </div>
          <div className="flex items-center justify-center relative">
            <div className="absolute inset-0 rounded-full opacity-15 blur-3xl" style={{ backgroundColor: GOLD }} />
            <div className="absolute -bottom-6 -left-6 grid grid-cols-5 gap-2.5">
              {Array.from({ length: 25 }).map((_, i) => (
                <div key={i} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: GOLD_DARK, opacity: 0.2 }} />
              ))}
            </div>
            <img
              src="/hero-computer.png"
              alt="LocalSM computer"
              className="relative w-[240px] sm:w-[288px] h-[240px] sm:h-[288px] object-contain drop-shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* ─── Why Join LocalSM ─── */}
      <section id="why-join" className="scroll-mt-20 py-20 border-t" style={{ backgroundColor: "#fff", borderColor: CREAM_BORDER }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-3" style={{ color: TEXT_DARK }}>Why Join LocalSM?</h2>
            <p className="max-w-xl leading-relaxed" style={{ color: TEXT_MUTED }}>
              Work with a small, focused team building products that serve our city. Internships at LocalSM are hands-on, mentored, and designed to grow your career.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {WHY_JOIN_CARDS.map((card) => (
              <div key={card.title} className="rounded-2xl p-6 border transition-shadow hover:shadow-md" style={{ backgroundColor: CREAM, borderColor: CREAM_BORDER }}>
                <img src={card.icon} alt={`${card.title} icon`} width={48} height={48} className="h-12 w-12 object-contain" />
                <h3 className="font-bold text-base mt-4 mb-1.5" style={{ color: TEXT_DARK }}>{card.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: TEXT_MUTED }}>{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Open Roles ─── */}
      <section id="open-roles" className="scroll-mt-20 py-20 border-t" style={{ backgroundColor: CREAM, borderColor: CREAM_BORDER }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-8">
            <h2 className="text-3xl sm:text-4xl font-extrabold" style={{ color: TEXT_DARK }}>Open Roles</h2>
            <p className="mt-1" style={{ color: TEXT_MUTED }}>Explore the roles available now.</p>
          </div>

          {/* Department filter */}
          <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl w-fit mb-10" style={{ backgroundColor: "rgba(236,228,204,0.75)" }}>
            {DEPARTMENTS.map((dept) => (
              <button
                key={dept.key}
                onClick={() => setActiveDept(dept.key)}
                className="px-5 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer"
                style={{
                  backgroundColor: activeDept === dept.key ? GOLD : "transparent",
                  color: activeDept === dept.key ? TEXT_DARK : TEXT_MUTED,
                }}
              >
                {dept.label}
              </button>
            ))}
          </div>

          {/* Jobs grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredJobs.map((job) => (
              <div
                key={job.title}
                className="bg-white rounded-2xl border flex flex-col hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
                style={{ borderColor: CREAM_BORDER }}
                onClick={() => onJobClick(job.title)}
              >
                {/* Role image */}
                <div className="w-full h-36 overflow-hidden shrink-0">
                  <img
                    src={job.image}
                    alt={job.title}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>
                <div className="p-6 flex flex-1 flex-col justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-[1.05rem] mb-2 leading-snug" style={{ color: TEXT_DARK }}>{job.title}</h3>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs" style={{ color: TEXT_MUTED }}>
                      <span className="capitalize">{job.dept}</span>
                      <span>/</span>
                      <span>{job.type}</span>
                      <span>/</span>
                      <span>Unpaid</span>
                      <span>/</span>
                      <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" />{job.location}</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t flex items-center justify-between" style={{ borderColor: CREAM_BORDER }}>
                    <span className="text-xs font-bold" style={{ color: OPENING_BLUE }}>
                      {job.openings} Opening{job.openings > 1 ? "s" : ""}
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); onJobClick(job.title); }}
                      className="px-4 py-1.5 rounded-full text-sm font-bold transition-all active:scale-95 hover:brightness-95 cursor-pointer"
                      style={{ backgroundColor: GOLD, color: TEXT_DARK }}
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end mt-8">
            <button
              onClick={() => setActiveDept("all")}
              className="text-sm font-bold flex items-center gap-1 transition-opacity hover:opacity-70"
              style={{ color: GOLD_DARK }}
            >
              View all 10 roles <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ─── About + Stats ─── */}
      <section id="about" className="scroll-mt-20 py-20 border-t" style={{ backgroundColor: "#fff", borderColor: CREAM_BORDER }}>
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-14 items-start">

          {/* Left – text */}
          <div>
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-6" style={{ color: TEXT_DARK }}>About LocalSM Recruitment</h2>
            <div className="space-y-5">
              <p className="leading-relaxed" style={{ color: TEXT_MUTED }}>
                At LocalSM, we are committed to building a fair, transparent, and merit-based recruitment process. Our assessments are designed to evaluate candidates based on their skills, technical knowledge, problem-solving abilities, and professional integrity, ensuring equal opportunities for every applicant.
              </p>
              <p className="leading-relaxed" style={{ color: TEXT_MUTED }}>
                We maintain the security and fairness of our hiring process through appropriate verification measures while protecting candidate privacy and handling personal information responsibly. All assessment materials remain confidential to preserve the integrity of our evaluations.
              </p>
              <p className="leading-relaxed" style={{ color: TEXT_MUTED }}>
                Our recruitment practices are guided by ethical standards and aligned with applicable Indian legal and data protection requirements, providing candidates with a secure, professional, and trustworthy hiring experience.
              </p>
            </div>
          </div>

          {/* Right – stats only */}
          <div className="grid grid-cols-2 gap-4">
            {STATS.map((stat) => (
              <div key={stat.label} className="rounded-2xl border p-5" style={{ borderColor: CREAM_BORDER, backgroundColor: CREAM }}>
                <img
                  src={stat.image}
                  alt={stat.label}
                  className={`w-full ${stat.imageHeight ?? "aspect-video"} object-cover rounded-2xl mb-3`}
                  style={{ objectPosition: stat.imagePosition ?? "center" }}
                />
                <div className="text-2xl font-extrabold" style={{ color: TEXT_DARK }}>{stat.value}</div>
                <div className="text-xs font-semibold" style={{ color: TEXT_MUTED }}>{stat.label}</div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ─── Get in Touch ─── */}
      <section id="contact-us" className="scroll-mt-20 py-20 border-t" style={{ backgroundColor: CREAM, borderColor: CREAM_BORDER }}>
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-10" style={{ color: TEXT_DARK }}>Get in Touch</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {CONTACTS.map((c) => (
              <a
                key={c.label}
                href={c.value.includes("@") ? `mailto:${c.value}` : "#"}
                className="bg-white rounded-2xl p-6 border flex items-start gap-4 hover:shadow-md group transition-shadow"
                style={{ borderColor: CREAM_BORDER }}
              >
                <Icon3D size={44} icon={c.icon} />
                <div>
                  <div className="text-[0.6rem] font-extrabold tracking-widest uppercase mb-1" style={{ color: TEXT_MUTED }}>{c.label}</div>
                  <div className="font-semibold text-sm break-all transition-opacity group-hover:opacity-70" style={{ color: TEXT_DARK }}>{c.value}</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

    </>
  );
}

/* ─── Root App ─── */
export default function App() {
  const [scrolled,      setScrolled]      = useState(false);
  const [activeDept,    setActiveDept]    = useState<string>("all");
  const [mobileOpen,    setMobileOpen]    = useState(false);
  const [view,          setView]          = useState<View>("home");
  const [selectedJob,   setSelectedJob]   = useState<JobDetail | null>(null);
  const [showApply,     setShowApply]     = useState(false);
  const [backendJobs,   setBackendJobs]   = useState<JobDetail[]>([]);

  useEffect(() => {
    fetch("/api/public/jobs")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const mappedJobs = data.map((job: any) => ({
            _id: job._id || job.id,
            title: job.title,
            dept: job.category || 'All',
            deptKey: job.category ? job.category.toLowerCase() : 'all',
            location: job.location,
            type: job.employmentType || 'Full Time',
            compensation: job.salary || 'Unpaid',
            openings: job.openings || 1,
            image: JOBS.find(j => j.title === job.title)?.image || "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&q=80",
            description: job.description || '',
            responsibilities: [],
            requirements: [],
            bonusSkills: [],
            benefits: [],
            skills: job.skills || [],
            customQuestions: job.customQuestions || []
          }));
          setBackendJobs(mappedJobs);
        }
      })
      .catch((err) => console.error("Error fetching jobs:", err));
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Scroll to top whenever view changes
  useEffect(() => {
    if (view === "home") window.scrollTo({ top: 0 });
  }, [view]);

  const handleJobClick = (title: string) => {
    const detail = backendJobs.find((j) => j.title === title) || JOB_DETAILS.find((j) => j.title === title);
    if (detail) {
      setSelectedJob(detail);
      setView("detail");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleHome = () => {
    setView("home");
    setSelectedJob(null);
    setShowApply(false);
  };

  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: "#fff", color: TEXT_DARK }}>
      <Navbar
        scrolled={scrolled}
        onHome={handleHome}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Page transition wrapper */}
      <div
        key={view}
        style={{ animation: "fadeIn 0.25s ease" }}
      >
        {view === "home" && (
          <HomePage
            activeDept={activeDept}
            setActiveDept={setActiveDept}
            onJobClick={handleJobClick}
            jobs={backendJobs.length > 0 ? backendJobs : JOBS}
          />
        )}
        {view === "detail" && selectedJob && (
          <JobDetailPage
            job={selectedJob}
            onBack={() => { setView("home"); setTimeout(() => { document.getElementById("open-roles")?.scrollIntoView({ behavior: "smooth" }); }, 80); }}
            onApply={() => setView("apply")}
          />
        )}
        {view === "apply" && selectedJob && (
          <SelectionProcessPage
            job={selectedJob}
            onBack={() => setView("detail")}
          />
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0);   }
        }
      `}</style>
    </div>
  );
}

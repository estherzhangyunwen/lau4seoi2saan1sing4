import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import {
  CUHK_STUDENT_EMAIL_DOMAIN,
  campusAreas,
  genderPreferences,
  lifestyleTags,
  roomTypes,
  starterPosts,
} from "./data";
import type {
  GenderPreference,
  LifestyleTag,
  RoommatePost,
  RoomType,
  StudentProfile,
} from "./types";

const STORAGE_KEYS = {
  profile: "cuhk-roommate-profile",
  posts: "cuhk-roommate-posts",
  saved: "cuhk-roommate-saved",
} as const;

interface VerificationForm {
  email: string;
  studentId: string;
  programme: string;
  yearOfStudy: string;
  isCurrentStudent: boolean;
}

interface PostForm {
  title: string;
  location: string;
  roomType: RoomType;
  budget: string;
  moveInDate: string;
  genderPreference: GenderPreference;
  lifestyleTags: LifestyleTag[];
  description: string;
  contactMethod: string;
}

const createEmptyVerificationForm = (): VerificationForm => ({
  email: "",
  studentId: "",
  programme: "",
  yearOfStudy: "Year 1",
  isCurrentStudent: false,
});

const createEmptyPostForm = (): PostForm => ({
  title: "",
  location: campusAreas[0] ?? "University Station",
  roomType: "Private room",
  budget: "",
  moveInDate: "",
  genderPreference: "No preference",
  lifestyleTags: [],
  description: "",
  contactMethod: "",
});

const loadProfile = (): StudentProfile | null => {
  const storedProfile = localStorage.getItem(STORAGE_KEYS.profile);

  if (!storedProfile) {
    return null;
  }

  try {
    const profile = JSON.parse(storedProfile) as StudentProfile;

    if (profile.email?.endsWith(CUHK_STUDENT_EMAIL_DOMAIN)) {
      return profile;
    }
  } catch {
    localStorage.removeItem(STORAGE_KEYS.profile);
  }

  return null;
};

const loadPosts = (): RoommatePost[] => {
  const storedPosts = localStorage.getItem(STORAGE_KEYS.posts);

  if (!storedPosts) {
    return starterPosts;
  }

  try {
    const posts = JSON.parse(storedPosts) as RoommatePost[];
    return posts.length > 0 ? posts : starterPosts;
  } catch {
    localStorage.removeItem(STORAGE_KEYS.posts);
    return starterPosts;
  }
};

const loadSavedIds = (): Set<string> => {
  const storedSavedIds = localStorage.getItem(STORAGE_KEYS.saved);

  if (!storedSavedIds) {
    return new Set();
  }

  try {
    return new Set(JSON.parse(storedSavedIds) as string[]);
  } catch {
    localStorage.removeItem(STORAGE_KEYS.saved);
    return new Set();
  }
};

const redactEmail = (email: string): string => {
  const parts = email.split("@");
  const localPart = parts[0] ?? "student";
  const domain = parts[1] ?? CUHK_STUDENT_EMAIL_DOMAIN.replace("@", "");
  const visiblePrefix = localPart.slice(0, 1);

  return `${visiblePrefix}${"*".repeat(Math.max(localPart.length - 1, 5))}@${domain}`;
};

const formatListingDate = (date: string): string =>
  new Intl.DateTimeFormat("en-HK", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));

const createPostId = (): string => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `post-${Date.now()}`;
};

export default function App() {
  const [profile, setProfile] = useState<StudentProfile | null>(() => loadProfile());
  const [verificationForm, setVerificationForm] = useState<VerificationForm>(() =>
    createEmptyVerificationForm(),
  );
  const [verificationError, setVerificationError] = useState("");
  const [verificationNotice, setVerificationNotice] = useState("");
  const [posts, setPosts] = useState<RoommatePost[]>(() => loadPosts());
  const [savedIds, setSavedIds] = useState<Set<string>>(() => loadSavedIds());
  const [postForm, setPostForm] = useState<PostForm>(() => createEmptyPostForm());
  const [postError, setPostError] = useState("");
  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState("All areas");
  const [maxBudget, setMaxBudget] = useState("");
  const [onlySaved, setOnlySaved] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.posts, JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.saved, JSON.stringify(Array.from(savedIds)));
  }, [savedIds]);

  const filteredPosts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const parsedMaxBudget = Number(maxBudget);
    const hasBudgetLimit = maxBudget.trim() !== "" && Number.isFinite(parsedMaxBudget);

    return [...posts]
      .sort(
        (firstPost, secondPost) =>
          new Date(secondPost.postedAt).getTime() -
          new Date(firstPost.postedAt).getTime(),
      )
      .filter((post) => {
        const matchesSearch =
          normalizedSearch === "" ||
          [post.title, post.location, post.description, post.authorProgramme]
            .join(" ")
            .toLowerCase()
            .includes(normalizedSearch);
        const matchesLocation =
          locationFilter === "All areas" || post.location === locationFilter;
        const matchesBudget = !hasBudgetLimit || post.budget <= parsedMaxBudget;
        const matchesSaved = !onlySaved || savedIds.has(post.id);

        return matchesSearch && matchesLocation && matchesBudget && matchesSaved;
      });
  }, [locationFilter, maxBudget, onlySaved, posts, savedIds, search]);

  const handleVerificationSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedEmail = verificationForm.email.trim().toLowerCase();
    const studentId = verificationForm.studentId.trim();
    const programme = verificationForm.programme.trim();

    setVerificationError("");
    setVerificationNotice("");

    if (!normalizedEmail.endsWith(CUHK_STUDENT_EMAIL_DOMAIN)) {
      setVerificationError(
        `Use your CUHK Link student email ending in ${CUHK_STUDENT_EMAIL_DOMAIN}.`,
      );
      return;
    }

    if (!/^\d{10}$/.test(studentId)) {
      setVerificationError("Enter a 10-digit CUHK student ID.");
      return;
    }

    if (!programme) {
      setVerificationError("Add your programme so other students have context.");
      return;
    }

    if (!verificationForm.isCurrentStudent) {
      setVerificationError("Confirm that you are currently enrolled at CUHK.");
      return;
    }

    const nextProfile: StudentProfile = {
      email: normalizedEmail,
      studentId,
      programme,
      yearOfStudy: verificationForm.yearOfStudy,
      verifiedAt: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(nextProfile));
    setProfile(nextProfile);
    setVerificationForm(createEmptyVerificationForm());
    setVerificationNotice(
      "Verification complete for this prototype. In production this step would require a CUHK email one-time code.",
    );
  };

  const handleSignOut = () => {
    localStorage.removeItem(STORAGE_KEYS.profile);
    setProfile(null);
    setVerificationNotice("");
  };

  const handleToggleTag = (tag: LifestyleTag) => {
    setPostForm((currentForm) => ({
      ...currentForm,
      lifestyleTags: currentForm.lifestyleTags.includes(tag)
        ? currentForm.lifestyleTags.filter((existingTag) => existingTag !== tag)
        : [...currentForm.lifestyleTags, tag],
    }));
  };

  const handlePostSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPostError("");

    if (!profile) {
      setPostError("Verify your current CUHK student status before posting.");
      return;
    }

    const budget = Number(postForm.budget);

    if (
      !postForm.title.trim() ||
      !postForm.moveInDate ||
      !postForm.description.trim() ||
      !postForm.contactMethod.trim()
    ) {
      setPostError("Complete the title, move-in date, description, and contact method.");
      return;
    }

    if (!Number.isFinite(budget) || budget <= 0) {
      setPostError("Enter a valid monthly budget in HKD.");
      return;
    }

    const nextPost: RoommatePost = {
      id: createPostId(),
      title: postForm.title.trim(),
      location: postForm.location,
      roomType: postForm.roomType,
      budget,
      moveInDate: postForm.moveInDate,
      genderPreference: postForm.genderPreference,
      lifestyleTags: postForm.lifestyleTags,
      description: postForm.description.trim(),
      contactMethod: postForm.contactMethod.trim(),
      postedAt: new Date().toISOString(),
      authorEmail: redactEmail(profile.email),
      authorProgramme: profile.programme,
      authorYear: profile.yearOfStudy,
    };

    setPosts((currentPosts) => [nextPost, ...currentPosts]);
    setPostForm(createEmptyPostForm());
  };

  const handleSaveToggle = (postId: string) => {
    setSavedIds((currentSavedIds) => {
      const nextSavedIds = new Set(currentSavedIds);

      if (nextSavedIds.has(postId)) {
        nextSavedIds.delete(postId);
      } else {
        nextSavedIds.add(postId);
      }

      return nextSavedIds;
    });
  };

  const handleDeletePost = (postId: string) => {
    setPosts((currentPosts) =>
      currentPosts.filter(
        (post) => post.id !== postId || post.authorEmail !== redactEmail(profile?.email ?? ""),
      ),
    );
    setSavedIds((currentSavedIds) => {
      const nextSavedIds = new Set(currentSavedIds);
      nextSavedIds.delete(postId);
      return nextSavedIds;
    });
  };

  return (
    <main>
      <section className="hero">
        <nav className="topbar" aria-label="Main navigation">
          <a className="brand" href="#top" aria-label="CUHK Roommate Board home">
            <span className="brand-mark">中</span>
            <span>
              CUHK
              <strong>Roommate Board</strong>
            </span>
          </a>
          <div className="topbar-actions">
            <a href="#posts">Browse posts</a>
            <a href="#post">Post a listing</a>
          </div>
        </nav>

        <div className="hero-grid" id="top">
          <div className="hero-copy">
            <p className="eyebrow">For verified current CUHK students</p>
            <h1>Find roommates before the lease gets stressful.</h1>
            <p className="hero-text">
              A student-only board for sharing housing plans, budgets, lifestyle
              preferences, and contact details with other verified CUHK students.
            </p>
            <div className="hero-actions">
              <a className="button primary" href={profile ? "#post" : "#verify"}>
                {profile ? "Create a post" : "Verify student status"}
              </a>
              <a className="button secondary" href="#posts">
                View listings
              </a>
            </div>
          </div>

          <aside className="trust-card" aria-label="Safety features">
            <span className="status-pill">Student-gated MVP</span>
            <h2>Built around campus trust</h2>
            <ul>
              <li>CUHK Link email and student ID gate before posting.</li>
              <li>Profiles display programme/year, not full email addresses.</li>
              <li>Listings include budget, move-in date, room type, and habits.</li>
            </ul>
          </aside>
        </div>
      </section>

      <section className="section two-column" id="verify">
        <div>
          <p className="eyebrow">Verification</p>
          <h2>Only current CUHK students can post.</h2>
          <p className="section-copy">
            This prototype verifies local sessions with a CUHK Link student email,
            a 10-digit student ID, and an enrolment declaration. Production should
            add one-time email codes and university SSO before launch.
          </p>
        </div>

        <div className="panel">
          {profile ? (
            <div className="verified-card">
              <span className="status-pill success">Verified</span>
              <h3>{redactEmail(profile.email)}</h3>
              <p>
                {profile.programme} · {profile.yearOfStudy}
              </p>
              <p className="small">
                Verified {formatListingDate(profile.verifiedAt)} with CUHK Link email.
              </p>
              <button className="button secondary" type="button" onClick={handleSignOut}>
                Sign out
              </button>
            </div>
          ) : (
            <form className="stacked-form" onSubmit={handleVerificationSubmit}>
              <label>
                CUHK Link email
                <input
                  type="email"
                  placeholder={`name${CUHK_STUDENT_EMAIL_DOMAIN}`}
                  value={verificationForm.email}
                  onChange={(event) =>
                    setVerificationForm((currentForm) => ({
                      ...currentForm,
                      email: event.target.value,
                    }))
                  }
                />
              </label>
              <label>
                Student ID
                <input
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="10-digit CUHK student ID"
                  value={verificationForm.studentId}
                  onChange={(event) =>
                    setVerificationForm((currentForm) => ({
                      ...currentForm,
                      studentId: event.target.value,
                    }))
                  }
                />
              </label>
              <label>
                Programme
                <input
                  placeholder="e.g. BSc Computer Science"
                  value={verificationForm.programme}
                  onChange={(event) =>
                    setVerificationForm((currentForm) => ({
                      ...currentForm,
                      programme: event.target.value,
                    }))
                  }
                />
              </label>
              <label>
                Year of study
                <select
                  value={verificationForm.yearOfStudy}
                  onChange={(event) =>
                    setVerificationForm((currentForm) => ({
                      ...currentForm,
                      yearOfStudy: event.target.value,
                    }))
                  }
                >
                  <option>Year 1</option>
                  <option>Year 2</option>
                  <option>Year 3</option>
                  <option>Year 4</option>
                  <option>Year 5+</option>
                  <option>Postgraduate</option>
                  <option>Exchange</option>
                </select>
              </label>
              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={verificationForm.isCurrentStudent}
                  onChange={(event) =>
                    setVerificationForm((currentForm) => ({
                      ...currentForm,
                      isCurrentStudent: event.target.checked,
                    }))
                  }
                />
                I confirm I am currently enrolled at CUHK.
              </label>
              {verificationError ? <p className="form-error">{verificationError}</p> : null}
              {verificationNotice ? <p className="form-success">{verificationNotice}</p> : null}
              <button className="button primary full-width" type="submit">
                Verify and continue
              </button>
            </form>
          )}
        </div>
      </section>

      <section className="section two-column post-section" id="post">
        <div>
          <p className="eyebrow">Create listing</p>
          <h2>Post what you need from a roommate.</h2>
          <p className="section-copy">
            Share practical details that help classmates decide quickly: where,
            when, budget, room type, lifestyle expectations, and how to contact you.
          </p>
          {!profile ? (
            <p className="gate-note">Verify your current CUHK student status to unlock posting.</p>
          ) : null}
        </div>

        <form
          className={`panel stacked-form ${profile ? "" : "disabled-panel"}`}
          onSubmit={handlePostSubmit}
          aria-disabled={!profile}
        >
          <label>
            Listing title
            <input
              placeholder="e.g. Looking for one flatmate near campus"
              disabled={!profile}
              value={postForm.title}
              onChange={(event) =>
                setPostForm((currentForm) => ({
                  ...currentForm,
                  title: event.target.value,
                }))
              }
            />
          </label>
          <div className="form-grid">
            <label>
              Area
              <select
                disabled={!profile}
                value={postForm.location}
                onChange={(event) =>
                  setPostForm((currentForm) => ({
                    ...currentForm,
                    location: event.target.value,
                  }))
                }
              >
                {campusAreas.map((area) => (
                  <option key={area}>{area}</option>
                ))}
              </select>
            </label>
            <label>
              Room type
              <select
                disabled={!profile}
                value={postForm.roomType}
                onChange={(event) =>
                  setPostForm((currentForm) => ({
                    ...currentForm,
                    roomType: event.target.value as RoomType,
                  }))
                }
              >
                {roomTypes.map((roomType) => (
                  <option key={roomType}>{roomType}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="form-grid">
            <label>
              Monthly budget (HKD)
              <input
                type="number"
                min="1"
                placeholder="6500"
                disabled={!profile}
                value={postForm.budget}
                onChange={(event) =>
                  setPostForm((currentForm) => ({
                    ...currentForm,
                    budget: event.target.value,
                  }))
                }
              />
            </label>
            <label>
              Move-in date
              <input
                type="date"
                disabled={!profile}
                value={postForm.moveInDate}
                onChange={(event) =>
                  setPostForm((currentForm) => ({
                    ...currentForm,
                    moveInDate: event.target.value,
                  }))
                }
              />
            </label>
          </div>
          <label>
            Roommate preference
            <select
              disabled={!profile}
              value={postForm.genderPreference}
              onChange={(event) =>
                setPostForm((currentForm) => ({
                  ...currentForm,
                  genderPreference: event.target.value as GenderPreference,
                }))
              }
            >
              {genderPreferences.map((preference) => (
                <option key={preference}>{preference}</option>
              ))}
            </select>
          </label>
          <fieldset className="tag-fieldset" disabled={!profile}>
            <legend>Lifestyle tags</legend>
            <div className="tag-list">
              {lifestyleTags.map((tag) => (
                <button
                  className={postForm.lifestyleTags.includes(tag) ? "tag active" : "tag"}
                  key={tag}
                  type="button"
                  onClick={() => handleToggleTag(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          </fieldset>
          <label>
            Description
            <textarea
              rows={5}
              placeholder="Describe the flat, expectations, commute, and who would be a good fit."
              disabled={!profile}
              value={postForm.description}
              onChange={(event) =>
                setPostForm((currentForm) => ({
                  ...currentForm,
                  description: event.target.value,
                }))
              }
            />
          </label>
          <label>
            Contact method
            <input
              placeholder="e.g. CUHK email, Telegram, WhatsApp after matching"
              disabled={!profile}
              value={postForm.contactMethod}
              onChange={(event) =>
                setPostForm((currentForm) => ({
                  ...currentForm,
                  contactMethod: event.target.value,
                }))
              }
            />
          </label>
          {postError ? <p className="form-error">{postError}</p> : null}
          <button className="button primary full-width" type="submit" disabled={!profile}>
            Publish roommate post
          </button>
        </form>
      </section>

      <section className="section listings" id="posts">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Listings</p>
            <h2>Roommate posts from CUHK students</h2>
          </div>
          <span className="count-pill">{filteredPosts.length} matching</span>
        </div>

        <div className="filters" aria-label="Filter roommate posts">
          <label>
            Search
            <input
              placeholder="Programme, area, habits..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
          <label>
            Area
            <select
              value={locationFilter}
              onChange={(event) => setLocationFilter(event.target.value)}
            >
              <option>All areas</option>
              {campusAreas.map((area) => (
                <option key={area}>{area}</option>
              ))}
            </select>
          </label>
          <label>
            Max budget
            <input
              type="number"
              min="1"
              placeholder="HKD"
              value={maxBudget}
              onChange={(event) => setMaxBudget(event.target.value)}
            />
          </label>
          <label className="checkbox-row filter-checkbox">
            <input
              type="checkbox"
              checked={onlySaved}
              onChange={(event) => setOnlySaved(event.target.checked)}
            />
            Saved only
          </label>
        </div>

        {filteredPosts.length > 0 ? (
          <div className="post-grid">
            {filteredPosts.map((post) => {
              const isOwnPost = profile
                ? post.authorEmail === redactEmail(profile.email)
                : false;

              return (
                <article className="post-card" key={post.id}>
                  <div className="post-card-header">
                    <div>
                      <p className="post-meta">
                        {post.location} · {post.roomType}
                      </p>
                      <h3>{post.title}</h3>
                    </div>
                    <button
                      className={savedIds.has(post.id) ? "save-button active" : "save-button"}
                      type="button"
                      onClick={() => handleSaveToggle(post.id)}
                      aria-label={savedIds.has(post.id) ? "Unsave listing" : "Save listing"}
                    >
                      {savedIds.has(post.id) ? "Saved" : "Save"}
                    </button>
                  </div>
                  <div className="post-details">
                    <span>HK${post.budget.toLocaleString("en-HK")}/mo</span>
                    <span>Move in {formatListingDate(post.moveInDate)}</span>
                    <span>{post.genderPreference}</span>
                  </div>
                  <p>{post.description}</p>
                  <div className="tag-list compact">
                    {post.lifestyleTags.map((tag) => (
                      <span className="tag readonly" key={tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="author-row">
                    <div>
                      <strong>{post.authorProgramme}</strong>
                      <span>
                        {post.authorYear} · {post.authorEmail}
                      </span>
                    </div>
                    <span>{formatListingDate(post.postedAt)}</span>
                  </div>
                  <div className="contact-row">
                    <span>Contact: {post.contactMethod}</span>
                    {isOwnPost ? (
                      <button
                        className="delete-button"
                        type="button"
                        onClick={() => handleDeletePost(post.id)}
                      >
                        Delete
                      </button>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <h3>No listings match those filters.</h3>
            <p>Try another area, remove the budget cap, or publish a new post.</p>
          </div>
        )}
      </section>
    </main>
  );
}

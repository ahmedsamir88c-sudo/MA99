import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  AcademicYear,
  AcademicSubject,
  AcademicLecture,
  AcademicMaterial,
  QuizQuestion,
  QuizAttemptResult,
  QuizAttemptAnswer,
  DailyChallenge,
  ReviewItem,
  StudyPlan,
  StudyNotification,
  StudentPreferences,
} from '../types';
import {
  INITIAL_YEARS,
  INITIAL_SUBJECTS,
  generateInitialLectures,
  INITIAL_MATERIALS,
  INITIAL_USERS,
  INITIAL_NOTIFICATIONS,
  INITIAL_STUDY_PLANS,
  INITIAL_REVIEW_ITEMS,
  INITIAL_PREFERENCES,
  INITIAL_DAILY_CHALLENGE,
  QUESTION_BANK,
} from '../data/seedData';
import {
  auth,
  db,
  googleProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  testFirestoreConnection,
  FirebaseUser,
} from '../firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

export interface GoogleAuthPayload {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
}

interface AppContextType {
  currentUser: User | null;
  users: User[];
  years: AcademicYear[];
  subjects: AcademicSubject[];
  lectures: AcademicLecture[];
  materials: AcademicMaterial[];
  dailyChallenge: DailyChallenge;
  reviewItems: ReviewItem[];
  studyPlans: StudyPlan[];
  notifications: StudyNotification[];
  preferences: StudentPreferences;
  attemptHistory: QuizAttemptResult[];
  unreadNotificationsCount: number;
  firebaseAuthUser: FirebaseUser | null;
  isAuthLoading: boolean;

  // Real Google Auth
  signInWithGoogleReal: () => Promise<{
    success: boolean;
    needsOnboarding?: boolean;
    googleUser?: GoogleAuthPayload;
    error?: string;
  }>;
  completeGoogleOnboarding: (data: {
    googleUser: GoogleAuthPayload;
    universityId: string;
    username: string;
    academicYear: number;
    profileImage?: string;
  }) => Promise<{ success: boolean; error?: string }>;

  // Local Auth
  login: (identifier: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: {
    username: string;
    email: string;
    universityId: string;
    academicYear: number;
    password?: string;
    profileImage?: string;
    fullName?: string;
    authProvider?: 'local' | 'google';
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  switchUser: (uid: string) => void;
  updateProfile: (data: Partial<User>) => void;
  updateProfileImage: (image: string) => void;

  // Quizzes & Challenges
  createQuiz: (
    subject: string,
    lecture: number,
    count: number,
    difficulty: 'easy' | 'medium' | 'hard',
    isDailyChallenge?: boolean
  ) => { quiz_id: string; questions: QuizQuestion[]; difficulty: 'easy' | 'medium' | 'hard' } | null;
  submitQuiz: (
    quizId: string,
    subject: string,
    lecture: number,
    answers: { question_id: string; selected_index: number | null }[],
    isDailyChallenge?: boolean,
    difficulty?: 'easy' | 'medium' | 'hard',
    quizQuestions?: QuizQuestion[]
  ) => QuizAttemptResult;

  // Spaced Repetition & Reviews
  markReviewed: (id: number) => void;

  // Study Plans
  savePlan: (plan: Partial<StudyPlan>) => void;
  deletePlan: (id: number) => void;
  togglePlanActive: (id: number) => void;

  // Notifications
  markNotificationRead: (id: number) => void;
  markAllNotificationsRead: () => void;

  // Preferences
  updatePreferences: (prefs: Partial<StudentPreferences>) => void;

  // Academic Management
  createYear: (yearNumber: number, name: string, order: number) => void;
  updateYear: (id: number, data: Partial<AcademicYear>) => void;
  deleteYear: (id: number) => void;
  createSubject: (academicYearId: number, name: string, code?: string, description?: string) => void;
  updateSubject: (id: number, data: Partial<AcademicSubject>) => void;
  deleteSubject: (id: number) => void;
  createLecture: (subjectId: number, lectureNumber: number, title: string, description?: string) => void;
  updateLecture: (id: number, data: Partial<AcademicLecture>) => void;
  deleteLecture: (id: number) => void;
  uploadMaterial: (data: {
    academicYearId: number;
    subjectId: number;
    lectureId: number;
    title: string;
    materialType: 'lecture' | 'section';
    sectionTitle?: string;
    filename: string;
    sizeBytes?: number;
    fileUrl?: string;
    extractedText?: string;
    pages?: any[];
    chunks?: any[];
    extractionReport?: any;
    processingStatus?: any;
  }) => void;
  replaceMaterial: (id: number, filename: string) => void;
  retryMaterial: (id: number) => void;
  deleteMaterial: (id: number) => void;
  toggleStudentStatus: (uid: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  CURRENT_USER_ID: 'study_challenge_user_id',
  USERS: 'study_challenge_users',
  YEARS: 'study_challenge_years',
  SUBJECTS: 'study_challenge_subjects',
  LECTURES: 'study_challenge_lectures',
  MATERIALS: 'study_challenge_materials',
  DAILY_CHALLENGE: 'study_challenge_daily',
  REVIEW_ITEMS: 'study_challenge_reviews',
  PLANS: 'study_challenge_plans',
  NOTIFICATIONS: 'study_challenge_notifications',
  PREFERENCES: 'study_challenge_prefs',
  ATTEMPTS: 'study_challenge_attempts',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseAuthUser, setFirebaseAuthUser] = useState<FirebaseUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Users state
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    if (saved) {
      try {
        const parsed: User[] = JSON.parse(saved);
        // Remove mock/test accounts
        const realUsers = parsed.filter(
          (u) =>
            !u.uid.startsWith('std-10') &&
            u.uid !== 'test' &&
            u.username !== 'test_user'
        );
        const ownerIndex = realUsers.findIndex((u) => u.role === 'owner' || u.uid === 'owner-001');
        if (ownerIndex === -1) {
          realUsers.unshift(INITIAL_USERS[0]);
        } else {
          realUsers[ownerIndex] = {
            ...realUsers[ownerIndex],
            xp: realUsers[ownerIndex].xp === 4200 ? 0 : realUsers[ownerIndex].xp,
          };
        }
        return realUsers;
      } catch {
        return INITIAL_USERS;
      }
    }
    return INITIAL_USERS;
  });

  const [currentUserId, setCurrentUserId] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
  });

  const [years, setYears] = useState<AcademicYear[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.YEARS);
    return saved ? JSON.parse(saved) : INITIAL_YEARS;
  });

  const [subjects, setSubjects] = useState<AcademicSubject[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
    return saved ? JSON.parse(saved) : INITIAL_SUBJECTS;
  });

  const [lectures, setLectures] = useState<AcademicLecture[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LECTURES);
    return saved ? JSON.parse(saved) : generateInitialLectures(INITIAL_SUBJECTS);
  });

  const [materials, setMaterials] = useState<AcademicMaterial[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MATERIALS);
    return saved ? JSON.parse(saved) : INITIAL_MATERIALS;
  });

  const [dailyChallenge, setDailyChallenge] = useState<DailyChallenge>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DAILY_CHALLENGE);
    return saved ? JSON.parse(saved) : INITIAL_DAILY_CHALLENGE;
  });

  const [reviewItems, setReviewItems] = useState<ReviewItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.REVIEW_ITEMS);
    return saved ? JSON.parse(saved) : INITIAL_REVIEW_ITEMS;
  });

  const [studyPlans, setStudyPlans] = useState<StudyPlan[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PLANS);
    return saved ? JSON.parse(saved) : INITIAL_STUDY_PLANS;
  });

  const [notifications, setNotifications] = useState<StudyNotification[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [preferences, setPreferences] = useState<StudentPreferences>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
    return saved ? JSON.parse(saved) : INITIAL_PREFERENCES;
  });

  const [attemptHistory, setAttemptHistory] = useState<QuizAttemptResult[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ATTEMPTS);
    return saved ? JSON.parse(saved) : [];
  });

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUserId) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, currentUserId);
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
    }
  }, [currentUserId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.YEARS, JSON.stringify(years));
  }, [years]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LECTURES, JSON.stringify(lectures));
  }, [lectures]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MATERIALS, JSON.stringify(materials));
  }, [materials]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DAILY_CHALLENGE, JSON.stringify(dailyChallenge));
  }, [dailyChallenge]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REVIEW_ITEMS, JSON.stringify(reviewItems));
  }, [reviewItems]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(studyPlans));
  }, [studyPlans]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(preferences));
  }, [preferences]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ATTEMPTS, JSON.stringify(attemptHistory));
  }, [attemptHistory]);

  // Test Firestore on boot and listen to Firebase Auth
  useEffect(() => {
    testFirestoreConnection();

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseAuthUser(fbUser);
      setIsAuthLoading(false);

      if (fbUser) {
        // Try fetching user from Firestore
        try {
          const userDocRef = doc(db, 'users', fbUser.uid);
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            const data = docSnap.data() as User;
            setUsers((prev) => {
              const existingIdx = prev.findIndex((u) => u.uid === fbUser.uid);
              if (existingIdx >= 0) {
                const next = [...prev];
                next[existingIdx] = { ...next[existingIdx], ...data };
                return next;
              }
              return [data, ...prev];
            });
            setCurrentUserId(fbUser.uid);
          }
        } catch {
          // If offline or permission check, local cache handles it
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const currentUser = users.find((u) => u.uid === currentUserId) || null;
  const unreadNotificationsCount = notifications.filter((n) => !n.is_read).length;

  // REAL Google Sign In with Firebase Popup
  const signInWithGoogleReal = async (): Promise<{
    success: boolean;
    needsOnboarding?: boolean;
    googleUser?: GoogleAuthPayload;
    error?: string;
  }> => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      const cleanEmail = (fbUser.email || '').toLowerCase();
      const displayName = fbUser.displayName || cleanEmail.split('@')[0] || 'طالب';
      const photoURL = fbUser.photoURL || undefined;

      const payload: GoogleAuthPayload = {
        uid: fbUser.uid,
        email: cleanEmail,
        displayName,
        photoURL,
      };

      // Check if user already exists in Firestore
      try {
        const userDocRef = doc(db, 'users', fbUser.uid);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          const remoteUser = docSnap.data() as User;
          setUsers((prev) => {
            const idx = prev.findIndex((u) => u.uid === fbUser.uid);
            if (idx >= 0) {
              const updated = [...prev];
              updated[idx] = { ...updated[idx], ...remoteUser };
              return updated;
            }
            return [remoteUser, ...prev];
          });
          setCurrentUserId(remoteUser.uid);
          return { success: true, needsOnboarding: false, googleUser: payload };
        }
      } catch {
        // Continue to check local state
      }

      // Check if this email exists locally
      const existing = users.find(
        (u) => u.email.toLowerCase() === cleanEmail || u.uid === fbUser.uid
      );

      if (existing) {
        if (!existing.is_active) {
          return { success: false, error: 'تم تعطيل هذا الحساب من قبل الإدارة.' };
        }
        // Link uid if needed and sync
        const updatedUser: User = {
          ...existing,
          uid: fbUser.uid,
          auth_provider: 'google',
          profile_image: photoURL || existing.profile_image,
        };
        setUsers((prev) =>
          prev.map((u) => (u.email.toLowerCase() === cleanEmail ? updatedUser : u))
        );
        setCurrentUserId(updatedUser.uid);

        // Save to Firestore
        try {
          await setDoc(doc(db, 'users', fbUser.uid), updatedUser, { merge: true });
        } catch {}

        return { success: true, needsOnboarding: false, googleUser: payload };
      }

      // New Google User: Needs Onboarding (University ID & username confirmation)
      return {
        success: true,
        needsOnboarding: true,
        googleUser: payload,
      };
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      let errorMsg = 'حدث خطأ أثناء الاتصال بحساب Google.';
      if (err.code === 'auth/popup-closed-by-user') {
        errorMsg = 'تم إغلاق نافذة تسجيل الدخول قبل إتمام العملية.';
      } else if (err.code === 'auth/cancelled-popup-request') {
        errorMsg = 'تم إلغاء الطلب السابق.';
      } else if (err.code === 'auth/popup-blocked') {
        errorMsg = 'المتصفح حظر النافذة المنبثقة، يرجى السماح بالنوافذ المنبثقة والمحاولة مرة أخرى.';
      } else if (err.message) {
        errorMsg = err.message;
      }
      return { success: false, error: errorMsg };
    }
  };

  // Complete Google Registration Onboarding
  const completeGoogleOnboarding = async (data: {
    googleUser: GoogleAuthPayload;
    universityId: string;
    username: string;
    academicYear: number;
    profileImage?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    // Strictly Year 2
    if (Number(data.academicYear) !== 2) {
      return {
        success: false,
        error: 'التطبيق مخصص حصرياً لطلاب الفرقة الثانية (Year 2).',
      };
    }

    const cleanUser = data.username.trim().toLowerCase();
    const cleanId = data.universityId.trim();

    if (users.some((u) => u.username.toLowerCase() === cleanUser && u.uid !== data.googleUser.uid)) {
      return { success: false, error: 'اسم المستخدم مسجل مسبقاً، يرجى اختيار اسم آخر.' };
    }
    if (users.some((u) => u.university_id === cleanId && u.uid !== data.googleUser.uid)) {
      return { success: false, error: 'كود الطالب الجامعي (ID) مسجل مسبقاً.' };
    }

    const isOwnerEmail = data.googleUser.email.toLowerCase() === 'ahmedsamir88c@gmail.com';

    const newUser: User = {
      uid: data.googleUser.uid,
      username: data.username.trim(),
      email: data.googleUser.email.trim(),
      university_id: cleanId,
      full_name: data.googleUser.displayName || data.username.trim(),
      role: isOwnerEmail ? 'owner' : 'student',
      academic_year: 2,
      xp: isOwnerEmail ? 4200 : 0,
      streak: 1,
      profile_image: data.profileImage || data.googleUser.photoURL,
      auth_provider: 'google',
      is_active: true,
      created_at: new Date().toISOString(),
    };

    setUsers((prev) => [newUser, ...prev.filter((u) => u.uid !== newUser.uid)]);
    setCurrentUserId(newUser.uid);

    // Save to Firestore
    try {
      await setDoc(doc(db, 'users', newUser.uid), newUser);
    } catch (e) {
      console.warn('Firestore write warning:', e);
    }

    return { success: true };
  };

  // Local Login
  const login = async (identifier: string, pass: string) => {
    const cleanId = identifier.trim().toLowerCase();
    const cleanPass = pass.trim();

    // Check if this is the Owner
    if (cleanId === '2024000' || cleanId === 'owner' || cleanId === 'ahmedsamir88c@gmail.com') {
      if (cleanPass === '12345678910') {
        let owner = users.find((u) => u.role === 'owner' || u.uid === 'owner-001');
        if (!owner) {
          owner = INITIAL_USERS[0];
          setUsers((prev) => [owner!, ...prev.filter((u) => u.uid !== 'owner-001')]);
        }
        setCurrentUserId(owner.uid);
        return { success: true };
      } else {
        return { success: false, error: 'كلمة المرور غير صحيحة لحساب المدير.' };
      }
    }

    // Normal student login
    const found = users.find(
      (u) =>
        u.university_id.toLowerCase() === cleanId ||
        u.username.toLowerCase() === cleanId ||
        u.email.toLowerCase() === cleanId
    );

    if (!found) {
      return { success: false, error: 'لم يتم العثور على حساب بهذا المعرّف.' };
    }
    if (!found.is_active) {
      return { success: false, error: 'تم تعطيل هذا الحساب من قبل الإدارة.' };
    }
    if (found.password && found.password !== cleanPass) {
      return { success: false, error: 'كلمة المرور غير صحيحة.' };
    }

    setCurrentUserId(found.uid);
    return { success: true };
  };

  // Local Register
  const register = async (data: {
    username: string;
    email: string;
    universityId: string;
    academicYear: number;
    password?: string;
    profileImage?: string;
    fullName?: string;
    authProvider?: 'local' | 'google';
  }) => {
    if (Number(data.academicYear) !== 2) {
      return {
        success: false,
        error: 'التطبيق مخصص حصرياً لطلاب الفرقة الثانية (Year 2).',
      };
    }

    const cleanUser = data.username.trim().toLowerCase();
    const cleanId = data.universityId.trim();

    if (users.some((u) => u.username.toLowerCase() === cleanUser)) {
      return { success: false, error: 'اسم المستخدم مسجل مسبقاً.' };
    }
    if (users.some((u) => u.university_id === cleanId)) {
      return { success: false, error: 'كود الطالب الجامعي (ID) مسجل مسبقاً.' };
    }

    const newUser: User = {
      uid: 'std-' + Date.now().toString(36),
      username: data.username.trim(),
      email: data.email.trim(),
      university_id: cleanId,
      full_name: data.fullName || data.username.trim(),
      role: 'student',
      academic_year: 2,
      xp: 0,
      streak: 1,
      profile_image: data.profileImage,
      password: data.password,
      auth_provider: data.authProvider || 'local',
      is_active: true,
      created_at: new Date().toISOString(),
    };

    setUsers((prev) => [newUser, ...prev]);
    setCurrentUserId(newUser.uid);
    return { success: true };
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch {}
    setCurrentUserId(null);
  };

  const switchUser = (uid: string) => {
    setCurrentUserId(uid);
  };

  const updateProfile = (data: Partial<User>) => {
    if (!currentUserId) return;
    setUsers((prev) =>
      prev.map((u) => (u.uid === currentUserId ? { ...u, ...data } : u))
    );
    // Sync update to Firestore if signed in
    if (firebaseAuthUser && firebaseAuthUser.uid === currentUserId) {
      try {
        updateDoc(doc(db, 'users', currentUserId), data);
      } catch {}
    }
  };

  const updateProfileImage = (image: string) => {
    if (!currentUserId) return;
    setUsers((prev) =>
      prev.map((u) => (u.uid === currentUserId ? { ...u, profile_image: image } : u))
    );
    if (firebaseAuthUser && firebaseAuthUser.uid === currentUserId) {
      try {
        updateDoc(doc(db, 'users', currentUserId), { profile_image: image });
      } catch {}
    }
  };

  // Quizzes & Challenges
  const createQuiz = (
    subject: string,
    lecture: number,
    count: number,
    difficulty: 'easy' | 'medium' | 'hard' = 'medium',
    _isDailyChallenge = false
  ) => {
    const available = QUESTION_BANK[subject] || QUESTION_BANK['Computer Architecture'] || [];
    if (available.length === 0) return null;

    // Filter or prioritize questions with matching difficulty
    const exactDiff = available.filter((q) => q.difficulty === difficulty);
    const pool = exactDiff.length > 0 ? [...exactDiff, ...available] : available;

    const picked: QuizQuestion[] = [];
    for (let i = 0; i < count; i++) {
      const baseQ = pool[i % pool.length];
      picked.push({
        ...baseQ,
        id: `${subject}-${lecture}-${i}-${Date.now()}`,
        lecture: lecture,
        subject: subject,
        difficulty: difficulty,
      });
    }

    return {
      quiz_id: 'quiz-' + Date.now(),
      questions: picked,
      difficulty: difficulty,
    };
  };

  const submitQuiz = (
    quizId: string,
    subject: string,
    lecture: number,
    answers: { question_id: string; selected_index: number | null }[],
    isDailyChallenge = false,
    difficulty: 'easy' | 'medium' | 'hard' = 'medium',
    quizQuestions?: QuizQuestion[]
  ): QuizAttemptResult => {
    const available = QUESTION_BANK[subject] || QUESTION_BANK['Computer Architecture'] || [];
    let score = 0;
    const answeredDetails: QuizAttemptAnswer[] = [];

    // Points per question based on difficulty:
    // Easy (سهل) = 1 point
    // Medium (متوسط) = 2 points
    // Hard (صعب) = 3 points
    const pointsPerQuestion = difficulty === 'hard' ? 3 : difficulty === 'medium' ? 2 : 1;

    answers.forEach((ans, index) => {
      // Find exact question by question_id from provided quizQuestions first
      const q =
        (quizQuestions &&
          quizQuestions.find((item) => item.id.toString() === ans.question_id.toString())) ||
        available.find((item) => item.id.toString() === ans.question_id.toString()) ||
        available[index % available.length];

      const isCorrect = ans.selected_index === q.correct_index;
      if (isCorrect) score++;

      answeredDetails.push({
        question_id: ans.question_id,
        question: q.question,
        options: q.options,
        selected_index: ans.selected_index,
        correct_index: q.correct_index,
        is_correct: isCorrect,
        explanation: q.explanation,
      });

      if (!isCorrect && !reviewItems.some((r) => r.question === q.question)) {
        setReviewItems((prev) => [
          {
            id: Date.now() + index,
            subject,
            lecture,
            question: q.question,
            options: q.options,
            correct_index: q.correct_index,
            explanation: q.explanation,
            reviewed_at: null,
            review_count: 0,
          },
          ...prev,
        ]);
      }
    });

    const bonus = isDailyChallenge && score === answers.length ? 25 : 0;
    const earnedXp = score * pointsPerQuestion + bonus;
    const maxXp = answers.length * pointsPerQuestion + bonus;

    const result: QuizAttemptResult = {
      id: 'attempt-' + Date.now(),
      quiz_id: quizId,
      score,
      total_questions: answers.length,
      earned_xp: earnedXp,
      points_per_question: pointsPerQuestion,
      max_xp: maxXp,
      difficulty,
      created_at: new Date().toISOString(),
      subject,
      lecture,
      answers: answeredDetails,
    };

    setAttemptHistory((prev) => [result, ...prev]);

    // Save attempt to Firestore if authenticated
    if (firebaseAuthUser) {
      try {
        setDoc(doc(db, 'quizAttempts', result.id), {
          id: result.id,
          userId: firebaseAuthUser.uid,
          quizId: result.quiz_id,
          subject,
          lecture,
          score,
          totalQuestions: answers.length,
          earnedXp,
          createdAt: result.created_at,
        });
      } catch {}
    }

    if (currentUserId) {
      setUsers((prev) =>
        prev.map((u) => {
          if (u.uid === currentUserId) {
            const nextXp = u.xp + earnedXp;
            const nextStreak = Math.max(u.streak, 1);
            if (firebaseAuthUser && firebaseAuthUser.uid === currentUserId) {
              try {
                updateDoc(doc(db, 'users', currentUserId), { xp: nextXp, streak: nextStreak });
              } catch {}
            }
            return {
              ...u,
              xp: nextXp,
              streak: nextStreak,
            };
          }
          return u;
        })
      );
    }

    if (isDailyChallenge) {
      setDailyChallenge((prev) => ({
        ...prev,
        completed: true,
        started: true,
        score,
        total_questions: answers.length,
      }));
    }

    return result;
  };

  const markReviewed = (id: number) => {
    setReviewItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              reviewed_at: new Date().toISOString(),
              review_count: item.review_count + 1,
            }
          : item
      )
    );
  };

  const savePlan = (plan: Partial<StudyPlan>) => {
    if (plan.id) {
      setStudyPlans((prev) =>
        prev.map((p) => (p.id === plan.id ? ({ ...p, ...plan } as StudyPlan) : p))
      );
    } else {
      const newPlan: StudyPlan = {
        id: Date.now(),
        title: plan.title || 'خطة دراسية جديدة',
        subject_id: plan.subject_id ?? null,
        subject_name: plan.subject_name,
        target_minutes_per_day: plan.target_minutes_per_day || 30,
        sessions_per_week: plan.sessions_per_week || 5,
        start_date: plan.start_date || new Date().toISOString().slice(0, 10),
        end_date: plan.end_date ?? null,
        notes: plan.notes || '',
        is_active: true,
      };
      setStudyPlans((prev) => [newPlan, ...prev]);
    }
  };

  const deletePlan = (id: number) => {
    setStudyPlans((prev) => prev.filter((p) => p.id !== id));
  };

  const togglePlanActive = (id: number) => {
    setStudyPlans((prev) =>
      prev.map((p) => (p.id === id ? { ...p, is_active: !p.is_active } : p))
    );
  };

  const markNotificationRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const updatePreferences = (prefs: Partial<StudentPreferences>) => {
    setPreferences((prev) => ({ ...prev, ...prefs }));
  };

  // Academic Management
  const createYear = (yearNumber: number, name: string, order: number) => {
    const newYear: AcademicYear = {
      id: Date.now(),
      year_number: yearNumber,
      name,
      order,
    };
    setYears((prev) => [...prev, newYear]);
  };

  const updateYear = (id: number, data: Partial<AcademicYear>) => {
    setYears((prev) => prev.map((y) => (y.id === id ? { ...y, ...data } : y)));
  };

  const deleteYear = (id: number) => {
    setYears((prev) => prev.filter((y) => y.id !== id));
  };

  const createSubject = (
    academicYearId: number,
    name: string,
    code?: string,
    description?: string
  ) => {
    const newSubj: AcademicSubject = {
      id: Date.now(),
      academic_year: academicYearId,
      name,
      code,
      description,
      order: subjects.length + 1,
      lecture_count: 16,
    };
    setSubjects((prev) => [...prev, newSubj]);

    const newLecs: AcademicLecture[] = [];
    for (let i = 1; i <= 16; i++) {
      newLecs.push({
        id: Date.now() + i,
        subject_id: newSubj.id,
        lecture_number: i,
        title: `المحاضرة ${i}: ${name} - موضوع ${i}`,
        description: `شرح المحاضرة ${i}`,
        order: i,
        has_content: true,
      });
    }
    setLectures((prev) => [...prev, ...newLecs]);
  };

  const updateSubject = (id: number, data: Partial<AcademicSubject>) => {
    setSubjects((prev) => prev.map((s) => (s.id === id ? { ...s, ...data } : s)));
  };

  const deleteSubject = (id: number) => {
    setSubjects((prev) => prev.filter((s) => s.id !== id));
    setLectures((prev) => prev.filter((l) => l.subject_id !== id));
    setMaterials((prev) => prev.filter((m) => m.subject_id !== id));
  };

  const createLecture = (
    subjectId: number,
    lectureNumber: number,
    title: string,
    description?: string
  ) => {
    const newLec: AcademicLecture = {
      id: Date.now(),
      subject_id: subjectId,
      lecture_number: lectureNumber,
      title,
      description,
      order: lectureNumber,
      has_content: true,
    };
    setLectures((prev) => [...prev, newLec]);
  };

  const updateLecture = (id: number, data: Partial<AcademicLecture>) => {
    setLectures((prev) => prev.map((l) => (l.id === id ? { ...l, ...data } : l)));
  };

  const deleteLecture = (id: number) => {
    setLectures((prev) => prev.filter((l) => l.subject_id !== id));
  };

  const uploadMaterial = (data: {
    academicYearId: number;
    subjectId: number;
    lectureId: number;
    title: string;
    materialType: 'lecture' | 'section';
    sectionTitle?: string;
    filename: string;
    sizeBytes?: number;
    fileUrl?: string;
    extractedText?: string;
    pages?: any[];
    chunks?: any[];
    extractionReport?: any;
    processingStatus?: any;
  }) => {
    const newMat: AcademicMaterial = {
      id: Date.now(),
      academic_year_id: data.academicYearId,
      subject_id: data.subjectId,
      lecture_id: data.lectureId,
      title: data.title || data.filename,
      material_type: data.materialType,
      section_title: data.sectionTitle,
      original_filename: data.filename,
      file_url: data.fileUrl,
      processing_status: data.processingStatus || 'READY',
      uploaded_at: new Date().toISOString().slice(0, 16).replace('T', ' '),
      size_bytes: data.sizeBytes || 2400000,
      extracted_text: data.extractedText,
      pages: data.pages,
      chunks: data.chunks,
      extraction_report: data.extractionReport,
    };
    setMaterials((prev) => [newMat, ...prev]);
  };

  const replaceMaterial = (id: number, filename: string) => {
    setMaterials((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              original_filename: filename,
              title: filename,
              processing_status: 'READY',
              uploaded_at: new Date().toISOString().slice(0, 16).replace('T', ' '),
            }
          : m
      )
    );
  };

  const retryMaterial = (id: number) => {
    setMaterials((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              processing_status: 'READY',
              processing_error: undefined,
            }
          : m
      )
    );
  };

  const deleteMaterial = (id: number) => {
    setMaterials((prev) => prev.filter((m) => m.id !== id));
  };

  const toggleStudentStatus = (uid: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.uid === uid ? { ...u, is_active: !u.is_active } : u))
    );
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        years,
        subjects,
        lectures,
        materials,
        dailyChallenge,
        reviewItems,
        studyPlans,
        notifications,
        preferences,
        attemptHistory,
        unreadNotificationsCount,
        firebaseAuthUser,
        isAuthLoading,
        signInWithGoogleReal,
        completeGoogleOnboarding,
        login,
        register,
        logout,
        switchUser,
        updateProfile,
        updateProfileImage,
        createQuiz,
        submitQuiz,
        markReviewed,
        savePlan,
        deletePlan,
        togglePlanActive,
        markNotificationRead,
        markAllNotificationsRead,
        updatePreferences,
        createYear,
        updateYear,
        deleteYear,
        createSubject,
        updateSubject,
        deleteSubject,
        createLecture,
        updateLecture,
        deleteLecture,
        uploadMaterial,
        replaceMaterial,
        retryMaterial,
        deleteMaterial,
        toggleStudentStatus,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

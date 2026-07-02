export type BriefStatus =
  | "draft" | "open" | "reviewing" | "ranked" | "challenged" | "appealed" | "awarded" | "archived";
export type ConceptStatus =
  | "submitted" | "assessed" | "shortlisted" | "revision_requested" | "rejected" | "low_effort" | "challenged" | "appealed" | "finalist" | "awarded";
export type Verdict = "" | "shortlisted" | "revision_requested" | "rejected" | "low_effort";
export type ChallengeStatus = "open" | "upheld" | "dismissed";
export type AppealStatus = "open" | "accepted" | "denied";

export interface Brief {
  briefId: string;
  owner: string;
  title: string;
  brandName: string;
  campaignGoal: string;
  audience: string;
  constraints: string[];
  referenceUrls: string[];
  scoringRubric: string[];
  maxSubmissions: number;
  minScoreToShortlist: number;
  status: BriefStatus;
  createdAt: number;
  selectedConceptId: string;
  conceptIds: string[];
  rankingIds: string[];
  challengeIds: string[];
  appealIds: string[];
  auditTrailIds: string[];
}

export interface Concept {
  conceptId: string;
  briefId: string;
  creator: string;
  conceptTitle: string;
  conceptSummary: string;
  executionPlan: string;
  proofUrls: string[];
  originalityScore: number;
  brandFitScore: number;
  feasibilityScore: number;
  lowEffortRiskScore: number;
  verdict: Verdict;
  assessmentSummary: string;
  strengths: string[];
  weaknesses: string[];
  brandRisks: string[];
  status: ConceptStatus;
  createdAt: number;
  rawAssessmentJson: string;
}

export interface Ranking {
  rankingId: string;
  briefId: string;
  publisher: string;
  rankedConceptIds: string[];
  summary: string;
  status: string;
  createdAt: number;
}

export interface Challenge {
  challengeId: string;
  briefId: string;
  conceptId: string;
  challenger: string;
  reason: string;
  evidenceUrls: string[];
  status: ChallengeStatus;
  reviewJson: string;
  createdAt: number;
}

export interface Appeal {
  appealId: string;
  briefId: string;
  conceptId: string;
  appellant: string;
  reason: string;
  evidenceUrls: string[];
  status: AppealStatus;
  reviewJson: string;
  createdAt: number;
}

export interface Profile {
  address: string;
  briefsCreated: number;
  conceptsSubmitted: number;
  conceptsShortlisted: number;
  conceptsRejected: number;
  lowEffortFlags: number;
  rankingsWon: number;
  challengesWon: number;
  challengesLost: number;
  appealsWon: number;
  appealsLost: number;
  reputationScore: number;
  lastActivity: number;
}

export interface AuditRecord {
  auditId: string;
  action: string;
  actor: string;
  briefId: string;
  conceptId: string;
  rankingId: string;
  challengeId: string;
  appealId: string;
  summary: string;
  statusAfter: string;
  at: number;
}

export interface PublicStats {
  briefs: number;
  concepts: number;
  rankings: number;
  challenges: number;
  appeals: number;
  openBriefs: number;
  rankedBriefs: number;
  awardedBriefs: number;
  lowEffortConcepts: number;
  openChallenges: number;
  openAppeals: number;
  auditRecords: number;
  clock: number;
}

/** Concept verdict/status → editorial tone. */
export type Tone = "shortlisted" | "revision" | "rejected" | "neutral";
export function toneOf(verdict?: string, status?: string): Tone {
  if (verdict === "shortlisted" || status === "shortlisted" || status === "finalist" || status === "awarded") return "shortlisted";
  if (verdict === "revision_requested" || status === "revision_requested") return "revision";
  if (verdict === "rejected" || verdict === "low_effort" || status === "rejected" || status === "low_effort") return "rejected";
  return "neutral";
}
export const TONE_HEX: Record<Tone, string> = {
  shortlisted: "#1F6F78", revision: "#B08936", rejected: "#B42318", neutral: "#756B5E",
};

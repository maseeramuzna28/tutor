import { site } from "../config/site";

export interface LegalBlock {
  type: "p" | "list";
  text?: string;
  items?: string[];
}

export interface LegalSection {
  id: string;
  title: string;
  blocks: LegalBlock[];
}

export interface LegalDoc {
  title: string;
  intro: string;
  sections: LegalSection[];
}

export const privacy: LegalDoc = {
  title: "Privacy Policy",
  intro: `This policy explains what personal information ${site.name} collects, why we collect it, and the choices you have. It applies to students, faculty and visitors who use the ${site.name} website and platform.`,
  sections: [
    {
      id: "who-we-are",
      title: "Who we are",
      blocks: [
        { type: "p", text: `${site.name} is operated by ${site.legalName} ("we", "us"). For questions about this policy, write to ${site.privacyEmail}.` },
      ],
    },
    {
      id: "information-we-collect",
      title: "Information we collect",
      blocks: [
        { type: "p", text: "We collect only what is needed to run the features you use. Depending on how you use the platform, this includes:" },
        { type: "list", items: [
          "Account details: your name, email address, role (student or faculty), and the college or institution you belong to.",
          "Learning activity: the questions you ask, the answers and explanations you receive, the micro lessons you open, and the points you earn.",
          "Community content: posts, replies and project listings you publish, including posts you choose to make anonymously.",
          "Confusion signals: the topics you mark as confusing and when you mark them.",
          "Voice input: if you use the voice tutor, the audio you speak and the text transcribed from it.",
          "Technical data: device type, browser, approximate location derived from your network address, and logs needed to keep the service secure and working.",
        ] },
      ],
    },
    {
      id: "how-we-use-information",
      title: "How we use your information",
      blocks: [
        { type: "list", items: [
          "To provide and operate the features you use, including answers, explanations and micro lessons.",
          "To show faculty learning signals for their courses so they can adjust their teaching.",
          "To run points, leaderboards and the community feed.",
          "To moderate content, prevent abuse and keep the platform secure.",
          "To fix problems and improve the platform.",
          "To contact you about your account.",
          "To meet our legal obligations.",
        ] },
        { type: "p", text: "We do not sell your personal information and we do not show advertising." },
      ],
    },
    {
      id: "anonymous-posts",
      title: "Anonymous posts",
      blocks: [
        { type: "p", text: "When you post anonymously, other students and faculty see no name or profile on the post. We keep an internal record that links the post to your account so that we can investigate abuse, enforce our Terms and respond to lawful requests." },
        { type: "p", text: "Anonymous means hidden from other users. It does not mean untraceable by us. Do not post anything you would not want connected to your account if the law required us to disclose it." },
      ],
    },
    {
      id: "ai-features",
      title: "AI features",
      blocks: [
        { type: "p", text: "Some features, including the AI tutor, the voice tutor and micro lessons, send your questions to AI model providers who process them on our behalf to produce a response. For the voice tutor, this includes your audio or its transcript." },
        { type: "p", text: "Do not include passwords, government identity numbers, financial details or health information in your questions. AI responses can be wrong. Check important answers against your course material or ask your instructor." },
      ],
    },
    {
      id: "sharing",
      title: "Who we share information with",
      blocks: [
        { type: "list", items: [
          "Service providers that help us run the platform, such as hosting, AI model providers and email delivery. They may use your information only to provide their service to us.",
          "Faculty at your institution, who see confusion signals and outcome data for their own courses in aggregated form.",
          "Authorities, when we are required to do so by law or to protect people from harm.",
          "A successor organisation, if the platform is transferred to one. We will tell you before your information becomes subject to a different policy.",
        ] },
      ],
    },
    {
      id: "retention",
      title: "How long we keep information",
      blocks: [
        { type: "p", text: "We keep personal information while your account is active and for as long as needed for the purposes above. When you delete your account, we delete or anonymise your personal information within a reasonable period, except where we must keep it to meet a legal obligation or resolve a dispute." },
      ],
    },
    {
      id: "security",
      title: "Security",
      blocks: [
        { type: "p", text: "We use reasonable technical and organisational safeguards, including encryption in transit and access controls. No system is completely secure. If a breach affects your personal information, we will notify you and the relevant authority as the law requires." },
      ],
    },
    {
      id: "your-rights",
      title: "Your rights",
      blocks: [
        { type: "p", text: "Under applicable law, including India's Digital Personal Data Protection Act, 2023, you may have the right to:" },
        { type: "list", items: [
          "Get information about the personal data we process about you and how we process it.",
          "Ask us to correct inaccurate data or complete incomplete data.",
          "Ask us to erase data that is no longer needed for the purpose it was collected.",
          "Withdraw your consent to processing that relies on consent.",
          "Nominate another person to exercise your rights if you die or become unable to do so.",
          "Have a grievance addressed by us.",
        ] },
        { type: "p", text: `To use any of these rights, write to ${site.privacyEmail}. Grievances are handled by the ${site.grievanceOfficer}. If your grievance is not resolved, you may approach the Data Protection Board of India once that route is available to you.` },
      ],
    },
    {
      id: "minors",
      title: "Users under 18",
      blocks: [
        { type: "p", text: `${site.name} is intended for college students and faculty. If you are under 18, your parent or legal guardian must consent to your use of ${site.name} and to our processing of your personal information before you create an account.` },
      ],
    },
    {
      id: "cookies-and-storage",
      title: "Cookies and browser storage",
      blocks: [
        { type: "p", text: "We use only the cookies and browser storage needed to keep you signed in and to remember basic preferences. We do not use advertising cookies. If we add analytics, we will update this policy first." },
      ],
    },
    {
      id: "changes",
      title: "Changes to this policy",
      blocks: [
        { type: "p", text: "If we change this policy in a way that matters, we will tell you on the platform or by email before the change applies. The effective date at the top of this page shows when it was last updated." },
      ],
    },
    {
      id: "contact",
      title: "Contact",
      blocks: [
        { type: "p", text: `Questions about this policy: ${site.privacyEmail}. General contact: ${site.contactEmail}.` },
      ],
    },
  ],
};

import { site } from "../config/site";
import { LegalDoc } from "./privacy";

export const terms: LegalDoc = {
  title: "Terms and Conditions",
  intro: `These terms are the agreement between you and ${site.legalName} for your use of ${site.name}. Please read them before you create an account.`,
  sections: [
    {
      id: "acceptance",
      title: "Accepting these terms",
      blocks: [
        { type: "p", text: `By creating an account or using ${site.name}, you agree to these terms and to our Privacy Policy. If you do not agree, do not use the platform.` },
      ],
    },
    {
      id: "accounts",
      title: "Accounts",
      blocks: [
        { type: "p", text: "You must give accurate information when you register and keep your login details private. You are responsible for activity on your account. Tell us at once if you think someone else has used it." },
        { type: "p", text: "If you are under 18, your parent or legal guardian must agree to these terms for you." },
      ],
    },
    {
      id: "roles",
      title: "Student and faculty roles",
      blocks: [
        { type: "p", text: "Accounts are either student or faculty accounts. Faculty features, such as the faculty dashboard, outcome dashboard and curriculum updates, are available only to faculty accounts. You must not claim a role you do not hold." },
      ],
    },
    {
      id: "acceptable-use",
      title: "Acceptable use",
      blocks: [
        { type: "p", text: "You agree not to:" },
        { type: "list", items: [
          "Harass, threaten or discriminate against anyone.",
          "Post unlawful, defamatory or sexually explicit content.",
          "Share another person's private information without their permission.",
          "Impersonate another person or misstate who you are.",
          "Try to break, overload or gain unauthorised access to the platform or other accounts.",
          "Use automated tools to collect content from the platform without our written permission.",
          "Manipulate points or leaderboards, for example through fake accounts or coordinated abuse.",
        ] },
      ],
    },
    {
      id: "your-content",
      title: "Your content",
      blocks: [
        { type: "p", text: "You keep ownership of what you post. You give us a non exclusive, worldwide license to host, display and process your content for the purpose of running the platform for you and your class. This license ends when you delete the content or your account, except for copies we must keep by law or that other users have already seen." },
        { type: "p", text: "You are responsible for what you post and confirm that you have the right to post it." },
      ],
    },
    {
      id: "anonymous-posting",
      title: "Anonymous posting and moderation",
      blocks: [
        { type: "p", text: "Anonymous posts are hidden from other users but remain linked to your account in our records, as described in the Privacy Policy. Anonymous posts follow the same rules as every other post. We may remove content and restrict accounts that break these terms." },
      ],
    },
    {
      id: "ai-features",
      title: "AI features",
      blocks: [
        { type: "p", text: "Answers, explanations and lessons produced by AI features can contain mistakes. They are study aids and not a replacement for your course material, your instructor or professional advice. Check anything important before you rely on it." },
      ],
    },
    {
      id: "academic-integrity",
      title: "Academic integrity",
      blocks: [
        { type: "p", text: "Your college sets its own rules about assessments and the use of AI tools. You are responsible for following them. Do not use the platform to submit work as your own that your institution does not permit you to prepare with help." },
      ],
    },
    {
      id: "planned-features",
      title: "Planned features",
      blocks: [
        { type: "p", text: "Features described as planned, including live lectures and AI lecture recap videos, are not available yet. We do not promise that they will be released or when." },
      ],
    },
    {
      id: "intellectual-property",
      title: "Our intellectual property",
      blocks: [
        { type: "p", text: `The platform, its design, its software and the ${site.name} name belong to ${site.legalName} or its licensors. These terms give you the right to use the platform, not to copy it or build a competing service from it.` },
      ],
    },
    {
      id: "availability",
      title: "Availability and changes to the service",
      blocks: [
        { type: "p", text: "We aim to keep the platform running but do not promise it will always be available or error free. We may change or stop features, and we will give reasonable notice of changes that significantly affect you." },
      ],
    },
    {
      id: "termination",
      title: "Ending your account",
      blocks: [
        { type: "p", text: "You can stop using the platform and ask us to delete your account at any time. We may suspend or end your account if you break these terms or if we are required to by law. When an account ends, the rights you had to use the platform end with it." },
      ],
    },
    {
      id: "disclaimers",
      title: "Disclaimers",
      blocks: [
        { type: "p", text: `To the extent the law allows, ${site.name} is provided as it is and as it is available. We do not promise that it will meet your particular needs or that its answers will be accurate or complete.` },
      ],
    },
    {
      id: "liability",
      title: "Limit of liability",
      blocks: [
        { type: "p", text: `To the extent the law allows, ${site.legalName} is not liable for indirect or consequential loss arising from your use of the platform. Nothing in these terms limits liability that cannot be limited by law.` },
      ],
    },
    {
      id: "governing-law",
      title: "Governing law",
      blocks: [
        { type: "p", text: `These terms are governed by the laws of India. The courts at ${site.jurisdiction} have jurisdiction over disputes arising from them, subject to any rights you have under mandatory law.` },
      ],
    },
    {
      id: "changes",
      title: "Changes to these terms",
      blocks: [
        { type: "p", text: "If we change these terms in a way that matters, we will tell you on the platform or by email before the change applies. If you keep using the platform after the change applies, you accept the new terms." },
      ],
    },
    {
      id: "contact",
      title: "Contact",
      blocks: [
        { type: "p", text: `Questions about these terms: ${site.contactEmail}.` },
      ],
    },
  ],
};

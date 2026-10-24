import { terms } from "@/data/terms";
import LegalPageView from "@/components/Legal/LegalPageView";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms and Conditions | TUTO",
  description: "Terms and conditions for college students and faculty using the TUTO platform.",
};

export default function TermsPage() {
  return <LegalPageView doc={terms} />;
}

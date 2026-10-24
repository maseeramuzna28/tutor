import { privacy } from "@/data/privacy";
import LegalPageView from "@/components/Legal/LegalPageView";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | TUTO",
  description: "Learn how TUTO protects student privacy, handles anonymous doubts, and adheres to India's DPDP Act.",
};

export default function PrivacyPage() {
  return <LegalPageView doc={privacy} />;
}

import { useState, useEffect } from "react";
import LegalPage, { LegalSection } from "../components/layout/LegalPage";
import { getContent, DEFAULT_CONTENT } from "../services/contentService";

export default function ShippingPolicy() {
  const [content, setContent] = useState(DEFAULT_CONTENT["shipping-policy"]);

  useEffect(() => {
    let cancelled = false;
    getContent("shipping-policy").then((res) => {
      if (!cancelled && res) {
        setContent((prev) => ({ ...prev, ...res }));
      }
    });

    const handleContentUpdate = (e) => {
      if (e.detail?.key === "shipping-policy" && e.detail.data) {
        setContent((prev) => ({ ...prev, ...e.detail.data }));
      }
    };

    window.addEventListener("daalbhat:content-updated", handleContentUpdate);
    return () => {
      cancelled = true;
      window.removeEventListener("daalbhat:content-updated", handleContentUpdate);
    };
  }, []);

  const sections = content.sections || DEFAULT_CONTENT["shipping-policy"].sections;

  return (
    <LegalPage title={content.title || "Shipping Policy"} updated={content.updated || "July 2026"}>
      {sections.map((sec, idx) => (
        <LegalSection key={sec.heading || idx} heading={sec.heading}>
          <p className="whitespace-pre-line">{sec.content}</p>
        </LegalSection>
      ))}
    </LegalPage>
  );
}


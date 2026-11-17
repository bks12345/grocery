import { useEffect, useState } from "react";
import {
  Sparkles,
  Layout,
  Info,
  Phone,
  HelpCircle,
  ShieldCheck,
  FileText,
  Truck,
  Package,
  RotateCcw,
  Save,
  Plus,
  Trash2,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Image as ImageIcon,
  Upload,
} from "lucide-react";
import {
  getContent,
  updateContent,
  resetContentToDefaults,
  getAllContentKeys,
  DEFAULT_CONTENT,
} from "../../services/contentService";
import { categoryImages } from "../../data/images";
import { uploadImageToStorage } from "../../services/storageService";

const iconMap = {
  Sparkles,
  Layout,
  Info,
  Phone,
  HelpCircle,
  ShieldCheck,
  FileText,
  Truck,
  Package,
  RotateCcw,
};

export default function AdminCMS() {
  const tabs = getAllContentKeys();
  const [activeTab, setActiveTab] = useState("hero");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);
  const [showResetModal, setShowResetModal] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setStatusMessage(null);

    getContent(activeTab)
      .then((res) => {
        if (!cancelled) {
          setData(JSON.parse(JSON.stringify(res || DEFAULT_CONTENT[activeTab])));
        }
      })
      .catch((err) => {
        console.error("Error loading CMS content:", err);
        if (!cancelled) {
          setData(JSON.parse(JSON.stringify(DEFAULT_CONTENT[activeTab])));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeTab]);

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    setStatusMessage(null);

    try {
      await updateContent(activeTab, data);
      setStatusMessage({
        type: "success",
        text: `Content for "${tabs.find((t) => t.key === activeTab)?.label}" successfully saved!`,
      });
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err) {
      console.error("Error saving CMS content:", err);
      setStatusMessage({
        type: "error",
        text: `Failed to save content: ${err.message}`,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    setSaving(true);
    setShowResetModal(false);
    try {
      const resetData = await resetContentToDefaults(activeTab);
      setData(JSON.parse(JSON.stringify(resetData)));
      setStatusMessage({
        type: "success",
        text: `Content reset to default values.`,
      });
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err) {
      console.error("Error resetting CMS content:", err);
      setStatusMessage({
        type: "error",
        text: `Reset failed: ${err.message}`,
      });
    } finally {
      setSaving(false);
    }
  };

  const getPreviewUrl = (key) => {
    switch (key) {
      case "hero":
      case "footer":
        return "/";
      case "about":
        return "/about";
      case "contact":
        return "/contact";
      case "faq":
        return "/faq";
      case "privacy-policy":
        return "/privacy-policy";
      case "terms":
        return "/terms";
      case "delivery-information":
        return "/delivery-information";
      case "shipping-policy":
        return "/shipping-policy";
      case "return-policy":
        return "/return-policy";
      default:
        return "/";
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="card-elevated rounded-3xl p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-mango-600 bg-mango-50 px-3 py-1 rounded-full">
            Content Management System
          </span>
          <h2 className="font-display text-xl sm:text-2xl font-semibold text-ink mt-2">
            Site Content & Policy Editor
          </h2>
          <p className="text-sm text-ink-soft/70 mt-1 max-w-2xl">
            Edit the Home Hero carousel, global Footer details, and all customer policy & static pages dynamically.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <a
            href={getPreviewUrl(activeTab)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-basil-200 text-basil-700 text-sm font-medium hover:bg-basil-50 transition-colors"
          >
            <ExternalLink size={15} /> View Live Page
          </a>
          <button
            onClick={() => setShowResetModal(true)}
            disabled={saving || loading}
            type="button"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-tomato-200 text-tomato-600 text-sm font-medium hover:bg-tomato-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={15} /> Reset
          </button>
          <button
            onClick={handleSave}
            disabled={saving || loading}
            type="button"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-basil-600 text-white text-sm font-medium hover:bg-basil-700 shadow-soft hover:shadow-glow transition-all disabled:opacity-50"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Save Changes
          </button>
        </div>
      </div>

      {/* Status notification */}
      {statusMessage && (
        <div
          className={`rounded-2xl p-4 flex items-center gap-3 transition-all ${
            statusMessage.type === "success"
              ? "bg-basil-50 border border-basil-200 text-basil-800"
              : "bg-tomato-50 border border-tomato-200 text-tomato-800"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 size={20} className="text-basil-600 shrink-0" />
          ) : (
            <AlertCircle size={20} className="text-tomato-600 shrink-0" />
          )}
          <span className="text-sm font-medium">{statusMessage.text}</span>
        </div>
      )}

      {/* Tabs navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {tabs.map((tab) => {
          const IconComponent = iconMap[tab.icon] || FileText;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                isActive
                  ? "bg-basil-600 text-white shadow-soft"
                  : "card-elevated text-ink-soft hover:bg-basil-50 hover:text-ink"
              }`}
            >
              <IconComponent size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Editor Content Body */}
      <div className="card-elevated rounded-3xl p-6 sm:p-8">
        {loading || !data ? (
          <div className="py-20 flex flex-col items-center justify-center text-ink-soft">
            <Loader2 className="animate-spin text-basil-600 mb-3" size={32} />
            <p className="text-sm">Loading content settings...</p>
          </div>
        ) : (
          <form onSubmit={handleSave} className="flex flex-col gap-8">
            {activeTab === "hero" && <HeroEditor data={data} setData={setData} />}
            {activeTab === "footer" && <FooterEditor data={data} setData={setData} />}
            {activeTab === "about" && <AboutEditor data={data} setData={setData} />}
            {activeTab === "contact" && <ContactEditor data={data} setData={setData} />}
            {activeTab === "faq" && <FAQEditor data={data} setData={setData} />}
            {activeTab === "privacy-policy" && <PolicyEditor data={data} setData={setData} title="Privacy Policy" />}
            {activeTab === "terms" && <PolicyEditor data={data} setData={setData} title="Terms & Conditions" />}
            {activeTab === "delivery-information" && <DeliveryInfoEditor data={data} setData={setData} />}
            {activeTab === "shipping-policy" && <PolicyEditor data={data} setData={setData} title="Shipping Policy" />}
            {activeTab === "return-policy" && <PolicyEditor data={data} setData={setData} title="Return & Refund Policy" />}

            {/* Bottom Save Action */}
            <div className="pt-6 border-t border-basil-50 flex items-center justify-between">
              <span className="text-xs text-ink-soft/60">
                Changes will immediately update customer-facing pages upon save.
              </span>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-basil-600 text-white font-medium hover:bg-basil-700 shadow-soft hover:shadow-glow transition-all disabled:opacity-50"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                Save Changes
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl">
            <h3 className="font-display text-xl font-semibold text-ink">Reset to Defaults?</h3>
            <p className="text-sm text-ink-soft mt-2">
              Are you sure you want to revert <strong>{tabs.find((t) => t.key === activeTab)?.label}</strong> to its default content? Any custom edits for this section will be overwritten.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="px-5 py-2.5 rounded-full border border-ink/10 text-sm font-medium text-ink-soft hover:bg-basil-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="px-5 py-2.5 rounded-full bg-tomato-500 text-white text-sm font-medium hover:bg-tomato-600 shadow-soft"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ========================================================================= */
/* 1. HERO SLIDER EDITOR                                                     */
/* ========================================================================= */
function HeroEditor({ data, setData }) {
  const slides = data.slides || [];
  const [uploadingIdx, setUploadingIdx] = useState(null);

  const handleSlideChange = (index, field, value) => {
    const updated = [...slides];
    updated[index] = { ...updated[index], [field]: value };
    setData({ ...data, slides: updated });
  };

  const handleBannerUpload = async (idx, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingIdx(idx);
    try {
      const res = await uploadImageToStorage(file, "cms", {
        maxWidth: 1920,
        maxHeight: 1080,
        quality: 0.85,
        allowFallback: true,
      });
      if (res?.url) {
        const updated = [...slides];
        updated[idx] = {
          ...updated[idx],
          image: res.url,
          imageFallback: res.url,
        };
        setData({ ...data, slides: updated });
      }
    } catch (err) {
      alert(err.message || "Failed to upload banner image to Firebase Storage.");
    } finally {
      setUploadingIdx(null);
      e.target.value = "";
    }
  };

  const handleCtaChange = (index, ctaType, field, value) => {
    const updated = [...slides];
    updated[index] = {
      ...updated[index],
      [ctaType]: {
        ...(updated[index][ctaType] || {}),
        [field]: value,
      },
    };
    setData({ ...data, slides: updated });
  };

  const addSlide = () => {
    const newSlide = {
      eyebrow: "Special Collection",
      title: "New Fresh Arrivals",
      subtitle: "Discover high quality groceries delivered directly to your doorstep.",
      image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=1600&auto=format&fit=crop&q=80",
      imageFallback: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=1600&auto=format&fit=crop&q=80",
      primaryCta: { label: "Shop Now", to: "/shop" },
      secondaryCta: { label: "Explore Offers", to: "/offers" },
    };
    setData({ ...data, slides: [...slides, newSlide] });
  };

  const removeSlide = (index) => {
    if (slides.length <= 1) {
      alert("You must keep at least 1 hero slide.");
      return;
    }
    const updated = slides.filter((_, i) => i !== index);
    setData({ ...data, slides: updated });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-lg font-semibold text-ink">Hero Carousel Slides</h3>
          <p className="text-xs text-ink-soft">
            Manage the prominent slides rotated in the homepage hero banner ({slides.length} slides active).
          </p>
        </div>
        <button
          type="button"
          onClick={addSlide}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-basil-50 text-basil-700 text-xs font-semibold hover:bg-basil-100 transition-colors"
        >
          <Plus size={14} /> Add Slide
        </button>
      </div>

      <div className="flex flex-col gap-8">
        {slides.map((slide, idx) => (
          <div key={idx} className="p-5 sm:p-6 rounded-3xl bg-basil-50/50 border border-basil-100 flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-basil-100 pb-3">
              <span className="font-semibold text-sm text-basil-900">
                Slide #{idx + 1}
              </span>
              {slides.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeSlide(idx)}
                  className="text-tomato-500 hover:text-tomato-700 text-xs font-medium inline-flex items-center gap-1"
                >
                  <Trash2 size={14} /> Remove Slide
                </button>
              )}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <InputField
                label="Eyebrow Badge"
                value={slide.eyebrow}
                onChange={(e) => handleSlideChange(idx, "eyebrow", e.target.value)}
                placeholder="e.g. Fresh picks, every morning"
              />
              <InputField
                label="Headline Title"
                value={slide.title}
                onChange={(e) => handleSlideChange(idx, "title", e.target.value)}
                placeholder="e.g. Pantry staples straight from the source"
              />
            </div>

            <TextAreaField
              label="Subtitle / Description"
              value={slide.subtitle}
              onChange={(e) => handleSlideChange(idx, "subtitle", e.target.value)}
              rows={2}
              placeholder="Short description under the title..."
            />

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <InputField
                  label="Hero Image URL"
                  value={slide.image}
                  onChange={(e) => handleSlideChange(idx, "image", e.target.value)}
                  placeholder="https://..."
                />
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <label className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-basil-100 text-basil-800 rounded-lg hover:bg-basil-200 cursor-pointer transition-colors shadow-2xs">
                    {uploadingIdx === idx ? (
                      <Loader2 size={13} className="animate-spin text-basil-700" />
                    ) : (
                      <Upload size={13} className="text-basil-700" />
                    )}
                    <span>{uploadingIdx === idx ? "Uploading..." : "Upload Banner"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleBannerUpload(idx, e)}
                      className="hidden"
                      disabled={uploadingIdx === idx}
                    />
                  </label>
                  {/* Preset image suggestions */}
                  <div className="flex flex-wrap gap-1.5 items-center">
                    <span className="text-[11px] text-ink-soft/60 flex items-center gap-1">
                      <ImageIcon size={12} /> Presets:
                    </span>
                    {Object.entries(categoryImages).slice(0, 3).map(([catKey, val]) => (
                      <button
                        key={catKey}
                        type="button"
                        onClick={() => {
                          handleSlideChange(idx, "image", val.url);
                          handleSlideChange(idx, "imageFallback", val.fallback);
                        }}
                        className="text-[11px] px-2 py-0.5 rounded-full bg-white border border-basil-200 text-basil-700 hover:bg-basil-100"
                      >
                        {catKey}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <InputField
                label="Fallback Image URL (Optional)"
                value={slide.imageFallback || ""}
                onChange={(e) => handleSlideChange(idx, "imageFallback", e.target.value)}
                placeholder="https://..."
              />
            </div>

            {/* CTAs */}
            <div className="grid sm:grid-cols-2 gap-4 pt-2 border-t border-basil-100">
              <div className="p-4 rounded-2xl bg-white border border-basil-100 flex flex-col gap-3">
                <span className="text-xs font-semibold text-ink">Primary Button</span>
                <InputField
                  label="Button Label"
                  value={slide.primaryCta?.label || ""}
                  onChange={(e) => handleCtaChange(idx, "primaryCta", "label", e.target.value)}
                />
                <InputField
                  label="Target Link (Path)"
                  value={slide.primaryCta?.to || ""}
                  onChange={(e) => handleCtaChange(idx, "primaryCta", "to", e.target.value)}
                />
              </div>

              <div className="p-4 rounded-2xl bg-white border border-basil-100 flex flex-col gap-3">
                <span className="text-xs font-semibold text-ink">Secondary Button</span>
                <InputField
                  label="Button Label"
                  value={slide.secondaryCta?.label || ""}
                  onChange={(e) => handleCtaChange(idx, "secondaryCta", "label", e.target.value)}
                />
                <InputField
                  label="Target Link (Path)"
                  value={slide.secondaryCta?.to || ""}
                  onChange={(e) => handleCtaChange(idx, "secondaryCta", "to", e.target.value)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ========================================================================= */
/* 2. FOOTER SECTION EDITOR                                                  */
/* ========================================================================= */
function FooterEditor({ data, setData }) {
  const handleChange = (field, value) => {
    setData({ ...data, [field]: value });
  };

  const handleSocialChange = (network, value) => {
    setData({
      ...data,
      socialLinks: {
        ...(data.socialLinks || {}),
        [network]: value,
      },
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="font-display text-lg font-semibold text-ink">Global Footer Settings</h3>
        <p className="text-xs text-ink-soft">
          Manage brand bio, contact channels, copyright, and social media handles displayed on every page footer.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <InputField
          label="Brand Name"
          value={data.brandName || ""}
          onChange={(e) => handleChange("brandName", e.target.value)}
        />
        <InputField
          label="Copyright Notice"
          value={data.copyrightText || ""}
          onChange={(e) => handleChange("copyrightText", e.target.value)}
        />
      </div>

      <TextAreaField
        label="Brand Tagline / Bio"
        value={data.tagline || ""}
        onChange={(e) => handleChange("tagline", e.target.value)}
        rows={2}
      />

      <div className="p-5 rounded-3xl bg-basil-50/50 border border-basil-100 flex flex-col gap-4">
        <h4 className="font-semibold text-sm text-basil-900">Direct Contact Information</h4>
        <div className="grid sm:grid-cols-3 gap-4">
          <InputField
            label="Support Phone"
            value={data.phone || ""}
            onChange={(e) => handleChange("phone", e.target.value)}
          />
          <InputField
            label="Support Email"
            value={data.email || ""}
            onChange={(e) => handleChange("email", e.target.value)}
          />
          <InputField
            label="Store Address"
            value={data.address || ""}
            onChange={(e) => handleChange("address", e.target.value)}
          />
        </div>
      </div>

      <div className="p-5 rounded-3xl bg-basil-50/50 border border-basil-100 flex flex-col gap-4">
        <h4 className="font-semibold text-sm text-basil-900">Social Media Links</h4>
        <div className="grid sm:grid-cols-2 gap-4">
          <InputField
            label="Facebook URL"
            value={data.socialLinks?.facebook || ""}
            onChange={(e) => handleSocialChange("facebook", e.target.value)}
          />
          <InputField
            label="Instagram URL"
            value={data.socialLinks?.instagram || ""}
            onChange={(e) => handleSocialChange("instagram", e.target.value)}
          />
          <InputField
            label="Twitter / X URL"
            value={data.socialLinks?.twitter || ""}
            onChange={(e) => handleSocialChange("twitter", e.target.value)}
          />
          <InputField
            label="YouTube URL"
            value={data.socialLinks?.youtube || ""}
            onChange={(e) => handleSocialChange("youtube", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}

/* ========================================================================= */
/* 3. ABOUT US PAGE EDITOR                                                   */
/* ========================================================================= */
function AboutEditor({ data, setData }) {
  const handleChange = (field, value) => {
    setData({ ...data, [field]: value });
  };

  const handleValueChange = (index, field, value) => {
    const updated = [...(data.values || [])];
    updated[index] = { ...updated[index], [field]: value };
    setData({ ...data, values: updated });
  };

  const addValueCard = () => {
    const newCard = { icon: "Heart", title: "New Core Value", text: "Description of core store value." };
    setData({ ...data, values: [...(data.values || []), newCard] });
  };

  const removeValueCard = (index) => {
    const updated = (data.values || []).filter((_, i) => i !== index);
    setData({ ...data, values: updated });
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="font-display text-lg font-semibold text-ink">About Us Page (/about)</h3>
        <p className="text-xs text-ink-soft">
          Customize brand storytelling, mission statements, and core value cards.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <InputField
          label="Badge Tag"
          value={data.eyebrow || ""}
          onChange={(e) => handleChange("eyebrow", e.target.value)}
        />
        <InputField
          label="Hero Title"
          value={data.title || ""}
          onChange={(e) => handleChange("title", e.target.value)}
        />
      </div>

      <TextAreaField
        label="Story / Description"
        value={data.story || ""}
        onChange={(e) => handleChange("story", e.target.value)}
        rows={4}
      />

      {/* Core Values Cards */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-sm text-ink">Core Value Cards</h4>
          <button
            type="button"
            onClick={addValueCard}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-basil-50 text-basil-700 text-xs font-semibold hover:bg-basil-100"
          >
            <Plus size={13} /> Add Value Card
          </button>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {(data.values || []).map((val, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-basil-50/50 border border-basil-100 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-basil-900">Card #{idx + 1}</span>
                <button
                  type="button"
                  onClick={() => removeValueCard(idx)}
                  className="text-tomato-500 hover:text-tomato-700 text-xs"
                >
                  <Trash2 size={13} />
                </button>
              </div>
              <InputField
                label="Title"
                value={val.title}
                onChange={(e) => handleValueChange(idx, "title", e.target.value)}
              />
              <TextAreaField
                label="Description"
                value={val.text}
                onChange={(e) => handleValueChange(idx, "text", e.target.value)}
                rows={2}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA banner */}
      <div className="p-5 rounded-3xl bg-basil-50/50 border border-basil-100 flex flex-col gap-4">
        <h4 className="font-semibold text-sm text-basil-900">Bottom Call to Action Banner</h4>
        <div className="grid sm:grid-cols-2 gap-4">
          <InputField
            label="Banner Title"
            value={data.ctaTitle || ""}
            onChange={(e) => handleChange("ctaTitle", e.target.value)}
          />
          <InputField
            label="Banner Subtitle"
            value={data.ctaSubtitle || ""}
            onChange={(e) => handleChange("ctaSubtitle", e.target.value)}
          />
          <InputField
            label="Button Text"
            value={data.ctaButtonText || ""}
            onChange={(e) => handleChange("ctaButtonText", e.target.value)}
          />
          <InputField
            label="Button Link"
            value={data.ctaButtonLink || ""}
            onChange={(e) => handleChange("ctaButtonLink", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}

/* ========================================================================= */
/* 4. CONTACT US PAGE EDITOR                                                 */
/* ========================================================================= */
function ContactEditor({ data, setData }) {
  const handleChange = (field, value) => {
    setData({ ...data, [field]: value });
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="font-display text-lg font-semibold text-ink">Contact Us Page (/contact)</h3>
        <p className="text-xs text-ink-soft">
          Manage header text, phone, email, store physical location, support hours, and Google Maps embed iframe.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <InputField
          label="Page Title"
          value={data.title || ""}
          onChange={(e) => handleChange("title", e.target.value)}
        />
        <InputField
          label="Subtitle"
          value={data.subtitle || ""}
          onChange={(e) => handleChange("subtitle", e.target.value)}
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <InputField
          label="Phone"
          value={data.phone || ""}
          onChange={(e) => handleChange("phone", e.target.value)}
        />
        <InputField
          label="Email"
          value={data.email || ""}
          onChange={(e) => handleChange("email", e.target.value)}
        />
        <InputField
          label="Store Address"
          value={data.address || ""}
          onChange={(e) => handleChange("address", e.target.value)}
        />
        <InputField
          label="Support Operating Hours"
          value={data.hours || ""}
          onChange={(e) => handleChange("hours", e.target.value)}
        />
      </div>

      <InputField
        label="Google Maps Embed URL (iframe src)"
        value={data.mapEmbedUrl || ""}
        onChange={(e) => handleChange("mapEmbedUrl", e.target.value)}
        placeholder="https://www.google.com/maps/embed?pb=..."
      />
    </div>
  );
}

/* ========================================================================= */
/* 5. FAQ PAGE EDITOR                                                        */
/* ========================================================================= */
function FAQEditor({ data, setData }) {
  const items = data.items || [];

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setData({ ...data, items: updated });
  };

  const addItem = () => {
    const newItem = {
      question: "New Question Title?",
      answer: "Detailed answer explaining the policy or instruction.",
    };
    setData({ ...data, items: [...items, newItem] });
  };

  const removeItem = (index) => {
    const updated = items.filter((_, i) => i !== index);
    setData({ ...data, items: updated });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-lg font-semibold text-ink">FAQ Management (/faq)</h3>
          <p className="text-xs text-ink-soft">
            Add, remove, and update customer frequently asked questions ({items.length} items).
          </p>
        </div>
        <button
          type="button"
          onClick={addItem}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-basil-50 text-basil-700 text-xs font-semibold hover:bg-basil-100"
        >
          <Plus size={14} /> Add Question
        </button>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <InputField
          label="Page Title"
          value={data.title || ""}
          onChange={(e) => setData({ ...data, title: e.target.value })}
        />
        <InputField
          label="Subtitle"
          value={data.subtitle || ""}
          onChange={(e) => setData({ ...data, subtitle: e.target.value })}
        />
      </div>

      <div className="flex flex-col gap-4">
        {items.map((item, idx) => (
          <div key={idx} className="p-4 sm:p-5 rounded-2xl bg-basil-50/50 border border-basil-100 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-basil-900">Q#{idx + 1}</span>
              <button
                type="button"
                onClick={() => removeItem(idx)}
                className="text-tomato-500 hover:text-tomato-700 text-xs inline-flex items-center gap-1"
              >
                <Trash2 size={13} /> Delete
              </button>
            </div>
            <InputField
              label="Question"
              value={item.question}
              onChange={(e) => handleItemChange(idx, "question", e.target.value)}
            />
            <TextAreaField
              label="Answer"
              value={item.answer}
              onChange={(e) => handleItemChange(idx, "answer", e.target.value)}
              rows={3}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ========================================================================= */
/* 6. GENERIC POLICY & LEGAL PAGE EDITOR                                     */
/* ========================================================================= */
function PolicyEditor({ data, setData, title }) {
  const sections = data.sections || [];

  const handleSectionChange = (index, field, value) => {
    const updated = [...sections];
    updated[index] = { ...updated[index], [field]: value };
    setData({ ...data, sections: updated });
  };

  const addSection = () => {
    const newSec = {
      heading: "New Clause Heading",
      content: "Details and terms regarding this policy clause.",
    };
    setData({ ...data, sections: [...sections, newSec] });
  };

  const removeSection = (index) => {
    const updated = sections.filter((_, i) => i !== index);
    setData({ ...data, sections: updated });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-lg font-semibold text-ink">{title} Editor</h3>
          <p className="text-xs text-ink-soft">
            Manage policy clauses, descriptions, and last updated timestamps.
          </p>
        </div>
        <button
          type="button"
          onClick={addSection}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-basil-50 text-basil-700 text-xs font-semibold hover:bg-basil-100"
        >
          <Plus size={14} /> Add Section
        </button>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <InputField
          label="Policy Title"
          value={data.title || ""}
          onChange={(e) => setData({ ...data, title: e.target.value })}
        />
        <InputField
          label="Last Updated (e.g. July 2026)"
          value={data.updated || ""}
          onChange={(e) => setData({ ...data, updated: e.target.value })}
        />
      </div>

      {data.disclaimer !== undefined && (
        <TextAreaField
          label="Intro Disclaimer / Notice"
          value={data.disclaimer || ""}
          onChange={(e) => setData({ ...data, disclaimer: e.target.value })}
          rows={2}
        />
      )}

      <div className="flex flex-col gap-4">
        {sections.map((sec, idx) => (
          <div key={idx} className="p-4 sm:p-5 rounded-2xl bg-basil-50/50 border border-basil-100 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-basil-900">Section #{idx + 1}</span>
              <button
                type="button"
                onClick={() => removeSection(idx)}
                className="text-tomato-500 hover:text-tomato-700 text-xs inline-flex items-center gap-1"
              >
                <Trash2 size={13} /> Delete
              </button>
            </div>
            <InputField
              label="Section Heading"
              value={sec.heading}
              onChange={(e) => handleSectionChange(idx, "heading", e.target.value)}
            />
            <TextAreaField
              label="Section Content"
              value={sec.content}
              onChange={(e) => handleSectionChange(idx, "content", e.target.value)}
              rows={3}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ========================================================================= */
/* 7. DELIVERY INFORMATION EDITOR                                            */
/* ========================================================================= */
function DeliveryInfoEditor({ data, setData }) {
  const notices = data.notices || [];

  const handleNoticeChange = (index, field, value) => {
    const updated = [...notices];
    updated[index] = { ...updated[index], [field]: value };
    setData({ ...data, notices: updated });
  };

  const addNotice = () => {
    const newNotice = {
      icon: "Clock",
      title: "New Notice Heading",
      text: "Information regarding regional deliveries, charges, or timing.",
    };
    setData({ ...data, notices: [...notices, newNotice] });
  };

  const removeNotice = (index) => {
    const updated = notices.filter((_, i) => i !== index);
    setData({ ...data, notices: updated });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-lg font-semibold text-ink">Delivery Information (/delivery-information)</h3>
          <p className="text-xs text-ink-soft">
            Manage descriptive notices and guidance shown alongside delivery zones. (Zone table postal codes are managed in the Delivery Zones tab).
          </p>
        </div>
        <button
          type="button"
          onClick={addNotice}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-basil-50 text-basil-700 text-xs font-semibold hover:bg-basil-100"
        >
          <Plus size={14} /> Add Notice Card
        </button>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <InputField
          label="Page Title"
          value={data.title || ""}
          onChange={(e) => setData({ ...data, title: e.target.value })}
        />
        <InputField
          label="Subtitle"
          value={data.subtitle || ""}
          onChange={(e) => setData({ ...data, subtitle: e.target.value })}
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {notices.map((notice, idx) => (
          <div key={idx} className="p-4 sm:p-5 rounded-2xl bg-basil-50/50 border border-basil-100 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-basil-900">Notice #{idx + 1}</span>
              <button
                type="button"
                onClick={() => removeNotice(idx)}
                className="text-tomato-500 hover:text-tomato-700 text-xs inline-flex items-center gap-1"
              >
                <Trash2 size={13} /> Delete
              </button>
            </div>
            <InputField
              label="Card Title"
              value={notice.title}
              onChange={(e) => handleNoticeChange(idx, "title", e.target.value)}
            />
            <TextAreaField
              label="Description"
              value={notice.text}
              onChange={(e) => handleNoticeChange(idx, "text", e.target.value)}
              rows={3}
            />
          </div>
        ))}
      </div>

      <TextAreaField
        label="Bottom Callout Banner Text"
        value={data.calloutText || ""}
        onChange={(e) => setData({ ...data, calloutText: e.target.value })}
        rows={2}
      />
    </div>
  );
}

/* ========================================================================= */
/* REUSABLE FORM CONTROLS                                                    */
/* ========================================================================= */
function InputField({ label, ...props }) {
  return (
    <label className="flex flex-col gap-1.5 text-xs font-medium text-ink-soft">
      <span>{label}</span>
      <input
        {...props}
        className="px-4 py-2.5 rounded-2xl bg-white border border-basil-100 text-sm text-ink outline-none focus:border-basil-500 focus:ring-2 focus:ring-basil-100 transition-all"
      />
    </label>
  );
}

function TextAreaField({ label, ...props }) {
  return (
    <label className="flex flex-col gap-1.5 text-xs font-medium text-ink-soft">
      <span>{label}</span>
      <textarea
        {...props}
        className="px-4 py-2.5 rounded-2xl bg-white border border-basil-100 text-sm text-ink outline-none focus:border-basil-500 focus:ring-2 focus:ring-basil-100 transition-all resize-none"
      />
    </label>
  );
}

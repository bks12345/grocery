import { useEffect, useState } from "react";
import {
  Loader2,
  Mail,
  Edit3,
  Check,
  X,
  AlertCircle,
  Settings,
  Send,
  CheckCircle2,
  HelpCircle,
} from "lucide-react";
import * as adminTemplateService from "../../services/adminTemplateService";
import { sendEmailNotification } from "../../services/mailService";

const senderPresets = [
  "orders@daalbhat.com",
  "support@daalbhat.com",
  "info@daalbhat.com",
  "billing@daalbhat.com",
];

export default function AdminTemplates() {
  const [templates, setTemplates] = useState(null);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [senderSettings, setSenderSettings] = useState({
    senderEmail: "orders@daalbhat.com",
    senderName: "Daalbhat Store",
    replyTo: "support@daalbhat.com",
    emailjsServiceId: "",
    emailjsTemplateId: "",
    emailjsPublicKey: "",
  });

  const [savingTemplate, setSavingTemplate] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);
  const [testEmailSending, setTestEmailSending] = useState(false);
  const [testEmailSuccess, setTestEmailSuccess] = useState(null);
  const [error, setError] = useState(null);

  const load = async () => {
    try {
      const [tList, sSettings] = await Promise.all([
        adminTemplateService.getAllTemplates(),
        adminTemplateService.getEmailSenderSettings(),
      ]);
      setTemplates(tList);
      if (sSettings) setSenderSettings(sSettings);
    } catch (err) {
      console.warn("[AdminTemplates] Load failed:", err);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleEdit = (template) => {
    setEditingTemplate({ ...template });
  };

  const handleSaveTemplate = async (e) => {
    e.preventDefault();
    setSavingTemplate(true);
    setError(null);
    try {
      await adminTemplateService.updateTemplate(editingTemplate.type, {
        subject: editingTemplate.subject,
        bodyHtml: editingTemplate.bodyHtml,
      });
      setEditingTemplate(null);
      await load();
    } catch {
      setError("Failed to save template. Please try again.");
    } finally {
      setSavingTemplate(false);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await adminTemplateService.updateEmailSenderSettings(senderSettings);
      setSettingsSuccess(true);
      setTimeout(() => setSettingsSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to save email settings:", err);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleSendTestEmail = async () => {
    setTestEmailSending(true);
    setTestEmailSuccess(null);
    try {
      const result = await sendEmailNotification({
        to: senderSettings.senderEmail || "test@daalbhat.com",
        subject: "Daalbhat System Test Email",
        html: `<p>This is a test notification sent from <strong>${senderSettings.senderName}</strong> using sender email <strong>${senderSettings.senderEmail}</strong>.</p>`,
        fromEmail: senderSettings.senderEmail,
        fromName: senderSettings.senderName,
      });

      if (result.live) {
        setTestEmailSuccess({
          type: "success",
          text: "Live test email dispatched successfully via EmailJS directly to your inbox!",
        });
      } else if (result.error) {
        setTestEmailSuccess({
          type: "warning",
          text: `Logged to Firestore /mail queue. Note from EmailJS: ${result.error}`,
        });
      } else {
        setTestEmailSuccess({
          type: "success",
          text: "Notification logged to Firestore /mail collection successfully!",
        });
      }
      setTimeout(() => setTestEmailSuccess(null), 8000);
    } catch (err) {
      console.error(err);
    } finally {
      setTestEmailSending(false);
    }
  };

  const placeholders = {
    otp: ["{{otp}}"],
    order_confirmation: [
      "{{orderId}}",
      "{{customerName}}",
      "{{total}}",
      "{{estimatedDelivery}}",
      "{{deliveryMethod}}",
    ],
    admin_new_order: ["{{orderId}}", "{{total}}", "{{deliveryMethod}}"],
    order_status: [
      "{{orderId}}",
      "{{customerName}}",
      "{{status}}",
      "{{total}}",
      "{{estimatedDelivery}}",
    ],
    nepal_order_confirmation: [
      "{{orderId}}",
      "{{customerName}}",
      "{{phone}}",
      "{{deliveryAddress}}",
      "{{itemsCount}}",
      "{{notes}}",
    ],
    nepal_order_status: [
      "{{orderId}}",
      "{{customerName}}",
      "{{status}}",
      "{{phone}}",
      "{{deliveryAddress}}",
    ],
  };

  if (!templates) {
    return (
      <div className="card-elevated rounded-3xl p-16 flex justify-center">
        <Loader2 className="animate-spin text-basil-600" size={24} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">Email & Delivery Notifications</h1>
        <p className="text-sm text-ink-soft mt-1">
          Configure sender email addresses, delivery status alerts, and automated customer emails.
        </p>
      </div>

      {/* Sender Email & Service Settings Card */}
      <div className="card-elevated rounded-3xl p-6 bg-white border border-basil-50 shadow-soft">
        <div className="flex items-center justify-between border-b border-basil-50 pb-4 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-basil-50 text-basil-600 flex items-center justify-center">
              <Settings size={17} />
            </div>
            <div>
              <h2 className="font-display text-lg font-semibold text-ink">
                Admin Sender Email Settings
              </h2>
              <p className="text-xs text-ink-soft">
                Choose which sender email appears on customer delivery updates and receipts.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSendTestEmail}
            disabled={testEmailSending}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-full bg-basil-50 text-basil-700 hover:bg-basil-100 transition-colors disabled:opacity-60"
          >
            {testEmailSending ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Send size={13} />
            )}
            Test Notification
          </button>
        </div>

        {testEmailSuccess && (
          <div
            className={`mb-4 p-3 rounded-xl text-xs flex items-center gap-2 border ${
              testEmailSuccess.type === "warning"
                ? "bg-mango-50 border-mango-200 text-mango-800"
                : "bg-basil-50 border-basil-200 text-basil-800"
            }`}
          >
            {testEmailSuccess.type === "warning" ? (
              <AlertCircle size={16} className="text-mango-600 shrink-0" />
            ) : (
              <CheckCircle2 size={16} className="text-basil-600 shrink-0" />
            )}
            <span>{testEmailSuccess.text}</span>
          </div>
        )}

        <form onSubmit={handleSaveSettings} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            {/* Sender Email with Presets */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-ink-soft uppercase tracking-wider">
                Sender Email Address
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  required
                  value={senderSettings.senderEmail}
                  onChange={(e) =>
                    setSenderSettings({ ...senderSettings, senderEmail: e.target.value })
                  }
                  placeholder="e.g. orders@daalbhat.com"
                  className="flex-1 px-4 py-2 text-sm rounded-xl border border-basil-100 bg-cream/30 focus:bg-white focus:border-basil-500 outline-none transition-all"
                />
              </div>
              <div className="flex flex-wrap gap-1.5 mt-1">
                <span className="text-[11px] text-ink-soft/70 self-center mr-1">Quick Select:</span>
                {senderPresets.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setSenderSettings({ ...senderSettings, senderEmail: preset })}
                    className={`text-[11px] px-2.5 py-0.5 rounded-full border transition-all ${
                      senderSettings.senderEmail === preset
                        ? "bg-basil-600 text-white border-basil-600"
                        : "bg-white text-ink-soft hover:bg-basil-50 border-basil-100"
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Sender Display Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-ink-soft uppercase tracking-wider">
                Sender Display Name
              </label>
              <input
                type="text"
                required
                value={senderSettings.senderName}
                onChange={(e) =>
                  setSenderSettings({ ...senderSettings, senderName: e.target.value })
                }
                placeholder="e.g. Daalbhat Grocery"
                className="w-full px-4 py-2 text-sm rounded-xl border border-basil-100 bg-cream/30 focus:bg-white focus:border-basil-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* EmailJS Live Delivery Settings (Optional) */}
          <details className="mt-3 p-4 bg-basil-50/30 rounded-2xl border border-basil-100/60 group">
            <summary className="text-xs font-semibold text-basil-700 cursor-pointer flex items-center gap-1.5">
              <HelpCircle size={14} /> Optional: Connect EmailJS for Free Real-World Inbox Delivery
            </summary>
            <div className="grid sm:grid-cols-3 gap-3 mt-3 pt-3 border-t border-basil-100/40">
              <div>
                <label className="text-[11px] font-medium text-ink-soft">Service ID</label>
                <input
                  type="text"
                  value={senderSettings.emailjsServiceId || ""}
                  onChange={(e) =>
                    setSenderSettings({ ...senderSettings, emailjsServiceId: e.target.value })
                  }
                  placeholder="service_xxx"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-basil-100 bg-white outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-ink-soft">Template ID</label>
                <input
                  type="text"
                  value={senderSettings.emailjsTemplateId || ""}
                  onChange={(e) =>
                    setSenderSettings({ ...senderSettings, emailjsTemplateId: e.target.value })
                  }
                  placeholder="template_xxx"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-basil-100 bg-white outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-ink-soft">Public Key</label>
                <input
                  type="text"
                  value={senderSettings.emailjsPublicKey || ""}
                  onChange={(e) =>
                    setSenderSettings({ ...senderSettings, emailjsPublicKey: e.target.value })
                  }
                  placeholder="public_xxx"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-basil-100 bg-white outline-none"
                />
              </div>
            </div>
          </details>

          <div className="flex items-center justify-between pt-2">
            {settingsSuccess && (
              <span className="text-xs text-basil-600 font-medium flex items-center gap-1">
                <Check size={14} /> Sender settings saved!
              </span>
            )}
            <div className="ml-auto">
              <button
                type="submit"
                disabled={savingSettings}
                className="px-6 py-2 bg-basil-600 text-white rounded-full text-xs font-semibold hover:bg-basil-700 hover:shadow-glow transition-all flex items-center gap-1.5 disabled:opacity-60"
              >
                {savingSettings ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                Save Sender Settings
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Templates Section */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Template List */}
        <div className="lg:col-span-1 flex flex-col gap-3">
          <h3 className="text-xs font-semibold text-ink-soft uppercase tracking-wider px-1">
            Notification Templates
          </h3>
          {templates.map((template) => (
            <button
              key={template.id}
              onClick={() => handleEdit(template)}
              className={`text-left w-full p-4 rounded-2xl border transition-all ${
                editingTemplate?.id === template.id
                  ? "bg-basil-50 border-basil-200 shadow-soft"
                  : "bg-white border-transparent shadow-sm hover:shadow-soft"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    editingTemplate?.id === template.id
                      ? "bg-basil-600 text-white"
                      : "bg-basil-50 text-basil-600"
                  }`}
                >
                  <Mail size={16} />
                </div>
                <div className="min-w-0">
                  <h3 className="font-medium text-ink text-sm capitalize truncate">
                    {template.type.replace(/_/g, " ")}
                  </h3>
                  <p className="text-xs text-ink-soft truncate mt-0.5">{template.subject}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Template Editor */}
        <div className="lg:col-span-2">
          {editingTemplate ? (
            <form
              onSubmit={handleSaveTemplate}
              className="card-elevated rounded-3xl p-6 flex flex-col gap-5 bg-white shadow-soft"
            >
              <div className="flex items-center justify-between border-b border-basil-50 pb-4">
                <h2 className="font-display text-lg font-semibold text-ink capitalize">
                  Edit {editingTemplate.type.replace(/_/g, " ")}
                </h2>
                <button
                  type="button"
                  onClick={() => setEditingTemplate(null)}
                  className="w-8 h-8 flex items-center justify-center text-ink-soft hover:text-ink hover:bg-basil-50 rounded-full transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {error && (
                <div className="p-3 bg-tomato-50 text-tomato-600 rounded-xl text-sm flex items-center gap-2">
                  <AlertCircle size={16} /> {error}
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-ink">Subject Line</label>
                <input
                  type="text"
                  required
                  value={editingTemplate.subject}
                  onChange={(e) =>
                    setEditingTemplate({ ...editingTemplate, subject: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-basil-100 focus:border-basil-500 outline-none text-sm transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-ink flex items-center justify-between">
                  <span>Email Body (HTML)</span>
                </label>
                <textarea
                  required
                  rows={12}
                  value={editingTemplate.bodyHtml}
                  onChange={(e) =>
                    setEditingTemplate({ ...editingTemplate, bodyHtml: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-basil-100 focus:border-basil-500 outline-none text-xs transition-colors font-mono"
                  style={{ whiteSpace: "pre" }}
                />

                <div className="mt-2 p-3 bg-basil-50/50 border border-basil-100 rounded-xl">
                  <p className="text-xs font-medium text-ink-soft mb-2">Available Placeholders:</p>
                  <div className="flex flex-wrap gap-2">
                    {placeholders[editingTemplate.type]?.map((p) => (
                      <span
                        key={p}
                        className="text-[11px] font-mono bg-white px-2 py-1 rounded text-basil-700 border border-basil-200"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingTemplate(null)}
                  className="px-5 py-2.5 text-sm font-medium text-ink-soft hover:text-ink hover:bg-basil-50 rounded-full transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingTemplate}
                  className="px-6 py-2.5 text-sm font-medium bg-basil-600 text-white rounded-full hover:bg-basil-700 hover:shadow-glow transition-all flex items-center gap-2 disabled:opacity-70"
                >
                  {savingTemplate ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                  Save Template
                </button>
              </div>
            </form>
          ) : (
            <div className="card-elevated rounded-3xl p-16 flex flex-col items-center justify-center text-center bg-white/50 border border-dashed border-basil-200 h-full">
              <div className="w-16 h-16 bg-basil-50 text-basil-300 rounded-full flex items-center justify-center mb-4">
                <Edit3 size={24} />
              </div>
              <h3 className="font-medium text-ink text-lg">Select a template</h3>
              <p className="text-sm text-ink-soft mt-1 max-w-xs">
                Choose an email template from the left to customize its subject line, design, and content.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { Loader2, Mail, Edit3, Check, X, AlertCircle } from "lucide-react";
import * as adminTemplateService from "../../services/adminTemplateService";

export default function AdminTemplates() {
  const [templates, setTemplates] = useState(null);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const load = () => adminTemplateService.getAllTemplates().then(setTemplates);

  useEffect(() => {
    load();
  }, []);

  const handleEdit = (template) => {
    setEditingTemplate({ ...template });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await adminTemplateService.updateTemplate(editingTemplate.type, {
        subject: editingTemplate.subject,
        bodyHtml: editingTemplate.bodyHtml
      });
      setEditingTemplate(null);
      await load();
    } catch (err) {
      setError("Failed to save template. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const placeholders = {
    otp: ["{{otp}}"],
    order_confirmation: ["{{orderId}}", "{{estimatedDelivery}}", "{{orderSummaryHTML}}", "{{total}}"],
    admin_new_order: ["{{orderId}}", "{{total}}", "{{deliveryMethod}}"],
    order_status: ["{{orderId}}", "{{status}}"]
  };

  if (!templates) {
    return (
      <div className="card-elevated rounded-3xl p-16 flex justify-center">
        <Loader2 className="animate-spin text-basil-600" size={24} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Email Templates</h1>
          <p className="text-sm text-ink-soft mt-1">Manage the content of automated system emails.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 flex flex-col gap-3">
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
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  editingTemplate?.id === template.id ? "bg-basil-600 text-white" : "bg-basil-50 text-basil-600"
                }`}>
                  <Mail size={16} />
                </div>
                <div>
                  <h3 className="font-medium text-ink text-sm capitalize">
                    {template.type.replace(/_/g, ' ')}
                  </h3>
                  <p className="text-xs text-ink-soft truncate mt-0.5">{template.subject}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="lg:col-span-2">
          {editingTemplate ? (
            <form onSubmit={handleSave} className="card-elevated rounded-3xl p-6 flex flex-col gap-5 bg-white">
              <div className="flex items-center justify-between border-b border-basil-50 pb-4">
                <h2 className="font-display text-lg font-semibold text-ink capitalize">
                  Edit {editingTemplate.type.replace(/_/g, ' ')}
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
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, subject: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-basil-100 focus:border-basil-500 outline-none text-sm transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-ink flex items-center justify-between">
                  <span>Email Body (HTML)</span>
                </label>
                <textarea
                  required
                  rows={14}
                  value={editingTemplate.bodyHtml}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, bodyHtml: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-basil-100 focus:border-basil-500 outline-none text-sm transition-colors font-mono"
                  style={{ whiteSpace: "pre" }}
                />
                
                <div className="mt-2 p-3 bg-basil-50/50 border border-basil-100 rounded-xl">
                  <p className="text-xs font-medium text-ink-soft mb-2">Available Variables:</p>
                  <div className="flex flex-wrap gap-2">
                    {placeholders[editingTemplate.type]?.map(p => (
                      <span key={p} className="text-[11px] font-mono bg-white px-2 py-1 rounded text-basil-700 border border-basil-200">
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
                  disabled={saving}
                  className="px-6 py-2.5 text-sm font-medium bg-basil-600 text-white rounded-full hover:bg-basil-700 hover:shadow-glow transition-all flex items-center gap-2 disabled:opacity-70"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                  Save Changes
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
                Choose an email template from the sidebar to view and edit its content.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

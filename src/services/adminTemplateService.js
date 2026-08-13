import { apiGet, apiPatch } from './apiClient';

export async function getAllTemplates() {
  try {
    const res = await apiGet('/api/admin/templates');
    return res;
  } catch (err) {
    console.error('[adminTemplateService] Get templates failed:', err.message);
    throw err;
  }
}

export async function updateTemplate(type, data) {
  try {
    const res = await apiPatch(`/api/admin/templates/${type}`, data);
    return res;
  } catch (err) {
    console.error('[adminTemplateService] Update template failed:', err.message);
    throw err;
  }
}

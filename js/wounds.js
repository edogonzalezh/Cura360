/**
 * wounds.js — Wound CRUD operations
 * ─────────────────────────────────────
 * Wounds are always associated with a patient (patient_id FK).
 * RLS ensures that only the owning professional (or the patient
 * themselves for reads) can access wound records.
 *
 * Public API (window.CURA360.wounds):
 *   create(patientId, data) → Promise<Wound>
 *   listByPatient(patientId)→ Promise<Wound[]>
 *   getById(woundId)        → Promise<Wound>
 */

(function () {
  'use strict';

  const sb = window.CURA360.supabase;

  // ── Create wound ─────────────────────────────────
  /**
   * @param {string} patientId   - FK to patients.id
   * @param {{ type: string, location: string, dimensions: string, status: string }} data
   * @returns {Promise<object|null>}
   */
  async function create(patientId, data) {
    const payload = {
      patient_id: patientId,
      type:       data.type || '',
      location:   data.location || '',
      dimensions: data.dimensions || '',
      status:     data.status || 'active'
    };

    const { data: row, error } = await sb
      .from('wounds')
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error('[wounds] create error:', error);
      window.CURA360.showToast('Error al registrar herida.');
      return null;
    }

    window.CURA360.showToast('Herida registrada exitosamente.', 'success');
    return row;
  }

  // ── List wounds for a patient ────────────────────
  /**
   * @param {string} patientId
   * @returns {Promise<object[]>}
   */
  async function listByPatient(patientId) {
    const { data, error } = await sb
      .from('wounds')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[wounds] listByPatient error:', error);
      return [];
    }

    return data || [];
  }

  // ── Get single wound ─────────────────────────────
  /**
   * @param {string} woundId
   * @returns {Promise<object|null>}
   */
  async function getById(woundId) {
    const { data, error } = await sb
      .from('wounds')
      .select('*')
      .eq('id', woundId)
      .single();

    if (error) {
      console.error('[wounds] getById error:', error);
      return null;
    }

    return data;
  }

  // ── Expose ─────────────────────────────────────────
  window.CURA360.wounds = { create, listByPatient, getById };

})();

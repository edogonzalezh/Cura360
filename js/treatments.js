/**
 * treatments.js — Treatment / Curación CRUD
 * ───────────────────────────────────────────
 * Treatments (curaciones) belong to a wound (wound_id FK).
 * RLS on the `wounds` and `patients` tables cascades access:
 * only the professional who owns the patient can insert/read.
 *
 * Public API (window.CURA360.treatments):
 *   create(woundId, data)     → Promise<Treatment>
 *   listByWound(woundId)      → Promise<Treatment[]>  (chronological)
 */

(function () {
  'use strict';

  const sb = window.CURA360.supabase;

  // ── Create treatment ─────────────────────────────
  /**
   * @param {string} woundId
   * @param {{ technique: string, supplies: string, notes: string }} data
   * @returns {Promise<object|null>}
   */
  async function create(woundId, data) {
    const payload = {
      wound_id:  woundId,
      technique: data.technique || '',
      supplies:  data.supplies  || '',
      notes:     data.notes     || '',
      created_at: new Date().toISOString()  // explicit timestamp
    };

    const { data: row, error } = await sb
      .from('treatments')
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error('[treatments] create error:', error);
      window.CURA360.showToast('Error al registrar curación.');
      return null;
    }

    window.CURA360.showToast('Curación registrada exitosamente.', 'success');
    return row;
  }

  // ── List treatments for a wound ──────────────────
  /**
   * Returns all treatments for a given wound, newest first.
   * @param {string} woundId
   * @returns {Promise<object[]>}
   */
  async function listByWound(woundId) {
    const { data, error } = await sb
      .from('treatments')
      .select('*')
      .eq('wound_id', woundId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[treatments] listByWound error:', error);
      return [];
    }

    return data || [];
  }

  // ── Expose ─────────────────────────────────────────
  window.CURA360.treatments = { create, listByWound };

})();

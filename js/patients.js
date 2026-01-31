/**
 * patients.js — Patient CRUD operations
 * ─────────────────────────────────────────
 * All queries go through Supabase's auto-generated REST API.
 * RLS policies on the server enforce that professionals only
 * see their own patients; patients only see themselves.
 *
 * Public API (window.CURA360.patients):
 *   create(data)       → Promise<Patient>
 *   list()             → Promise<Patient[]>   (current professional's patients)
 *   getById(id)        → Promise<Patient>
 */

(function () {
  'use strict';

  const sb = window.CURA360.supabase;

  // ── Create patient ───────────────────────────────
  /**
   * Inserts a new patient record.
   * `professional_id` is set server-side to the authenticated user's ID
   * (enforced by RLS default), but we also pass it explicitly for clarity.
   *
   * @param {{ name: string, age: number, diagnosis: string, comorbidities: string }} data
   * @returns {Promise<object|null>} the inserted row, or null on error
   */
  async function create(data) {
    const user = window.CURA360.auth.getCurrentUser();
    if (!user) return null;

    const payload = {
      name:            data.name,
      age:             parseInt(data.age, 10),
      diagnosis:       data.diagnosis || '',
      comorbidities:   data.comorbidities || '',
      professional_id: user.id
    };

    const { data: row, error } = await sb
      .from('patients')
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error('[patients] create error:', error);
      window.CURA360.showToast('Error al crear paciente.');
      return null;
    }

    window.CURA360.showToast('Paciente creado exitosamente.', 'success');
    return row;
  }

  // ── List patients ────────────────────────────────
  /**
   * Returns all patients visible to the current user.
   * RLS handles scoping automatically.
   * Ordered by most recent first.
   *
   * @returns {Promise<object[]>}
   */
  async function list() {
    const { data, error } = await sb
      .from('patients')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[patients] list error:', error);
      window.CURA360.showToast('Error al cargar pacientes.');
      return [];
    }

    return data || [];
  }

  // ── Get single patient ───────────────────────────
  /**
   * Fetches a single patient by ID.
   * RLS ensures the current user has access.
   *
   * @param {string} id - patient UUID
   * @returns {Promise<object|null>}
   */
  async function getById(id) {
    const { data, error } = await sb
      .from('patients')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('[patients] getById error:', error);
      return null;
    }

    return data;
  }

  // ── Expose ─────────────────────────────────────────
  window.CURA360.patients = { create, list, getById };

})();

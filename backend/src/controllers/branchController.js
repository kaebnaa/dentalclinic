import { supabase, supabaseAdmin } from '../config/supabase.js';
import { AuditService } from '../services/auditService.js';

/**
 * Get all branches
 */
export const getBranches = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('branches')
      .select('*')
      .order('name');

    if (error) {
      throw new Error(`Failed to fetch branches: ${error.message}`);
    }

    res.json(data);
  } catch (error) {
    next(error);
  }
};

/**
 * Get branch by ID
 */
export const getBranchById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('branches')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return res.status(404).json({
        error: 'Branch not found',
        message: error.message
      });
    }

    res.json(data);
  } catch (error) {
    next(error);
  }
};

/**
 * Create branch (Admin only)
 */
export const createBranch = async (req, res, next) => {
  try {
    const { name, address, latitude, longitude } = req.body;

    // Use supabaseAdmin to bypass RLS for admin operations
    const { data, error } = await supabaseAdmin
      .from('branches')
      .insert({
        name,
        address,
        latitude,
        longitude
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create branch: ${error.message}`);
    }

    // Log audit
    await AuditService.logCreate(req.user.id, 'branches', data);

    res.status(201).json({
      message: 'Branch created successfully',
      branch: data
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update branch (Admin only)
 */
export const updateBranch = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Get current branch (use supabaseAdmin to bypass RLS)
    const { data: current, error: fetchError } = await supabaseAdmin
      .from('branches')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !current) {
      return res.status(404).json({
        error: 'Branch not found'
      });
    }

    // Update branch (use supabaseAdmin to bypass RLS)
    const { data, error } = await supabaseAdmin
      .from('branches')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update branch: ${error.message}`);
    }

    // Log audit
    await AuditService.logUpdate(req.user.id, 'branches', current, data);

    res.json({
      message: 'Branch updated successfully',
      branch: data
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete branch (Admin only)
 */
export const deleteBranch = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Get current branch (use supabaseAdmin to bypass RLS)
    const { data: current, error: fetchError } = await supabaseAdmin
      .from('branches')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !current) {
      return res.status(404).json({
        error: 'Branch not found'
      });
    }

    // Delete branch (use supabaseAdmin to bypass RLS)
    const { error } = await supabaseAdmin
      .from('branches')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete branch: ${error.message}`);
    }

    // Log audit
    await AuditService.logDelete(req.user.id, 'branches', current);

    res.json({
      message: 'Branch deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};


import prisma from '../config/prisma.js';
import AppError from '../utils/AppError.js';
import {
  PROGRAMMES,
  PROGRAMME_BATCHES,
  PROGRAMME_BRANCHES,
  PROGRAMME_SEMESTERS,
  ALL_SEMESTERS_LABEL
} from '../config/constants.js';

/**
 * Get Supported Academic Programmes
 * Public endpoint consumed by student portal programme-selection gate.
 */
export const getProgrammes = (req, res) => {
  res.status(200).json({
    success: true,
    programmes: PROGRAMMES
  });
};

/**
 * Get Dynamic Filter Options for a Selected Programme
 * Retrieves active batches from database and constants, alongside configured branches and semesters.
 */
export const getFilterOptions = async (req, res, next) => {
  try {
    const { programme } = req.query;

    if (!programme || typeof programme !== 'string' || !PROGRAMMES.includes(programme.trim())) {
      return next(
        new AppError(
          `Programme parameter is required and must be one of: ${PROGRAMMES.join(', ')}.`,
          400
        )
      );
    }

    const cleanProgramme = programme.trim();

    // 1. Fetch distinct batches currently existing in the database for this programme
    const distinctBatchRecords = await prisma.courseOffering.findMany({
      where: { programme: cleanProgramme },
      select: { batch: true },
      distinct: ['batch'],
      orderBy: { batch: 'desc' }
    });

    const dbBatches = distinctBatchRecords.map((r) => r.batch);
    const configuredBatches = PROGRAMME_BATCHES[cleanProgramme] || [];

    // Merge configured batches with any distinct DB batches (sorted descending)
    const batchSet = new Set([...configuredBatches, ...dbBatches]);
    const batches = Array.from(batchSet).sort((a, b) => b.localeCompare(a));

    // 2. Retrieve established institutional branches for this programme
    const branches = PROGRAMME_BRANCHES[cleanProgramme] || [];

    // 3. Retrieve semesters and append the 'All Semesters' option
    const baseSemesters = PROGRAMME_SEMESTERS[cleanProgramme] || [];
    const semesters = [...baseSemesters, ALL_SEMESTERS_LABEL];

    res.status(200).json({
      success: true,
      programme: cleanProgramme,
      batches,
      branches,
      semesters
    });
  } catch (err) {
    next(err);
  }
};

export default {
  getProgrammes,
  getFilterOptions
};

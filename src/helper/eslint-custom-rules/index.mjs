import validatePriorityTag from './validatePriorityTag.mjs';
import preventDuplicateTitles from './preventDuplicateTitles.mjs';

export default {
  rules: {
    'validate-playwright-priority-tags': validatePriorityTag,
    'prevent-duplicate-titles': preventDuplicateTitles,
  },
};

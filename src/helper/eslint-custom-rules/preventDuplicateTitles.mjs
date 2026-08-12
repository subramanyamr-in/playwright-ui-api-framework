import { ESLintUtils } from '@typescript-eslint/utils';
import fs from 'fs';
import path from 'path';

const createRule = ESLintUtils.RuleCreator(() => '');
const TITLES_CACHE_FILE = path.join(process.cwd(), 'output', '.eslint-titles-cache.json');

function readTitlesCache() {
  try {
    if (fs.existsSync(TITLES_CACHE_FILE)) {
      const data = fs.readFileSync(TITLES_CACHE_FILE, 'utf8');
      return new Map(JSON.parse(data));
    }
  } catch {
    // Cache file doesn't exist or is corrupted
  }
  return new Map();
}

function writeTitlesCache(titlesMap) {
  try {
    fs.mkdirSync(path.dirname(TITLES_CACHE_FILE), { recursive: true });
    fs.writeFileSync(TITLES_CACHE_FILE, JSON.stringify([...titlesMap]), 'utf8');
  } catch {
    // Could not write cache
  }
}

function isTestFunction(node) {
  if (node.callee.type === 'Identifier') return node.callee.name === 'test';
  if (node.callee.type === 'MemberExpression') {
    const object = node.callee.object;
    const property = node.callee.property;
    if (
      object?.type === 'Identifier' &&
      object.name === 'test' &&
      property?.type === 'Identifier'
    ) {
      return ['only', 'skip', 'fixme', 'fail'].includes(property.name);
    }
  }
  return false;
}

function isDescribeFunction(node) {
  if (node.callee.type === 'MemberExpression') {
    const object = node.callee.object;
    const property = node.callee.property;
    if (
      object?.type === 'Identifier' &&
      object.name === 'test' &&
      property?.type === 'Identifier'
    ) {
      return ['describe'].includes(property.name);
    }
  }
  return false;
}

export default createRule({
  name: 'prevent-duplicate-titles',
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow duplicate test titles across files',
      recommended: true,
    },
    messages: {
      duplicateTitle: "Title '{{title}}' is duplicated. First occurrence in '{{file}}'.",
      duplicateTitleInFile: "Title '{{title}}' is already used in this file at line {{line}}.",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const globalTitlesMap = readTitlesCache();
    const currentFileTitles = new Map();
    const currentFileName = context.filename || context.getFilename?.();

    return {
      'Program:exit'() {
        const allTitles = new Map(globalTitlesMap);
        for (const [titleKey, info] of currentFileTitles) {
          if (!allTitles.has(titleKey)) {
            allTitles.set(titleKey, info);
          }
        }
        writeTitlesCache(allTitles);
      },

      CallExpression(node) {
        if (!isTestFunction(node) && !isDescribeFunction(node)) return;

        const arg = node.arguments[0];
        let title = null;

        if (arg?.type === 'Literal' && typeof arg.value === 'string') {
          title = arg.value;
        } else if (arg?.type === 'TemplateLiteral') {
          title = arg.quasis.map((q) => q.value.cooked).join('');
        }

        if (!title) return;

        const titleKey = title.toUpperCase();

        if (currentFileTitles.has(titleKey)) {
          context.report({
            node,
            messageId: 'duplicateTitleInFile',
            data: {
              title,
              line: currentFileTitles.get(titleKey).line,
            },
          });
          return;
        }

        const existing = globalTitlesMap.get(titleKey);
        if (existing && existing.filePath !== currentFileName) {
          context.report({
            node,
            messageId: 'duplicateTitle',
            data: {
              title,
              file: existing.filePath,
            },
          });
          return;
        }

        currentFileTitles.set(titleKey, {
          filePath: currentFileName,
          line: node.loc.start.line,
        });
      },
    };
  },
});

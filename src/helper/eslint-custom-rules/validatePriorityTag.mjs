const PRIORITY_TAGS = new Set(['@P1', '@P2', '@P3', '@P4']);
const RUN_FIRST_TAG = '@runFirst';
const RUN_LAST_TAG = '@runLast';

function getPropertyName(property) {
  if (property?.type !== 'Property') return null;

  const { key } = property;
  if (key.type === 'Identifier') return key.name;
  if (key.type === 'Literal' && typeof key.value === 'string') return key.value;

  return null;
}

function getStaticStringValue(node) {
  if (!node) return null;
  if (node.type === 'Literal' && typeof node.value === 'string') return node.value;
  if (node.type === 'TemplateLiteral' && node.expressions.length === 0) {
    return node.quasis[0]?.value?.cooked ?? null;
  }
  return null;
}

function getTags(configNode) {
  if (configNode?.type !== 'ObjectExpression') return [];

  const tagProperty = configNode.properties.find((prop) => getPropertyName(prop) === 'tag');
  if (tagProperty?.value?.type !== 'ArrayExpression') return [];

  return tagProperty.value.elements
    .map(getStaticStringValue)
    .filter((value) => typeof value === 'string');
}

function isPlaywrightTestCall(callee) {
  if (callee.type === 'Identifier') return callee.name === 'test';
  if (callee.type === 'MemberExpression') return isPlaywrightTestCall(callee.object);
  return false;
}

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Validate Playwright test priority tags',
    },
    schema: [],
  },

  create(context) {
    return {
      CallExpression(node) {
        if (!isPlaywrightTestCall(node.callee)) return;

        const configNode = node.arguments.find((arg) => arg.type === 'ObjectExpression');
        if (!configNode) return;

        const tags = getTags(configNode);
        if (tags.length === 0) return;

        const priorityTags = tags.filter((tag) => PRIORITY_TAGS.has(tag));
        const hasRunFirst = tags.includes(RUN_FIRST_TAG);
        const hasRunLast = tags.includes(RUN_LAST_TAG);

        if (priorityTags.length > 1) {
          context.report({
            node: configNode,
            message: `Only one priority tag allowed. Found: ${priorityTags.join(', ')}.`,
          });
        }

        if (hasRunFirst && hasRunLast) {
          context.report({
            node: configNode,
            message: `Cannot use both ${RUN_FIRST_TAG} and ${RUN_LAST_TAG}.`,
          });
        }
      },
    };
  },
};

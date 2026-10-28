import type {
  AlgorithmDefinition,
  Step,
  PseudocodeLine,
  ComplexityMetric,
} from '../../types/algorithm';
import type { StackQueueSnapshot } from '../../types/stack-queue';

export interface ParenthesesInput {
  text: string;
}

const parenthesesPseudocode: PseudocodeLine[] = [
  { line: 1, code: 'function isBalanced(str):', explanation: 'Check if opening and closing brackets match and nest properly' },
  { line: 2, code: '  stack = new Stack()', explanation: 'Initialize stack to store open brackets' },
  { line: 3, code: '  for char in str:', explanation: 'Scan each character in sequence' },
  { line: 4, code: '    if char in "([{": stack.push(char)', explanation: 'Push opening bracket onto stack' },
  { line: 5, code: '    else if char in ")]}":', explanation: 'Encountered closing bracket' },
  { line: 6, code: '      if stack.isEmpty(): return false // Extra closer', explanation: 'No matching open bracket exists' },
  { line: 7, code: '      top = stack.pop()', explanation: 'Retrieve most recent open bracket' },
  { line: 8, code: '      if not matches(top, char): return false // Mismatched type', explanation: 'Check if bracket types match (e.g. "(" with ")")' },
  { line: 9, code: '  return stack.isEmpty() // true if no leftover openers', explanation: 'If stack is empty, string is balanced' },
];

const parenthesesComplexity: ComplexityMetric = {
  best: 'O(1)',
  average: 'O(N)',
  worst: 'O(N)',
  plainEnglish: 'Single pass O(N) through string of length N. Stack holds at most N elements.',
  space: 'O(N)',
};

const matchingBracket: Record<string, string> = {
  ')': '(',
  ']': '[',
  '}': '{',
};

export function generateBalancedParenthesesSteps(
  input: ParenthesesInput
): Step<StackQueueSnapshot, Record<string, unknown>>[] {
  const { text } = input;
  const chars = text.split('');
  const steps: Step<StackQueueSnapshot, Record<string, unknown>>[] = [];

  const stack: string[] = [];
  const capacity = Math.max(10, text.length + 2);

  let comparisons = 0;
  let iterations = 0;
  let accesses = 0;

  // Initial step
  steps.push({
    id: steps.length,
    type: 'start',
    description: text.length === 0
      ? 'Evaluating empty string. An empty string has 0 unclosed brackets and is trivially balanced.'
      : `Starting Balanced Parentheses check on "${text}". Scanning left to right using a bracket stack.`,
    explanationDetail: 'Opening brackets are pushed to wait for their matching partner. When a closing bracket appears, it must match the most recently opened bracket on the top of the stack.',
    codeLine: 1,
    state: {
      mode: 'parentheses',
      items: [],
      capacity,
      count: 0,
      charIndex: 0,
      charStream: chars,
      isOverflow: false,
      isUnderflow: false,
      isMatchFailure: false,
      statusMessage: 'Ready to evaluate',
    },
    auxiliaryState: {},
    counters: { comparisons, swaps: 0, iterations, accesses },
  });

  if (text.length === 0) {
    steps.push({
      id: steps.length,
      type: 'complete',
      description: 'Result: String is BALANCED! (Empty string contains no mismatched brackets).',
      explanationDetail: 'All opening brackets are matched and closed.',
      codeLine: 9,
      state: {
        mode: 'parentheses',
        items: [],
        capacity,
        count: 0,
        charIndex: 0,
        charStream: chars,
        isOverflow: false,
        isUnderflow: false,
        isMatchFailure: false,
        statusMessage: 'Balanced (Empty String)',
      },
      auxiliaryState: {},
      counters: { comparisons, swaps: 0, iterations, accesses },
    });
    return steps;
  }

  let isFailure = false;
  let failureReason = '';

  for (let idx = 0; idx < chars.length; idx++) {
    iterations++;
    accesses++;
    const char = chars[idx];

    if (char === '(' || char === '[' || char === '{') {
      stack.push(char);

      steps.push({
        id: steps.length,
        type: 'push',
        description: `Position ${idx}: Encountered opener '${char}'. Pushing to stack. Expecting matching '${
          char === '(' ? ')' : char === '[' ? ']' : '}'
        }'.`,
        explanationDetail: `Open brackets wait on the stack until closed in LIFO order. Stack depth: ${stack.length}.`,
        codeLine: 4,
        state: {
          mode: 'parentheses',
          items: [...stack],
          capacity,
          count: stack.length,
          charIndex: idx,
          charStream: chars,
          lastActionVal: char,
          peekValue: char,
          isOverflow: false,
          isUnderflow: false,
          isMatchFailure: false,
          statusMessage: `Pushed '${char}'`,
        },
        auxiliaryState: {},
        counters: { comparisons, swaps: 0, iterations, accesses },
      });
    } else if (char === ')' || char === ']' || char === '}') {
      comparisons++;

      if (stack.length === 0) {
        // Extra closer failure!
        isFailure = true;
        failureReason = `Unmatched closing bracket '${char}' at index ${idx} with no corresponding opener!`;

        steps.push({
          id: steps.length,
          type: 'not-found',
          description: `❌ Syntax Error at index ${idx}: Found closer '${char}', but the bracket stack is empty! (Extra Closer).`,
          explanationDetail: 'Every closing bracket must have a preceding open bracket. Since the stack is empty, this bracket was never opened.',
          codeLine: 6,
          state: {
            mode: 'parentheses',
            items: [],
            capacity,
            count: 0,
            charIndex: idx,
            charStream: chars,
            lastActionVal: char,
            isOverflow: false,
            isUnderflow: true,
            isMatchFailure: true,
            statusMessage: 'Error: Extra closing bracket!',
          },
          auxiliaryState: {},
          counters: { comparisons, swaps: 0, iterations, accesses },
        });
        break;
      }

      const topOpener = stack[stack.length - 1];
      const expectedOpener = matchingBracket[char];
      comparisons++;

      if (topOpener !== expectedOpener) {
        // Mismatched type failure! (e.g. '(' vs ']')
        isFailure = true;
        failureReason = `Mismatched bracket types at index ${idx}: expected closer for '${topOpener}', but received '${char}'!`;

        steps.push({
          id: steps.length,
          type: 'not-found',
          description: `❌ Mismatch at index ${idx}: Found closer '${char}', but top of stack is '${topOpener}'! Expected '${
            topOpener === '(' ? ')' : topOpener === '[' ? ']' : '}'
          }'.`,
          explanationDetail: 'Brackets must nest properly. An inner bracket must be closed before the enclosing outer bracket.',
          codeLine: 8,
          state: {
            mode: 'parentheses',
            items: [...stack],
            capacity,
            count: stack.length,
            charIndex: idx,
            charStream: chars,
            lastActionVal: char,
            peekValue: topOpener,
            isOverflow: false,
            isUnderflow: false,
            isMatchFailure: true,
            statusMessage: `Mismatch: '${topOpener}' vs '${char}'`,
          },
          auxiliaryState: {},
          counters: { comparisons, swaps: 0, iterations, accesses },
        });
        break;
      }

      // Successful match! Pop stack
      const popped = stack.pop();

      steps.push({
        id: steps.length,
        type: 'pop',
        description: `Position ${idx}: Closer '${char}' matches top opener '${popped}'! Popped from stack.`,
        explanationDetail: `Valid bracket pair '${popped}...${char}' resolved successfully.`,
        codeLine: 7,
        state: {
          mode: 'parentheses',
          items: [...stack],
          capacity,
          count: stack.length,
          charIndex: idx,
          charStream: chars,
          lastActionVal: char,
          peekValue: stack.length > 0 ? stack[stack.length - 1] : null,
          isOverflow: false,
          isUnderflow: false,
          isMatchFailure: false,
          statusMessage: `Matched '${popped}' with '${char}'`,
        },
        auxiliaryState: {},
        counters: { comparisons, swaps: 0, iterations, accesses },
      });
    }
  }

  // Check end of stream
  if (!isFailure) {
    if (stack.length > 0) {
      // Extra openers left over!
      isFailure = true;
      failureReason = `Reached end of expression with ${stack.length} unclosed opener(s): ${stack.join(', ')}`;

      steps.push({
        id: steps.length,
        type: 'not-found',
        description: `❌ Incomplete Expression: Reached end of string, but ${stack.length} bracket(s) remained unclosed on stack: [${stack.join(', ')}].`,
        explanationDetail: 'A balanced expression must close all opened brackets before the end of the string.',
        codeLine: 9,
        state: {
          mode: 'parentheses',
          items: [...stack],
          capacity,
          count: stack.length,
          charIndex: chars.length,
          charStream: chars,
          isOverflow: false,
          isUnderflow: false,
          isMatchFailure: true,
          statusMessage: `Unclosed openers: ${stack.join(', ')}`,
        },
        auxiliaryState: {},
        counters: { comparisons, swaps: 0, iterations, accesses },
      });
    }
  }

  // Final summary step
  steps.push({
    id: steps.length,
    type: 'complete',
    description: !isFailure
      ? `✅ SUCCESS: Expression "${text}" is BALANCED! All opening brackets have matching closing pairs.`
      : `❌ FAILED: Expression "${text}" is UNBALANCED. ${failureReason}`,
    explanationDetail: !isFailure
      ? 'The stack is empty, confirming zero unmatched brackets and correct nesting.'
      : 'At least one bracket violated pairing or nesting rules.',
    codeLine: 9,
    state: {
      mode: 'parentheses',
      items: [...stack],
      capacity,
      count: stack.length,
      charIndex: chars.length,
      charStream: chars,
      isOverflow: false,
      isUnderflow: false,
      isMatchFailure: isFailure,
      statusMessage: !isFailure ? 'Expression is BALANCED!' : 'Expression is UNBALANCED!',
    },
    auxiliaryState: {},
    counters: { comparisons, swaps: 0, iterations, accesses },
  });

  return steps;
}

export const balancedParenthesesAlgorithm: AlgorithmDefinition<
  ParenthesesInput,
  StackQueueSnapshot,
  Record<string, unknown>
> = {
  id: 'balanced-parentheses',
  name: 'Balanced Parentheses',
  category: 'stack-queue',
  description: 'Validates that every opening bracket has a corresponding closing bracket in proper nesting order.',
  realWorldAnalogy: 'Compiler syntax validation in code editors: ensuring every { is closed before the file ends.',
  complexity: parenthesesComplexity,
  pseudocode: parenthesesPseudocode,
  generateSteps: generateBalancedParenthesesSteps,
  defaultInput: {
    text: '{[()]}',
  },
  sampleInputs: [
    { label: 'Valid Nested ({[()]})', input: { text: '{[()]}' } },
    { label: 'Valid Complex (()[{}])', input: { text: '()[{}]' } },
    { label: 'Mismatched Types ((])', input: { text: '(]' } },
    { label: 'Extra Opener (((()))', input: { text: '((())' } },
    { label: 'Extra Closer (()))', input: { text: '())' } },
    { label: 'Empty String ("")', input: { text: '' } },
  ],
};

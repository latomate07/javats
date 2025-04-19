import { BaseRule } from './base-rule.js';
import { NoProceduralCodeRule } from './no-procedural-code.js';
import { MainModifierRule } from './main-modifier-rule.js';
import { RequireModifiersRule } from './require-modifiers-rule.js';
import { ExplicitTypingRule } from './explicit-typing-rule.js';
import { RequireTypeRule } from './require-type.js';
import { ProjectMainMethodRule } from './project-main-method.js';

export {
  BaseRule,
  NoProceduralCodeRule,
  RequireTypeRule,
  ProjectMainMethodRule,
  MainModifierRule,
  RequireModifiersRule,
  ExplicitTypingRule
};

export function createDefaultRules(): BaseRule[] {
  return [
    new NoProceduralCodeRule(),
    new MainModifierRule(),
    new RequireModifiersRule(),
    new ExplicitTypingRule()
  ];
}
import { BaseRule } from './base-rule.js';
import { NoProceduralCodeRule } from './no-procedural-code.js';
import { RequireClassRule } from './require-class.js';
import { MainMethodRule } from './main-method-rule.js';
import { MainModifierRule } from './main-modifier-rule.js';
import { RequireModifiersRule } from './require-modifiers-rule.js';
import { ExplicitTypingRule } from './explicit-typing-rule.js';

export {
  BaseRule,
  NoProceduralCodeRule,
  RequireClassRule,
  MainMethodRule,
  MainModifierRule,
  RequireModifiersRule,
  ExplicitTypingRule
};

export function createDefaultRules(): BaseRule[] {
  return [
    new NoProceduralCodeRule(),
    new RequireClassRule(),
    new MainMethodRule(),
    new MainModifierRule(),
    new RequireModifiersRule(),
    new ExplicitTypingRule()
  ];
}
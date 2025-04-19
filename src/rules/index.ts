import { BaseRule } from './base-rule';
import { NoProceduralCodeRule } from './no-procedural-code';
import { RequireClassRule } from './require-class';
import { MainMethodRule } from './main-method-rule';
import { MainModifierRule } from './main-modifier-rule';
import { RequireModifiersRule } from './require-modifiers-rule';
import { ExplicitTypingRule } from './explicit-typing-rule';

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
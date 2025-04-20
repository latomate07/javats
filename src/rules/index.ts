import { BaseRule } from './base-rule.js';
import { NoProceduralCodeRule } from './no-procedural-code.js';
import { MainModifierRule } from './main-modifier-rule.js';
import { RequireModifiersRule } from './require-modifiers-rule.js';
import { ExplicitTypingRule } from './explicit-typing-rule.js';
import { RequireTypeRule } from './require-type.js';
import { InterfaceImplementationRule } from './interface-implementation-rule.js';
import { ProjectMainMethodRule } from './project-main-method.js';
import { SinglePublicClassRule } from './single-public-class-rule.js';
import { NamingConventionRule } from './naming-convention-rule.js';

export {
  BaseRule,
  NoProceduralCodeRule,
  RequireTypeRule,
  InterfaceImplementationRule,
  ProjectMainMethodRule,
  SinglePublicClassRule,
  NamingConventionRule,
  MainModifierRule,
  RequireModifiersRule,
  ExplicitTypingRule
};

export function createDefaultRules(): BaseRule[] {
  return [
    new NoProceduralCodeRule(),
    new MainModifierRule(),
    new RequireTypeRule(),
    new InterfaceImplementationRule(),
    new SinglePublicClassRule(),
    new NamingConventionRule(),
    new RequireModifiersRule(),
    new ExplicitTypingRule()
  ];
}
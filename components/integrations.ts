import React from 'react';
import type { IntegrationType } from '../types';
import { 
    ConvexIcon, FirecrawlIcon, VapiIcon, BetterAuthIcon, ResendIcon, AutumnPricingIcon, 
    OpenAIIcon, ScorecardIcon, StripeIcon 
} from './icons';

export interface Integration {
  id: IntegrationType;
  name: string;
  description: string;
  docsUrl: string;
  icon: React.FC<{ className?: string }>;
}

export const INTEGRATIONS: Integration[] = [
  {
    id: 'convex',
    name: 'Convex',
    description: 'A backend platform providing a realtime database, cloud functions, scheduling, and TypeScript-first developer ergonomics for building full-stack apps.',
    docsUrl: 'https://convex.dev',
    icon: ConvexIcon,
  },
  {
    id: 'firecrawl',
    name: 'Firecrawl',
    description: 'A web-data API that crawls and scrapes websites to produce LLM-ready, structured outputs (markdown/JSON) for AI apps.',
    docsUrl: 'https://firecrawl.dev/',
    icon: FirecrawlIcon,
  },
  {
    id: 'vapi',
    name: 'Vapi',
    description: 'A voice-AI platform and API for building phone-based voice agents and automations that handle inbound/outbound calls at scale.',
    docsUrl: 'https://vapi.ai/',
    icon: VapiIcon,
  },
  {
    id: 'better_auth',
    name: 'Better Auth',
    description: 'A framework-agnostic authentication/authorization library and hosted tooling for easy email/social sign-in, 2FA, and user management (TypeScript-friendly).',
    docsUrl: 'https://www.betterauth.dev/',
    icon: BetterAuthIcon,
  },
  {
    id: 'resend',
    name: 'Resend',
    description: 'An email API built for developers to send, test, and track transactional and template emails with simple SDKs and dashboard.',
    docsUrl: 'https://resend.com/docs',
    icon: ResendIcon,
  },
  {
    id: 'autumnpricing',
    name: 'Autumn Pricing',
    description: 'A Stripe-first billing/pricing layer (open-source + SaaS) that makes usage-based, subscription, and complex pricing models easy to implement for apps.',
    docsUrl: 'https://useautumn.com/',
    icon: AutumnPricingIcon,
  },
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'AI research and product company providing large language, vision, and multimodal models (ChatGPT, GPT family, APIs) and developer tools.',
    docsUrl: 'https://platform.openai.com/docs',
    icon: OpenAIIcon,
  },
];
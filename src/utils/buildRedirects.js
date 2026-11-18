// ============================================================================
// Build-time redirect generation and validation — used by prerender.js
// ----------------------------------------------------------------------------
// Generates Cloudflare Pages _redirects rules from product/collection slug
// history, merges them with manually maintained legacy rules, and validates
// the final rule set for duplicates, conflicts and loops.
// ============================================================================

import { flattenSlugRedirects } from './slugHistory.js'
import fs from 'node:fs'
import path from 'node:path'

const BASE_REDIRECTS_PATH = 'public/_redirects'

export function generateProductRedirects(products = []) {
  const rules = []
  for (const p of products) {
    if (!p?.slug) continue
    for (const { from, to } of flattenSlugRedirects(p.slug, p.slugHistory)) {
      rules.push({ source: `/cakes/${from}`, destination: `/cakes/${to}/`, code: 301 })
      rules.push({ source: `/cakes/${from}/`, destination: `/cakes/${to}/`, code: 301 })
    }
  }
  return rules
}

export function generateCollectionRedirects(collections = []) {
  const rules = []
  for (const c of collections) {
    if (!c?.slug) continue
    for (const { from, to } of flattenSlugRedirects(c.slug, c.slugHistory)) {
      rules.push({ source: `/collections/${from}`, destination: `/collections/${to}/`, code: 301 })
      rules.push({ source: `/collections/${from}/`, destination: `/collections/${to}/`, code: 301 })
    }
  }
  return rules
}

function parseManualRedirects(content) {
  const rules = []
  for (const raw of content.split('\n')) {
    const line = raw.split('#')[0].trim()
    if (!line) continue
    const parts = line.split(/\s+/)
    if (parts.length < 3) continue
    const [source, destination, codeStr, ...rest] = parts
    const code = Number(codeStr)
    if (!source || !destination || !Number.isFinite(code)) continue
    // Skip the SPA fallback here; it is always appended once at the end.
    if (source === '/*' && code === 200) continue
    rules.push({ source, destination, code, conditions: rest.join(' ') })
  }
  return rules
}

function serializeRule(rule) {
  const conditions = rule.conditions ? ` ${rule.conditions}` : ''
  return `${rule.source} ${rule.destination} ${rule.code}${conditions}`
}

function isPlainRedirect(rule) {
  // Cloudflare Pages supports 200 (rewrite), 301, 302, 303, 307, 308.
  return [301, 302, 303, 307, 308].includes(rule.code)
}

export function mergeAndValidateRedirects({ productRules = [], collectionRules = [], manualRules = [] }) {
  const generated = [...productRules, ...collectionRules]
  const all = [...manualRules, ...generated]

  const errors = []
  const sourceMap = new Map()
  const destinationSet = new Set()

  for (const rule of all) {
    if (!isPlainRedirect(rule)) {
      destinationSet.add(rule.source)
      continue
    }

    const existing = sourceMap.get(rule.source)
    if (existing) {
      errors.push(`Duplicate redirect source "${rule.source}" points to "${existing.destination}" and "${rule.destination}".`)
      continue
    }
    sourceMap.set(rule.source, rule)

    // Detect simple redirect loops: source == destination (trailing slashes ignored).
    const normSource = rule.source.replace(/\/+$/, '') || '/'
    const normDest = rule.destination.replace(/\/+$/, '') || '/'
    if (normSource === normDest) {
      errors.push(`Redirect loop detected: ${rule.source} -> ${rule.destination}.`)
    }
  }

  // Detect redirect chains where a destination is also a source.
  for (const rule of generated) {
    if (!isPlainRedirect(rule)) continue
    if (sourceMap.has(rule.destination)) {
      const next = sourceMap.get(rule.destination)
      errors.push(`Redirect chain detected: ${rule.source} -> ${rule.destination} -> ${next.destination}. Generated redirects should point directly to the final URL.`)
    }
  }

  return { rules: all, errors }
}

export async function buildRedirectsFile({ products, collections, distDir }) {
  const manualContent = fs.existsSync(BASE_REDIRECTS_PATH)
    ? fs.readFileSync(BASE_REDIRECTS_PATH, 'utf-8')
    : ''
  const manualRules = parseManualRedirects(manualContent)

  const productRules = generateProductRedirects(products)
  const collectionRules = generateCollectionRedirects(collections)

  const { rules, errors } = mergeAndValidateRedirects({
    productRules,
    collectionRules,
    manualRules,
  })

  if (errors.length) {
    throw new Error(`[build] Redirect validation failed:\n${errors.join('\n')}`)
  }

  const lines = [
    '# Auto-generated redirects (manual rules first; generated slug-history rules follow)',
    '# Manual/legacy rules',
    ...manualRules.map(serializeRule),
    '',
    '# Generated product slug-history redirects',
    ...productRules.map(serializeRule),
    '',
    '# Generated collection slug-history redirects',
    ...collectionRules.map(serializeRule),
    '',
    '# SPA fallback (must be last)',
    '/*    /index.html    200',
  ]

  const outPath = path.join(distDir, '_redirects')
  fs.writeFileSync(outPath, lines.join('\n') + '\n')
  return { path: outPath, productRules, collectionRules, manualRules }
}

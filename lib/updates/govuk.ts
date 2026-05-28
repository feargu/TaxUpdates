/**
 * Fetches UK tax updates from the gov.uk public search API.
 *
 * Source: https://www.gov.uk/api/search.json
 * Filters: HMRC + HM Treasury, excluding manual updates (too granular for a "news" feed).
 * No auth, no API key. Public, CORS-friendly.
 *
 * Content licensed under the Open Government Licence v3 — fine to link to and quote titles/descriptions.
 */

const GOV_UK_BASE = 'https://www.gov.uk';
const SEARCH_URL = `${GOV_UK_BASE}/api/search.json`;

// Manual updates are too frequent to be useful "news" — exclude them.
const EXCLUDED_FORMATS = new Set(['hmrc_manual_section', 'hmrc_manual']);

export type UKUpdateOrganisation = 'HMRC' | 'HM Treasury' | 'Other';

export interface UKUpdateItem {
  id: string;
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  organisation: UKUpdateOrganisation;
  contentType: string;
  rawFormat: string;
}

interface GovUKSearchResult {
  title: string;
  description?: string;
  link: string;
  public_timestamp: string;
  format: string;
  display_type?: string;
  content_id: string;
  organisations?: Array<{ slug?: string; title?: string }>;
}

interface GovUKSearchResponse {
  results: GovUKSearchResult[];
  total: number;
}

function orgFromSlugs(slugs: string[]): UKUpdateOrganisation {
  if (slugs.includes('hm-revenue-customs')) return 'HMRC';
  if (slugs.includes('hm-treasury')) return 'HM Treasury';
  return 'Other';
}

function humanContentType(format: string, displayType?: string): string {
  if (displayType) return displayType;
  return format
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export async function fetchUKTaxUpdates(opts: { limit?: number } = {}): Promise<UKUpdateItem[]> {
  const limit = opts.limit ?? 50;
  // Build URL manually — gov.uk's array filter syntax (filter_x[]=) doesn't survive URLSearchParams encoding.
  const fields = 'title,description,link,public_timestamp,format,display_type,content_id,organisations';
  const url =
    `${SEARCH_URL}?filter_organisations[]=hm-revenue-customs` +
    `&filter_organisations[]=hm-treasury` +
    `&order=-public_timestamp` +
    `&count=${limit * 2}` +
    `&fields=${fields}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`gov.uk API returned ${res.status}`);
  }
  const json: GovUKSearchResponse = await res.json();

  return json.results
    .filter((r) => !EXCLUDED_FORMATS.has(r.format))
    .map<UKUpdateItem>((r) => {
      const orgSlugs = (r.organisations ?? []).map((o) => o.slug ?? '').filter(Boolean);
      return {
        id: r.content_id,
        title: r.title,
        description: r.description ?? '',
        url: r.link.startsWith('http') ? r.link : `${GOV_UK_BASE}${r.link}`,
        publishedAt: r.public_timestamp,
        organisation: orgFromSlugs(orgSlugs),
        contentType: humanContentType(r.format, r.display_type),
        rawFormat: r.format,
      };
    })
    .slice(0, limit);
}

const MS_PER_DAY = 1000 * 60 * 60 * 24;

export function relativeTimeShort(iso: string, now: Date = new Date()): string {
  const target = new Date(iso);
  if (Number.isNaN(target.getTime())) return '';
  const diffMs = now.getTime() - target.getTime();
  if (diffMs < 0) return 'just now';
  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(diffMs / MS_PER_DAY);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

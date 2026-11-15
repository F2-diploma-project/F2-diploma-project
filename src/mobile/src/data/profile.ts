/** Профіль працівника — `GET /v1/venue/me` і `GET /v1/venue/me/today` (`docs/api/openapi.yaml`). */
import type { StaffRole } from './auth';

export interface Me {
  staff: { id: string; login: string; display_name: string; role: StaffRole };
  /** `photo` — у API `photo_url`; число — вбудоване тестове фото заглушки. */
  venue: { name: string; photo: string | number | null };
}

export interface TodaySummary {
  date: string;
  published_lots: number;
  redeemed_orders: number;
}

export interface ProfileService {
  me(login: string): Promise<Me>;
  today(): Promise<TodaySummary>;
}

/** Ініціали для кружка-аватара: «Олена Коваль» → «ОК». */
export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

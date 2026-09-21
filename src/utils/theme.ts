import { OpeningHoursDay } from '../types';

export interface ThemePalette {
  name: string;
  primary: string;
  primaryHex?: string;
  primaryHover: string;
  primaryLight: string;
  primaryBorder: string;
  badgeBg: string;
  badgeText: string;
  accent: string;
  gradient: string;
}

export const themePresets: Record<string, ThemePalette> = {
  emerald: {
    name: 'Emerald Healthcare & Wellness',
    primary: '#059669', // emerald-600
    primaryHex: '#059669',
    primaryHover: '#047857', // emerald-700
    primaryLight: '#ecfdf5', // emerald-50
    primaryBorder: '#a7f3d0', // emerald-200
    badgeBg: '#d1fae5',
    badgeText: '#065f46',
    accent: '#0d9488', // teal-600
    gradient: 'from-emerald-600 to-teal-700'
  },
  sapphire: {
    name: 'Sapphire Medical & Corporate',
    primary: '#2563eb', // blue-600
    primaryHex: '#2563eb',
    primaryHover: '#1d4ed8', // blue-700
    primaryLight: '#eff6ff',
    primaryBorder: '#bfdbfe',
    badgeBg: '#dbeafe',
    badgeText: '#1e40af',
    accent: '#0284c7',
    gradient: 'from-blue-600 to-cyan-700'
  },
  crimson: {
    name: 'Crimson Elite Care',
    primary: '#e11d48', // rose-600
    primaryHex: '#e11d48',
    primaryHover: '#be123c',
    primaryLight: '#fff1f2',
    primaryBorder: '#fecdd3',
    badgeBg: '#ffe4e6',
    badgeText: '#9f1239',
    accent: '#d97706',
    gradient: 'from-rose-600 to-orange-600'
  },
  amber: {
    name: 'Warm Amber & Gold',
    primary: '#d97706', // amber-600
    primaryHex: '#d97706',
    primaryHover: '#b45309',
    primaryLight: '#fffbeb',
    primaryBorder: '#fde68a',
    badgeBg: '#fef3c7',
    badgeText: '#92400e',
    accent: '#ea580c',
    gradient: 'from-amber-600 to-orange-700'
  },
  violet: {
    name: 'Modern Violet & Indigo',
    primary: '#7c3aed', // violet-600
    primaryHex: '#7c3aed',
    primaryHover: '#6d28d9',
    primaryLight: '#f5f3ff',
    primaryBorder: '#ddd6fe',
    badgeBg: '#ede9fe',
    badgeText: '#5b21b6',
    accent: '#4f46e5',
    gradient: 'from-violet-600 to-indigo-700'
  },
  slate: {
    name: 'Slate Minimalist Dark Luxury',
    primary: '#334155', // slate-700
    primaryHex: '#334155',
    primaryHover: '#1e293b',
    primaryLight: '#f8fafc',
    primaryBorder: '#cbd5e1',
    badgeBg: '#f1f5f9',
    badgeText: '#0f172a',
    accent: '#475569',
    gradient: 'from-slate-800 to-gray-900'
  }
};

export function getOpenStatus(hours: OpeningHoursDay[]): {
  isOpenNow: boolean;
  statusText: string;
  todayHours: string;
} {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const now = new Date();
  const currentDayName = days[now.getDay()];
  const todayConfig = hours.find((h) => h.day.toLowerCase() === currentDayName.toLowerCase());

  if (!todayConfig || !todayConfig.isOpen) {
    return {
      isOpenNow: false,
      statusText: 'Closed Today',
      todayHours: 'Closed'
    };
  }

  // Parse open & close times (e.g. "08:00 AM" or "20:00")
  try {
    const parseTime = (timeStr: string) => {
      const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
      if (!match) return null;
      let hours = parseInt(match[1], 10);
      const mins = parseInt(match[2], 10);
      const modifier = match[3] ? match[3].toUpperCase() : null;

      if (modifier === 'PM' && hours < 12) hours += 12;
      if (modifier === 'AM' && hours === 12) hours = 0;
      return hours * 60 + mins;
    };

    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const openMinutes = parseTime(todayConfig.openTime);
    const closeMinutes = parseTime(todayConfig.closeTime);

    if (openMinutes !== null && closeMinutes !== null) {
      if (currentMinutes >= openMinutes && currentMinutes <= closeMinutes) {
        return {
          isOpenNow: true,
          statusText: `Open Now • Closes ${todayConfig.closeTime}`,
          todayHours: `${todayConfig.openTime} – ${todayConfig.closeTime}`
        };
      } else if (currentMinutes < openMinutes) {
        return {
          isOpenNow: false,
          statusText: `Closed • Opens at ${todayConfig.openTime}`,
          todayHours: `${todayConfig.openTime} – ${todayConfig.closeTime}`
        };
      } else {
        return {
          isOpenNow: false,
          statusText: `Closed for Today (reopens tomorrow)`,
          todayHours: `${todayConfig.openTime} – ${todayConfig.closeTime}`
        };
      }
    }
  } catch {
    // Fallback if parsing fails
  }

  return {
    isOpenNow: true,
    statusText: `Open Today (${todayConfig.openTime} – ${todayConfig.closeTime})`,
    todayHours: `${todayConfig.openTime} – ${todayConfig.closeTime}`
  };
}

export function formatWhatsAppLink(phone: string, businessName: string, serviceTitle?: string): string {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  let message = `Hello ${businessName}, I found your website and would like to inquire about your services.`;
  if (serviceTitle) {
    message = `Hello ${businessName}, I am interested in booking or inquiring about "${serviceTitle}". Could you please share more details?`;
  }
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

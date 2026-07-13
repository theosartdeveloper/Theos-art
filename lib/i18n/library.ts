export type SiteLocale = 'en' | 'rw'

export const SITE_LOCALES: { id: SiteLocale; label: string }[] = [
  { id: 'en', label: 'English' },
  { id: 'rw', label: 'Kinyarwanda' },
]

const libraryMessages = {
  en: {
    title: 'Theos Art Library',
    subtitle: 'Browse our gallery, studio projects, books, and creative culture.',
    projectsTitle: 'Studio projects',
    projectsSubtitle: 'Artworks and creative projects showcased by Theos Art.',
    viewAllProjects: 'View all projects',
    photosEvents: 'Photos & events',
    engineeringProject: 'Studio project',
    team: 'Team',
    year: 'Year',
    technologies: 'Materials & mediums',
  },
  rw: {
    title: 'Isomero rya Theos Art',
    subtitle:
      "Reba amafoto, imishinga y'ubuhanzi, ibitabo n'ibindi bijyanye n'umuco gakondo bitegurwa na Theos Art.",
    projectsTitle: 'Imishinga y\'ubuhanzi',
    projectsSubtitle: "Imishinga y'ubuhanzi yerekanywe na Theos Art.",
    viewAllProjects: 'Reba imishinga yose',
    photosEvents: "Amafoto n'ibyakozwe",
    engineeringProject: 'Imishinga',
    team: 'Itsinda',
    year: 'Umwaka',
    technologies: 'Ibikoresho',
  },
} as const

export function getLibraryMessages(locale: SiteLocale = 'en') {
  return libraryMessages[locale] ?? libraryMessages.en
}

export function parseSiteLocale(value?: string | null): SiteLocale {
  return value === 'rw' ? 'rw' : 'en'
}

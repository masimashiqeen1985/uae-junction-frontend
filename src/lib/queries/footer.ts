import { MEDIA_FIELDS } from './fragments'

// All menus + their top-level items. We match footer columns by menu NAME
// (case-insensitive) so editors only need to create menus in Appearance → Menus —
// no menu-location registration required on the WordPress side.
export const FOOTER_MENUS_QUERY = `query FooterMenus {
  menus(first: 50) {
    nodes {
      name
      menuItems(first: 100, where: { parentDatabaseId: 0 }) {
        nodes { label uri target }
      }
    }
  }
}`

// Site-wide options (ACF options page exposed to WPGraphQL). Fetched separately so a
// missing/unconfigured options page can't break the footer link columns.
export const FOOTER_OPTIONS_QUERY = `query FooterOptions {
  siteOptions {
    siteLogo { ${MEDIA_FIELDS} }
    whatsappNumber
    phoneNumber
    emailAddress
    footerTagline
    socialLinks { platform url }
  }
}`

export const theme = {
  colors: {
    primary: "var(--color-primary)",
    primaryHover: "var(--color-primary-hover)",
    primaryHoverAlt: "var(--color-primary-hover-alt)",
    welcomeCtaHover: "var(--color-welcome-cta-hover)",
    dashboardCtaHover: "var(--color-dashboard-cta-hover)",
    iconAccent: "var(--color-icon-accent)",

    darkCta: "var(--color-dark-cta)",
    darkCtaHover: "var(--color-dark-cta-hover)",

    textPrimary: "var(--color-text-primary)",
    textBody: "var(--color-text-body)",
    textSecondary: "var(--color-text-secondary)",
    textMuted: "var(--color-text-muted)",
    textTertiary: "var(--color-text-tertiary)",
    textQuaternary: "var(--color-text-quaternary)",
    textPlaceholder: "var(--color-text-placeholder)",
    textPlaceholderAlt: "var(--color-text-placeholder-alt)",
    inputPlaceholder: "var(--color-input-placeholder)",

    white: "var(--color-white)",
    border: "var(--color-border)",
    borderLight: "var(--color-border-light)",
    borderLighter: "var(--color-border-lighter)",
    borderTable: "var(--color-border-table)",
    borderInput: "var(--color-border-input)",

    iconBgSoft: "var(--color-icon-bg-soft)",
    iconBgSoft2: "var(--color-icon-bg-soft-2)",
    surfaceHover: "var(--color-surface-hover)",
    surfaceAlt: "var(--color-surface-alt)",
    successBg: "var(--color-success-bg)",
    success: "var(--color-success)",

    statRed: "var(--color-stat-red)",
    statGreen: "var(--color-stat-green)",
    statYellow: "var(--color-stat-yellow)",
  },
} as const;

export type ThemeColorKey = keyof typeof theme.colors;

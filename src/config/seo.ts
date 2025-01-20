export const siteConfig = {
    siteName: 'JPC Group Tracking',
    siteUrl: 'https://tracking.jpcgroup.com',
    defaultTitle: 'Tracking - JPC Group',
    titleTemplate: '%s - JPC Group',
    defaultDescription: 'Track your shipments and manage your global logistics with JPC Group. Real-time tracking, comprehensive shipping solutions, and expert support.',

    openGraph: {
      type: 'website',
      locale: 'en_US',
      site_name: 'JPC Group Tracking',
    }
  };
  
  export type PathConfig = {
    title: string;
    description: string;
    path: string;
  };
  
  export const pathConfigs: Record<string, PathConfig> = {
    home: {
      title: 'Tracking - JPC Group',
      description: 'Real-time tracking for your international shipments. Monitor your cargo status, get updates, and manage your logistics with JPC Group Tracking.',
      path: '/',
    },
  };
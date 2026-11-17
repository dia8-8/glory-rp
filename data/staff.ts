// Staff team shown on /staff. The page shows "coming soon" while this list is empty.
// `avatar` can be a file in /public/staff/ (e.g. '/staff/name.png') or left empty for the logo.
//
// Example:
//   { name: 'Glory', role: { en: 'Owner', ar: 'المالك' }, rank: 'owner', avatar: '/staff/glory.png' },

export type StaffRank = 'owner' | 'admin' | 'mod' | 'support';

export type StaffMember = {
  name: string;
  role: { en: string; ar: string };
  rank: StaffRank;
  avatar?: string;
};

export const STAFF: StaffMember[] = [];

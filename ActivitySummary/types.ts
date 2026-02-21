export interface IActivitySummaryProps {
  bannerColor: string;
  tileFooterColor: string;
  cardTitleLabel: string;
  showCardTitle: boolean;
  cardTitleColor: string;
  buttonBackgroundColor: string;
  buttonTextColor: string;
  totalActivitiesLabel: string;
  openActivitiesLabel: string;
  overdueActivitiesLabel: string;
  dueTodayLabel: string;
  dueThisWeekLabel: string;
  dueThisMonthLabel: string;
  dueThisYearLabel: string;
  showTileSection: boolean;
  showTotalActivities: boolean;
  showOpenActivities: boolean;
  showOverdueActivities: boolean;
  showDueToday: boolean;
  showDueThisWeek: boolean;
  showDueThisMonth: boolean;
  showDueThisYear: boolean;
  showTileIcons: boolean;
  includedActivityTypes: string;
  lastActivitySectionLabel: string;
  showLastActivitySection: boolean;
  lastActivityCreatedOnLabel: string;
  lastActivityCreatedByLabel: string;
  lastActivityModifiedOnLabel: string;
  lastActivityModifiedByLabel: string;
  lastActivityTypeLabel: string;
  lastActivitySubjectLabel: string;
  lastActivityDescriptionLabel: string;
  showCreatedOn: boolean;
  showCreatedBy: boolean;
  showModifiedOn: boolean;
  showModifiedBy: boolean;
  showType: boolean;
  showSubject: boolean;
  showDescription: boolean;
  maxDescriptionLines: number;
  lastActivityTypeFilter: string;
  openActivityButtonLabel: string;
  showVersion: boolean;
  webAPI: ComponentFramework.WebApi;
  recordId: string | null;
  entityName: string | null;
  forceRefresh?: boolean;
  context?: ComponentFramework.Context<any>;
  version?: string;
}

export interface IActivitySummaryData {
  totalActivities: number;
  openActivities: number;
  overdueActivities: number;
  dueToday: number;
  dueThisWeek: number;
  dueThisMonth: number;
  dueThisYear: number;
  lastActivity: ILastActivity | null;
  loading: boolean;
  error: string | null;
  descriptionExpanded: boolean;
}

export interface ILastActivity {
  activityid: string;
  createdon: string;
  createdbyname: string | null;
  modifiedon: string;
  modifiedbyname: string | null;
  activitytypecode: string | number;
  subject: string | null;
  description: string | null;
}

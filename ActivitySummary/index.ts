import { IInputs, IOutputs } from './generated/ManifestTypes';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { ActivitySummaryCard } from './ActivitySummaryCard';
import { IActivitySummaryData, IActivitySummaryProps } from './types';

export class ActivitySummaryControl implements ComponentFramework.StandardControl<IInputs, IOutputs> {
  private _container: HTMLDivElement;
  private _context: ComponentFramework.Context<IInputs>;
  private _notifyOutputChanged: () => void;
  private _props: IActivitySummaryProps;
  private _currentRecordId: string | null = null;
  private _currentEntityName: string | null = null;

  /**
   * Empty constructor.
   */
  constructor() {}

  /**
   * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
   * Data-set values are not initialized here, use updateView.
   * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
   * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
   * @param state A piece of data that persists between init and updateView calls.
   * @param container If a control is marked control-type="standard", it will receive an empty div element within which it can render its content.
   */
  public init(
    context: ComponentFramework.Context<IInputs>,
    notifyOutputChanged: () => void,
    state: ComponentFramework.Dictionary,
    container: HTMLDivElement
  ): void {
    // Add control initialization code
    this._container = container;
    this._context = context;
    this._notifyOutputChanged = notifyOutputChanged;

    // Get current record info - try multiple approaches for compatibility
    let recordId: string | null = null;
    let entityName: string | null = null;

    // Try contextInfo first (most common)
    const mode = context.mode as any;
    if (mode?.contextInfo) {
      const contextInfo = mode.contextInfo;
      recordId = contextInfo.entityId?.replace(/[{}]/g, '') || null;
      entityName = contextInfo.entityTypeName || null;
    }

    // Fallback: try page context (if available)
    if (!recordId && (context as any).page) {
      const page = (context as any).page;
      recordId = page.entityId?.replace(/[{}]/g, '') || null;
      entityName = page.entityRecordName || page.entityTypeName || null;
    }

    this._currentRecordId = recordId;
    this._currentEntityName = entityName;

    // Initialize props (all from input = static value when configuring; defaults in code if empty)
    this._props = this.getPropsFromContext(context);
  }

  /**
   * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
   * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
   */
  public updateView(context: ComponentFramework.Context<IInputs>): void {
    // Update props with latest values
    // Get current record info - try multiple approaches for compatibility
    let recordId: string | null = null;
    let entityName: string | null = null;

    // Try contextInfo first (most common)
    const mode = context.mode as any;
    if (mode?.contextInfo) {
      const contextInfo = mode.contextInfo;
      recordId = contextInfo.entityId?.replace(/[{}]/g, '') || null;
      entityName = contextInfo.entityTypeName || null;
    }

    // Fallback: try page context (if available)
    if (!recordId && (context as any).page) {
      const page = (context as any).page;
      recordId = page.entityId?.replace(/[{}]/g, '') || null;
      entityName = page.entityRecordName || page.entityTypeName || null;
    }

    // Check if record changed
    const recordChanged = recordId !== this._currentRecordId;
    
    // Get new props to check for property changes
    const newProps = this.getPropsFromContext(context);
    const includedActivityTypesChanged = this._props?.includedActivityTypes !== newProps.includedActivityTypes;
    const lastActivityTypeFilterChanged = this._props?.lastActivityTypeFilter !== newProps.lastActivityTypeFilter;
    
    if (includedActivityTypesChanged) {
      console.log('[ActivitySummaryControl] includedActivityTypes property changed:', {
        old: this._props?.includedActivityTypes,
        new: newProps.includedActivityTypes,
        rawValue: context.parameters.includedActivityTypes?.raw
      });
    }
    
    if (lastActivityTypeFilterChanged) {
      console.log('[ActivitySummaryControl] lastActivityTypeFilter property changed:', {
        old: this._props?.lastActivityTypeFilter,
        new: newProps.lastActivityTypeFilter,
        rawValue: context.parameters.lastActivityTypeFilter?.raw
      });
    }
    
    this._currentRecordId = recordId;
    this._currentEntityName = entityName;

    // Force refresh if record changed OR if filter properties changed
    this._props = { ...newProps, forceRefresh: recordChanged || includedActivityTypesChanged || lastActivityTypeFilterChanged };

    ReactDOM.render(React.createElement(ActivitySummaryCard, this._props), this._container);
  }

  /**
   * Build props from context (all usage="input" = static value when configuring; defaults if empty).
   */
  private getPropsFromContext(context: ComponentFramework.Context<IInputs>): IActivitySummaryProps {
    const p = context.parameters;
    return {
      bannerColor: (p.bannerColor?.raw as string) || '#2B579A',
      tileFooterColor: (p.tileFooterColor?.raw as string) || '#107c10',
      cardTitleLabel: (p.cardTitleLabel?.raw as string) || 'Activities',
      showCardTitle: p.showCardTitle?.raw !== false,
      cardTitleColor: (p.cardTitleColor?.raw as string) || '#323130',
      buttonBackgroundColor: (p.buttonBackgroundColor?.raw as string) || '#0078d4',
      buttonTextColor: (p.buttonTextColor?.raw as string) || '#ffffff',
      totalActivitiesLabel: (p.totalActivitiesLabel?.raw as string) || 'Total activities',
      openActivitiesLabel: (p.openActivitiesLabel?.raw as string) || 'Open activities',
      overdueActivitiesLabel: (p.overdueActivitiesLabel?.raw as string) || 'Overdue activities',
      dueTodayLabel: (p.dueTodayLabel?.raw as string) || 'Due today',
      dueThisWeekLabel: (p.dueThisWeekLabel?.raw as string) || 'Due this week',
      dueThisMonthLabel: (p.dueThisMonthLabel?.raw as string) || 'Due this month',
      dueThisYearLabel: (p.dueThisYearLabel?.raw as string) || 'Due this year',
      showTileSection: p.showTileSection?.raw !== false,
      showTotalActivities: p.showTotalActivities?.raw !== false,
      showOpenActivities: p.showOpenActivities?.raw !== false,
      showOverdueActivities: p.showOverdueActivities?.raw === true,
      showDueToday: p.showDueToday?.raw === true,
      showDueThisWeek: p.showDueThisWeek?.raw === true,
      showDueThisMonth: p.showDueThisMonth?.raw === true,
      showDueThisYear: p.showDueThisYear?.raw === true,
      showTileIcons: p.showTileIcons?.raw !== false,
      includedActivityTypes: (() => {
        const rawValue = p.includedActivityTypes?.raw as string;
        const trimmedValue = rawValue?.trim() || '';
        console.log('[ActivitySummaryControl] Reading includedActivityTypes property:', {
          raw: rawValue,
          trimmed: trimmedValue,
          type: typeof rawValue
        });
        return trimmedValue;
      })(),
      lastActivitySectionLabel: (p.lastActivitySectionLabel?.raw as string) || 'Last activity',
      showLastActivitySection: p.showLastActivitySection?.raw !== false,
      lastActivityCreatedOnLabel: (p.lastActivityCreatedOnLabel?.raw as string) || 'Created on',
      lastActivityCreatedByLabel: (p.lastActivityCreatedByLabel?.raw as string) || 'Created by',
      lastActivityModifiedOnLabel: (p.lastActivityModifiedOnLabel?.raw as string) || 'Modified on',
      lastActivityModifiedByLabel: (p.lastActivityModifiedByLabel?.raw as string) || 'Modified by',
      lastActivityTypeLabel: (p.lastActivityTypeLabel?.raw as string) || 'Type',
      lastActivitySubjectLabel: (p.lastActivitySubjectLabel?.raw as string) || 'Subject',
      lastActivityDescriptionLabel: (p.lastActivityDescriptionLabel?.raw as string) || 'Description',
      showCreatedOn: p.showCreatedOn?.raw !== false,
      showCreatedBy: p.showCreatedBy?.raw !== false,
      showModifiedOn: p.showModifiedOn?.raw === true,
      showModifiedBy: p.showModifiedBy?.raw === true,
      showType: p.showType?.raw !== false,
      showSubject: p.showSubject?.raw !== false,
      showDescription: p.showDescription?.raw !== false,
      maxDescriptionLines: (() => {
        const rawValue = p.maxDescriptionLines?.raw as number;
        const finalValue = rawValue ?? 6;
        console.log('[ActivitySummaryControl] Reading maxDescriptionLines property:', {
          raw: rawValue,
          final: finalValue,
          type: typeof rawValue
        });
        return finalValue;
      })(),
      lastActivityTypeFilter: (() => {
        const rawValue = p.lastActivityTypeFilter?.raw as string;
        const trimmedValue = rawValue?.trim() || '';
        console.log('[ActivitySummaryControl] Reading lastActivityTypeFilter property:', {
          raw: rawValue,
          trimmed: trimmedValue,
          type: typeof rawValue
        });
        return trimmedValue;
      })(),
      openActivityButtonLabel: (p.openActivityButtonLabel?.raw as string) || '',
      showVersion: p.showVersion?.raw === true,
      webAPI: context.webAPI,
      recordId: this._currentRecordId,
      entityName: this._currentEntityName,
      context: context as any,
      version: (() => {
        // Try multiple ways to get the version
        const manifest = (context as any).manifest;
        const versionFromManifest = manifest?.version;
        
        // Log for debugging
        console.log('[ActivitySummary] Version detection:', {
          manifestExists: !!manifest,
          versionFromManifest,
          fallback: '1.4.9'
        });
        
        return versionFromManifest || '1.4.9';
      })(),
    };
  }

  /**
   * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
   * i.e. cancelling any pending remote calls, removing listeners, etc.
   */
  public destroy(): void {
    // Add code to cleanup control if necessary
    ReactDOM.unmountComponentAtNode(this._container);
  }
}

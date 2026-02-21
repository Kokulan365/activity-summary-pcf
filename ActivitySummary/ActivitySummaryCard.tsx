import * as React from 'react';
import { IActivitySummaryProps, IActivitySummaryData, ILastActivity } from './types';
import { ActivityDataService } from './ActivityDataService';
import { TileIcon, TileIconKey } from './TileIcons';
import './css/ActivitySummary.css';

export class ActivitySummaryCard extends React.Component<IActivitySummaryProps, IActivitySummaryData> {
  private _dataService: ActivityDataService;

  constructor(props: IActivitySummaryProps) {
    super(props);
    this._dataService = new ActivityDataService(props.webAPI, props.includedActivityTypes);
    this.state = {
      totalActivities: 0,
      openActivities: 0,
      overdueActivities: 0,
      dueToday: 0,
      dueThisWeek: 0,
      dueThisMonth: 0,
      dueThisYear: 0,
      lastActivity: null,
      loading: true,
      error: null,
      descriptionExpanded: false,
    };
  }

  componentDidMount(): void {
    this.loadData();
  }

  componentDidUpdate(prevProps: IActivitySummaryProps): void {
    // Recreate data service if includedActivityTypes changed
    if (prevProps.includedActivityTypes !== this.props.includedActivityTypes) {
      console.log('[ActivitySummaryCard] includedActivityTypes changed:', {
        old: prevProps.includedActivityTypes,
        new: this.props.includedActivityTypes
      });
      this._dataService = new ActivityDataService(this.props.webAPI, this.props.includedActivityTypes);
    }
    
    // Reset description expanded state when last activity changes
    if (prevProps.recordId !== this.props.recordId || 
        (prevProps.lastActivityTypeFilter !== this.props.lastActivityTypeFilter)) {
      this.setState({ descriptionExpanded: false });
    }
    
    if (
      prevProps.recordId !== this.props.recordId ||
      prevProps.entityName !== this.props.entityName ||
      prevProps.includedActivityTypes !== this.props.includedActivityTypes ||
      prevProps.lastActivityTypeFilter !== this.props.lastActivityTypeFilter ||
      this.props.forceRefresh
    ) {
      console.log('[ActivitySummaryCard] Reloading data due to prop change', {
        recordIdChanged: prevProps.recordId !== this.props.recordId,
        entityNameChanged: prevProps.entityName !== this.props.entityName,
        includedActivityTypesChanged: prevProps.includedActivityTypes !== this.props.includedActivityTypes,
        lastActivityTypeFilterChanged: prevProps.lastActivityTypeFilter !== this.props.lastActivityTypeFilter,
        forceRefresh: this.props.forceRefresh
      });
      this.loadData();
    }
  }

  private toggleDescriptionExpanded = (): void => {
    this.setState(prevState => ({
      descriptionExpanded: !prevState.descriptionExpanded
    }));
  }

  private isEmailActivity(activityTypeCode: string | number | null | undefined): boolean {
    if (!activityTypeCode) return false;
    
    // Check if it's the Email activity type code (4201) or entity name ('email')
    const codeStr = typeof activityTypeCode === 'number' 
      ? activityTypeCode.toString() 
      : String(activityTypeCode || '').trim().toLowerCase();
    
    return codeStr === '4201' || codeStr === 'email';
  }

  private needsDescriptionTruncation(description: string | null, maxLines: number, isEmail: boolean = false): boolean {
    if (!description) return false;
    
    if (isEmail) {
      // For HTML content, estimate based on text content length
      const stripped = this.stripHtml(description);
      if (!stripped) return false;
      const estimatedLines = Math.ceil(stripped.length / 50);
      return estimatedLines > maxLines;
    } else {
      // For plain text, use simple heuristic
      const stripped = this.stripHtml(description);
      if (!stripped) return false;
      const estimatedLines = Math.ceil(stripped.length / 50);
      return estimatedLines > maxLines;
    }
  }

  private async loadData(): Promise<void> {
    if (!this.props.recordId) {
      this.setState({
        loading: false,
        error: 'No record ID available',
        totalActivities: 0,
        openActivities: 0,
        overdueActivities: 0,
        dueToday: 0,
        dueThisWeek: 0,
        dueThisMonth: 0,
        dueThisYear: 0,
        lastActivity: null,
        descriptionExpanded: false,
      });
      return;
    }

    this.setState({ loading: true, error: null, descriptionExpanded: false });

    const promises: Promise<number | ILastActivity | null>[] = [];
    const keys: (keyof IActivitySummaryData)[] = [];

    if (this.props.showTileSection) {
      if (this.props.showTotalActivities) {
        promises.push(this._dataService.getTotalActivitiesCount(this.props.recordId));
        keys.push('totalActivities');
      }
      if (this.props.showOpenActivities) {
        promises.push(this._dataService.getOpenActivitiesCount(this.props.recordId));
        keys.push('openActivities');
      }
      if (this.props.showOverdueActivities) {
        promises.push(this._dataService.getOverdueActivitiesCount(this.props.recordId));
        keys.push('overdueActivities');
      }
      if (this.props.showDueToday) {
        promises.push(this._dataService.getDueTodayCount(this.props.recordId));
        keys.push('dueToday');
      }
      if (this.props.showDueThisWeek) {
        promises.push(this._dataService.getDueThisWeekCount(this.props.recordId));
        keys.push('dueThisWeek');
      }
      if (this.props.showDueThisMonth) {
        promises.push(this._dataService.getDueThisMonthCount(this.props.recordId));
        keys.push('dueThisMonth');
      }
      if (this.props.showDueThisYear) {
        promises.push(this._dataService.getDueThisYearCount(this.props.recordId));
        keys.push('dueThisYear');
      }
    }

    if (this.props.showLastActivitySection) {
      promises.push(this._dataService.getLastActivity(this.props.recordId, this.props.lastActivityTypeFilter));
      keys.push('lastActivity');
    }

    if (promises.length === 0) {
      this.setState({
        loading: false,
        error: null,
        totalActivities: 0,
        openActivities: 0,
        overdueActivities: 0,
        dueToday: 0,
        dueThisWeek: 0,
        dueThisMonth: 0,
        dueThisYear: 0,
        lastActivity: null,
        descriptionExpanded: false,
      });
      return;
    }

    try {
      const results = await Promise.all(promises);
      const newState: Partial<IActivitySummaryData> = {
        loading: false,
        error: null,
        totalActivities: 0,
        openActivities: 0,
        overdueActivities: 0,
        dueToday: 0,
        dueThisWeek: 0,
        dueThisMonth: 0,
        dueThisYear: 0,
        lastActivity: null,
        descriptionExpanded: false,
      };
      let idx = 0;
      keys.forEach((key) => {
        if (key === 'lastActivity') {
          newState.lastActivity = results[idx] as ILastActivity | null;
        } else {
          (newState as any)[key] = typeof results[idx] === 'number' ? results[idx] : 0;
        }
        idx++;
      });
      this.setState(newState as IActivitySummaryData);
    } catch (error) {
      console.error('Error loading activity data:', error);
      this.setState({
        loading: false,
        error: 'Unable to load activity summary',
        totalActivities: 0,
        openActivities: 0,
        overdueActivities: 0,
        dueToday: 0,
        dueThisWeek: 0,
        dueThisMonth: 0,
        dueThisYear: 0,
        lastActivity: null,
        descriptionExpanded: false,
      });
    }
  }

  private formatDate(dateString: string | null): string {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateString;
    }
  }

  /** Darken a hex color by a percentage (0-100) */
  private darkenColor(hex: string, percent: number): string {
    if (!hex || typeof hex !== 'string') {
      return '#0078d4'; // Default fallback
    }
    
    // Remove # if present
    const hexColor = hex.replace('#', '').trim();
    
    // Validate hex color format (must be 6 characters, hexadecimal)
    if (!/^[0-9A-Fa-f]{6}$/.test(hexColor)) {
      console.warn('[ActivitySummaryCard] Invalid hex color format:', hex);
      return '#0078d4'; // Default fallback
    }
    
    // Parse RGB values
    const r = parseInt(hexColor.substring(0, 2), 16);
    const g = parseInt(hexColor.substring(2, 4), 16);
    const b = parseInt(hexColor.substring(4, 6), 16);
    
    // Validate parsed values
    if (isNaN(r) || isNaN(g) || isNaN(b)) {
      console.warn('[ActivitySummaryCard] Failed to parse hex color:', hex);
      return '#0078d4'; // Default fallback
    }
    
    // Darken each component
    const newR = Math.max(0, Math.floor(r * (1 - percent / 100)));
    const newG = Math.max(0, Math.floor(g * (1 - percent / 100)));
    const newB = Math.max(0, Math.floor(b * (1 - percent / 100)));
    
    // Convert back to hex
    const toHex = (n: number) => {
      const hex = n.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    
    return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`;
  }

  /** Strip HTML tags and decode entities for plain text display (e.g. email body) */
  private stripHtml(html: string | null): string {
    if (!html) return '';
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    const text = tmp.textContent || tmp.innerText || '';
    return text.replace(/\s+/g, ' ').trim();
  }

  private getActivityTypeLabel(activityTypeCode: string | number): string {
    // Convert to string for lookup
    const codeStr = typeof activityTypeCode === 'number' 
      ? activityTypeCode.toString() 
      : String(activityTypeCode || '').trim().toLowerCase();
    
    // Map numeric codes to display names
    const numericTypeMap: { [key: string]: string } = {
      '4201': 'Email',
      '4202': 'Fax',
      '4204': 'Letter',
      '4207': 'Phone Call',
      '4210': 'Appointment',
      '4212': 'Task',
      '4214': 'Recurring Appointment',
      '4216': 'Social Activity',
      '4251': 'Teams Chat',
    };
    
    // Map entity logical names to display names
    const entityNameMap: { [key: string]: string } = {
      'email': 'Email',
      'fax': 'Fax',
      'letter': 'Letter',
      'phonecall': 'Phone Call',
      'appointment': 'Appointment',
      'task': 'Task',
      'recurringappointmentmaster': 'Recurring Appointment',
      'socialactivity': 'Social Activity',
      'msdyn_ocliveworkitem': 'Teams Chat',
    };
    
    // First check numeric codes
    const numericMapped = numericTypeMap[codeStr];
    if (numericMapped) return numericMapped;
    
    // Then check entity logical names
    const entityMapped = entityNameMap[codeStr];
    if (entityMapped) return entityMapped;
    
    // Fallback: capitalize first letter
    if (!codeStr) return '';
    return codeStr.charAt(0).toUpperCase() + codeStr.slice(1);
  }

  private getOpenActivityButtonText(activityTypeCode: string | number | null | undefined): string {
    // If custom label is provided, use it
    if (this.props.openActivityButtonLabel && this.props.openActivityButtonLabel.trim().length > 0) {
      console.log('[ActivitySummaryCard] Using custom button label:', this.props.openActivityButtonLabel);
      return this.props.openActivityButtonLabel;
    }
    
    // Otherwise, generate dynamic text based on activity type
    if (!activityTypeCode) {
      console.log('[ActivitySummaryCard] No activity type code, using default "Open Activity"');
      return 'Open Activity';
    }
    
    const activityType = this.getActivityTypeLabel(activityTypeCode);
    const dynamicText = `Open ${activityType}`;
    console.log('[ActivitySummaryCard] Generating dynamic button text:', {
      activityTypeCode,
      activityType,
      dynamicText
    });
    return dynamicText;
  }

  /** Map activity type code to entity logical name for opening the form */
  private getActivityEntityName(activityTypeCode: string | number): string {
    const inputStr = String(activityTypeCode || '').trim().toLowerCase();
    
    // List of valid activity entity logical names
    const validEntityNames = [
      'email', 'fax', 'letter', 'phonecall', 'appointment', 'task',
      'recurringappointmentmaster', 'socialactivity', 'msdyn_ocliveworkitem'
    ];
    
    // If input is already a valid entity logical name, return it directly
    if (validEntityNames.includes(inputStr)) {
      console.log(`[getActivityEntityName] Input "${activityTypeCode}" is already a valid entity name, returning: "${inputStr}"`);
      return inputStr;
    }
    
    // Try to parse as numeric code and map to entity name
    let codeNum: number;
    if (typeof activityTypeCode === 'string') {
      codeNum = parseInt(activityTypeCode.trim(), 10);
    } else {
      codeNum = activityTypeCode;
    }
    
    // If it's a valid number, map it
    if (!isNaN(codeNum)) {
      const codeStr = codeNum.toString();
      
      const entityMap: { [key: string]: string } = {
        '4201': 'email', // Email
        '4202': 'fax', // Fax
        '4204': 'letter', // Letter
        '4207': 'phonecall', // Phone Call
        '4210': 'appointment', // Appointment
        '4212': 'task', // Task
        '4214': 'recurringappointmentmaster', // Recurring Appointment
        '4216': 'socialactivity', // Social Activity
        '4251': 'msdyn_ocliveworkitem', // Teams Chat
      };
      
      const entityName = entityMap[codeStr];
      if (entityName) {
        console.log(`[getActivityEntityName] Input: "${activityTypeCode}" (numeric code: ${codeNum}), Mapped to: "${entityName}"`);
        return entityName;
      }
    }
    
    // If we get here, the input is neither a valid entity name nor a mappable numeric code
    console.error(`[getActivityEntityName] Cannot map activity type code: "${activityTypeCode}" (type: ${typeof activityTypeCode}). Valid inputs are numeric codes (4201, 4202, etc.) or entity names (email, task, etc.).`);
    return 'activitypointer';
  }

  private async openActivity(activityId: string, activityTypeCode: string | number): Promise<void> {
    console.log(`[openActivity] Called with activityId: "${activityId}", activityTypeCode: "${activityTypeCode}" (type: ${typeof activityTypeCode})`);
    
    if (!activityId) {
      console.error('[openActivity] No activity ID provided');
      return;
    }
    
    if (!activityTypeCode) {
      console.error('[openActivity] No activity type code provided');
      return;
    }
    
    const entityName = this.getActivityEntityName(activityTypeCode);
    console.log(`[openActivity] Mapped entity: "${entityName}"`);
    
    const context = this.props.context as any;
    if (!context) {
      console.error('[openActivity] PCF context not available');
      return;
    }
    
    // Validate entity name - if it's still activitypointer, log error and abort
    if (entityName === 'activitypointer') {
      console.error(`[openActivity] ERROR: Entity name is still 'activitypointer'! Activity type code: "${activityTypeCode}"`);
      console.error(`[openActivity] This means the activity type code mapping failed. Check the mapping in getActivityEntityName.`);
      return;
    }
    
    try {
      // Clean the GUID (remove braces if present)
      const cleanId = activityId.replace(/[{}]/g, '');
      
      // Use official PCF Navigation API: context.navigation.openForm()
      // According to Microsoft documentation: https://learn.microsoft.com/en-us/power-apps/developer/component-framework/reference/navigation/openform
      if (context.navigation && context.navigation.openForm) {
        console.log(`[openActivity] Using official PCF Navigation API: context.navigation.openForm()`);
        console.log(`[openActivity] Entity Name: "${entityName}", Entity ID: "${cleanId}"`);
        
        const formOptions: ComponentFramework.NavigationApi.EntityFormOptions = {
          entityName: entityName,
          entityId: cleanId,
          openInNewWindow: true, // Opens in a new tab
        };
        
        try {
          await context.navigation.openForm(formOptions);
          console.log(`[openActivity] Successfully opened form using PCF Navigation API`);
          return;
        } catch (formError) {
          console.error(`[openActivity] PCF Navigation API failed:`, formError);
          console.log(`[openActivity] Falling back to URL method...`);
        }
      } else {
        console.warn(`[openActivity] context.navigation.openForm not available, falling back to URL method`);
      }
      
      // Fallback: Use URL method if Navigation API is not available
      if (!context.page) {
        console.error('[openActivity] PCF page context not available for fallback');
        return;
      }
      
      const clientUrl = context.page.getClientUrl();
      const appId = context.page.appId ?? '';
      
      // Build URL using the exact format from documentation
      const url =
        `${clientUrl}/main.aspx?appid=${encodeURIComponent(appId)}` +
        `&pagetype=entityrecord&etn=${encodeURIComponent(entityName)}` +
        `&id=${encodeURIComponent(cleanId)}` +
        `&forceUCI=1&newWindow=true`;
      
      console.log(`[openActivity] ===== FALLBACK URL METHOD =====`);
      console.log(`[openActivity] Activity ID: ${cleanId}`);
      console.log(`[openActivity] Activity Type Code: ${activityTypeCode} (${typeof activityTypeCode})`);
      console.log(`[openActivity] Mapped Entity Name: ${entityName}`);
      console.log(`[openActivity] Client URL: ${clientUrl}`);
      console.log(`[openActivity] App ID: ${appId}`);
      console.log(`[openActivity] Full URL: ${url}`);
      console.log(`[openActivity] ====================================`);
      
      // Use setTimeout to avoid message channel errors with window.open
      setTimeout(() => {
        try {
          const newWindow = window.open(url, '_blank', 'noopener, noreferrer');
          if (!newWindow) {
            console.error('[openActivity] window.open() returned null - popup may be blocked');
          } else {
            console.log('[openActivity] Successfully opened new window via URL');
          }
        } catch (openError) {
          console.error('[openActivity] Error calling window.open():', openError);
        }
      }, 100);
    } catch (error) {
      console.error('[openActivity] Error opening activity:', error);
    }
  }

  public render(): React.ReactElement {
    const { state, props } = this;

    if (state.loading) {
      return (
        <div className="activity-summary-container">
          <div className="activity-summary-loading">Loading...</div>
        </div>
      );
    }

    if (state.error) {
      return (
        <div className="activity-summary-container">
          <div className="activity-summary-error">{state.error}</div>
        </div>
      );
    }

    const tileFooterStyle = props.tileFooterColor
      ? { backgroundColor: props.tileFooterColor }
      : undefined;

    const showIcons = props.showTileIcons !== false;

    const renderTile = (key: string, iconKey: TileIconKey, label: string, value: number) => (
      <div className="activity-summary-kpi" key={key}>
        {showIcons && (
          <div className="activity-summary-kpi-icon">
            <TileIcon name={iconKey} className="activity-summary-kpi-icon-svg" />
          </div>
        )}
        <div className="activity-summary-kpi-label">{label}</div>
        <div className="activity-summary-kpi-value">{value}</div>
        {props.tileFooterColor && <div className="activity-summary-kpi-footer" style={tileFooterStyle} />}
      </div>
    );

    const tileElements: React.ReactNode[] = [];
    if (props.showTotalActivities) tileElements.push(renderTile('total', 'total', props.totalActivitiesLabel || 'Total activities', state.totalActivities));
    if (props.showOpenActivities) tileElements.push(renderTile('open', 'open', props.openActivitiesLabel || 'Open activities', state.openActivities));
    if (props.showOverdueActivities) tileElements.push(renderTile('overdue', 'overdue', props.overdueActivitiesLabel || 'Overdue activities', state.overdueActivities));
    if (props.showDueToday) tileElements.push(renderTile('dueToday', 'dueToday', props.dueTodayLabel || 'Due today', state.dueToday));
    if (props.showDueThisWeek) tileElements.push(renderTile('dueWeek', 'dueWeek', props.dueThisWeekLabel || 'Due this week', state.dueThisWeek));
    if (props.showDueThisMonth) tileElements.push(renderTile('dueMonth', 'dueMonth', props.dueThisMonthLabel || 'Due this month', state.dueThisMonth));
    if (props.showDueThisYear) tileElements.push(renderTile('dueYear', 'dueYear', props.dueThisYearLabel || 'Due this year', state.dueThisYear));

    const showAnyTile = props.showTileSection && tileElements.length > 0;

    // Calculate hover and active button colors (slightly darker)
    const buttonBgHover = this.darkenColor(props.buttonBackgroundColor, 10);
    const buttonBgActive = this.darkenColor(props.buttonBackgroundColor, 20);

    return (
      <div className="activity-summary-container">
        <div className="activity-summary-card" style={{
          '--button-bg-color': props.buttonBackgroundColor,
          '--button-text-color': props.buttonTextColor,
          '--button-bg-color-hover': buttonBgHover,
          '--button-bg-color-active': buttonBgActive
        } as React.CSSProperties}>
          <div className="activity-summary-banner" style={{ backgroundColor: props.bannerColor }} />
          <div className="activity-summary-content">
            {props.showCardTitle && (
              <div className="activity-summary-title" style={{ color: props.cardTitleColor }}>
                {props.cardTitleLabel || 'Activities'}
              </div>
            )}

            {showAnyTile && <div className="activity-summary-kpis">{tileElements}</div>}

            {props.showLastActivitySection && (
              <div className="activity-summary-last-activity">
                <div className="activity-summary-last-activity-header">
                  <div className="activity-summary-section-header">
                    {props.lastActivitySectionLabel || 'Last activity'}
                    {state.lastActivity && props.showType && (
                      <span className="activity-summary-header-type">
                        {' - '}{this.getActivityTypeLabel(state.lastActivity.activitytypecode)}
                      </span>
                    )}
                  </div>
                  {/* Open Activity button - moved to header */}
                  {state.lastActivity?.activityid && (
                    <div className="activity-summary-open-button-container-header">
                      <button
                        className="activity-summary-open-button"
                        onClick={() => this.openActivity(state.lastActivity!.activityid, state.lastActivity!.activitytypecode)}
                        type="button"
                      >
                        {this.getOpenActivityButtonText(state.lastActivity?.activitytypecode)}
                      </button>
                    </div>
                  )}
                </div>
                {state.lastActivity ? (
                  <div className="activity-summary-last-activity-content">
                    {/* Metadata fields in 2 columns */}
                    <div className="activity-summary-metadata-grid">
                      {props.showCreatedOn && (
                        <div className="activity-summary-field">
                          <span className="activity-summary-field-label">{props.lastActivityCreatedOnLabel || 'Created on'}:</span>
                          <span className="activity-summary-field-value">{this.formatDate(state.lastActivity.createdon)}</span>
                        </div>
                      )}
                      {props.showCreatedBy && (
                        <div className="activity-summary-field">
                          <span className="activity-summary-field-label">{props.lastActivityCreatedByLabel || 'Created by'}:</span>
                          <span className="activity-summary-field-value">{state.lastActivity.createdbyname || '—'}</span>
                        </div>
                      )}
                      {props.showModifiedBy && (
                        <div className="activity-summary-field">
                          <span className="activity-summary-field-label">{props.lastActivityModifiedByLabel || 'Modified by'}:</span>
                          <span className="activity-summary-field-value">{state.lastActivity.modifiedbyname || '—'}</span>
                        </div>
                      )}
                      {props.showModifiedOn && (
                        <div className="activity-summary-field">
                          <span className="activity-summary-field-label">{props.lastActivityModifiedOnLabel || 'Modified on'}:</span>
                          <span className="activity-summary-field-value">{this.formatDate(state.lastActivity.modifiedon)}</span>
                        </div>
                      )}
                    </div>

                    {/* Subject and Description in separated section */}
                    {(props.showSubject || props.showDescription) && (
                      <div className="activity-summary-content-section">
                        {props.showSubject && (
                          <div className="activity-summary-field">
                            <span className="activity-summary-field-label">{props.lastActivitySubjectLabel || 'Subject'}:</span>
                            <span className="activity-summary-field-value activity-summary-subject">{state.lastActivity.subject || '(No subject)'}</span>
                          </div>
                        )}
                        {props.showDescription && (
                          <div className="activity-summary-field">
                            <span className="activity-summary-field-label">{props.lastActivityDescriptionLabel || 'Description'}:</span>
                            <div className="activity-summary-description-container">
                              {(() => {
                                const isEmail = this.isEmailActivity(state.lastActivity?.activitytypecode);
                                const description = state.lastActivity?.description || '';
                                const hasDescription = description.trim().length > 0;
                                
                                if (isEmail && hasDescription) {
                                  // Render HTML for email descriptions
                                  return (
                                    <div
                                      className={`activity-summary-field-value activity-summary-description activity-summary-description-html ${state.descriptionExpanded ? 'activity-summary-description-expanded' : ''}`}
                                      style={!state.descriptionExpanded ? { WebkitLineClamp: props.maxDescriptionLines, lineClamp: props.maxDescriptionLines } : {}}
                                      dangerouslySetInnerHTML={{ __html: description }}
                                    />
                                  );
                                } else {
                                  // Render plain text for other activity types
                                  return (
                                    <span
                                      className={`activity-summary-field-value activity-summary-description ${state.descriptionExpanded ? 'activity-summary-description-expanded' : ''}`}
                                      style={!state.descriptionExpanded ? { WebkitLineClamp: props.maxDescriptionLines, lineClamp: props.maxDescriptionLines } : {}}
                                    >
                                      {this.stripHtml(description) || '(No description)'}
                                    </span>
                                  );
                                }
                              })()}
                              {state.lastActivity?.description && (() => {
                                const isEmail = this.isEmailActivity(state.lastActivity?.activitytypecode);
                                return this.needsDescriptionTruncation(state.lastActivity.description, props.maxDescriptionLines, isEmail);
                              })() && (
                                <button
                                  type="button"
                                  className="activity-summary-read-more"
                                  onClick={this.toggleDescriptionExpanded}
                                >
                                  {state.descriptionExpanded ? 'Read less' : 'Read more'}
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="activity-summary-no-activity">No activity found</div>
                )}
              </div>
            )}
          </div>
          {props.showVersion && props.version && (
            <div className="activity-summary-version">
              Version {props.version}
            </div>
          )}
        </div>
      </div>
    );
  }
}

import { ILastActivity } from './types';

export class ActivityDataService {
  private _webAPI: ComponentFramework.WebApi;
  private _includedActivityTypes: number[];
  
  // Mapping from entity logical names to numeric codes
  private static readonly ENTITY_NAME_TO_CODE: { [key: string]: number } = {
    'email': 4201,
    'fax': 4202,
    'letter': 4204,
    'phonecall': 4207,
    'appointment': 4210,
    'task': 4212,
    'recurringappointmentmaster': 4214,
    'socialactivity': 4216,
    'msdyn_ocliveworkitem': 4251,
  };

  constructor(webAPI: ComponentFramework.WebApi, includedActivityTypes: string = '') {
    this._webAPI = webAPI;
    // Parse comma-separated activity type codes (e.g., "4212,4207" for Task and Phone Call)
    this._includedActivityTypes = includedActivityTypes
      ? includedActivityTypes
          .split(',')
          .map(code => parseInt(code.trim(), 10))
          .filter(code => !isNaN(code) && code > 0)
      : [];
    
    console.log('[ActivityDataService] Initialized with includedActivityTypes:', {
      input: includedActivityTypes,
      parsed: this._includedActivityTypes,
      willFilter: this._includedActivityTypes.length > 0
    });
  }

  private formatGuid(guid: string): string {
    return guid.replace(/[{}]/g, '');
  }

  private getBaseFilter(recordId: string): string {
    // Always use base filter without activity type filtering
    // Activity type filtering will be done client-side if needed
    const baseFilter = `_regardingobjectid_value eq ${this.formatGuid(recordId)}`;
    
    console.log('[ActivityDataService] getBaseFilter:', {
      recordId,
      baseFilter,
      willFilterClientSide: this._includedActivityTypes.length > 0
    });
    
    return baseFilter;
  }

  /**
   * Check if an activity matches the included activity types (client-side filtering)
   * Handles both numeric codes (4201) and entity logical names ('email', 'task')
   */
  private matchesActivityType(activity: any): boolean {
    console.log('[ActivityDataService] ===== matchesActivityType CALLED =====', {
      activityid: activity?.activityid,
      rawActivityTypeCode: activity?.activitytypecode,
      includedTypes: this._includedActivityTypes
    });
    
    if (this._includedActivityTypes.length === 0) {
      return true; // No filter - include all
    }

    // Extract activity type code from the activity entity
    let typeCode: number | null = null;
    const rawValue = activity.activitytypecode;
    
    if (rawValue !== undefined && rawValue !== null) {
      if (typeof rawValue === 'object' && 'Value' in rawValue) {
        // OptionSetValue object
        typeCode = rawValue.Value;
      } else if (typeof rawValue === 'string') {
        // Could be numeric string ('4201') or entity logical name ('email', 'task')
        const numericCode = parseInt(rawValue, 10);
        if (!isNaN(numericCode)) {
          // It's a numeric string
          typeCode = numericCode;
          console.log('[ActivityDataService] matchesActivityType: Parsed numeric string', {
            rawValue,
            typeCode,
            activityid: activity.activityid
          });
        } else {
          // It's an entity logical name - convert to numeric code
          const lowerValue = rawValue.toLowerCase();
          typeCode = ActivityDataService.ENTITY_NAME_TO_CODE[lowerValue] || null;
          console.log('[ActivityDataService] matchesActivityType: Converting entity name to code', {
            rawValue,
            lowerValue,
            typeCode,
            mappedFrom: ActivityDataService.ENTITY_NAME_TO_CODE[lowerValue],
            activityid: activity.activityid
          });
          if (typeCode === null) {
            console.log('[ActivityDataService] matchesActivityType: Unknown entity name', {
              rawValue,
              activityid: activity.activityid
            });
          }
        }
      } else {
        // Already a number
        typeCode = rawValue;
      }
    }

    if (typeCode === null || isNaN(typeCode)) {
      console.log('[ActivityDataService] matchesActivityType: Invalid type code', {
        rawValue,
        typeCode,
        activityid: activity.activityid
      });
      return false;
    }

    const matches = this._includedActivityTypes.includes(typeCode);
    
    // Always log when filtering to help debug
    console.log('[ActivityDataService] matchesActivityType: Result', {
      activityid: activity.activityid,
      rawValue,
      typeCode,
      includedTypes: this._includedActivityTypes,
      matches,
      willInclude: matches
    });
    
    return matches;
  }

  private getOpenFilter(recordId: string): string {
    return `${this.getBaseFilter(recordId)} and statecode eq 0`;
  }

  private async getCount(recordId: string, filter: string): Promise<number> {
    try {
      // If filtering by activity type, we need to fetch all records for client-side filtering
      // Otherwise, use $count=true for efficiency
      const needsClientSideFilter = this._includedActivityTypes.length > 0;
      const query = needsClientSideFilter
        ? `?$filter=${encodeURIComponent(filter)}&$select=activityid,activitytypecode`
        : `?$filter=${encodeURIComponent(filter)}&$select=activityid&$count=true`;
      
      console.log('[ActivityDataService] getCount called:', {
        recordId,
        filter,
        needsClientSideFilter,
        includedActivityTypes: this._includedActivityTypes,
        query
      });
      
      const response = await this._webAPI.retrieveMultipleRecords('activitypointer', query);
      
      // Ensure entities array exists
      if (!response || !response.entities) {
        console.error('[ActivityDataService] Invalid response structure:', {
          response,
          responseType: typeof response,
          hasEntities: !!response?.entities
        });
        return 0;
      }
      
      console.log('[ActivityDataService] Raw response:', {
        entitiesCount: response.entities.length,
        odataCount: (response as any)['@odata.count'],
        hasEntities: response.entities.length > 0,
        firstEntity: response.entities.length > 0 ? {
          activityid: response.entities[0].activityid,
          activitytypecode: response.entities[0].activitytypecode,
          activitytypecodeType: typeof response.entities[0].activitytypecode,
          activitytypecodeValue: response.entities[0].activitytypecode
        } : null
      });
      
      // If we need to filter by activity type, do it client-side
      let entities = response.entities || [];
      
      if (needsClientSideFilter) {
        const beforeCount = entities.length;
        console.log('[ActivityDataService] Starting client-side filter:', {
          beforeCount,
          filterTypes: this._includedActivityTypes,
          sampleEntities: entities.slice(0, 3).map((e: any) => ({
            activityid: e.activityid,
            activitytypecode: e.activitytypecode,
            activitytypecodeType: typeof e.activitytypecode
          }))
        });
        
        entities = entities.filter((entity: any) => {
          const matches = this.matchesActivityType(entity);
          if (!matches && beforeCount <= 10) {
            // Log first few non-matching entities for debugging
            console.log('[ActivityDataService] Entity filtered out:', {
              activityid: entity.activityid,
              activitytypecode: entity.activitytypecode,
              activitytypecodeType: typeof entity.activitytypecode,
              rawValue: entity.activitytypecode
            });
          }
          return matches;
        });
        
        console.log('[ActivityDataService] Client-side filtered:', {
          before: beforeCount,
          after: entities.length,
          filterTypes: this._includedActivityTypes,
          filteredOut: beforeCount - entities.length
        });
      }
      
      const count = !needsClientSideFilter && (response as any)['@odata.count'] !== undefined
        ? (response as any)['@odata.count'] 
        : entities.length;
      console.log('[ActivityDataService] getCount result:', { 
        filter, 
        count, 
        entitiesFound: entities.length,
        usedODataCount: !needsClientSideFilter && (response as any)['@odata.count'] !== undefined
      });
      return count;
    } catch (error) {
      console.error('[ActivityDataService] Error getting count:', {
        error,
        filter,
        recordId,
        errorMessage: error instanceof Error ? error.message : String(error)
      });
      try {
        // Fallback: fetch without $count and filter client-side
        const fallbackQuery = `?$filter=${encodeURIComponent(filter)}&$select=activityid,activitytypecode`;
        console.log('[ActivityDataService] Trying fallback query:', fallbackQuery);
        const response = await this._webAPI.retrieveMultipleRecords('activitypointer', fallbackQuery);
        
        // Apply client-side filtering if needed
        let entities = response.entities;
        if (this._includedActivityTypes.length > 0) {
          entities = entities.filter((entity: any) => this.matchesActivityType(entity));
        }
        
        console.log('[ActivityDataService] Fallback query result:', { count: entities.length });
        return entities.length;
      } catch (fallbackError) {
        console.error('[ActivityDataService] Fallback query also failed:', fallbackError);
        return 0;
      }
    }
  }

  /** Date boundaries in ISO format for OData (UTC) */
  private getDateBoundaries(): {
    now: string;
    todayStart: string;
    todayEnd: string;
    weekStart: string;
    weekEnd: string;
    monthStart: string;
    monthEnd: string;
    yearStart: string;
    yearEnd: string;
  } {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    const dayOfWeek = now.getDay();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    const yearStart = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
    const yearEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
    return {
      now: now.toISOString(),
      todayStart: todayStart.toISOString(),
      todayEnd: todayEnd.toISOString(),
      weekStart: weekStart.toISOString(),
      weekEnd: weekEnd.toISOString(),
      monthStart: monthStart.toISOString(),
      monthEnd: monthEnd.toISOString(),
      yearStart: yearStart.toISOString(),
      yearEnd: yearEnd.toISOString(),
    };
  }

  async getTotalActivitiesCount(recordId: string): Promise<number> {
    return this.getCount(recordId, this.getBaseFilter(recordId));
  }

  async getOpenActivitiesCount(recordId: string): Promise<number> {
    return this.getCount(recordId, this.getOpenFilter(recordId));
  }

  async getOverdueActivitiesCount(recordId: string): Promise<number> {
    const { now } = this.getDateBoundaries();
    const filter = `${this.getOpenFilter(recordId)} and scheduledend lt ${now}`;
    return this.getCount(recordId, filter);
  }

  async getDueTodayCount(recordId: string): Promise<number> {
    const { todayStart, todayEnd } = this.getDateBoundaries();
    const filter = `${this.getOpenFilter(recordId)} and scheduledend ge ${todayStart} and scheduledend le ${todayEnd}`;
    return this.getCount(recordId, filter);
  }

  async getDueThisWeekCount(recordId: string): Promise<number> {
    const { weekStart, weekEnd } = this.getDateBoundaries();
    const filter = `${this.getOpenFilter(recordId)} and scheduledend ge ${weekStart} and scheduledend le ${weekEnd}`;
    return this.getCount(recordId, filter);
  }

  async getDueThisMonthCount(recordId: string): Promise<number> {
    const { monthStart, monthEnd } = this.getDateBoundaries();
    const filter = `${this.getOpenFilter(recordId)} and scheduledend ge ${monthStart} and scheduledend le ${monthEnd}`;
    return this.getCount(recordId, filter);
  }

  async getDueThisYearCount(recordId: string): Promise<number> {
    const { yearStart, yearEnd } = this.getDateBoundaries();
    const filter = `${this.getOpenFilter(recordId)} and scheduledend ge ${yearStart} and scheduledend le ${yearEnd}`;
    return this.getCount(recordId, filter);
  }

  async getLastActivity(recordId: string, activityTypeFilter?: string): Promise<ILastActivity | null> {
    const filter = `_regardingobjectid_value eq ${this.formatGuid(recordId)}`;
    const select = 'activityid,createdon,modifiedon,activitytypecode,subject,description';
    const orderBy = 'modifiedon desc';
    
    // If activityTypeFilter is specified, we need to fetch multiple records and filter client-side
    // Otherwise, use $top=1 for efficiency
    const needsClientSideFilter = activityTypeFilter && activityTypeFilter.trim().length > 0;
    const topLimit = needsClientSideFilter ? 100 : 1; // Fetch more if filtering needed
    const baseQuery = `?$filter=${encodeURIComponent(filter)}&$select=${select}&$orderby=${orderBy}&$top=${topLimit}`;

    console.log('[ActivityDataService] getLastActivity called:', {
      recordId,
      activityTypeFilter,
      needsClientSideFilter,
      topLimit
    });

    let response: any;
    try {
      response = await this._webAPI.retrieveMultipleRecords(
        'activitypointer',
        baseQuery + `&$expand=createdby($select=fullname),modifiedby($select=fullname)`
      );
    } catch {
      try {
        response = await this._webAPI.retrieveMultipleRecords('activitypointer', baseQuery);
      } catch (error) {
        console.error('[ActivityDataService] Error getting last activity:', error);
        return null;
      }
    }

    if (!response || !response.entities || response.entities.length === 0) {
      console.log('[ActivityDataService] getLastActivity: No activities found');
      return null;
    }

    // If filtering by activity type, filter client-side
    let activities = response.entities;
    if (needsClientSideFilter && activityTypeFilter) {
      const filterCode = parseInt(activityTypeFilter.trim(), 10);
      if (!isNaN(filterCode)) {
        console.log('[ActivityDataService] getLastActivity: Filtering by type code', filterCode);
        activities = activities.filter((activity: any) => {
          // Extract activity type code from the activity entity
          let typeCode: number | null = null;
          const rawValue = activity.activitytypecode;
          
          if (rawValue !== undefined && rawValue !== null) {
            if (typeof rawValue === 'object' && 'Value' in rawValue) {
              typeCode = rawValue.Value;
            } else if (typeof rawValue === 'string') {
              const numericCode = parseInt(rawValue, 10);
              if (!isNaN(numericCode)) {
                typeCode = numericCode;
              } else {
                const lowerValue = rawValue.toLowerCase();
                typeCode = ActivityDataService.ENTITY_NAME_TO_CODE[lowerValue] || null;
              }
            } else {
              typeCode = rawValue;
            }
          }
          
          const matches = typeCode !== null && !isNaN(typeCode) && typeCode === filterCode;
          console.log('[ActivityDataService] getLastActivity: Activity match check', {
            activityid: activity.activityid,
            rawActivityTypeCode: rawValue,
            typeCode,
            filterCode,
            matches
          });
          return matches;
        });
        
        console.log('[ActivityDataService] getLastActivity: Filtered results', {
          before: response.entities.length,
          after: activities.length
        });
      } else {
        console.warn('[ActivityDataService] getLastActivity: Invalid activity type filter', activityTypeFilter);
      }
    }

    if (activities.length > 0) {
      const activity = activities[0] as any;
      
      // Handle activitytypecode - it might be a number or an OptionSetValue object
      // Preserve as string for consistency, but log the raw value for debugging
      let activityTypeCode = '';
      let rawActivityTypeCode: any = activity.activitytypecode;
      
      if (activity.activitytypecode !== undefined && activity.activitytypecode !== null) {
        if (typeof activity.activitytypecode === 'object' && 'Value' in activity.activitytypecode) {
          // OptionSetValue object
          rawActivityTypeCode = activity.activitytypecode.Value;
          activityTypeCode = rawActivityTypeCode?.toString() || '';
        } else {
          // Plain number or string
          rawActivityTypeCode = activity.activitytypecode;
          activityTypeCode = rawActivityTypeCode.toString();
        }
      }
      
      console.log('[ActivityDataService] Retrieved activity:', {
        activityid: activity.activityid,
        rawActivityTypeCode: rawActivityTypeCode,
        rawActivityTypeCodeType: typeof rawActivityTypeCode,
        parsedActivityTypeCode: activityTypeCode,
        parsedActivityTypeCodeType: typeof activityTypeCode,
      });
      
      return {
        activityid: activity.activityid || '',
        createdon: activity.createdon || '',
        createdbyname: activity.createdby?.fullname ?? null,
        modifiedon: activity.modifiedon || '',
        modifiedbyname: activity.modifiedby?.fullname ?? null,
        activitytypecode: activityTypeCode,
        subject: activity.subject || null,
        description: activity.description || null,
      };
    }
    return null;
  }
}

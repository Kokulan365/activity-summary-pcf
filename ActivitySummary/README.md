# Activity Summary PCF Control

[![Version](https://img.shields.io/badge/version-1.4.9-blue.svg)](https://github.com/Kokulan365/activity-summary-pcf)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Power Apps](https://img.shields.io/badge/Power%20Apps-PCF-orange.svg)](https://powerapps.microsoft.com/)

A comprehensive Power Apps Component Framework (PCF) standard control that displays an Activity Summary card on model-driven forms. This control provides real-time activity metrics, due date filtering, and detailed last activity information for any record in Dataverse.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Property Reference](#property-reference)
- [Configuration Examples](#configuration-examples)
- [Activity Type Codes](#activity-type-codes)
- [Usage Scenarios](#usage-scenarios)
- [Technical Details](#technical-details)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

The Activity Summary control provides a comprehensive view of all activities associated with the current record through an intuitive, card-based interface. It displays:

- **Activity Metrics**: Total, open, overdue, and due date-based activity counts
- **Last Activity Details**: Most recently modified activity with expandable description
- **Quick Navigation**: One-click access to open activity records
- **Full Customization**: Complete control over labels, colors, and visibility

Perfect for Account, Contact, Opportunity, or any custom entity where activity visibility is important.

## ✨ Features

### Core Functionality

- ✅ **Total Activities Count**: Displays the total number of activities associated with the record
- ✅ **Open Activities Count**: Shows the count of open activities (statecode = 0)
- ✅ **Overdue Activities**: Count of open activities past their due date
- ✅ **Due Date Filters**: Activities due today, this week, this month, or this year
- ✅ **Last Activity Details**: Most recently modified activity with:
  - Activity type, subject, and description
  - Created/modified dates and users
  - Expandable description (configurable max lines)
  - HTML rendering for email descriptions
- ✅ **Activity Type Filtering**: Filter activities by type codes (e.g., Tasks only, Emails only)
- ✅ **Open Activity Button**: Quick navigation to activity record (opens in new tab)

### Customization

- 🎨 **Visual Customization**: Customize banner, tile footer, card title, and button colors
- 🏷️ **Label Customization**: All text labels are configurable
- 👁️ **Visibility Control**: Show/hide any section or field
- 🎯 **Icon Control**: Toggle tile icons on/off
- 🌓 **Theme Support**: Works seamlessly in both light and dark themes

### Performance

- ⚡ **Optimized Queries**: Uses efficient Web API queries with minimal requests
- 🔄 **Parallel Execution**: All queries run simultaneously using Promise.all()
- 💾 **Smart Caching**: Refreshes only when record or filters change
- 📊 **Minimal Data**: Retrieves only necessary fields

## 🚀 Installation

### Prerequisites

- Node.js (v14 or higher recommended)
- npm or yarn
- Power Platform CLI (pac CLI)
- Access to a Dataverse environment

### Option 1: Install from Managed Solution (Recommended)

1. **Download the managed solution**:
   - Go to [Releases](https://github.com/Kokulan365/activity-summary-pcf/releases)
   - Download `ActivitySummary-v1.4.9-Managed.zip` from the latest release

2. **Import to Dataverse**:
   - Go to https://make.powerapps.com
   - Navigate to **Solutions** → **Import**
   - Select the downloaded ZIP file
   - Follow the import wizard
   - **Publish all customizations**

3. **Add to Form**:
   - Open any model-driven form (Account, Contact, Opportunity, etc.)
   - Edit the form
   - Click **+ Add component**
   - Under **Custom**, find **Activity Summary**
   - Drag it onto the form
   - Configure properties (optional)
   - **Save** and **Publish**

### Option 2: Build from Source

#### 1. Install Power Platform CLI

```bash
npm install -g @microsoft/powerplatform-cli
```

#### 2. Clone Repository

```bash
git clone https://github.com/Kokulan365/activity-summary-pcf.git
cd activity-summary-pcf/ActivitySummary
```

#### 3. Install Dependencies

```bash
npm install
```

#### 4. Build the Control

```bash
npm run build
```

#### 5. Create Solution and Import

```bash
# Create solution with recommended publisher
pac solution init --publisher-name "Kokulan Eswaranathan" --publisher-prefix "ke365"

# Add PCF control reference
pac solution add-reference --path "./ActivitySummary"

# Build solution
pac solution build

# Import to Dataverse
pac solution import --path "bin/Debug/Solution1.zip"
```

## 🏃 Quick Start

After installing the control:

1. **Add to Form**: Edit any model-driven form and add the Activity Summary component
2. **Configure** (optional): Customize colors, labels, or visibility in the component properties
3. **Publish**: Save and publish the form
4. **View**: Open a record with activities to see the summary

**That's it!** The control works out of the box with sensible defaults.

## 📖 Property Reference

The control supports **40+ configurable properties** organized into logical groups. All properties are optional and have sensible defaults.

### Visual Customization Properties

Control the appearance of the card, banner, and buttons.

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `bannerColor` | Single Line of Text | `#2B579A` | Hex color code for the top banner. Example: `#0078D4` for Microsoft blue, `#107C10` for green. |
| `tileFooterColor` | Single Line of Text | `#107c10` | Hex color code for the accent bar at the bottom of each KPI tile. Example: `#0078D4` for blue accent. |
| `cardTitleLabel` | Single Line of Text | `Activities` | Title displayed at the top of the card. Can be customized for different contexts (e.g., "Activity Overview", "Recent Activities"). |
| `showCardTitle` | Two Options | `Yes` | Toggle to show or hide the card title. Set to `No` to remove the title completely. |
| `cardTitleColor` | Single Line of Text | `#323130` | Hex color code for the card title text. Use `#000000` for black, `#FFFFFF` for white (on dark backgrounds). |
| `buttonBackgroundColor` | Single Line of Text | `#0078d4` | Hex color code for the "Open Activity" button background. Example: `#107C10` for green button. |
| `buttonTextColor` | Single Line of Text | `#ffffff` | Hex color code for the button text. Typically `#FFFFFF` (white) for good contrast. |

**Example Configuration:**
```
bannerColor: #0078D4
cardTitleLabel: Activity Overview
buttonBackgroundColor: #107C10
```

### Tile Section Properties

Control which KPI tiles are displayed and their labels.

#### Visibility Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `showTileSection` | Two Options | `Yes` | Master toggle for the entire KPI tiles section. Set to `No` to hide all tiles. |
| `showTileIcons` | Two Options | `Yes` | Toggle to show/hide icons on tiles. Set to `No` for a cleaner, icon-free look. |
| `showTotalActivities` | Two Options | `Yes` | Show the total activities count tile. |
| `showOpenActivities` | Two Options | `Yes` | Show the open activities count tile. |
| `showOverdueActivities` | Two Options | `No` | Show the overdue activities count tile. Overdue = open activities past their scheduled end date. |
| `showDueToday` | Two Options | `No` | Show activities due today tile. |
| `showDueThisWeek` | Two Options | `No` | Show activities due this week tile (Monday-Sunday). |
| `showDueThisMonth` | Two Options | `No` | Show activities due this month tile. |
| `showDueThisYear` | Two Options | `No` | Show activities due this year tile. |

#### Label Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `totalActivitiesLabel` | Single Line of Text | `Total activities` | Label for total activities tile. Example: "All Activities", "Total Count". |
| `openActivitiesLabel` | Single Line of Text | `Open activities` | Label for open activities tile. Example: "Pending", "In Progress". |
| `overdueActivitiesLabel` | Single Line of Text | `Overdue activities` | Label for overdue activities tile. Example: "Past Due", "Overdue Items". |
| `dueTodayLabel` | Single Line of Text | `Due today` | Label for due today tile. Example: "Due Today", "Today's Tasks". |
| `dueThisWeekLabel` | Single Line of Text | `Due this week` | Label for due this week tile. Example: "This Week", "Week's Tasks". |
| `dueThisMonthLabel` | Single Line of Text | `Due this month` | Label for due this month tile. Example: "This Month", "Monthly Tasks". |
| `dueThisYearLabel` | Single Line of Text | `Due this year` | Label for due this year tile. Example: "This Year", "Annual Tasks". |

#### Filtering Property

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `includedActivityTypes` | Single Line of Text | _(empty)_ | Comma-separated list of activity type codes to include in tile counts. Leave empty to include all types. **Format**: `"4212,4207"` (no spaces, comma-separated). **Examples**: `"4212"` (Tasks only), `"4212,4207"` (Tasks and Phone Calls), `"4201"` (Emails only). See [Activity Type Codes](#activity-type-codes) for full list. |

**Example Configuration:**
```
showOverdueActivities: Yes
showDueToday: Yes
showDueThisWeek: Yes
includedActivityTypes: 4212,4207
totalActivitiesLabel: All Tasks & Calls
```

### Last Activity Section Properties

Control the display of the last activity details section.

#### Visibility Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `showLastActivitySection` | Two Options | `Yes` | Master toggle for the entire last activity section. Set to `No` to hide completely. |
| `showCreatedOn` | Two Options | `Yes` | Show the "Created on" date/time field. |
| `showCreatedBy` | Two Options | `Yes` | Show the "Created by" user field. |
| `showModifiedOn` | Two Options | `No` | Show the "Modified on" date/time field. |
| `showModifiedBy` | Two Options | `No` | Show the "Modified by" user field. |
| `showType` | Two Options | `Yes` | Show the activity type (e.g., "Email", "Task") in the section header. |
| `showSubject` | Two Options | `Yes` | Show the activity subject field. |
| `showDescription` | Two Options | `Yes` | Show the activity description field. |

#### Description Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `maxDescriptionLines` | Whole Number | `6` | Maximum number of lines to display before truncating with "Read more" button. Valid range: 1-20. Lower values (3-5) for compact views, higher (10-15) for detailed views. |

#### Filtering Property

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `lastActivityTypeFilter` | Single Line of Text | _(empty)_ | Activity type code to filter the last activity display. Leave empty to show the last activity of any type. **Format**: Single code only (e.g., `"4212"` for Tasks only). See [Activity Type Codes](#activity-type-codes) for full list. |

#### Label Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `lastActivitySectionLabel` | Single Line of Text | `Last activity` | Header text for the last activity section. Example: "Most Recent Activity", "Latest Update". |
| `lastActivityCreatedOnLabel` | Single Line of Text | `Created on` | Label for created on field. Example: "Created", "Date Created". |
| `lastActivityCreatedByLabel` | Single Line of Text | `Created by` | Label for created by field. Example: "Creator", "Author". |
| `lastActivityModifiedOnLabel` | Single Line of Text | `Modified on` | Label for modified on field. Example: "Last Modified", "Updated". |
| `lastActivityModifiedByLabel` | Single Line of Text | `Modified by` | Label for modified by field. Example: "Last Modified By", "Editor". |
| `lastActivityTypeLabel` | Single Line of Text | `Type` | Label for activity type field (if shown separately). |
| `lastActivitySubjectLabel` | Single Line of Text | `Subject` | Label for subject field. Example: "Title", "Topic". |
| `lastActivityDescriptionLabel` | Single Line of Text | `Description` | Label for description field. Example: "Details", "Notes". |

#### Button Property

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `openActivityButtonLabel` | Single Line of Text | _(empty)_ | Custom label for the "Open Activity" button. If empty, button text is dynamic based on activity type (e.g., "Open Email", "Open Task"). **Example**: `"View Details"` for a static label. |

**Example Configuration:**
```
showLastActivitySection: Yes
showModifiedOn: Yes
showModifiedBy: Yes
maxDescriptionLines: 10
lastActivityTypeFilter: 4212
lastActivitySectionLabel: Most Recent Task
```

### Other Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `showVersion` | Two Options | `No` | Display the control version number at the bottom of the card. Useful for debugging and development environments. |
| `anchorField` | Single Line of Text (Bound) | - | Bind any column (e.g., Name) so this control appears in the form. The value is not used by the control - it's only for form placement. |

## 🎨 Configuration Examples

### Example 1: Minimal Configuration (Tasks Only)

Show only Tasks with minimal information:

```
showTileSection: Yes
showTotalActivities: Yes
showOpenActivities: Yes
showOverdueActivities: Yes
showDueToday: Yes
showDueThisWeek: No
showDueThisMonth: No
showDueThisYear: No
includedActivityTypes: 4212
showLastActivitySection: Yes
lastActivityTypeFilter: 4212
showCreatedOn: Yes
showCreatedBy: Yes
showModifiedOn: No
showModifiedBy: No
showDescription: Yes
maxDescriptionLines: 5
```

### Example 2: Comprehensive View (All Activities)

Show all activities with full details:

```
showTileSection: Yes
showTotalActivities: Yes
showOpenActivities: Yes
showOverdueActivities: Yes
showDueToday: Yes
showDueThisWeek: Yes
showDueThisMonth: Yes
showDueThisYear: Yes
includedActivityTypes: (empty - all types)
showLastActivitySection: Yes
lastActivityTypeFilter: (empty - any type)
showCreatedOn: Yes
showCreatedBy: Yes
showModifiedOn: Yes
showModifiedBy: Yes
showDescription: Yes
maxDescriptionLines: 10
```

### Example 3: Custom Branding

Match your organization's colors:

```
bannerColor: #107C10
tileFooterColor: #0078D4
cardTitleLabel: Activity Dashboard
cardTitleColor: #000000
buttonBackgroundColor: #107C10
buttonTextColor: #FFFFFF
```

### Example 4: Compact View

Minimal display for space-constrained forms:

```
showCardTitle: No
showTileSection: Yes
showTotalActivities: Yes
showOpenActivities: Yes
showOverdueActivities: No
showDueToday: No
showDueThisWeek: No
showDueThisMonth: No
showDueThisYear: No
showTileIcons: No
showLastActivitySection: Yes
showCreatedOn: No
showCreatedBy: No
showModifiedOn: Yes
showModifiedBy: No
showDescription: Yes
maxDescriptionLines: 3
```

## 🔢 Activity Type Codes

The control uses numeric codes to identify activity types. Use these codes in `includedActivityTypes` and `lastActivityTypeFilter` properties.

| Code | Entity Name | Display Name | Common Use Cases |
|------|-------------|--------------|------------------|
| `4201` | `email` | Email | Email communications, follow-ups |
| `4202` | `fax` | Fax | Fax documents (legacy) |
| `4204` | `letter` | Letter | Physical mail correspondence |
| `4207` | `phonecall` | Phone Call | Phone conversations, call logs |
| `4210` | `appointment` | Appointment | Meetings, calendar events |
| `4212` | `task` | Task | To-do items, action items |
| `4214` | `recurringappointmentmaster` | Recurring Appointment | Recurring meetings |
| `4216` | `socialactivity` | Social Activity | Social media interactions |
| `4251` | `msdyn_ocliveworkitem` | Teams Chat | Microsoft Teams conversations |

### Using Activity Type Codes

**Filter tiles to show only Tasks and Phone Calls:**
```
includedActivityTypes: 4212,4207
```

**Show last Email activity only:**
```
lastActivityTypeFilter: 4201
```

**Show only Tasks in both tiles and last activity:**
```
includedActivityTypes: 4212
lastActivityTypeFilter: 4212
```

**Note**: Unknown codes are displayed as-is. If you use a custom activity type, use its numeric code.

## 💡 Usage Scenarios

### Scenario 1: Account Management Dashboard

**Goal**: Show all activity types with focus on overdue items.

**Configuration**:
- Enable all tiles including overdue
- Show due dates (today, week, month)
- Display full last activity details
- Use professional blue color scheme

### Scenario 2: Task Management Focus

**Goal**: Focus only on Tasks for project management.

**Configuration**:
- Filter to Tasks only (`includedActivityTypes: 4212`)
- Show overdue and due date tiles
- Display last Task with full details
- Compact description (3-4 lines)

### Scenario 3: Customer Service View

**Goal**: Show all communication activities (Email, Phone, Teams).

**Configuration**:
- Filter to communication types (`includedActivityTypes: 4201,4207,4251`)
- Show open activities prominently
- Display last communication with full description
- Enable modified date/user to track updates

### Scenario 4: Executive Summary

**Goal**: High-level overview with minimal details.

**Configuration**:
- Show only total and open activities
- Hide due date filters
- Show last activity type and subject only
- Hide description and metadata
- Compact card design

## 🔧 Technical Details

### Architecture

- **Framework**: React 18.2.0 with TypeScript
- **Build Tool**: Webpack (via pcf-scripts)
- **API**: Dataverse Web API v9.2
- **Styling**: CSS with CSS variables for theming

### Data Queries

The control makes efficient Web API requests:

#### 1. Total Activities Count
```
GET /api/data/v9.2/activitypointers?
  $filter=_regardingobjectid_value eq {guid}
  &$select=activityid
  &$count=true
```

#### 2. Open Activities Count
```
GET /api/data/v9.2/activitypointers?
  $filter=_regardingobjectid_value eq {guid} and statecode eq 0
  &$select=activityid
  &$count=true
```

#### 3. Overdue Activities Count
```
GET /api/data/v9.2/activitypointers?
  $filter=_regardingobjectid_value eq {guid} 
    and statecode eq 0 
    and scheduledend lt {currentDateTime}
  &$select=activityid
  &$count=true
```

#### 4. Due Date Filters
Similar queries with date range filters on `scheduledend` field.

#### 5. Last Activity
```
GET /api/data/v9.2/activitypointers?
  $filter=_regardingobjectid_value eq {guid}
  &$select=activityid,createdon,modifiedon,activitytypecode,subject,description
  &$expand=createdby($select=fullname),modifiedby($select=fullname)
  &$orderby=modifiedon desc
  &$top=1
```

### Performance Optimizations

1. **Parallel Execution**: All count queries run simultaneously using `Promise.all()`
2. **Efficient Counting**: Uses `$count=true` when activity type filtering is not applied
3. **Minimal Fields**: Only retrieves necessary fields with `$select`
4. **Smart Filtering**: Client-side filtering when activity type codes are specified
5. **Caching**: Results cached until record ID or filters change
6. **Top Limit**: Uses `$top=1` for last activity query

### Activity Type Handling

The control handles activity types in multiple formats:
- **Numeric codes**: `4201`, `4212`, etc.
- **Entity names**: `email`, `task`, etc.
- **OptionSetValue objects**: Automatically extracts numeric value

All formats are normalized and mapped to display names.

### Description Rendering

- **Email Activities**: Renders HTML content with proper formatting
- **Other Activities**: Renders plain text with HTML stripped
- **Truncation**: Uses CSS `line-clamp` for multi-line truncation
- **Expand/Collapse**: "Read more" button appears when content exceeds `maxDescriptionLines`

### Navigation

The control uses the official PCF Navigation API to open activity forms:
- **Primary**: `context.navigation.openForm()` (recommended)
- **Fallback**: URL-based navigation if API unavailable
- **New Tab**: Always opens in new tab for better UX

## 🐛 Troubleshooting

### Control Not Loading

**Symptoms**: Control shows "Loading..." indefinitely or doesn't appear.

**Solutions**:
1. Verify solution is imported and published
2. Check browser console (F12) for JavaScript errors
3. Ensure form is published after adding control
4. Clear browser cache and reload
5. Verify Web API permissions for the user

### No Data Showing

**Symptoms**: Control loads but shows "0" for all counts or "No activity found".

**Solutions**:
1. Verify record has activities (check Timeline view)
2. Check browser console for API errors (F12 → Console)
3. Verify Web API permissions (user needs Read permission on Activity Pointer)
4. Check `includedActivityTypes` filter - may be filtering out all activities
5. Verify record ID is valid (control should auto-detect)

### Incorrect Counts

**Symptoms**: Counts don't match what's visible in Timeline.

**Solutions**:
1. Check `includedActivityTypes` filter - may be excluding some types
2. Verify activity state codes (open = statecode = 0)
3. Check date filters - due date filters only show open activities
4. Ensure activities are properly associated with the record (`regardingobjectid`)

### Styling Issues

**Symptoms**: Colors not applying, layout broken, or theme conflicts.

**Solutions**:
1. Clear browser cache completely
2. Verify CSS file is included in manifest (should be automatic)
3. Check for conflicting CSS in custom themes
4. Verify hex color format (must be `#RRGGBB` format)
5. Test in different browsers (Edge, Chrome)

### Button Not Opening Activity

**Symptoms**: "Open Activity" button doesn't work or opens wrong form.

**Solutions**:
1. Check browser console for navigation errors
2. Verify activity ID exists and is valid
3. Check activity type code mapping (see [Activity Type Codes](#activity-type-codes))
4. Ensure user has Read permission on the activity entity
5. Try different browser (popup blockers may interfere)

### Description Not Expanding

**Symptoms**: "Read more" button doesn't appear or doesn't work.

**Solutions**:
1. Verify `showDescription` is set to `Yes`
2. Check `maxDescriptionLines` value (should be > 0)
3. Ensure description content exists and exceeds the line limit
4. Check browser console for JavaScript errors

### Performance Issues

**Symptoms**: Control loads slowly or causes form lag.

**Solutions**:
1. Reduce number of visible tiles (disable unused ones)
2. Use activity type filtering to reduce query scope
3. Check network tab for slow API calls
4. Verify Dataverse environment performance
5. Consider reducing `maxDescriptionLines` for faster rendering

## 📝 Development

### Project Structure

```
ActivitySummary/
├── ControlManifest.Input.xml    # PCF manifest with all properties
├── index.ts                     # Main control entry point
├── ActivitySummaryCard.tsx      # React component (UI)
├── ActivityDataService.ts       # Data service (Web API queries)
├── types.ts                     # TypeScript interfaces
├── TileIcons.tsx               # SVG icon components
├── css/
│   └── ActivitySummary.css     # Styles and theming
├── strings/
│   └── ActivitySummary.1033.resx # Resource strings (labels)
├── package.json                 # Dependencies and scripts
├── tsconfig.json                # TypeScript configuration
└── README.md                    # This file
```

### Development Commands

```bash
# Build the control
npm run build

# Clean build artifacts
npm run clean

# Rebuild (clean + build)
npm run rebuild

# Start development server (test harness)
npm run start

# Refresh type definitions
npm run refreshTypes
```

### Testing Locally

1. **Start Test Harness**:
   ```bash
   npm run start
   ```

2. **Configure Connection**:
   - Enter your Dataverse environment URL
   - Authenticate with your credentials

3. **Test Properties**:
   - Modify property values in the test harness
   - Verify UI updates correctly
   - Test different activity types and scenarios

### Building for Production

```bash
# 1. Build the PCF control
cd ActivitySummary
npm run build

# 2. Create solution (from parent directory)
cd ..
pac solution init --publisher-name "Kokulan Eswaranathan" --publisher-prefix "ke365"
pac solution add-reference --path "./ActivitySummary"

# 3. Build managed solution
dotnet msbuild SolutionKE/SolutionKE.cdsproj /t:Build /p:Configuration=Release
```

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Report Issues**: Found a bug? [Open an issue](https://github.com/Kokulan365/activity-summary-pcf/issues)
2. **Suggest Features**: Have an idea? [Create a feature request](https://github.com/Kokulan365/activity-summary-pcf/issues)
3. **Submit Pull Requests**: 
   - Fork the repository
   - Create your feature branch (`git checkout -b feature/AmazingFeature`)
   - Commit your changes (`git commit -m 'Add some AmazingFeature'`)
   - Push to the branch (`git push origin feature/AmazingFeature`)
   - Open a Pull Request

### Development Guidelines

- Follow existing code style and patterns
- Add comments for complex logic
- Update documentation for new features
- Test thoroughly before submitting PR
- Ensure TypeScript compiles without errors

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Power Apps Component Framework](https://learn.microsoft.com/power-apps/developer/component-framework/)
- Uses [React](https://react.dev/) for UI components
- Thanks to the PCF community for feedback and support

## 📞 Support

- **GitHub Issues**: [Report issues or ask questions](https://github.com/Kokulan365/activity-summary-pcf/issues)
- **Documentation**: This README and inline code comments
- **Releases**: Check [Releases](https://github.com/Kokulan365/activity-summary-pcf/releases) for latest version

## 📚 Additional Resources

- [Power Apps Component Framework Documentation](https://learn.microsoft.com/power-apps/developer/component-framework/)
- [PCF Gallery](https://pcf.gallery/) - Discover more PCF controls
- [Power Platform CLI Documentation](https://learn.microsoft.com/power-platform/developer/cli/introduction)

---

**Made with ❤️ by [Kokulan Eswaranathan](https://github.com/Kokulan365)**

**Version**: 1.4.9 | **Last Updated**: February 2026

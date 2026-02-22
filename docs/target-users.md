# C-Madong Target Users Document

> **Version**: 1.0
> **Last Updated**: 2026-02-21
> **Author**: Khaoklong (Product Designer)
> **Status**: Draft

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Target Audience Profile](#target-audience-profile)
3. [User Personas](#user-personas)
4. [User Research Insights](#user-research-insights)
5. [Opportunity Areas](#opportunity-areas)
6. [User Journey Maps](#user-journey-maps)

---

## Executive Summary

C-Madong serves a diverse ecosystem of **four primary user types** within Chulalongkorn University dormitories:

| User Type | Primary Role | Key Motivations | Pain Points |
|-----------|-------------|-----------------|-------------|
| **Students** | Dorm residents | Convenience, staying informed, quick issue resolution | Disconnected communication channels, manual processes |
| **Staff** | Daily operations | Efficiency, visibility, task management | Information silos, manual tracking |
| **Admins** | Strategic oversight | Data-driven decisions, control, oversight | Fragmented data, lack of analytics |
| **Committee** | Student representation | Advocacy, bridge between students & admin | Limited access, delayed information |

**Key Insight**: All user groups suffer from **fragmented communication** and **manual processes**. LINE is the unifying platform—everyone already uses it daily. The opportunity is to create a **unified digital layer** that streamlines operations while meeting each user type where they already are.

---

## Target Audience Profile

### Demographic Overview

#### Students (Primary Users)
- **Age**: 18-25 years old
- **Education**: Undergraduate and graduate students at Chulalongkorn University
- **Tech Literacy**: High—smartphone-native, active social media users
- **Devices**: Primarily mobile (Android/iOS), some laptop use for academics
- **Language**: Bilingual (Thai native, English proficient)
- **Dorm Population**: ~1,000-2,000 residents across multiple buildings

#### Staff (Operational Users)
- **Age**: 25-55 years old
- **Roles**: Dorm managers, maintenance technicians, administrative staff
- **Tech Literacy**: Moderate—comfortable with mobile apps, prefers simplicity
- **Work Environment**: Mobile (walking around dorm), desktop (office tasks)
- **Language**: Primarily Thai
- **Team Size**: ~20-50 staff members

#### Admins (Strategic Users)
- **Age**: 30-60 years old
- **Roles**: Dorm heads, facility managers, university administrators
- **Tech Literacy**: Moderate to high—comfortable with dashboards and reports
- **Work Environment**: Primarily desktop/laptop
- **Language**: Bilingual (Thai/English)
- **Team Size**: ~5-15 administrators

#### Committee (Student Representatives)
- **Age**: 19-24 years old
- **Roles**: Elected student representatives, dorm committee members
- **Tech Literacy**: High—digital native
- **Work Environment**: Mobile-first, some desktop
- **Language**: Bilingual (Thai/English)
- **Team Size**: ~10-30 committee members

---

### Psychographic Profile

#### Student Psychographics
| Trait | Description | Design Implication |
|-------|-------------|-------------------|
| **Gen-Z Identity** | Digital native, values authenticity, expects instant responses | Real-time notifications, mobile-first, fast loading |
| **Social Connectedness** | Strong peer networks, FOMO, values community | Social features, announcement visibility, peer visibility |
| **Convenience-First** | "Path of least resistance" mindset | LINE Login (no new passwords), minimal forms |
| **Visual Learners** | Prefer images/video over text | Visual Flex messages, photo uploads for maintenance |
| **Instant Gratification** | Expect immediate results | Real-time status updates, instant confirmations |
| **Privacy-Conscious** | Careful about personal data | Clear permissions, data transparency |
| **Bilingual Context** | Code-switch between Thai/English naturally | Seamless language toggle, culturally appropriate UX copy |

#### Staff Psychographics
| Trait | Description | Design Implication |
|-------|-------------|-------------------|
| **Task-Oriented** | Focus on getting jobs done efficiently | Clear workflows, minimal clicks, status tracking |
| **Mobile Workforce** | Often away from desks, in the field | Mobile-optimized admin features, offline support |
| **Time-Pressed** | Managing multiple responsibilities simultaneously | Priority indicators, quick actions, bulk operations |
| **Relationship-Builders** | Personal connections with students | Student profiles visible, communication history |
| **Pragmatic** | Prefer familiar patterns over innovation | Familiar UI patterns, gentle onboarding |

#### Admin Psychographics
| Trait | Description | Design Implication |
|-------|-------------|-------------------|
| **Data-Driven** | Want metrics and insights | Dashboards, analytics, export capabilities |
| **Risk-Averse** | Concerned about compliance and security | Audit logs, role-based access, data validation |
| **Strategic Thinkers** | Focus on big-picture optimization | Analytics, trends, comparison views |
| **Multi-Stakeholder** | Balance student needs with university policies | Flexible policies, configuration options |
| **Time-Pressed** | Managing at scale | Bulk operations, automation features, reporting |

#### Committee Psychographics
| Trait | Description | Design Implication |
|-------|-------------|-------------------|
| **Student Advocates** | Represent student interests | Feedback channels, voting features, visibility into issues |
| **Part-Time Role** | Balance studies with committee responsibilities | Part-time access, simplified workflows |
| **Peer Bridges** | Connect admin decisions with student concerns | Communication tools, announcement drafting |
| **Tech-Savvy** | Comfortable exploring new tools | Early adopters for new features, feedback loops |

---

### Behavioral Patterns

#### Student Behaviors
| Behavior | Frequency | Context | Feature Response |
|----------|-----------|---------|------------------|
| **Check LINE constantly** | 50-100x/day | Always-on, habit | LINE-native experience, push notifications |
| **Report issues immediately** | Ad-hoc | When problems arise | Quick maintenance form, photo upload |
| **Miss announcements** | Recurring | Bulletin boards, scattered info | Pinned announcements, push notifications |
| **Forget deadlines** | Recurring | Bills, check-outs | Reminder system, calendar integration |
| **Ask friends first** | Default | Social validation | FAQ, chatbot, peer support visibility |
| **Screenshot important info** | Often | Digital hoarding | Easy-to-screenshot cards, persistent info |

#### Staff Behaviors
| Behavior | Frequency | Context | Feature Response |
|----------|-----------|---------|------------------|
| **Walk the dorm** | Daily | Physical inspections | Mobile ticket management, geolocation |
| **Prioritize emergencies** | Daily | Reactive triage | Priority indicators, urgent notifications |
| **Track multiple tickets** | Concurrent | Multitasking | Kanban board, status filters |
| **Communicate with students** | Constant | Updates, questions | In-app messaging, LINE notifications |
| **Document work** | Per ticket | Accountability | Notes, photo evidence, status history |

#### Admin Behaviors
| Behavior | Frequency | Context | Feature Response |
|----------|-----------|---------|------------------|
| **Review metrics** | Weekly/Monthly | Strategic planning | Analytics dashboard, trend reports |
| **Broadcast announcements** | Weekly/Monthly | Mass communication | Template library, scheduling, targeting |
| **Manage access** | Per semester | Onboarding/offboarding | Bulk import, role management |
| **Handle escalations** | As needed | Complex issues | Full student history, audit logs |

---

## User Personas

### Persona 1: Nam (Student - Year 2)

**Profile:**
- **Name**: นามสุวรรณ์ (Nam) — นามสุวรรณ์ จงใจกลั่น
- **Age**: 19 years old
- **Year**: 2nd year undergraduate, Faculty of Engineering
- **Dorm**: U-4, 2nd Floor, Room 205
- **LINE Usage**: 8+ hours/day, 50+ friends, active in multiple group chats

**Bio:**
Nam is a typical Gen-Z student who lives on her phone. She's active in student clubs, studies hard, and values her social life. She's comfortable with technology and expects things to "just work." She often misses dorm announcements because they're posted on physical bulletin boards she rarely checks.

**Goals:**
- Wants to report a broken air conditioner quickly without walking to the office
- Needs to stay informed about dorm events and payment deadlines
- Hates carrying physical cards—wants everything digital
- Wants to track when her maintenance request will be resolved

**Frustrations:**
- "Why do I need to fill out a paper form to report something broken?"
- "I never check the bulletin board—I missed the payment deadline again"
- "I don't know if my repair request was even received"
- "Why so many different apps and systems for everything?"

**Tech Comfort:** High—uses multiple apps daily, expects seamless experiences

**Quote:**
> "แค่อยากแจ้งซ่อมแอร์เสีย ทำไมต้องเดินลงหอไปเขียนกระดาษ? ใช้แอปได้ไหมมั้ย?"
> *("I just want to report a broken AC. Why do I have to walk to the office and fill out paper? Can't I just use an app?")*

---

### Persona 2: Golf (Student - Year 4, Committee Member)

**Profile:**
- **Name**: กอล์ฟ — กิตติพงษ์ สุขสันต์
- **Age**: 21 years old
- **Year**: 4th year undergraduate, Faculty of Arts
- **Dorm**: U-3, 4th Floor, Room 412
- **Role**: Dorm Committee Member (Head of Communications)

**Bio:**
Golf is an active student leader who balances his studies with committee responsibilities. He's the bridge between students and dorm administration. He cares deeply about student welfare and wants to improve dorm life. He often hears student complaints but lacks tools to track and advocate for changes systematically.

**Goals:**
- Wants to understand common student complaints and issues
- Needs to communicate admin decisions to students effectively
- Wants to track maintenance patterns (e.g., "Why does U-4 have so many AC issues?")
- Needs to draft announcements that resonate with students

**Frustrations:**
- "Students complain to me, but I have no data to take to admin"
- "I write announcements in Word, copy-paste to LINE, format breaks—so tedious"
- "I don't know which buildings have the most problems—is it just U-4?"
- "Committee work is 80% manual coordination, 20% actual impact"

**Tech Comfort:** Very high—explores new tools, builds simple automations

**Quote:**
> "นิสิตบอกปัญหากับผมมากมาย แต่ผมไม่มีข้อมูลมาเป็นรูปธรรม เลยเสนอกับเจ้าหน้าที่ไม่ได้สักที"
> *("Students tell me about so many problems, but I don't have concrete data, so I can never properly propose solutions to the staff.")*

---

### Persona 3: Auntie Malee (Staff - Dorm Manager)

**Profile:**
- **Name**: คุณมาลี (Auntie Malee)
- **Age**: 48 years old
- **Role**: Dorm Manager, U-4 Building
- **Experience**: 15 years managing dormitories
- **Tech Comfort**: Moderate—uses LINE, Facebook, basic office apps

**Bio:**
Auntie Malee has managed U-4 for over a decade. She knows every student by name and takes pride in creating a welcoming environment. She's overwhelmed by paperwork, manual tracking, and constantly walking between the office and dorm rooms. She cares deeply about students but struggles with the administrative burden.

**Goals:**
- Wants to respond to student issues quickly
- Needs to track which technician is assigned to which ticket
- Wants to broadcast announcements to students without formatting issues
- Needs to know which rooms have ongoing issues for follow-up

**Frustrations:**
- "I write maintenance requests in a notebook, then I have to call technicians—so inefficient"
- "Students LINE me directly at all hours—I need boundaries"
- "I don't know which tickets are overdue until a student complains again"
- "I want to target announcements to specific floors, but I have to create multiple LINE groups"

**Tech Comfort:** Moderate—comfortable with mobile apps, prefers familiar patterns

**Quote:**
> "น้องๆ เมนท์มาหาผมตามไลน์ตลอด ก็ช่วยอะไรไม่ได้ เพราะไม่รู้ว่าใครเป็นช่างที่รับผิดชอบห้องนั้นๆ"
> *("Students message me on LINE all the time, but I can't help because I don't know which technician is responsible for that room.")*

---

### Persona 4: Uncle Somchai (Staff - Maintenance Technician)

**Profile:**
- **Name**: ลุงสมชาย (Uncle Somchai)
- **Age**: 52 years old
- **Role**: Senior Maintenance Technician
- **Specialization**: Electrical & AC
- **Experience**: 20 years in facility maintenance

**Bio:**
Uncle Somchai is a seasoned technician who takes pride in his work. He's practical and hands-on. He receives assignments via phone calls or paper notes, which he often loses. He wants clear instructions and photos before visiting a room so he can bring the right tools.

**Goals:**
- Wants to see the problem before arriving (photos help)
- Needs to know if students are available for access
- Wants to update ticket status without calling the office
- Needs to track his completed work for the day

**Frustrations:**
- "I arrive at a room, but the student isn't there—wasted trip"
- "No photo of the problem—I brought the wrong tools"
- "I fixed it, but the student complained again because nobody told them it was done"
- "Paper notes get lost—I don't remember all my assignments"

**Tech Comfort:** Low to moderate—prefers simple, clear interfaces

**Quote:**
> "ถ้ามีรูปปัญหามาด้วย ผมจะได้รู้ว่าต้องเอาอะไรไปซ่อม ไม่ต้องเดินขึ้นลงห้องซ้ำๆ"
> *("If there's a photo of the problem, I'll know what tools to bring. I won't have to walk up and down multiple times.")*

---

### Persona 5: Dr. Chai (Admin - Dorm Head)

**Profile:**
- **Name**: Dr. ชัยวุฒิ (Dr. Chai)
- **Age**: 54 years old
- **Role**: Head of Dormitory Management
- **Experience**: 10 years in administration, former academic
- **Tech Comfort:** Moderate to high—comfortable with dashboards and reports

**Bio:**
Dr. Chai oversees all dormitories. He's strategic and data-driven but lacks visibility into day-to-day operations. He makes decisions based on anecdotal evidence because there's no centralized data. He wants to improve efficiency but doesn't know where the biggest bottlenecks are.

**Goals:**
- Wants data-driven insights to optimize operations
- Needs to track maintenance response times and student satisfaction
- Wants to broadcast targeted announcements efficiently
- Needs to manage access control as staff roles change

**Frustrations:**
- "I have no idea what our average response time is—is it 1 day or 1 week?"
- "Students complain about slow repairs, but I can't prove it to the university"
- "I want to send announcements to specific buildings, but I have to create multiple LINE groups"
- "When staff leave, I have to manually update access across multiple systems"

**Tech Comfort:** Moderate to high—values reports and analytics

**Quote:**
> "ผมไม่รู้ว่าปัญหาใหญ่สุดคืออะไร แอร์เสีย? ประปารั่ว? ทำไมต้องเดินถามลุงสมชายทุกวัน ถึงจะรู้ว่าวันนี้เขาซ่อมอะไรอยู่"
> *("I don't know what our biggest problem is. Broken ACs? Leaking pipes? Why do I have to ask Uncle Somchai every day to find out what he's working on?")*

---

### Persona 6: Nong Ploy (Student - Year 1, Freshman)

**Profile:**
- **Name**: พลอย (Nong Ploy)
- **Age**: 18 years old
- **Year**: 1st year undergraduate, Faculty of Science
- **Dorm**: U-2, 1st Floor, Room 108
- **Tech Comfort:** High—digital native, new to dorm life

**Bio:**
Ploy just moved into the dorm and is still learning the ropes. She's anxious about doing something wrong and doesn't know who to ask for help. She misses important announcements because she doesn't know where to look. She wants clear guidance and reassurance.

**Goals:**
- Wants to know how everything works (check-in, maintenance, payments)
- Needs clear onboarding so she doesn't miss deadlines
- Wants to ask questions without feeling stupid
- Needs reassurance that she's following the right process

**Frustrations:**
- "I don't know who to ask—so I just ask my friends"
- "I missed the announcement about check-out procedure because I didn't know where to look"
- "I'm scared to report something wrong in case I get blamed for it"
- "Everything feels so disorganized—is this normal?"

**Tech Comfort:** High—digital native, but new to dorm systems

**Quote:**
> "ไม่รู้ว่าต้องทำยังไง ก็ถามเพื่อนๆ แต่เพื่อนก็ไม่รู้เหมือนกัน ช่วยมี manual หน่อยได้ไหม"
> *("I don't know what to do, so I ask my friends, but they don't know either. Can we have a manual or something?")*

---

## User Research Insights

### Key Research Findings

#### 1. LINE is the Universal Channel
**Finding**: All user groups are already active on LINE daily.
- **Students**: 50+ messages/day, primary communication channel
- **Staff**: Use LINE groups for coordination, messaging students
- **Admin**: Use LINE for urgent communications

**Implication**:
- LINE Login reduces friction (no new passwords)
- LINE push notifications ensure visibility
- LINE Flex Messages enable rich, visual communication
- LIFF mini app provides seamless in-app experience

#### 2. Communication is Fragmented
**Finding**: Information is scattered across multiple channels:
- Physical bulletin boards (easily missed)
- LINE groups (noisy, unstructured)
- Paper forms (lost, delayed)
- Word of mouth (inaccurate)

**Implication**:
- Centralized notification hub with unread counts
- Pinned announcements for critical information
- Targeted messaging by tags/buildings
- Push notifications for urgent updates

#### 3. Status Anxiety is High
**Finding**: Students experience anxiety about:
- "Was my request received?"
- "When will it be fixed?"
- "Did I miss a payment deadline?"
- "Am I doing this right?"

**Implication**:
- Real-time status updates
- Transparent tracking (e.g., "Received → In Progress → Completed")
- Proactive notifications (status changes, deadlines)
- Clear confirmation messages

#### 4. Staff are Overwhelmed by Manual Processes
**Finding**: Staff spend 60-80% of time on coordination, not value work:
- Chasing updates via phone calls
- Manual data entry from paper forms
- Walking between office and dorm rooms
- Managing multiple communication channels

**Implication**:
- Mobile-first admin interface
- Real-time ticket tracking
- Bulk operations (status updates, assignments)
- Automated notifications reduce follow-up calls

#### 5. Admin Lack Data for Decisions
**Finding**: Administrative decisions are based on anecdotes, not data:
- No visibility into response times
- No tracking of common issues by building
- No measurement of student satisfaction
- No analytics on announcement read rates

**Implication**:
- Dashboard with key metrics
- Analytics and trend reports
- Export capabilities for deeper analysis
- Audit logs for accountability

#### 6. Students Prefer Visual Communication
**Finding**: Text-heavy announcements are ignored:
- Photos get 3x more engagement than text
- Infographics are shared peer-to-peer
- Screenshots of announcements circulate in groups

**Implication**:
- LINE Flex Messages (rich, visual cards)
- Photo upload for maintenance requests
- Visual status indicators (badges, colors, icons)
- Easy-to-screenshot digital dorm card

#### 7. Trust is Built Through Transparency
**Finding**: Students distrust opaque processes:
- "Did they even receive my request?"
- "Why is it taking so long?"
- "Is my room being singled out?"

**Implication**:
- Full request history visible to students
- Status change notifications with timestamps
- Public maintenance stats (e.g., "Avg response time: 2 days")
- Clear escalation paths

#### 8. Onboarding is Critical for Freshmen
**Finding**: First-year students struggle most:
- Don't know who to ask for help
- Miss deadlines because they don't know where to look
- Fear making mistakes
- High anxiety period

**Implication**:
- Guided onboarding flow
- Clear how-to guides
- Chatbot for FAQ
- Welcome announcements with key info

---

### Pain Point Summary Matrix

| Pain Point | Students | Staff | Admin | Severity |
|------------|----------|-------|-------|----------|
| **Scattered communication** | High | High | Medium | Critical |
| **No status visibility** | High | Medium | High | Critical |
| **Manual processes** | Medium | High | Medium | High |
| **Paper-based forms** | High | High | Medium | High |
| **No analytics/data** | Low | Medium | High | High |
| **Onboarding confusion** | High | Low | Medium | Medium |
| **Broadcast inefficiency** | Low | High | High | Medium |
| **Access control complexity** | Low | Medium | High | Medium |

---

## Opportunity Areas

### 1. Unified Communication Hub
**Opportunity**: Replace scattered channels with a single, LINE-integrated platform.

**Features**:
- LINE Login (no new passwords)
- Centralized announcement feed
- Targeted messaging by tags
- Push notifications for urgent updates

**Success Metric**: Announcement read rate > 70%

---

### 2. Transparent Request Tracking
**Opportunity**: End the "black box" anxiety with real-time status updates.

**Features**:
- Visual status pipeline (Received → In Progress → Completed)
- Status change notifications
- Request history and details
- Estimated resolution time

**Success Metric**: Student satisfaction > 4.0/5.0

---

### 3. Mobile-First Staff Experience
**Opportunity**: Empower staff to manage tasks from anywhere in the dorm.

**Features**:
- Mobile-optimized ticket management
- Photo attachments for triage
- One-tap status updates
- Student profiles and history

**Success Metric**: Staff efficiency +50% (time reduction)

---

### 4. Data-Driven Admin Decisions
**Opportunity**: Provide admins with visibility and analytics.

**Features**:
- Dashboard with key metrics
- Trend reports (response time, common issues)
- Export capabilities
- Audit logs

**Success Metric**: Data-driven decisions increase by 80%

---

### 5. Visual, Engaging Announcements
**Opportunity**: Make announcements impossible to ignore.

**Features**:
- LINE Flex Message templates
- Visual editor with preview
- AI-assisted copy generation
- Template library for recurring messages

**Success Metric**: Announcement engagement +3x

---

### 6. Guided Onboarding for Freshmen
**Opportunity**: Reduce anxiety for first-year students.

**Features**:
- Multi-step onboarding flow
- How-to guides and FAQs
- Welcome tour of features
- Chatbot for common questions

**Success Metric**: Freshman satisfaction > 4.5/5.0

---

### 7. Committee Empowerment
**Opportunity**: Give committee members tools to advocate for students.

**Features**:
- Access to analytics and trends
- Announcement drafting tools
- Feedback collection
- Student insights dashboard

**Success Metric**: Committee-initiated improvements increase

---

### 8. Automated Workflow Triggers
**Opportunity**: Reduce manual coordination with automation.

**Features**:
- Scheduled announcements
- Reminder notifications
- Auto-assignment of technicians
- Recurring task templates

**Success Metric**: Manual coordination time -60%

---

## User Journey Maps

### Journey 1: Student - Reporting Maintenance Issue

#### Current State (Painful)

| Stage | Actions | Touchpoints | Emotions | Pain Points |
|-------|---------|-------------|----------|-------------|
| **Discovery** | Notice broken AC | Physical room | 😟 Frustrated | Problem exists |
| **Decision** | "Should I report it?" | Internal monologue | 😐 Hesitant | Will it be fixed? Is it worth it? |
| **Reporting** | Walk to dorm office | Paper form, office hours | 😤 Annoyed | Office closed, long walk |
| **Filling Form** | Write details by hand | Paper form | 😒 Bored | Repetitive info, no photo |
| **Submission** | Hand form to staff | Staff member | 😕 Uncertain | Did they receive it? |
| **Waiting** | No updates for days | Nothing | 😰 Anxious | Is anyone working on it? |
| **Follow-up** | Call or visit office | Phone, in-person | 😤 Frustrated | "We're checking on it" |
| **Resolution** | Technician arrives | Room visit | 😌 Relieved | Finally fixed |

**Time to Resolution**: 2-7 days (average 4 days)
**Emotion Score**: -3.6 (mostly negative)

---

#### Future State (Delightful)

| Stage | Actions | Touchpoints | Emotions | Delight Factors |
|-------|---------|-------------|----------|-----------------|
| **Discovery** | Notice broken AC | Room | 😟 Frustrated | Problem exists |
| **Reporting** | Open app, tap "แจ้งซ่อม" | LINE LIFF / Mobile web | 😊 Confident | Easy to find |
| **Filling Form** | Tap category, add photo, describe | Mobile form | 🤗 Empowered | Photo upload, intuitive |
| **Submission** | Tap "ส่ง", get confirmation | Success message | 😌 Reassured | "Received! ID: #1234" |
| **Tracking** | Watch status: "รับเรื่องแล้ว" | Real-time update | 😊 Informed | Push notification |
| **Scheduling** | Select appointment slot | Calendar picker | 🤗 In control | Choose my own time |
| **Progress** | "กำลังดำเนินการ" + photo | Status update | 😌 Confident | See technician is working |
| **Resolution** | "เสร็จสิ้น" + rate service | Completion screen | 😁 Satisfied | Quick, transparent |

**Time to Resolution**: < 24 hours
**Emotion Score**: +3.8 (mostly positive)

**Key Improvements**:
- 📱 **No walking**: Report from room
- 📸 **Photo evidence**: Technicians arrive prepared
- 🔔 **Real-time updates**: No anxiety
- ⏰ **Self-service scheduling**: Choose convenient time
- ✅ **Transparency**: Full status visibility

---

### Journey 2: Staff - Managing Maintenance Requests

#### Current State (Chaotic)

| Stage | Actions | Tools | Pain Points |
|-------|---------|-------|-------------|
| **Receive Requests** | Collect paper forms | Physical forms | Lost forms, illegible handwriting |
| **Prioritize** | "This seems urgent" | Gut feeling | No data, inconsistent |
| **Assign** | Call technicians | Phone calls | Phone tag, lost messages |
| **Track** | Paper notebook, memory | Notebook | No visibility, forgot |
| **Follow-up** | Call students, technicians | Phone calls | Time-consuming, intrusive |
| **Close** | Update paper file | Manual | No audit trail |

**Time per Request**: 15-30 minutes of coordination
**Capacity**: 5-10 requests/day max

---

#### Future State (Streamlined)

| Stage | Actions | Tools | Delight Factors |
|-------|---------|-------|-----------------|
| **Receive Requests** | View new tickets | Mobile app, push notification | Instant, all in one place |
| **Prioritize** | Sort by category, time | Auto-sort, filters | Data-driven, consistent |
| **Assign** | Drag to technician column | Kanban board | Visual, one gesture |
| **Track** | Real-time status feed | Live dashboard | Full visibility |
| **Follow-up** | Auto-notifications | System-triggered | No manual calls |
| **Close** | Tap "เสร็จสิ้น", add notes | One-tap action | Quick, audited |

**Time per Request**: 2-5 minutes
**Capacity**: 20-30 requests/day

**Key Improvements**:
- 📊 **Visual Kanban**: Drag-and-drop management
- 🔔 **Auto-notifications**: Reduce follow-up calls by 80%
- 📱 **Mobile-first**: Manage from anywhere
- 📈 **Data-driven**: Sort, filter, search
- ⚡ **One-tap actions**: Minimal friction

---

### Journey 3: Admin - Broadcasting Announcement

#### Current State (Tedious)

| Stage | Actions | Tools | Pain Points |
|-------|---------|-------|-------------|
| **Draft** | Write in Word | Microsoft Word | No formatting for LINE |
| **Copy-Paste** | Copy to LINE | LINE Official Account | Formatting breaks, no images |
| **Target** | "Send to everyone?" | Broadcast API | No targeting |
| **Send** | Click send | LINE Manager | No scheduling |
| **Track** | No visibility | Nothing | No metrics |

**Time per Announcement**: 20-30 minutes
**Engagement**: Unknown, likely low

---

#### Future State (Efficient)

| Stage | Actions | Tools | Delight Factors |
|-------|---------|-------|-----------------|
| **Draft** | Use template or AI assist | Rich editor | Pre-built templates, AI copy |
| **Design** | Visual Flex builder | Drag-and-drop editor | WYSIWYG, preview |
| **Target** | Select tags/buildings | Multi-select | Targeted messaging |
| **Schedule** | Set date/time | Calendar picker | Automate delivery |
| **Send** | One click | API integration | Instant delivery |
| **Track** | View analytics | Dashboard | Read rate, engagement |

**Time per Announcement**: 5-10 minutes (after first setup)
**Engagement**: Measured, > 70% read rate

**Key Improvements**:
- 🎨 **Visual builder**: No coding required
- 📋 **Templates**: Reuse recurring announcements
- 🎯 **Targeting**: Send to specific groups
- ⏰ **Scheduling**: Automate delivery
- 📊 **Analytics**: Track engagement

---

## Summary & Recommendations

### Top 3 Priorities

1. **Unified Communication via LINE**
   - All users already active on LINE
   - Reduce friction with LINE Login
   - Push notifications ensure visibility
   - Flex Messages enable visual engagement

2. **Transparent Request Tracking**
   - End status anxiety for students
   - Reduce follow-up calls for staff
   - Provide visibility for admins
   - Build trust through transparency

3. **Mobile-First Staff Experience**
   - Empower staff to work from anywhere
   - Reduce coordination overhead
   - Increase response speed
   - Improve student satisfaction

### Design Principles

Based on user research, C-Madong should embody these principles:

1. **Where You Are**: Meet users in LINE (no new app to download)
2. **Show, Don't Hide**: Full transparency and status visibility
3. **Fast & Frictionless**: Minimal steps, instant confirmations
4. **Visual First**: Photos, Flex Messages, clear visual hierarchy
5. **Mobile Native**: Optimized for smartphones, not desktop
6. **Bilingual Seamless**: Thai/English toggle, culturally appropriate
7. **Forgiving**: Undo, edit, clear next steps, no dead ends
8. **Human-Centered**: Support chatbot, FAQ, how-to guides

---

## Appendix: Research Methodology

### Research Sources
- **PRD v1.1** — Product requirements and user stories
- **Lovable Admin Portal Analysis** — Existing feature set and usage patterns
- **Thai Gen-Z UX Writing Skill** — Cultural insights and language patterns
- **LINE Messaging API Documentation** — Technical capabilities
- **Chula Dorm Context** — University dorm environment

### Assumptions & Validation Needs
- **Assumption**: 80% of students have LINE installed
  - **Validation**: Survey incoming students during onboarding

- **Assumption**: Staff prefer mobile over desktop for task management
  - **Validation**: Observe staff work patterns, conduct interviews

- **Assumption**: Real-time notifications reduce anxiety
  - **Validation**: A/B test notification frequency, measure satisfaction

- **Assumption**: Visual announcements get 3x engagement
  - **Validation**: Track read rates for text vs. Flex messages

### Next Steps
1. **User Interviews**: Validate personas with real students, staff, admins
2. **Usability Testing**: Test maintenance flow with 5-10 students
3. **Staff Shadowing**: Observe staff work patterns for 1 week
4. **Analytics Audit**: Review existing LINE Official Account metrics
5. **Survey**: Deploy survey to current dorm residents

---

**Document End**

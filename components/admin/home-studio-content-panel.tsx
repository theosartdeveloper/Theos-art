'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import AnnouncementManagementTab from '@/components/admin/announcement-management'
import EventManagementPanel from '@/components/admin/event-management'

/** Homepage Art Events + Announcements — admin entry point under Home & Art Gallery. */
export default function HomeStudioContentPanel() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Art Events & Announcements</h1>
        <p className="text-slate-600 mt-1 max-w-3xl">
          Content you publish here appears on the public homepage. Use <strong>Art Events</strong> for
          dated exhibitions and studio gatherings, and <strong>Announcements</strong> for news and studio
          notices.
        </p>
      </div>

      <Tabs defaultValue="events" className="space-y-6">
        <TabsList>
          <TabsTrigger value="events">Art Events</TabsTrigger>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
        </TabsList>
        <TabsContent value="events">
          <EventManagementPanel />
        </TabsContent>
        <TabsContent value="announcements">
          <AnnouncementManagementTab embedded />
        </TabsContent>
      </Tabs>
    </div>
  )
}

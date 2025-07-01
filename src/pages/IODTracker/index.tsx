import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs"
import { DashboardOverview } from "./components/DashboardOverview"
import { IODTableView } from "./components/IODTableView"

export default function IODTrackerPage() {
  return (
    <div className="container mx-auto py-10">
      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="table">Table View</TabsTrigger>
        </TabsList>
        <TabsContent value="dashboard">
          <DashboardOverview />
        </TabsContent>
        <TabsContent value="table">
          <IODTableView />
        </TabsContent>
      </Tabs>
    </div>
  )
} 
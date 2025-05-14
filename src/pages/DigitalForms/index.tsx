"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/formBuilder/tabs"
import FormBuilder from "../../components/form-builder/form-builder"
import FormFiller from "../../components/form-builder/form-filler"

export default function FormDashboard() {
  const [activeTab, setActiveTab] = useState("builder")

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Digital Forms</h1>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="builder">Form Builder</TabsTrigger>
          <TabsTrigger value="filler">Form Filler</TabsTrigger>
        </TabsList>
        <TabsContent value="builder">
          <FormBuilder />
        </TabsContent>
        <TabsContent value="filler">
          <FormFiller />
        </TabsContent>
      </Tabs>
    </div>
  )
}


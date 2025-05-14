export interface Job {
  id: string;
  title: string;
  product_code: string;
  start_date: Date
  comments: string
  revised_due_date: Date
  due_date: Date
  submission_date: Date
  completion_date: Date
  outcome: string
  created_at: string
  assigned_to: string | null;
  division_id: number | null;
  task_category_id: number | null;
  status_id: number | null;
  product_description: string | null;
  requestor_id: number | null;

 

  // Expanded FKs
  profiles?: {
    id: string;
    first_name: string;
    last_name: string;
    email?: string;
  };

  job_status?: {
    id: number;
    description: string;
  };

  requestor?: {
    id: number;
    name: string;
  };

  production_plant?: {
    id: number;
    name: string;
  }
  quality_lab_task_category?: {
    id: number;
    description: string;
  };
}
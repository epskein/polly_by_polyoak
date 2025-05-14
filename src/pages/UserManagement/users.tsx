import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import AllUsersTable from "../../components/tables/BasicTables/AllUsersTable";

export default function BasicTables() {
  return (
    <>
      <PageMeta
        title="All users for Polly"
        description="This page displays a list of all the users created for the Polly application."
      />
      <PageBreadcrumb pageTitle="Users" />
      <div className="space-y-6">
          <AllUsersTable />
      </div>
    </>
  );
}

import EmployeeList from './employee-list';
import EmployeeForm from './employee-form';
import PageContainer from '@/components/layout/page-container';
import { fetchEmployees } from './actions';

export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'Dashboard : Employees'
};

export default async function EmployeesPage() {
  const { employees } = await fetchEmployees();

  return (
    <PageContainer>
      <EmployeeForm />
      <EmployeeList initialEmployees={employees || []} />
    </PageContainer>
  );
}
'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { deleteEmployee, updateEmployee, fetchEmployees } from './actions';
import { toast } from 'sonner';
import { Trash2, Edit } from 'lucide-react';
import { Role } from '@prisma/client';

interface Employee {
  id: string;
  email: string;
  role: Role;
}

interface EmployeeListProps {
  initialEmployees: Employee[];
}

export default function EmployeeList({ initialEmployees }: EmployeeListProps) {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  useEffect(() => {
    const handleEmployeeCreated = (event: Event) => {
      const customEvent = event as CustomEvent;
      const newEmployee = customEvent.detail;
      setEmployees(prev => [newEmployee, ...prev]);
    };

    const handleRefreshEmployees = async () => {
      const result = await fetchEmployees();
      if (result.employees) setEmployees(result.employees);
    };

    window.addEventListener('employeesUpdated', handleRefreshEmployees);
    window.addEventListener('employeeCreated', handleEmployeeCreated);
    
    return () => {
      window.removeEventListener('employeesUpdated', handleRefreshEmployees);
      window.removeEventListener('employeeCreated', handleEmployeeCreated);
    };
  }, []);

  const handleDelete = async (employeeId: string) => {
    const originalEmployees = employees;
    setEmployees(prev => prev.filter(emp => emp.id !== employeeId));
    
    try {
      const result = await deleteEmployee(employeeId);
      if (result?.error) throw new Error(result.error);
      toast.success('Employee deleted successfully');
    } catch (error) {
      setEmployees(originalEmployees);
      toast.error('Failed to delete employee');
    }
  };

  const handleRoleUpdate = async () => {
    if (!editingEmployee) return;

    const originalEmployees = employees;
    const updatedEmployees = employees.map(emp => 
      emp.id === editingEmployee.id ? editingEmployee : emp
    );
    
    try {
      setEmployees(updatedEmployees);
      const result = await updateEmployee(editingEmployee.id, {
        role: editingEmployee.role
      });

      if (result?.error) throw new Error(result.error);
      toast.success('Employee role updated successfully');
    } catch (error) {
      setEmployees(originalEmployees);
      toast.error('Failed to update employee role');
    } finally {
      setEditingEmployee(null);
    }
  };

  const roleVariants = {
    [Role.ADMIN]: 'destructive',
    [Role.MANAGER]: 'secondary',
    [Role.EMPLOYEE]: 'outline'
  } as const;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Employees List</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell>{employee.email}</TableCell>
                <TableCell>
                  {editingEmployee?.id === employee.id ? (
                    <Select
                      value={editingEmployee.role}
                      onValueChange={(value: Role) => setEditingEmployee({
                        ...editingEmployee,
                        role: value
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(Role).map((role) => (
                          <SelectItem key={role} value={role}>
                            {role.toLowerCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge variant={roleVariants[employee.role]}>
                      {employee.role.toLowerCase()}
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  {editingEmployee?.id === employee.id ? (
                    <>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mr-2"
                        onClick={handleRoleUpdate}
                      >
                        Save
                      </Button>
                      <Button 
                        variant="secondary" 
                        size="sm"
                        onClick={() => setEditingEmployee(null)}
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="mr-2"
                        onClick={() => setEditingEmployee(employee)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="icon">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the employee.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(employee.id)}>
                              Continue
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
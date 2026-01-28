import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Modal } from '@/components/ui/Modal';
import { Loader } from '@/components/ui/Loader';
import { equipmentApi } from '@/lib/api/equipment';
import { showToast } from '@/lib/hooks/useToast';
import { handleApiError } from '@/lib/api/axios';
import { QUERY_KEYS } from '@/constants';
import { Plus, Pencil, Trash2, FolderOpen } from 'lucide-react';
import type { Category } from '@/types';

const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required').min(2, 'Name must be at least 2 characters'),
});

type CategoryFormData = z.infer<typeof categorySchema>;

export const CategoryManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingCategory, setEditingCategory] = React.useState<Category | null>(null);
  const [deleteConfirm, setDeleteConfirm] = React.useState<Category | null>(null);

  const { data: categories = [], isLoading } = useQuery({
    queryKey: [QUERY_KEYS.CATEGORIES],
    queryFn: equipmentApi.getAllCategories,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
  });

  // Reset form when editing category changes
  React.useEffect(() => {
    if (editingCategory) {
      reset({ name: editingCategory.name });
    } else {
      reset({ name: '' });
    }
  }, [editingCategory, reset]);

  const createMutation = useMutation({
    mutationFn: (data: CategoryFormData) => equipmentApi.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CATEGORIES] });
      showToast('Category created successfully!', 'success');
      closeModal();
    },
    onError: (error) => {
      showToast(handleApiError(error), 'error');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CategoryFormData }) =>
      equipmentApi.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CATEGORIES] });
      showToast('Category updated successfully!', 'success');
      closeModal();
    },
    onError: (error) => {
      showToast(handleApiError(error), 'error');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => equipmentApi.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CATEGORIES] });
      showToast('Category deleted successfully!', 'success');
      setDeleteConfirm(null);
    },
    onError: (error) => {
      showToast(handleApiError(error), 'error');
    },
  });

  const openAddModal = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    reset();
  };

  const onSubmit = (data: CategoryFormData) => {
    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Layout>
      <div className="container-custom py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Category Management</h1>
          <Button onClick={openAddModal}>
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Categories ({categories.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader size="lg" />
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-12">
                <FolderOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500">No categories found. Add your first category!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FolderOpen className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <span className="font-medium">{category.name}</span>
                        <p className="text-sm text-gray-500">
                          Created: {new Date(category.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditModal(category)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => setDeleteConfirm(category)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add/Edit Category Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={closeModal}
          title={editingCategory ? 'Edit Category' : 'Add New Category'}
          size="sm"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Category Name</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Enter category name"
                autoFocus
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={closeModal}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader size="sm" className="mr-2" />
                    {editingCategory ? 'Updating...' : 'Creating...'}
                  </>
                ) : editingCategory ? (
                  'Update Category'
                ) : (
                  'Create Category'
                )}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={!!deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          title="Delete Category"
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              Are you sure you want to delete <strong>{deleteConfirm?.name}</strong>? 
              This may affect equipment items in this category.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteConfirm && deleteMutation.mutate(deleteConfirm.id)}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? (
                  <>
                    <Loader size="sm" className="mr-2" />
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  );
};

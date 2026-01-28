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
import { formatCurrency } from '@/lib/utils/formatters';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import type { Equipment, CreateEquipmentData } from '@/types';

const equipmentSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  category_id: z.coerce.number().min(1, 'Category is required'),
  daily_rate: z.coerce.number().min(0.01, 'Daily rate must be greater than 0'),
  image_url: z.string().url('Must be a valid URL').or(z.literal('')),
  is_available: z.boolean(),
});

type EquipmentFormData = z.infer<typeof equipmentSchema>;

export const EquipmentManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingEquipment, setEditingEquipment] = React.useState<Equipment | null>(null);
  const [deleteConfirm, setDeleteConfirm] = React.useState<Equipment | null>(null);

  const { data: equipment = [], isLoading } = useQuery({
    queryKey: [QUERY_KEYS.EQUIPMENT_LIST],
    queryFn: equipmentApi.getAll,
  });

  const { data: categories = [] } = useQuery({
    queryKey: [QUERY_KEYS.CATEGORIES],
    queryFn: equipmentApi.getAllCategories,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EquipmentFormData>({
    resolver: zodResolver(equipmentSchema),
    defaultValues: {
      is_available: true,
    },
  });

  // Reset form when editing equipment changes
  React.useEffect(() => {
    if (editingEquipment) {
      reset({
        name: editingEquipment.name,
        description: editingEquipment.description || '',
        category_id: editingEquipment.category_id,
        daily_rate: editingEquipment.daily_rate,
        image_url: editingEquipment.image_url || '',
        is_available: editingEquipment.is_available,
      });
    } else {
      reset({
        name: '',
        description: '',
        category_id: 0,
        daily_rate: 0,
        image_url: '',
        is_available: true,
      });
    }
  }, [editingEquipment, reset]);

  const createMutation = useMutation({
    mutationFn: (data: CreateEquipmentData) => equipmentApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.EQUIPMENT_LIST] });
      showToast('Equipment created successfully!', 'success');
      closeModal();
    },
    onError: (error) => {
      showToast(handleApiError(error), 'error');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateEquipmentData> }) =>
      equipmentApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.EQUIPMENT_LIST] });
      showToast('Equipment updated successfully!', 'success');
      closeModal();
    },
    onError: (error) => {
      showToast(handleApiError(error), 'error');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => equipmentApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.EQUIPMENT_LIST] });
      showToast('Equipment deleted successfully!', 'success');
      setDeleteConfirm(null);
    },
    onError: (error) => {
      showToast(handleApiError(error), 'error');
    },
  });

  const openAddModal = () => {
    setEditingEquipment(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: Equipment) => {
    setEditingEquipment(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingEquipment(null);
    reset();
  };

  const onSubmit = (data: EquipmentFormData) => {
    const equipmentData: CreateEquipmentData = {
      ...data,
      image_url: data.image_url || '',
    };

    if (editingEquipment) {
      updateMutation.mutate({ id: editingEquipment.id, data: equipmentData });
    } else {
      createMutation.mutate(equipmentData);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Layout>
      <div className="container-custom py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Equipment Management</h1>
          <Button onClick={openAddModal}>
            <Plus className="mr-2 h-4 w-4" />
            Add Equipment
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Equipment ({equipment.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader size="lg" />
              </div>
            ) : equipment.length === 0 ? (
              <p className="text-center py-8 text-gray-500">No equipment found. Add your first equipment!</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold">Name</th>
                      <th className="text-left py-3 px-4 font-semibold">Category</th>
                      <th className="text-left py-3 px-4 font-semibold">Daily Rate</th>
                      <th className="text-left py-3 px-4 font-semibold">Available</th>
                      <th className="text-left py-3 px-4 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {equipment.map((item) => (
                      <tr key={item.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            {item.image_url && (
                              <img
                                src={item.image_url}
                                alt={item.name}
                                className="w-10 h-10 rounded object-cover"
                              />
                            )}
                            <span className="font-medium">{item.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">{item.category.name}</td>
                        <td className="py-3 px-4">{formatCurrency(item.daily_rate)}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              item.is_available
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {item.is_available ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEditModal(item)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:bg-red-50"
                              onClick={() => setDeleteConfirm(item)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add/Edit Equipment Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={closeModal}
          title={editingEquipment ? 'Edit Equipment' : 'Add New Equipment'}
          size="lg"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder="Equipment name"
                />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category_id">Category</Label>
                <select
                  id="category_id"
                  {...register('category_id')}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {errors.category_id && (
                  <p className="text-sm text-red-600">{errors.category_id.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                {...register('description')}
                rows={3}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Equipment description"
              />
              {errors.description && (
                <p className="text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="daily_rate">Daily Rate ($)</Label>
                <Input
                  id="daily_rate"
                  type="number"
                  step="0.01"
                  {...register('daily_rate')}
                  placeholder="0.00"
                />
                {errors.daily_rate && (
                  <p className="text-sm text-red-600">{errors.daily_rate.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="image_url">Image URL</Label>
                <Input
                  id="image_url"
                  {...register('image_url')}
                  placeholder="https://example.com/image.jpg"
                />
                {errors.image_url && (
                  <p className="text-sm text-red-600">{errors.image_url.message}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_available"
                {...register('is_available')}
                className="rounded border-gray-300"
              />
              <Label htmlFor="is_available" className="font-normal">
                Available for rent
              </Label>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={closeModal}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader size="sm" className="mr-2" />
                    {editingEquipment ? 'Updating...' : 'Creating...'}
                  </>
                ) : editingEquipment ? (
                  'Update Equipment'
                ) : (
                  'Create Equipment'
                )}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={!!deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          title="Delete Equipment"
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              Are you sure you want to delete <strong>{deleteConfirm?.name}</strong>? This action cannot be undone.
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

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
import { Plus, Pencil, Trash2, Upload, X } from 'lucide-react';
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
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

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
      setImagePreview(editingEquipment.image_url || null);
    } else {
      reset({
        name: '',
        description: '',
        category_id: 0,
        daily_rate: 0,
        image_url: '',
        is_available: true,
      });
      setImagePreview(null);
    }
    setSelectedFile(null);
  }, [editingEquipment, reset]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showToast('Please select an image file', 'error');
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        showToast('Image must be less than 5MB', 'error');
        return;
      }
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    setImagePreview(editingEquipment?.image_url || null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

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
    setSelectedFile(null);
    setImagePreview(null);
    reset();
  };

  const onSubmit = async (data: EquipmentFormData) => {
    let imageUrl = data.image_url || '';

    // Upload image if a new file is selected
    if (selectedFile) {
      setIsUploading(true);
      try {
        const uploadResult = await equipmentApi.uploadImage(selectedFile);
        imageUrl = uploadResult.url;
      } catch (error) {
        showToast(handleApiError(error), 'error');
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
    }

    const equipmentData: CreateEquipmentData = {
      ...data,
      image_url: imageUrl,
    };

    if (editingEquipment) {
      updateMutation.mutate({ id: editingEquipment.id, data: equipmentData });
    } else {
      createMutation.mutate(equipmentData);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending || isUploading;

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
                <Label htmlFor="image_url">Equipment Image</Label>
                <div className="space-y-3">
                  {/* Image Preview */}
                  {imagePreview && (
                    <div className="relative inline-block">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={clearSelectedFile}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                  
                  {/* File Upload */}
                  <div className="flex gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      {selectedFile ? 'Change Image' : 'Upload Image'}
                    </Button>
                    {selectedFile && (
                      <span className="text-sm text-gray-600 self-center">
                        {selectedFile.name}
                      </span>
                    )}
                  </div>
                  
                  {/* Or use URL */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">or paste URL:</span>
                    <Input
                      {...register('image_url')}
                      placeholder="https://example.com/image.jpg"
                      className="flex-1"
                      disabled={!!selectedFile}
                    />
                  </div>
                  {errors.image_url && (
                    <p className="text-sm text-red-600">{errors.image_url.message}</p>
                  )}
                </div>
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

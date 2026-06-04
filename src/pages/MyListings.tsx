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
import { Plus, Pencil, Trash2, Upload, X, Package, Image } from 'lucide-react';
import { BackButton } from '@/components/ui/BackButton';
import { ROUTES, EQUIPMENT_STATUS_LABELS, EQUIPMENT_STATUS_COLORS } from '@/constants';
import type { Equipment, CreateEquipmentData } from '@/types';
import { getCurrentUser } from '@/lib/hooks/useAuth';
import { isProfileComplete } from '@/lib/utils/profile';
import { ProfileCompletionBanner } from '@/components/ui/ProfileCompletionBanner';

const equipmentSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    category_id: z.coerce.number().min(1, 'Category is required'),
    daily_rate: z.coerce.number().min(0.01, 'Daily rate must be greater than 0'),
    item_value: z.coerce.number().min(0).optional(),
    security_deposit: z.coerce.number().min(0).optional(),
    image_url: z.string().url('Must be a valid URL').or(z.literal('')),
    is_available: z.boolean(),
    condition: z.string().optional(),
    location: z.string().min(1, 'Location is required'),
    requires_approval: z.boolean().optional(),
    min_notice_hours: z.coerce.number().min(0).optional(),
    pickup_location: z.string().optional(),
});

type EquipmentFormData = z.infer<typeof equipmentSchema>;

export const MyListings: React.FC = () => {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [editingEquipment, setEditingEquipment] = React.useState<Equipment | null>(null);
    const [deleteConfirm, setDeleteConfirm] = React.useState<Equipment | null>(null);

    // Primary image upload state
    const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
    const [imagePreview, setImagePreview] = React.useState<string | null>(null);
    const [isUploading, setIsUploading] = React.useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    // Extra gallery images
    const [extraFiles, setExtraFiles] = React.useState<File[]>([]);
    const [extraPreviews, setExtraPreviews] = React.useState<string[]>([]);

    // "Other" category suggestion
    const [categorySuggestion, setCategorySuggestion] = React.useState('');
    const [suggestionSent, setSuggestionSent] = React.useState(false);
    const extraFileInputRef = React.useRef<HTMLInputElement>(null);

    const { data: listings = [], isLoading } = useQuery({
        queryKey: [QUERY_KEYS.MY_LISTINGS],
        queryFn: equipmentApi.getMyListings,
    });

    const { data: categories = [] } = useQuery({
        queryKey: [QUERY_KEYS.CATEGORIES],
        queryFn: equipmentApi.getAllCategories,
    });

    const currentUser = getCurrentUser();
    const profileComplete = isProfileComplete(currentUser);

    const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<EquipmentFormData>({
        resolver: zodResolver(equipmentSchema),
        defaultValues: { is_available: true, condition: 'Good', location: '', requires_approval: false },
    });

    const selectedCategoryId = watch('category_id');

    React.useEffect(() => {
        if (editingEquipment) {
            reset({
                name: editingEquipment.name,
                description: editingEquipment.description || '',
                category_id: editingEquipment.category_id,
                daily_rate: editingEquipment.daily_rate,
                item_value: editingEquipment.item_value ?? undefined,
                security_deposit: editingEquipment.security_deposit ?? undefined,
                image_url: editingEquipment.image_url || '',
                is_available: editingEquipment.is_available,
                condition: editingEquipment.condition || 'Good',
                location: editingEquipment.location || '',
                requires_approval: editingEquipment.requires_approval ?? false,
                min_notice_hours: editingEquipment.min_notice_hours ?? undefined,
                pickup_location: editingEquipment.pickup_location || '',
            });
            setImagePreview(editingEquipment.image_url || null);
        } else {
            reset({
                name: '', description: '',
                category_id: categories.length > 0 ? categories[0].id : 0,
                daily_rate: 0, item_value: undefined, security_deposit: undefined,
                image_url: '', is_available: true, condition: 'Good', location: '',
                requires_approval: false, min_notice_hours: undefined, pickup_location: '',
            });
            setImagePreview(null);
        }
        setSelectedFile(null);
        setExtraFiles([]);
        setExtraPreviews([]);
    }, [editingEquipment, reset, categories]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) { showToast('Please select an image file', 'error'); return; }
        if (file.size > 5 * 1024 * 1024) { showToast('Image must be less than 5MB', 'error'); return; }
        setSelectedFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const handleExtraFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const valid = files.filter((f) => {
            if (!f.type.startsWith('image/')) { showToast(`${f.name} is not an image`, 'error'); return false; }
            if (f.size > 5 * 1024 * 1024) { showToast(`${f.name} exceeds 5MB`, 'error'); return false; }
            return true;
        });
        setExtraFiles((prev) => [...prev, ...valid]);
        setExtraPreviews((prev) => [...prev, ...valid.map((f) => URL.createObjectURL(f))]);
    };

    const removeExtraFile = (index: number) => {
        setExtraFiles((prev) => prev.filter((_, i) => i !== index));
        setExtraPreviews((prev) => prev.filter((_, i) => i !== index));
    };

    const createMutation = useMutation({
        mutationFn: (data: CreateEquipmentData) => equipmentApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MY_LISTINGS] });
            showToast('Listing created successfully!', 'success');
            closeModal();
        },
        onError: (error) => showToast(handleApiError(error), 'error'),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<CreateEquipmentData> }) =>
            equipmentApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MY_LISTINGS] });
            showToast('Listing updated successfully!', 'success');
            closeModal();
        },
        onError: (error) => showToast(handleApiError(error), 'error'),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => equipmentApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MY_LISTINGS] });
            showToast('Listing deleted.', 'success');
            setDeleteConfirm(null);
        },
        onError: (error) => showToast(handleApiError(error), 'error'),
    });

    // Auto-set security_deposit to 20% of item_value
    const itemValue = watch('item_value');
    React.useEffect(() => {
        if (itemValue && itemValue > 0) {
            setValue('security_deposit', Math.round(itemValue * 0.2 * 100) / 100, { shouldValidate: false });
        }
    }, [itemValue, setValue]);

    const openAddModal = () => {
        if (!profileComplete) {
            showToast('Complete your profile (verify email, add WhatsApp number and bank account) before listing an item.', 'error');
            return;
        }
        setEditingEquipment(null);
        setIsModalOpen(true);
    };
    const openEditModal = (item: Equipment) => { setEditingEquipment(item); setIsModalOpen(true); };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingEquipment(null);
        setSelectedFile(null);
        setImagePreview(null);
        setExtraFiles([]);
        setExtraPreviews([]);
        setCategorySuggestion('');
        setSuggestionSent(false);
        reset();
    };

    const onSubmit = async (data: EquipmentFormData) => {
        let imageUrl = data.image_url || '';

        // Upload primary image if a new file was selected
        if (selectedFile) {
            setIsUploading(true);
            try {
                const result = await equipmentApi.uploadImage(selectedFile);
                imageUrl = result.url;
            } catch (error) {
                showToast(handleApiError(error), 'error');
                setIsUploading(false);
                return;
            }
            setIsUploading(false);
        }

        const payload: CreateEquipmentData = {
            name: data.name,
            description: data.description,
            category_id: data.category_id,
            daily_rate: data.daily_rate,
            item_value: data.item_value || undefined,
            security_deposit: data.security_deposit || undefined,
            image_url: imageUrl,
            is_available: data.is_available,
            condition: data.condition,
            location: data.location,
            requires_approval: data.requires_approval,
            min_notice_hours: data.min_notice_hours || undefined,
            pickup_location: data.pickup_location || undefined,
        };

        if (editingEquipment) {
            updateMutation.mutate({ id: editingEquipment.id, data: payload }, {
                onSuccess: async (updatedEquipment) => {
                    // Upload any extra gallery images
                    if (extraFiles.length > 0) {
                        for (const file of extraFiles) {
                            try {
                                await equipmentApi.addImage(updatedEquipment.id, file);
                            } catch {
                                // best-effort
                            }
                        }
                        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MY_LISTINGS] });
                    }
                }
            });
        } else {
            createMutation.mutate(payload, {
                onSuccess: async (newEquipment) => {
                    if (extraFiles.length > 0) {
                        for (const file of extraFiles) {
                            try { await equipmentApi.addImage(newEquipment.id, file); } catch { /* best-effort */ }
                        }
                        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MY_LISTINGS] });
                    }
                }
            });
        }
    };

    const isPending = createMutation.isPending || updateMutation.isPending || isUploading;

    return (
        <Layout>
            <div className="container-custom py-12">
                <BackButton to={ROUTES.HOME} label="Browse Items" />
                <ProfileCompletionBanner />
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">My Listings</h1>
                        <p className="text-gray-600">Manage items you're sharing with the community</p>
                    </div>
                    <Button onClick={openAddModal}>
                        <Plus className="mr-2 h-4 w-4" />
                        List an Item
                    </Button>
                </div>

                <Card>
                    <CardHeader><CardTitle>Your Items ({listings.length})</CardTitle></CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex justify-center py-8"><Loader size="lg" /></div>
                        ) : listings.length === 0 ? (
                            <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
                                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No items listed</h3>
                                <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                                    Start earning by sharing your unused gear, tools, and equipment with people nearby.
                                </p>
                                <Button onClick={openAddModal}><Plus className="mr-2 h-4 w-4" />List Your First Item</Button>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left py-3 px-4 font-semibold">Item</th>
                                            <th className="text-left py-3 px-4 font-semibold">Category</th>
                                            <th className="text-left py-3 px-4 font-semibold">Status</th>
                                            <th className="text-left py-3 px-4 font-semibold">Rate/day</th>
                                            <th className="text-left py-3 px-4 font-semibold">Available</th>
                                            <th className="text-left py-3 px-4 font-semibold">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {listings.map((item) => (
                                            <tr key={item.id} className="border-b hover:bg-gray-50">
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-3">
                                                        {item.image_url ? (
                                                            <img src={item.image_url} alt={item.name} className="w-10 h-10 rounded object-cover" />
                                                        ) : (
                                                            <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center">
                                                                <Package className="h-5 w-5 text-gray-400" />
                                                            </div>
                                                        )}
                                                        <div>
                                                            <span className="font-medium">{item.name}</span>
                                                            {item.images && item.images.length > 1 && (
                                                                <p className="text-xs text-gray-400 flex items-center gap-1">
                                                                    <Image className="h-3 w-3" />{item.images.length} photos
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4 text-sm">{item.category?.name}</td>
                                                <td className="py-3 px-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${EQUIPMENT_STATUS_COLORS[item.status] ?? 'bg-gray-100 text-gray-600'}`}>
                                                        {EQUIPMENT_STATUS_LABELS[item.status] ?? item.status}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 font-semibold text-primary">{formatCurrency(item.daily_rate)}</td>
                                                <td className="py-3 px-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.is_available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                        {item.is_available ? 'Yes' : 'No'}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex gap-2">
                                                        <Button size="sm" variant="outline" onClick={() => openEditModal(item)}
                                                            title={item.status === 'rejected' ? 'Edit & Resubmit' : 'Edit'}>
                                                            <Pencil className="h-4 w-4" />
                                                            {item.status === 'rejected' && (
                                                                <span className="ml-1 hidden sm:inline text-xs">Resubmit</span>
                                                            )}
                                                        </Button>
                                                        <Button size="sm" variant="outline"
                                                            className="text-red-600 hover:bg-red-50 hover:border-red-200"
                                                            onClick={() => setDeleteConfirm(item)}>
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

                {/* Add/Edit Modal */}
                <Modal isOpen={isModalOpen} onClose={closeModal}
                    title={editingEquipment ? 'Edit Listing' : 'List a New Item'} size="lg">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-h-[75vh] overflow-y-auto pr-2">

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="name">Item Name *</Label>
                                <Input id="name" {...register('name')} placeholder="E.g., Canon EOS 80D Camera" />
                                {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="category_id">Category *</Label>
                                <select id="category_id" {...register('category_id')}
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                                    <option value="">Select a category</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                    <option value={-1}>Other (suggest a category)</option>
                                </select>
                                {errors.category_id && <p className="text-sm text-red-600">{errors.category_id.message}</p>}
                                {Number(selectedCategoryId) === -1 && (
                                    <div className="space-y-2 mt-1">
                                        <input
                                            type="text"
                                            value={categorySuggestion}
                                            onChange={(e) => { setCategorySuggestion(e.target.value); setSuggestionSent(false); }}
                                            placeholder="What category would you suggest?"
                                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        />
                                        <Button type="button" size="sm" variant="outline"
                                            disabled={!categorySuggestion.trim() || suggestionSent}
                                            onClick={async () => {
                                                try {
                                                    await equipmentApi.suggestCategory(categorySuggestion.trim());
                                                    setSuggestionSent(true);
                                                    showToast('Suggestion sent! Please select the closest existing category for now.', 'success');
                                                } catch { showToast('Could not send suggestion', 'error'); }
                                            }}>
                                            {suggestionSent ? '✓ Suggestion sent' : 'Send suggestion to admin'}
                                        </Button>
                                        <p className="text-xs text-amber-600">Please also select the closest existing category above to submit your listing.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description *</Label>
                            <textarea id="description" {...register('description')} rows={3}
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                placeholder="Describe the item, what's included, how to use it..." />
                            {errors.description && <p className="text-sm text-red-600">{errors.description.message}</p>}
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="daily_rate">Daily Rate (₦) *</Label>
                                <Input id="daily_rate" type="number" step="1" {...register('daily_rate')} placeholder="0" />
                                {errors.daily_rate && <p className="text-sm text-red-600">{errors.daily_rate.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="condition">Condition</Label>
                                <select id="condition" {...register('condition')}
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                                    <option value="Like New">Like New</option>
                                    <option value="Excellent">Excellent</option>
                                    <option value="Good">Good</option>
                                    <option value="Fair">Fair</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="item_value">Item Value (₦)</Label>
                            <Input id="item_value" type="number" step="1" {...register('item_value')} placeholder="Estimated replacement cost" />
                            <p className="text-xs text-gray-400">
                                A refundable security deposit of <strong>20%</strong> of this value will be charged to borrowers and returned in full when the item is returned in good condition.
                                {watch('item_value') && Number(watch('item_value')) > 0 && (
                                    <> That's <strong>₦{Math.round(Number(watch('item_value')) * 0.2).toLocaleString()}</strong> for this item.</>
                                )}
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="location">Area / LGA *</Label>
                            <Input id="location" {...register('location')} placeholder="E.g., Ikeja" />
                            {errors.location && <p className="text-sm text-red-600">{errors.location.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="pickup_location">Detailed Pickup Address</Label>
                            <Input id="pickup_location" {...register('pickup_location')} placeholder="E.g., 12 Broad Street, Lagos Island" />
                            <p className="text-xs text-gray-400">Shown to borrowers after booking is confirmed</p>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="min_notice_hours">Minimum Notice (hours)</Label>
                                <Input id="min_notice_hours" type="number" min="0" {...register('min_notice_hours')} placeholder="e.g. 24" />
                                <p className="text-xs text-gray-400">How far in advance must a booking start</p>
                            </div>
                            <div className="flex items-start gap-3 pt-6">
                                <input type="checkbox" id="requires_approval" {...register('requires_approval')}
                                    className="rounded border-gray-300 w-4 h-4 text-primary mt-1" />
                                <div>
                                    <Label htmlFor="requires_approval" className="font-medium cursor-pointer">Require my approval</Label>
                                    <p className="text-xs text-gray-400">You'll approve each booking request before payment</p>
                                </div>
                            </div>
                        </div>

                        {editingEquipment?.status === 'rejected' && (
                            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                                This listing was rejected. Saving changes will resubmit it for admin review.
                            </div>
                        )}

                        {/* Primary image */}
                        <div className="space-y-2">
                            <Label>Main Photo *</Label>
                            <div className="space-y-3">
                                {imagePreview && (
                                    <div className="relative inline-block border p-1 rounded-lg">
                                        <img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover rounded-md" />
                                        <button type="button"
                                            onClick={() => { setSelectedFile(null); setImagePreview(editingEquipment?.image_url || null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600">
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                )}
                                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                                <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2">
                                    <Upload className="h-4 w-4" />
                                    {selectedFile ? 'Change Photo' : imagePreview ? 'Replace Photo' : 'Upload Photo'}
                                </Button>
                            </div>
                        </div>

                        {/* Extra gallery images */}
                        <div className="space-y-2">
                            <Label>Additional Photos</Label>
                            {/* Show existing gallery (editing only) */}
                            {editingEquipment && editingEquipment.images && editingEquipment.images.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {editingEquipment.images.map((img) => (
                                        <div key={img.id} className="relative">
                                            <img src={img.url} alt="" className="w-16 h-16 rounded object-cover border" />
                                        </div>
                                    ))}
                                </div>
                            )}
                            {/* New extra photos to upload */}
                            {extraPreviews.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {extraPreviews.map((src, i) => (
                                        <div key={i} className="relative">
                                            <img src={src} alt="" className="w-16 h-16 rounded object-cover border border-primary" />
                                            <button type="button" onClick={() => removeExtraFile(i)}
                                                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5">
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <input ref={extraFileInputRef} type="file" accept="image/*" multiple onChange={handleExtraFilesSelect} className="hidden" />
                            <Button type="button" variant="outline" size="sm"
                                onClick={() => extraFileInputRef.current?.click()}
                                className="flex items-center gap-2">
                                <Image className="h-4 w-4" />
                                Add More Photos
                            </Button>
                            <p className="text-xs text-gray-400">More photos help borrowers decide faster</p>
                        </div>

                        <div className="flex items-center gap-2 py-2 border-t mt-4">
                            <input type="checkbox" id="is_available" {...register('is_available')}
                                className="rounded border-gray-300 w-4 h-4 text-primary" />
                            <Label htmlFor="is_available" className="font-medium cursor-pointer">
                                Item is currently available to borrow
                            </Label>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                            <Button type="button" variant="outline" onClick={closeModal}>Cancel</Button>
                            <Button type="submit" disabled={isPending}>
                                {isPending ? (
                                    <><Loader size="sm" className="mr-2" />Saving...</>
                                ) : editingEquipment ? 'Save Changes' : 'List Item'}
                            </Button>
                        </div>
                    </form>
                </Modal>

                {/* Delete Confirmation Modal */}
                <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Remove Listing" size="sm">
                    <div className="space-y-4">
                        <p className="text-gray-600">
                            Are you sure you want to remove <strong>{deleteConfirm?.name}</strong>? This cannot be undone.
                        </p>
                        <div className="flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
                            <Button variant="destructive"
                                onClick={() => deleteConfirm && deleteMutation.mutate(deleteConfirm.id)}
                                disabled={deleteMutation.isPending}>
                                {deleteMutation.isPending ? <><Loader size="sm" className="mr-2" />Removing...</> : 'Remove Item'}
                            </Button>
                        </div>
                    </div>
                </Modal>
            </div>
        </Layout>
    );
};

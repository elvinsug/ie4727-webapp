"use client";

import { useState, useEffect } from "react";
import {
  Edit,
  Trash,
  Plus,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost/miona/api";

// Predefined colors
const AVAILABLE_COLORS = [
  { name: "Black", hex: "#000000" },
  { name: "Blue", hex: "#7BA3D1" },
  { name: "White", hex: "#FFFFFF" },
  { name: "Brown", hex: "#6B4423" },
  { name: "Yellow", hex: "#F5E56B" },
  { name: "Beige", hex: "#D4C5A9" },
  { name: "Green", hex: "#6CC04A" },
  { name: "Red", hex: "#D64545" },
  { name: "Orange", hex: "#E89142" },
  { name: "Purple", hex: "#8B4FB8" },
  { name: "Maroon", hex: "#6B1D3C" },
  { name: "Pink", hex: "#D9A7E0" },
  { name: "Gray", hex: "#CCCCCC" },
];

const AdminProducts = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);

  // Form state
  const [productName, setProductName] = useState("");
  const [material, setMaterial] = useState("");
  const [sex, setSex] = useState<"male" | "female" | "unisex" | "">("");
  const [description, setDescription] = useState("");
  const [colors, setColors] = useState<
    Array<{
      id: string;
      name: string;
      hex: string;
      images: Array<{ id: string; file: File; preview: string }>;
      sizes: { size: string; qty: number }[];
      price: string;
      discount: string;
    }>
  >([]);

  // Available sizes (European sizing)
  const availableSizes = [
    "36",
    "37",
    "38",
    "39",
    "40",
    "41",
    "42",
    "43",
    "44",
    "45",
    "46",
  ];

  // Fetch products from API
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/products/get_products.php`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }

      const data = await response.json();
      if (data.success) {
        setProducts(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      alert("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  // Load products on mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // Toggle color selection
  const handleToggleColor = (colorName: string, colorHex: string) => {
    const existingColor = colors.find((c) => c.name === colorName);
    
    if (existingColor) {
      // Remove color and clean up images
      existingColor.images.forEach((image) => {
        URL.revokeObjectURL(image.preview);
      });
      setColors(colors.filter((c) => c.name !== colorName));
    } else {
      // Add color
      setColors([
        ...colors,
        {
          id: Date.now().toString(),
          name: colorName,
          hex: colorHex,
          images: [],
          sizes: availableSizes.map((size) => ({ size, qty: 0 })),
          price: "",
          discount: "",
        },
      ]);
    }
  };

  // Check if color is selected
  const isColorSelected = (colorName: string) => {
    return colors.some((c) => c.name === colorName);
  };

  // Remove color
  const handleRemoveColor = (colorId: string) => {
    setColors(colors.filter((color) => color.id !== colorId));
  };

  // Add color image
  const handleColorImageChange = (
    colorId: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const color = colors.find((c) => c.id === colorId);

      // Check if already has 2 images
      if (color && color.images.length >= 2) {
        alert("Maximum 2 images per color");
        return;
      }

      // Create preview URL
      const preview = URL.createObjectURL(file);
      const newImage = {
        id: Date.now().toString(),
        file,
        preview,
      };

      setColors(
        colors.map((c) =>
          c.id === colorId ? { ...c, images: [...c.images, newImage] } : c
        )
      );

      // Reset input
      e.target.value = "";
    }
  };

  // Remove color image
  const handleRemoveImage = (colorId: string, imageId: string) => {
    setColors(
      colors.map((color) => {
        if (color.id === colorId) {
          const updatedImages = color.images.filter(
            (img) => img.id !== imageId
          );
          // Revoke the preview URL to free memory
          const imageToRemove = color.images.find((img) => img.id === imageId);
          if (imageToRemove) {
            URL.revokeObjectURL(imageToRemove.preview);
          }
          return { ...color, images: updatedImages };
        }
        return color;
      })
    );
  };

  // Update size quantity
  const handleSizeQtyChange = (
    colorId: string,
    sizeIndex: number,
    qty: number
  ) => {
    setColors(
      colors.map((color) =>
        color.id === colorId
          ? {
              ...color,
              sizes: color.sizes.map((s, idx) =>
                idx === sizeIndex ? { ...s, qty } : s
              ),
            }
          : color
      )
    );
  };

  // Update price for a color
  const handlePriceChange = (colorId: string, price: string) => {
    setColors(
      colors.map((color) =>
        color.id === colorId ? { ...color, price } : color
      )
    );
  };

  // Update discount for a color
  const handleDiscountChange = (colorId: string, discount: string) => {
    setColors(
      colors.map((color) =>
        color.id === colorId ? { ...color, discount } : color
      )
    );
  };

  // Open dialog for adding new product
  const handleOpenAddDialog = () => {
    setEditingProductId(null);
    setProductName("");
    setMaterial("");
    setSex("");
    setDescription("");
    setColors([]);
    setIsDialogOpen(true);
  };

  // Open dialog for editing product
  const handleOpenEditDialog = (productId: string) => {
    const product = products.find((p) => p.id.toString() === productId);
    if (!product) return;

    setEditingProductId(productId);
    setProductName(product.name);
    setMaterial(product.materials || "");
    setSex(product.sex || "unisex");
    setDescription(product.description || "");

    // Convert API product data to color format
    const formattedColors = (product.colors || []).map((colorData: any) => {
      // Get first option for price/discount (assuming all sizes have same price/discount)
      const firstOption = (colorData.options || [])[0] || { price: 0, discount_percentage: 0 };

      return {
        id: colorData.id.toString(),
        name: colorData.color,
        hex: AVAILABLE_COLORS.find(c => c.name === colorData.color)?.hex || "#000000",
        images: [], // Images are already uploaded, we'll handle them separately if needed
        sizes: availableSizes.map((size) => {
          const matchingOption = (colorData.options || []).find((opt: any) => opt.size === size);
          return {
            size,
            qty: matchingOption ? matchingOption.stock : 0,
          };
        }),
        price: firstOption.price.toString(),
        discount: firstOption.discount_percentage.toString(),
      };
    });

    setColors(formattedColors);
    setIsDialogOpen(true);
  };

  // Reset form
  const handleResetForm = () => {
    // Revoke all preview URLs to free memory
    colors.forEach((color) => {
      color.images.forEach((image) => {
        URL.revokeObjectURL(image.preview);
      });
    });

    setEditingProductId(null);
    setProductName("");
    setMaterial("");
    setSex("");
    setDescription("");
    setColors([]);
    setIsDialogOpen(false);
  };

  // Handle submit (add or update)
  const handleSubmit = async () => {
    try {
      // Validate required fields
      if (!productName.trim()) {
        alert("Product name is required");
        return;
      }
      if (!description.trim()) {
        alert("Product description is required");
        return;
      }
      if (!sex) {
        alert("Please select a sex category");
        return;
      }
      if (colors.length === 0) {
        alert("Please add at least one color variant");
        return;
      }

      // Prepare FormData
      const formData = new FormData();
      formData.append("name", productName);
      formData.append("description", description);
      formData.append("materials", material);
      formData.append("sex", sex);
      formData.append("type", "casual"); // Default type

      // Prepare colors data
      const colorsData = colors.map((color, index) => {
        // Add images to FormData
        color.images.forEach((image, imgIndex) => {
          formData.append(`color_${index}_image_${imgIndex + 1}`, image.file);
        });

        // Prepare options array for this color
        const options = color.sizes
          .filter((s) => s.qty > 0) // Only include sizes with stock
          .map((s) => ({
            size: s.size,
            price: parseFloat(color.price) || 0,
            discount_percentage: parseInt(color.discount) || 0,
            stock: s.qty,
          }));

        const colorData: any = {
          color: color.name,
          options,
        };

        // Include color ID for updates (if it's a number, it's from the API)
        if (editingProductId && !isNaN(parseInt(color.id))) {
          colorData.id = parseInt(color.id);
        }

        return colorData;
      });

      formData.append("colors_data", JSON.stringify(colorsData));

      // Determine endpoint
      let url = `${API_URL}/products/create_product.php`;
      if (editingProductId) {
        url = `${API_URL}/products/update_product.php`;
        formData.append("id", editingProductId);
      }

      // Submit request
      const response = await fetch(url, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to save product");
      }

      alert(editingProductId ? "Product updated successfully!" : "Product created successfully!");
      handleResetForm();
      fetchProducts(); // Refresh products list
    } catch (error: any) {
      console.error("Error saving product:", error);
      alert(error.message || "Failed to save product");
    }
  };

  // Handle delete
  const handleDeleteProduct = async (productId: string) => {
    try {
      const response = await fetch(
        `${API_URL}/products/delete_product.php?id=${productId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to delete product");
      }

      alert("Product deleted successfully!");
      setDeletingProductId(null);
      fetchProducts(); // Refresh products list
    } catch (error: any) {
      console.error("Error deleting product:", error);
      alert(error.message || "Failed to delete product");
    }
  };

  // Filter products based on search
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <p className="text-lg text-muted-foreground">Loading products...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex flex-col gap-4 p-4">
      {/* Search */}
      <div className="shrink-0 flex items-center gap-2">
        <Input
          type="text"
          placeholder="Search products..."
          className="h-12 bg-white"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Button className="h-12" onClick={handleOpenAddDialog}>
          <Plus /> <p className="pr-2">Add New Product</p>
        </Button>
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            if (!open) {
              handleResetForm();
            } else {
              setIsDialogOpen(open);
            }
          }}
        >
          <DialogContent
            showCloseButton={false}
            className="max-w-3xl max-h-[90vh] p-0 flex flex-col"
          >
            {/* Header */}
            <DialogHeader className="p-4 border-b flex items-center justify-between">
              <DialogTitle className="text-xl font-display font-bold">
                {editingProductId ? "Edit Product" : "Add New Product"}
              </DialogTitle>
              <DialogClose asChild>
                <Button
                  variant="outline"
                  size="icon-lg"
                  className="rounded-full"
                >
                  <X />
                </Button>
              </DialogClose>
            </DialogHeader>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-6">
                {/* Product Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter product name"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    className="h-10"
                  />
                </div>

                {/* Material */}
                <div className="space-y-2">
                  <Label htmlFor="material">Material</Label>
                  <Input
                    id="material"
                    placeholder="Enter material"
                    value={material}
                    onChange={(e) => setMaterial(e.target.value)}
                    className="h-10"
                  />
                </div>

                {/* Sex Selection */}
                <div className="space-y-2">
                  <Label>Sex</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={sex === "male" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSex("male")}
                      className="rounded-full"
                    >
                      Male
                    </Button>
                    <Button
                      type="button"
                      variant={sex === "female" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSex("female")}
                      className="rounded-full"
                    >
                      Female
                    </Button>
                    <Button
                      type="button"
                      variant={sex === "unisex" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSex("unisex")}
                      className="rounded-full"
                    >
                      Unisex
                    </Button>
                  </div>
                </div>

                {/* Colors Section */}
                <div className="space-y-3">
                  <Label>Choose Colors</Label>

                  {/* Color Circles */}
                  <TooltipProvider>
                    <div className="flex flex-wrap gap-3">
                      {AVAILABLE_COLORS.map((color) => (
                        <Tooltip key={color.name}>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              onClick={() =>
                                handleToggleColor(color.name, color.hex)
                              }
                              className={`w-9 h-9 rounded-full transition-all hover:scale-110 ${
                                isColorSelected(color.name)
                                  ? "ring-2 ring-offset-2 ring-black"
                                  : color.name === "White"
                                  ? "border-2 border-neutral-300"
                                  : "border-0"
                              }`}
                              style={{
                                backgroundColor: color.hex,
                              }}
                            />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{color.name}</p>
                          </TooltipContent>
                        </Tooltip>
                      ))}
                    </div>
                  </TooltipProvider>

                  {/* Selected Colors List */}
                  {colors.length > 0 && (
                    <div className="space-y-4 mt-4">
                      {colors.map((color) => (
                        <div
                          key={color.id}
                          className="border rounded-md p-4 space-y-4 bg-neutral-50"
                        >
                          {/* Color Header */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-8 h-8 rounded-full border-2 border-neutral-300"
                                style={{
                                  backgroundColor: color.hex,
                                  boxShadow:
                                    color.name === "White"
                                      ? "inset 0 0 0 1px #e5e5e5"
                                      : undefined,
                                }}
                              />
                              <h4 className="text-base">
                                {color.name}
                              </h4>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => handleRemoveColor(color.id)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>

                          {/* Image Upload */}
                          <div className="space-y-3">
                            <Label>Product Images (Max 2)</Label>

                            {/* Image Previews */}
                            {color.images.length > 0 && (
                              <div className="flex gap-3">
                                {color.images.map((image) => (
                                  <div
                                    key={image.id}
                                    className="relative w-32 h-32 rounded-md border border-neutral-300 overflow-hidden group"
                                  >
                                    <img
                                      src={image.preview}
                                      alt="Preview"
                                      className="w-full h-full object-cover"
                                    />
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleRemoveImage(color.id, image.id)
                                      }
                                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-md transition-colors"
                                      title="Remove image"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Upload Button */}
                            {color.images.length < 2 && (
                              <div className="flex items-center gap-3">
                                <Input
                                  id={`image-${color.id}`}
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) =>
                                    handleColorImageChange(color.id, e)
                                  }
                                  className="h-10"
                                />
                                <span className="text-sm text-muted-foreground whitespace-nowrap">
                                  {color.images.length}/2
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Price & Discount */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor={`price-${color.id}`}>
                                Price ($)
                              </Label>
                              <Input
                                id={`price-${color.id}`}
                                type="number"
                                placeholder="0.00"
                                value={color.price}
                                onChange={(e) =>
                                  handlePriceChange(color.id, e.target.value)
                                }
                                className="h-10"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`discount-${color.id}`}>
                                Discount (%)
                              </Label>
                              <Input
                                id={`discount-${color.id}`}
                                type="number"
                                placeholder="0"
                                value={color.discount}
                                onChange={(e) =>
                                  handleDiscountChange(color.id, e.target.value)
                                }
                                className="h-10"
                              />
                            </div>
                          </div>

                          {/* Size Quantities */}
                          <div className="space-y-2">
                            <Label>Size Quantities</Label>
                            <div className="grid grid-cols-5 gap-3">
                              {color.sizes.map((sizeItem, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center gap-2"
                                >
                                  <Label
                                    htmlFor={`${color.id}-${sizeItem.size}`}
                                    className="w-8 text-sm"
                                  >
                                    {sizeItem.size}:
                                  </Label>
                                  <Input
                                    id={`${color.id}-${sizeItem.size}`}
                                    type="number"
                                    min="0"
                                    value={sizeItem.qty}
                                    onChange={(e) =>
                                      handleSizeQtyChange(
                                        color.id,
                                        idx,
                                        parseInt(e.target.value) || 0
                                      )
                                    }
                                    className="h-9 text-sm"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Enter product description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <DialogFooter className="p-4 border-t bg-neutral-50 rounded-b-md">
              <div className="flex gap-2 justify-end w-full">
                <Button
                  type="button"
                  variant="outline"
                  size={"lg"}
                  onClick={handleResetForm}
                >
                  Discard
                </Button>
                <Button type="button" onClick={handleSubmit} size={"lg"}>
                  {editingProductId ? "Update Product" : "Add Product"}
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Products Table */}
      <div className="flex-1 flex flex-col bg-white rounded-md overflow-hidden min-h-0">
        {/* Table Header */}
        <div className="shrink-0 border-b">
          <Table className="table-fixed">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[320px] h-12 px-4">Product</TableHead>
                <TableHead className="w-[140px]">ID</TableHead>
                <TableHead className="w-[100px]">Total Qty</TableHead>
                <TableHead className="w-[120px]">Discount</TableHead>
                <TableHead className="w-[140px]">Sales YTD</TableHead>
                <TableHead className="w-[100px]">Price</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
          </Table>
        </div>

        {/* Scrollable Table Body */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <Table className="table-fixed">
            <TableBody>
              {filteredProducts.flatMap((product) => {
                // If product has no colors, show a single row
                if (!product.colors || product.colors.length === 0) {
                  return [{
                    product,
                    color: null,
                    key: `${product.id}`
                  }];
                }

                // Otherwise, create a row for each color
                return product.colors.map((color: any) => ({
                  product,
                  color,
                  key: `${product.id}-${color.id}`
                }));
              }).map(({ product, color, key }) => {
                // Calculate quantities for this specific color
                const colorQty = color
                  ? (color.options || []).reduce(
                      (total: number, opt: any) => total + (opt.stock || 0),
                      0
                    )
                  : 0;

                // Get price and discount from first option of this color
                const firstOption = color?.options?.[0];
                const price = firstOption?.price || 0;
                const discount = firstOption?.discount_percentage || 0;

                // Get image for this color
                const imageUrl = color?.image_url;

                return (
                  <TableRow key={key}>
                    <TableCell className="w-[320px] px-4">
                      <div className="flex gap-4 items-center py-1">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={`${product.name} - ${color?.color}`}
                            className="aspect-square w-16 rounded-sm object-cover bg-neutral-200"
                          />
                        ) : (
                          <div className="aspect-square w-16 rounded-sm bg-neutral-300" />
                        )}
                        <div className="flex flex-col">
                          <h1 className="text-base font-medium truncate">
                            {product.name}
                          </h1>
                          {color && (
                            <span className="text-sm text-muted-foreground">
                              {color.color}
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="w-[140px] font-mono text-sm">
                      {product.id}
                    </TableCell>
                    <TableCell className="w-[100px]">
                      {colorQty} pcs
                    </TableCell>
                    <TableCell className="w-[120px]">
                      {discount > 0 ? (
                        <span className="font-medium text-green-600">
                          {discount}% off
                        </span>
                      ) : (
                        <span className="text-muted-foreground">No discount</span>
                      )}
                    </TableCell>
                    <TableCell className="w-[140px] font-display">
                      $0.00
                    </TableCell>
                    <TableCell className="w-[100px] font-display">
                      ${price.toFixed(2)}
                    </TableCell>
                    <TableCell className="w-[100px]">
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleOpenEditDialog(product.id.toString())}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon-sm">
                              <Trash className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Are you absolutely sure?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently
                                delete{" "}
                                <span>
                                  {product.name}
                                </span>{" "}
                                and remove all associated data from our servers.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() =>
                                  handleDeleteProduct(product.id.toString())
                                }
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default AdminProducts;

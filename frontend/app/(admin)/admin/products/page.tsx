"use client";

import { useState } from "react";
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

// Mock product data
const mockProducts = [
  {
    id: "1234567890",
    name: "Nike Air Max 270",
    image: "bg-neutral-500",
    sizes: [
      { size: "US 8", qty: 15 },
      { size: "US 9", qty: 12 },
      { size: "US 10", qty: 15 },
    ],
    discount: 10,
    sales: 12450.0,
    price: 180.0,
  },
  {
    id: "0987654321",
    name: "Adidas Ultraboost 22",
    image: "bg-neutral-400",
    sizes: [
      { size: "US 7", qty: 8 },
      { size: "US 8", qty: 10 },
      { size: "US 9", qty: 10 },
    ],
    discount: 15,
    sales: 8920.0,
    price: 190.0,
  },
  {
    id: "5647382910",
    name: "New Balance 990v6",
    image: "bg-neutral-600",
    sizes: [
      { size: "US 8", qty: 5 },
      { size: "US 9", qty: 5 },
      { size: "US 10", qty: 5 },
    ],
    discount: 0,
    sales: 7350.0,
    price: 175.0,
  },
  {
    id: "1928374650",
    name: "Asics Gel-Kayano 29",
    image: "bg-neutral-700",
    sizes: [
      { size: "US 7", qty: 20 },
      { size: "US 8", qty: 18 },
      { size: "US 9", qty: 12 },
    ],
    discount: 20,
    sales: 6800.0,
    price: 160.0,
  },
  {
    id: "5738291046",
    name: "Puma RS-X3",
    image: "bg-neutral-300",
    sizes: [
      { size: "US 8", qty: 25 },
      { size: "US 9", qty: 20 },
      { size: "US 10", qty: 15 },
    ],
    discount: 5,
    sales: 5200.0,
    price: 130.0,
  },
  {
    id: "8374629105",
    name: "Reebok Nano X2",
    image: "bg-neutral-800",
    sizes: [
      { size: "US 7", qty: 10 },
      { size: "US 8", qty: 8 },
      { size: "US 9", qty: 7 },
    ],
    discount: 10,
    sales: 4900.0,
    price: 140.0,
  },
  {
    id: "2938475610",
    name: "Hoka One One Clifton 8",
    image: "bg-neutral-400",
    sizes: [
      { size: "US 8", qty: 14 },
      { size: "US 9", qty: 12 },
      { size: "US 10", qty: 10 },
    ],
    discount: 0,
    sales: 4500.0,
    price: 150.0,
  },
  {
    id: "4857392016",
    name: "Saucony Endorphin Speed 2",
    image: "bg-neutral-500",
    sizes: [
      { size: "US 7", qty: 6 },
      { size: "US 8", qty: 8 },
      { size: "US 9", qty: 10 },
    ],
    discount: 25,
    sales: 4200.0,
    price: 170.0,
  },
  {
    id: "9182736450",
    name: "Brooks Ghost 14",
    image: "bg-neutral-600",
    sizes: [
      { size: "US 8", qty: 18 },
      { size: "US 9", qty: 15 },
      { size: "US 10", qty: 12 },
    ],
    discount: 10,
    sales: 3800.0,
    price: 140.0,
  },
  {
    id: "3847562910",
    name: "Mizuno Wave Rider 25",
    image: "bg-neutral-700",
    sizes: [
      { size: "US 7", qty: 9 },
      { size: "US 8", qty: 11 },
      { size: "US 9", qty: 10 },
    ],
    discount: 15,
    sales: 3500.0,
    price: 135.0,
  },
  {
    id: "5629384710",
    name: "Under Armour HOVR Phantom 2",
    image: "bg-neutral-300",
    sizes: [
      { size: "US 8", qty: 22 },
      { size: "US 9", qty: 18 },
      { size: "US 10", qty: 14 },
    ],
    discount: 20,
    sales: 3200.0,
    price: 150.0,
  },
  {
    id: "7485920163",
    name: "On Cloudflow",
    image: "bg-neutral-800",
    sizes: [
      { size: "US 7", qty: 7 },
      { size: "US 8", qty: 9 },
      { size: "US 9", qty: 11 },
    ],
    discount: 0,
    sales: 2900.0,
    price: 145.0,
  },
];

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
    const product = mockProducts.find((p) => p.id === productId);
    if (!product) return;

    setEditingProductId(productId);
    setProductName(product.name);
    setMaterial("Synthetic Mesh"); // Mock material since it's not in mockProducts
    setSex("unisex"); // Mock sex since it's not in mockProducts
    setDescription("High-performance athletic footwear designed for comfort and style."); // Mock description
    
    // Convert mock product data to color format
    // For demo purposes, we'll create a single "Black" color with the product's data
    setColors([
      {
        id: Date.now().toString(),
        name: "Black",
        hex: "#000000",
        images: [],
        sizes: product.sizes.map((s) => ({
          size: s.size.replace("US ", ""), // Convert "US 8" to "8"
          qty: s.qty,
        })),
        price: product.price.toString(),
        discount: product.discount.toString(),
      },
    ]);
    
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
  const handleSubmit = () => {
    if (editingProductId) {
      // TODO: Implement update product logic
      console.log("Updating product:", editingProductId, {
        productName,
        material,
        sex,
        description,
        colors,
      });
    } else {
      // TODO: Implement add product logic
      console.log("Adding new product:", {
        productName,
        material,
        sex,
        description,
        colors,
      });
    }
    handleResetForm();
  };

  // Handle delete
  const handleDeleteProduct = (productId: string) => {
    // TODO: Implement delete product logic
    console.log("Deleting product:", productId);
    setDeletingProductId(null);
  };

  // Filter products based on search
  const filteredProducts = mockProducts.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                              <h4 className="font-semibold text-base">
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
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="w-[320px] px-4">
                    <div className="flex gap-4 items-center py-1">
                      <div
                        className={`aspect-square w-16 rounded-sm ${product.image}`}
                      />
                      <h1 className="text-base font-medium truncate">{product.name}</h1>
                    </div>
                  </TableCell>
                  <TableCell className="w-[140px] font-mono text-sm">
                    {product.id}
                  </TableCell>
                  <TableCell className="w-[100px] font-medium">
                    {product.sizes.reduce((total, size) => total + size.qty, 0)}{" "}
                    pcs
                  </TableCell>
                  <TableCell className="w-[120px]">
                    {product.discount > 0 ? (
                      <span className="font-medium text-green-600">
                        {product.discount}% off
                      </span>
                    ) : (
                      <span className="text-muted-foreground">No discount</span>
                    )}
                  </TableCell>
                  <TableCell className="w-[140px] font-display font-bold">
                    $
                    {product.sales.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </TableCell>
                  <TableCell className="w-[100px] font-display font-semibold">
                    ${product.price.toFixed(2)}
                  </TableCell>
                  <TableCell className="w-[100px]">
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleOpenEditDialog(product.id)}
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
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete{" "}
                              <span className="font-semibold">{product.name}</span> and remove
                              all associated data from our servers.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteProduct(product.id)}
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
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default AdminProducts;

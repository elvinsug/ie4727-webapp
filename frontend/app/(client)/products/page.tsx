"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { useState, useEffect, Suspense } from "react";
import FilterSheet from "@/components/FilterSheet";
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "@/components/ProductCard";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

const ShoeTypes = [
	{
		name: "All Types",
		path: "/products",
	},
	{
		name: "Casual",
		path: "/products?type=casual",
		icon: `${BASE_PATH}/shoes-icon/casual.svg`,
	},
	{
		name: "Track & Field",
		path: "/products?type=track_field",
		icon: `${BASE_PATH}/shoes-icon/track_field.svg`,
	},
	{
		name: "Arch",
		path: "/products?type=arch",
		icon: `${BASE_PATH}/shoes-icon/arch.svg`,
	},
];

const AvailableSizes = [
	{
		name: "All Sizes",
		path: "/products",
	},
	{
		name: "36",
		path: "/products?size=36",
	},
	{
		name: "37",
		path: "/products?size=37",
	},
	{
		name: "38",
		path: "/products?size=38",
	},
	{
		name: "39",
		path: "/products?size=39",
	},
	{
		name: "40",
		path: "/products?size=40",
	},
	{
		name: "41",
		path: "/products?size=41",
	},
	{
		name: "42",
		path: "/products?size=42",
	},
	{
		name: "43",
		path: "/products?size=43",
	},
	{
		name: "44",
		path: "/products?size=44",
	},
	{
		name: "45",
		path: "/products?size=45",
	},
];

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost/miona/api";

const ProductsPageContent = () => {
	const pathname = usePathname();
	const router = useRouter();
	const searchParams = useSearchParams();

	// State for selected filters
	const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
	const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
	const [selectedSort, setSelectedSort] = useState<string>("");

	// State for products data
	const [products, setProducts] = useState<any[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [pagination, setPagination] = useState({
		current_page: 1,
		per_page: 10,
		total: 0,
		total_pages: 0,
		has_next: false,
		has_prev: false,
	});

	// Get all available type values (excluding "All Types")
	const allTypeValues = ShoeTypes.filter((t) => t.name !== "All Types").map(
		(t) => t.path.split("=")[1]
	);

	// Get all available size values (excluding "All Sizes")
	const allSizeValues = AvailableSizes.filter(
		(s) => s.name !== "All Sizes"
	).map((s) => s.path.split("=")[1]);

	// Fetch products from API
	const fetchProducts = async () => {
		setLoading(true);
		setError(null);

		try {
			// Build query parameters from URL search params
			const params = new URLSearchParams();

			// Add search parameter
			const search = searchParams.get("search");
			if (search) {
				params.set("search", search);
			}

			// Add sex parameter
			const sex = searchParams.get("sex");
			if (sex) {
				params.set("sex", sex);
			}

			// Add type parameter (comma-separated if multiple)
			const type = searchParams.get("type");
			if (type) {
				params.set("type", type);
			}

			// Add material parameter
			const material = searchParams.get("material");
			if (material) {
				params.set("material", material);
			}

			// Add sizes parameter (rename from 'size' to 'sizes' for API)
			const size = searchParams.get("size");
			if (size) {
				params.set("sizes", size);
			}

			// Add price range parameters
			const price_low = searchParams.get("price_low");
			if (price_low) {
				params.set("price_low", price_low);
			}

			const price_high = searchParams.get("price_high");
			if (price_high) {
				params.set("price_high", price_high);
			}

			// Add sort parameter
			const sort = searchParams.get("sort");
			if (sort) {
				params.set("sort", sort);
			}

			// Add pagination parameters
			const page = searchParams.get("page") || "1";
			const limit = searchParams.get("limit") || "12";
			params.set("page", page);
			params.set("limit", limit);

			const response = await fetch(
				`${API_URL}/products/get_products.php?${params.toString()}`
			);

			if (!response.ok) {
				throw new Error("Failed to fetch products");
			}

			const data = await response.json();

			if (data.success) {
				setProducts(data.data || []);
				setPagination(data.pagination);
			} else {
				throw new Error(data.error || "Failed to fetch products");
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : "An error occurred");
			setProducts([]);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchProducts();
	}, []);

	// Fetch products when search params change (including pagination)
	useEffect(() => {
		fetchProducts();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [searchParams.toString()]);

	// Initialize from URL params
	useEffect(() => {
		const typeParam = searchParams.get("type");
		const sizeParam = searchParams.get("size");
		const sortParam = searchParams.get("sort");

		const newTypes = typeParam ? typeParam.split(",") : [];
		const newSizes = sizeParam ? sizeParam.split(",") : [];
		const newSort = sortParam || "";

		// Only update state if values actually changed (avoid unnecessary re-renders)
		setSelectedTypes((prev) => {
			if (prev.length !== newTypes.length || !prev.every((val, idx) => val === newTypes[idx])) {
				return newTypes;
			}
			return prev;
		});

		setSelectedSizes((prev) => {
			if (prev.length !== newSizes.length || !prev.every((val, idx) => val === newSizes[idx])) {
				return newSizes;
			}
			return prev;
		});

		setSelectedSort((prev) => {
			if (prev !== newSort) {
				return newSort;
			}
			return prev;
		});
	}, [searchParams]);

	// Check if all types are selected
	const allTypesSelected =
		selectedTypes.length === allTypeValues.length &&
		allTypeValues.every((type) => selectedTypes.includes(type));

	// Check if all sizes are selected
	const allSizesSelected =
		selectedSizes.length === allSizeValues.length &&
		allSizeValues.every((size) => selectedSizes.includes(size));

	// Toggle type filter
	const toggleType = (typeValue: string | null) => {
		if (typeValue === null) {
			// "All Types" clicked - clear all types
			setSelectedTypes([]);
		} else {
			setSelectedTypes((prev) => {
				if (prev.includes(typeValue)) {
					// Remove the type
					return prev.filter((t) => t !== typeValue);
				} else {
					// Add the type
					return [...prev, typeValue];
				}
			});
		}
	};

	// Toggle size filter
	const toggleSize = (sizeValue: string | null) => {
		if (sizeValue === null) {
			// "All Sizes" clicked - clear all sizes
			setSelectedSizes([]);
		} else {
			setSelectedSizes((prev) => {
				if (prev.includes(sizeValue)) {
					// Remove the size
					return prev.filter((s) => s !== sizeValue);
				} else {
					// Add the size
					return [...prev, sizeValue];
				}
			});
		}
	};

	useEffect(() => {
		const params = new URLSearchParams(searchParams.toString());

		// Handle types
		if (selectedTypes.length > 0) {
			params.set("type", selectedTypes.join(","));
		} else {
			params.delete("type");
		}

		// Handle sizes
		if (selectedSizes.length > 0) {
			params.set("size", selectedSizes.join(","));
		} else {
			params.delete("size");
		}

		// Handle sort
		if (selectedSort) {
			params.set("sort", selectedSort);
		} else {
			params.delete("sort");
		}

		// Reset to page 1 when filters change (but keep other params)
		params.delete("page");

		const queryString = params.toString();

		if (queryString) {
			router.replace(`${pathname}?${queryString}`, { scroll: false });
		} else {
			router.replace(`${pathname}`, { scroll: false });
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedTypes, selectedSizes, selectedSort]);

	return (
		<div className="mt-[88px] w-screen p-8 pt-4">
			<header className="flex flex-col gap-2">
				{/* Breadcrumb */}
				<div className="flex items-center gap-2 text-gray-500 text-sm">
					<Link
						href="/"
						className="hover:text-gray-900 transition-colors duration-100 cursor-pointer"
					>
						MIONA
					</Link>
					<span>/</span>
					<Link
						href="/products"
						className="hover:text-gray-900 transition-colors duration-100 cursor-pointer"
					>
						Sneakers for Men
					</Link>
				</div>
				{/* Page Title */}
				<h1 className="text-3xl font-bold">Sneakers for Men</h1>

				{/* Debug Display */}
				{/* <div className="bg-gray-100 p-4 rounded-lg text-sm space-y-2 mt-2">
          <div>
            <span className="font-semibold">Selected Types:</span>{" "}
            {selectedTypes.length > 0 ? (
              <span className="text-blue-600">[{selectedTypes.join(", ")}]</span>
            ) : (
              <span className="text-gray-400">[]</span>
            )}
            {allTypesSelected && (
              <span className="ml-2 text-green-600 font-semibold">✓ All Types Selected</span>
            )}
          </div>
          <div>
            <span className="font-semibold">Selected Sizes:</span>{" "}
            {selectedSizes.length > 0 ? (
              <span className="text-blue-600">[{selectedSizes.join(", ")}]</span>
            ) : (
              <span className="text-gray-400">[]</span>
            )}
            {allSizesSelected && (
              <span className="ml-2 text-green-600 font-semibold">✓ All Sizes Selected</span>
            )}
          </div>
        </div> */}

				{/* The Filters */}
				<div className="flex flex-col gap-2 mt-3">
					{/* Types Button Chips + Filter */}
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							{ShoeTypes.map((type) => {
								const [path, query] = type.path.split("?");
								const typeValue = query?.split("=")[1];

								// Special case: When all types are selected, only "All Types" is active
								// Individual types are NOT active when all are selected
								let isActive = false;
								if (type.name === "All Types") {
									// "All Types" is active when no types selected OR all types selected
									isActive = selectedTypes.length === 0 || allTypesSelected;
								} else {
									// Individual type is active ONLY if:
									// - It's in the selection AND
									// - Not all types are selected
									isActive =
										selectedTypes.includes(typeValue) && !allTypesSelected;
								}

								return (
									<Button
										key={type.name}
										variant={isActive ? "default" : "secondary"}
										className="font-thin flex items-center gap-2"
										size="sm"
										onClick={() =>
											toggleType(type.name === "All Types" ? null : typeValue)
										}
									>
										{type.name !== "All Types" && (
											<Image
												src={type.icon || ""}
												alt={type.name}
												width={28}
												height={28}
											/>
										)}
										{type.name}
									</Button>
								);
							})}
						</div>

						{/* The Sort + Filters */}
						<div className="flex items-center gap-6">
							<div className="flex gap-2 items-center">
								<p>Sort Price</p>
								<div className="flex rounded-full">
									<Button
										variant={selectedSort === 'price_asc' ? 'default' : 'ghost'}
										size="icon-sm"
										className="rounded-full"
										onClick={() => setSelectedSort(selectedSort === 'price_asc' ? '' : 'price_asc')}
									>
										<ArrowUp className="w-3 h-3" />
									</Button>
									<Button
										variant={selectedSort === 'price_desc' ? 'default' : 'ghost'}
										size="icon-sm"
										className="rounded-full"
										onClick={() => setSelectedSort(selectedSort === 'price_desc' ? '' : 'price_desc')}
									>
										<ArrowDown className="w-3 h-3" />
									</Button>
								</div>
							</div>
							<div className="h-6 w-px bg-black" />
							<div className="flex gap-2 items-center">
								<p>Sort Release</p>
								<div className="flex rounded-full">
									<Button
										variant={selectedSort === 'release_asc' ? 'default' : 'ghost'}
										size="icon-sm"
										className="rounded-full"
										onClick={() => setSelectedSort(selectedSort === 'release_asc' ? '' : 'release_asc')}
									>
										<ArrowUp className="w-3 h-3" />
									</Button>
									<Button
										variant={selectedSort === 'release_desc' ? 'default' : 'ghost'}
										size="icon-sm"
										className="rounded-full"
										onClick={() => setSelectedSort(selectedSort === 'release_desc' ? '' : 'release_desc')}
									>
										<ArrowDown className="w-3 h-3" />
									</Button>
								</div>
							</div>
							<div className="h-6 w-px bg-black" />
							<FilterSheet />
						</div>
					</div>

					{/* Sizes Button Chips */}
					<div className="flex items-center gap-2">
						<div className="flex items-center gap-2 flex-wrap">
							{AvailableSizes.map((size) => {
								const [path, query] = size.path.split("?");
								const sizeValue = query?.split("=")[1];

								// Special case: When all sizes are selected, only "All Sizes" is active
								// Individual sizes are NOT active when all are selected
								let isActive = false;
								if (size.name === "All Sizes") {
									// "All Sizes" is active when no sizes selected OR all sizes selected
									isActive = selectedSizes.length === 0 || allSizesSelected;
								} else {
									// Individual size is active ONLY if:
									// - It's in the selection AND
									// - Not all sizes are selected
									isActive =
										selectedSizes.includes(sizeValue) && !allSizesSelected;
								}

								return (
									<Button
										key={size.name}
										variant={isActive ? "default" : "secondary"}
										className="font-normal"
										size="sm"
										onClick={() =>
											toggleSize(size.name === "All Sizes" ? null : sizeValue)
										}
									>
										{size.name}
									</Button>
								);
							})}
						</div>
					</div>
				</div>
			</header>

			{/* Products Grid */}
			<div className="mt-8">
				{/* Error State */}
				{error && (
					<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
						{error}
					</div>
				)}

				{/* Loading State */}
				{loading && (
					<div className="flex items-center justify-center py-12">
						<p className="text-gray-500">Loading products...</p>
					</div>
				)}

				{/* Products Display */}
				{!loading && !error && (
					<>
						{/* Products Info */}
						<div className="mb-4 text-sm text-gray-600">
							Showing {products.length} of {pagination.total} products
							{pagination.total > 0 && (
								<span>
									{" "}
									(Page {pagination.current_page} of {pagination.total_pages})
								</span>
							)}
						</div>

						{/* Products Grid */}
						{products.length > 0 ? (
							<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
								{products.map((product, index) => (
									<ProductCard
										key={`${product.product_id}-${product.color}-${index}`}
										id={product.product_id}
										name={`${product.product_name} - ${product.color}`}
										sizes={product.options ? product.options.map((opt: any) => opt.size) : []}
										price={product.price}
										discount={product.discount_percentage}
										image={product.image_url}
										image2={product.image_url_2}
									/>
								))}
							</div>
						) : (
							<div className="text-center py-12">
								<p className="text-gray-500">
									No products found matching your filters.
								</p>
							</div>
						)}

						{/* Pagination */}
						{pagination.total_pages > 1 && (
							<div className="flex items-center justify-center gap-2 mt-8">
								<Button
									variant="ghost"
									size="icon"
									disabled={!pagination.has_prev}
									onClick={() => {
										const params = new URLSearchParams(searchParams.toString());
										params.set("page", String(pagination.current_page - 1));
										router.push(`${pathname}?${params.toString()}`);
									}}
								>
									<ChevronLeft className="w-5 h-5" />
								</Button>

								<span className="text-sm text-gray-600">
									Page {pagination.current_page} / {pagination.total_pages}
								</span>

								<Button
									variant="ghost"
									size="icon"
									disabled={!pagination.has_next}
									onClick={() => {
										const params = new URLSearchParams(searchParams.toString());
										params.set("page", String(pagination.current_page + 1));
										router.push(`${pathname}?${params.toString()}`);
									}}
								>
									<ChevronRight className="w-5 h-5" />
								</Button>
							</div>
						)}
					</>
				)}
			</div>
		</div>
	);
};

const ProductsPage = () => {
	return (
		<Suspense fallback={<div className="mt-[88px] w-screen p-8 pt-4">Loading...</div>}>
			<ProductsPageContent />
		</Suspense>
	);
};

export default ProductsPage;

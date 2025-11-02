"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
	SheetFooter,
	SheetClose,
} from "@/components/ui/sheet";
import { Button } from "./ui/button";
import { ChevronDown, ChevronUp, X } from "lucide-react";

// Types for filter data (placeholders for BE data)
interface ShoeType {
	id: string;
	name: string;
	value: string;
}

interface Material {
	id: string;
	name: string;
	value: string;
}

const FilterSheet = () => {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	// Placeholder data - to be fetched from backend
	const [shoeTypes] = useState<ShoeType[]>([
		{ id: "1", name: "Casual", value: "casual" },
		{ id: "2", name: "Track & Field", value: "track_field" },
		{ id: "3", name: "Arch", value: "arch" },
	]);

	const [availableSizes] = useState<string[]>([
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
	]);

	const [materials] = useState<Material[]>([
		{ id: "1", name: "Leather", value: "leather" },
		{ id: "2", name: "Canvas", value: "canvas" },
		{ id: "3", name: "Synthetic", value: "synthetic" },
		{ id: "4", name: "Mesh", value: "mesh" },
	]);

	// Selected filters state
	const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
	const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
	const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
	const [onSale, setOnSale] = useState(false);
	const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
	const [bufferPriceRange, setBufferPriceRange] = useState<[number, number]>([
		0, 500,
	]);

	// Sheet open/close state
	const [isOpen, setIsOpen] = useState(false);

	// Initialize filters from URL parameters
	useEffect(() => {
		const typeParam = searchParams.get("type");
		const sizeParam = searchParams.get("size");
		const materialParam = searchParams.get("material");
		const priceLowParam = searchParams.get("price_low");
		const priceHighParam = searchParams.get("price_high");

		if (typeParam) {
			setSelectedTypes(typeParam.split(","));
		}
		if (sizeParam) {
			setSelectedSizes(sizeParam.split(","));
		}
		if (materialParam) {
			setSelectedMaterials(materialParam.split(","));
		}
		if (priceLowParam || priceHighParam) {
			const low = priceLowParam ? parseInt(priceLowParam) : 0;
			const high = priceHighParam ? parseInt(priceHighParam) : 500;
			setPriceRange([low, high]);
			setBufferPriceRange([low, high]);
		}
	}, [searchParams]);

	// Collapsible sections state
	const [expandedSections, setExpandedSections] = useState<{
		[key: string]: boolean;
	}>({
		discount: true,
		type: true,
		size: true,
		price: true,
		material: true,
		gender: true,
	});

	const toggleSection = (section: string) => {
		setExpandedSections((prev) => ({
			...prev,
			[section]: !prev[section],
		}));
	};

	const toggleSelection = (
		value: string,
		selectedArray: string[],
		setFunction: React.Dispatch<React.SetStateAction<string[]>>
	) => {
		if (selectedArray.includes(value)) {
			setFunction(selectedArray.filter((item) => item !== value));
		} else {
			setFunction([...selectedArray, value]);
		}
	};

	const clearAllFilters = () => {
		setSelectedTypes([]);
		setSelectedSizes([]);
		setSelectedMaterials([]);
		setOnSale(false);
		setPriceRange([0, 500]);
		setBufferPriceRange([0, 500]);

		// Clear URL parameters (keep only page/limit if they exist)
		const params = new URLSearchParams();
		const page = searchParams.get("page");
		const limit = searchParams.get("limit");

		if (page) params.set("page", page);
		if (limit) params.set("limit", limit);

		const queryString = params.toString();
		if (queryString) {
			router.replace(`?${queryString}`, { scroll: false });
		}
	};

	const applyFilters = () => {
		// Build query parameters from selected filters
		const params = new URLSearchParams();

		// Preserve existing search/page/limit params
		const search = searchParams.get("search");
		const page = searchParams.get("page");
		const limit = searchParams.get("limit");

		if (search) params.set("search", search);

		// Add filter parameters
		if (selectedTypes.length > 0) {
			params.set("type", selectedTypes.join(","));
		}
		if (selectedSizes.length > 0) {
			params.set("size", selectedSizes.join(","));
		}
		if (selectedMaterials.length > 0) {
			params.set("material", selectedMaterials.join(","));
		}
		if (priceRange[0] > 0) {
			params.set("price_low", priceRange[0].toString());
		}
		if (priceRange[1] < 500) {
			params.set("price_high", priceRange[1].toString());
		}

		// Reset to page 1 when filters change
		params.set("page", "1");
		if (limit) params.set("limit", limit);

		const queryString = params.toString();

		// Use router.replace to update URL without creating history entries
		router.replace(queryString ? `?${queryString}` : pathname, { scroll: false });

		// Close the sheet after applying filters
		setIsOpen(false);
	};

	return (
		<Sheet open={isOpen} onOpenChange={setIsOpen}>
			<SheetTrigger asChild>
				<Button variant="outline" size="sm" className="rounded-full">
					Filters
				</Button>
			</SheetTrigger>
			<SheetContent className="p-0 flex flex-col" hideCloseButton={true}>
				{/* Fixed Header */}
				<SheetHeader className="border-b px-6 py-4 shrink-0">
					<div className="flex items-center justify-between">
						<SheetTitle className="text-2xl font-bold">Filters</SheetTitle>
						<SheetClose asChild>
							<Button variant="outline" size="icon-lg" className="rounded-full">
								<X className="w-5 h-5" />
							</Button>
						</SheetClose>
					</div>
				</SheetHeader>

				{/* Scrollable Content Area - fills remaining space */}
				<div className="flex-1 overflow-y-auto min-h-0">
					<div className="flex flex-col gap-6 p-6">
						{/* Discount Section */}
						<div className="border-b pb-4">
							<button
								onClick={() => toggleSection("discount")}
								className="flex items-center justify-between w-full text-left"
							>
								<h3 className="text-lg font-semibold">Sale</h3>
								{expandedSections.discount ? (
									<ChevronUp className="w-5 h-5" />
								) : (
									<ChevronDown className="w-5 h-5" />
								)}
							</button>
							{expandedSections.discount && (
								<div className="mt-4">
									<Button
										variant={onSale ? "default" : "secondary"}
										size="sm"
										onClick={() => setOnSale(!onSale)}
										className="rounded-full font-thin"
									>
										On Sale
									</Button>
								</div>
							)}
						</div>

						{/* Type Section */}
						<div className="border-b pb-4">
							<button
								onClick={() => toggleSection("type")}
								className="flex items-center justify-between w-full text-left"
							>
								<h3 className="text-lg font-semibold">Type</h3>
								{expandedSections.type ? (
									<ChevronUp className="w-5 h-5" />
								) : (
									<ChevronDown className="w-5 h-5" />
								)}
							</button>
							{expandedSections.type && (
								<div className="mt-4 flex flex-wrap gap-2">
									{shoeTypes.map((type) => (
										<Button
											key={type.id}
											variant={
												selectedTypes.includes(type.value)
													? "default"
													: "secondary"
											}
											size="sm"
											onClick={() =>
												toggleSelection(
													type.value,
													selectedTypes,
													setSelectedTypes
												)
											}
											className="rounded-full font-thin"
										>
											{type.name}
										</Button>
									))}
								</div>
							)}
						</div>

						{/* Size Section */}
						<div className="border-b pb-4">
							<button
								onClick={() => toggleSection("size")}
								className="flex items-center justify-between w-full text-left"
							>
								<h3 className="text-lg font-semibold">Size</h3>
								{expandedSections.size ? (
									<ChevronUp className="w-5 h-5" />
								) : (
									<ChevronDown className="w-5 h-5" />
								)}
							</button>
							{expandedSections.size && (
								<div className="mt-4 grid grid-cols-4 gap-2">
									{availableSizes.map((size) => (
										<Button
											key={size}
											variant={
												selectedSizes.includes(size) ? "default" : "secondary"
											}
											size="sm"
											onClick={() =>
												toggleSelection(size, selectedSizes, setSelectedSizes)
											}
											className="rounded-lg font-thin"
										>
											{size}
										</Button>
									))}
								</div>
							)}
						</div>

						{/* Price Section */}
						<div className="border-b pb-4">
							<button
								onClick={() => toggleSection("price")}
								className="flex items-center justify-between w-full text-left"
							>
								<h3 className="text-lg font-semibold">Price</h3>
								{expandedSections.price ? (
									<ChevronUp className="w-5 h-5" />
								) : (
									<ChevronDown className="w-5 h-5" />
								)}
							</button>
							{expandedSections.price && (
								<div className="mt-4 space-y-4">
									{/* Dual Range Slider */}
									<div className="relative pt-2">
										{/* Track Background */}
										<div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 rounded-full -translate-y-1/2"></div>

										{/* Active Track (between handles) */}
										<div
											className="absolute top-1/2 h-1 bg-black rounded-full -translate-y-1/2"
											style={{
												left: `${(priceRange[0] / 500) * 100}%`,
												right: `${100 - (priceRange[1] / 500) * 100}%`,
											}}
										></div>

										{/* Lower Range Input */}
										<input
											type="range"
											min="0"
											max="500"
											value={priceRange[0]}
											onChange={(e) => {
												const value = parseInt(e.target.value);
												if (value < priceRange[1]) {
													setPriceRange([value, priceRange[1]]);
													setBufferPriceRange([value, priceRange[1]]);
												}
											}}
											className="absolute w-full top-1/2 -translate-y-1/2 bg-transparent appearance-none cursor-pointer pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-black [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-black [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-0"
										/>

										{/* Upper Range Input */}
										<input
											type="range"
											min="0"
											max="500"
											value={priceRange[1]}
											onChange={(e) => {
												const value = parseInt(e.target.value);
												if (value > priceRange[0]) {
													setPriceRange([priceRange[0], value]);
													setBufferPriceRange([priceRange[0], value]);
												}
											}}
											className="absolute w-full top-1/2 -translate-y-1/2 bg-transparent appearance-none cursor-pointer pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-black [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-black [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-0"
										/>
									</div>

									<div className="flex items-center justify-between gap-2 text-sm">
										<div className="flex items-center">
											<span className="text-gray-600 mr-1">S$</span>
											<input
												type="number"
												min="0"
												max="500"
												value={bufferPriceRange[0]}
												onFocus={(e) => {
													// Select all text when focused
													e.target.select();
												}}
												onChange={(e) => {
													const value = parseInt(e.target.value);
													setBufferPriceRange([value, bufferPriceRange[1]]);
													if (
														value >= 0 &&
														value <= 500 &&
														value <= priceRange[1]
													) {
														setPriceRange([value, priceRange[1]]);
													}
												}}
												onBlur={(e) => {
													const value = parseInt(e.target.value);
													if (value > priceRange[1]) {
														setBufferPriceRange([priceRange[1], priceRange[1]]);
														setPriceRange([priceRange[1], priceRange[1]]);
													}
												}}
												className="w-16 px-2 py-1 border border-gray-300 rounded text-gray-900 focus:outline-none focus:border-gray-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
											/>
										</div>
										<span className="text-gray-600">to</span>
										<div className="flex items-center">
											<span className="text-gray-600 mr-1">S$</span>
											<input
												type="number"
												min="0"
												max="500"
												value={bufferPriceRange[1]}
												onFocus={(e) => {
													// Select all text when focused
													e.target.select();
												}}
												onChange={(e) => {
													const value = parseInt(e.target.value);
													setBufferPriceRange([bufferPriceRange[0], value]);
													if (
														value >= 0 &&
														value <= 500 &&
														value > priceRange[0]
													) {
														setPriceRange([priceRange[0], value]);
													}
												}}
												onBlur={(e) => {
													const value = parseInt(e.target.value);
													if (value < priceRange[0]) {
														setBufferPriceRange([priceRange[0], priceRange[0]]);
														setPriceRange([priceRange[0], priceRange[0]]);
													}
												}}
												className="w-16 px-2 py-1 border border-gray-300 rounded text-gray-900 focus:outline-none focus:border-gray-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
											/>
										</div>
									</div>
								</div>
							)}
						</div>

						{/* Material Section */}
						<div className="border-b pb-4">
							<button
								onClick={() => toggleSection("material")}
								className="flex items-center justify-between w-full text-left"
							>
								<h3 className="text-lg font-semibold">Material</h3>
								{expandedSections.material ? (
									<ChevronUp className="w-5 h-5" />
								) : (
									<ChevronDown className="w-5 h-5" />
								)}
							</button>
							{expandedSections.material && (
								<div className="mt-4 flex flex-wrap gap-2">
									{materials.map((material) => (
										<Button
											key={material.id}
											variant={
												selectedMaterials.includes(material.value)
													? "default"
													: "secondary"
											}
											size="sm"
											onClick={() =>
												toggleSelection(
													material.value,
													selectedMaterials,
													setSelectedMaterials
												)
											}
											className="rounded-full font-thin"
										>
											{material.name}
										</Button>
									))}
								</div>
							)}
						</div>
					</div>
				</div>

				{/* Fixed Footer */}
				<SheetFooter className="border-t px-6 py-4 shrink-0">
					<div className="flex gap-1 w-full">
						<Button
							variant={"outline"}
							onClick={clearAllFilters}
							size={"lg"}
							className="flex-1"
						>
							CLEAR FILTERS
						</Button>
						<Button onClick={applyFilters} size={"lg"} className="flex-1">
							APPLY FILTERS
						</Button>
					</div>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);
};

export default FilterSheet;

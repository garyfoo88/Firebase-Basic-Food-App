"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import renderStars from "@/src/components/Stars";
import { getRestaurantsSnapshot } from "@/src/lib/firebase/firestore";
import Filters from "@/src/components/Filters";
import { RestaurantFilter } from "../lib/types";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export type Restaurants = {
  restaurant: Restaurant;
};

export type Restaurant = {
  id: string;
  name: string;
  photo: string;
  avgRating: number;
  numRatings: number;
  category: string;
  city: string;
  price: number;
};

export type ImageCover = { photo: string; name: string };

const RestaurantItem = ({ restaurant }: Restaurants) => (
  <li key={restaurant.id}>
    <Link href={`/restaurant/${restaurant.id}`}>
      <ActiveResturant restaurant={restaurant} />
    </Link>
  </li>
);

const ActiveResturant = ({ restaurant }: Restaurants) => (
  <div>
    <ImageCover photo={restaurant.photo} name={restaurant.name} />
    <ResturantDetails restaurant={restaurant} />
  </div>
);

const ImageCover = ({ photo, name }: ImageCover) => (
  <div className="image-cover">
    <img src={photo} alt={name} />
  </div>
);

const ResturantDetails = ({ restaurant }: Restaurants) => (
  <div className="restaurant__details">
    <h2>{restaurant.name}</h2>
    <RestaurantRating restaurant={restaurant} />
    <RestaurantMetadata restaurant={restaurant} />
  </div>
);

const RestaurantRating = ({ restaurant }: Restaurants) => (
  <div className="restaurant__rating">
    <ul>{renderStars(restaurant.avgRating)}</ul>
    <span>({restaurant.numRatings})</span>
  </div>
);

const RestaurantMetadata = ({ restaurant }: Restaurants) => (
  <div className="restaurant__meta">
    <p>
      {restaurant.category} | {restaurant.city}
    </p>
    <p>{"$".repeat(restaurant.price)}</p>
  </div>
);

export default function RestaurantListings({
  initialRestaurants,
  searchParams,
}: Readonly<{
  initialRestaurants: { timestamp: any; id: string }[];
  searchParams: any;
}>) {
  const router = useRouter();

  // The initial filters are the search params from the URL, useful for when the user refreshes the page
  const initialFilters = {
    city: searchParams.city || "",
    category: searchParams.category || "",
    price: searchParams.price || "",
    sort: searchParams.sort || "",
  };

  const [restaurants, setRestaurants] = useState<any>(initialRestaurants);
  const [filters, setFilters] = useState<RestaurantFilter>(initialFilters);

  useEffect(() => {
    routerWithFilters(router, filters);
  }, [filters]);

  useEffect(() => {
    const unsubscribe = getRestaurantsSnapshot((data) => {
      setRestaurants(data);
    }, filters);

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [filters]);

  return (
    <article>
      <Filters filters={filters} setFilters={setFilters} />
      <ul className="restaurants">
        {restaurants.map((restaurant: Restaurant) => (
          <RestaurantItem key={restaurant.id} restaurant={restaurant} />
        ))}
      </ul>
    </article>
  );
}

function routerWithFilters(
  router: AppRouterInstance,
  filters: RestaurantFilter
) {
  const queryParams = new URLSearchParams();

  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== "") {
      queryParams.append(key, value);
    }
  }

  const queryString = queryParams.toString();
  router.push(`?${queryString}`);
}

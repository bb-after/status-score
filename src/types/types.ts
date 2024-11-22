export interface SearchResults {
    results: DentistResult[]; // Array of dentist results
    nextPageToken?: string;   // Optional field for pagination
  }
  
export interface Review {
    author_name: string;
    rating: number;
    text: string;
    relative_time_description?: string;
    profile_photo_url?: string;
    author_url?: string;
  }
  
  export interface DentistResult {
    name: string;
    rating: number;
    totalReviews: number;
    address: string;
    placeId: string;
    photoUrl?: string;
    negativeReviewCount: number;
    negativeReviews: Review[]; // Array of detailed negative reviews
  }
  
import { gql } from '@apollo/client';

export const GET_RIDERS = gql`
  query riders {
    riders {
      _id
      name
      username
      phone
      available
      vehicleType
      assigned
      zone {
        _id
        title
      }
    }
  }
`;

export const GET_RIDERS_PAGINATED = gql`
  query RidersPaginated(
    $page: Int
    $limit: Int
    $search: String
    $zone: String
    $available: Boolean
    $isActive: Boolean
    $vendor: String
    $storeId: String
  ) {
    ridersPaginated(
      page: $page
      limit: $limit
      search: $search
      zone: $zone
      available: $available
      isActive: $isActive
      vendor: $vendor
      storeId: $storeId
    ) {
      data {
        _id
        name
        username
        phone
        available
        isActive
        vehicleType
        assigned
        ratingAverage
        ratingCount
        zone {
          _id
          title
        }
        vendor {
          _id
          name
          email
        }
        assignedStores {
          _id
          name
        }
      }
      totalCount
      currentPage
      totalPages
    }
  }
`;

export const GET_RIDER = gql`
  query Rider($id: String!) {
    rider(id: $id) {
      _id
      name
      username
      phone
      available
      isActive
      assigned
      ratingAverage
      ratingCount
      zone {
        _id
        title
      }
      vendor {
        _id
        name
        email
      }
      assignedStores {
        _id
        name
        image
        address
      }
      bussinessDetails {
        bankName
        accountName
        accountCode
        accountNumber
        bussinessRegNo
        companyRegNo
        taxRate
      }
      licenseDetails {
        number
        expiryDate
        image
      }
      vehicleDetails {
        number
        image
      }
    }
  }
`;

export const GET_AVAILABLE_RIDERS = gql`
  query {
    availableRiders {
      _id
      name
      username
      phone
      available
      vehicleType
      zone {
        _id
      }
    }
  }
`;
export const GET_RIDERS_BY_ZONE = gql`
  query RidersByZone($id: String!) {
    ridersByZone(id: $id) {
      _id
      name
      username
      phone
      available
      vehicleType
      zone {
        _id
        title
      }
    }
  }
`;

// Riders a vendor owns. Super admin may pass `vendorId` to inspect a roster.
export const GET_VENDOR_RIDERS_PAGINATED = gql`
  query VendorRidersPaginated(
    $page: Int
    $limit: Int
    $search: String
    $vendorId: String
    $storeId: String
    $available: Boolean
    $isActive: Boolean
  ) {
    vendorRidersPaginated(
      page: $page
      limit: $limit
      search: $search
      vendorId: $vendorId
      storeId: $storeId
      available: $available
      isActive: $isActive
    ) {
      data {
        _id
        name
        username
        phone
        available
        isActive
        vehicleType
        ratingAverage
        ratingCount
        zone {
          _id
          title
        }
        assignedStores {
          _id
          name
          image
          address
        }
      }
      totalCount
      currentPage
      totalPages
    }
  }
`;

// Riders eligible to deliver for one store — the manual-assignment shortlist.
export const GET_RIDERS_BY_STORE = gql`
  query RidersByStore($storeId: String!, $onlyAvailable: Boolean) {
    ridersByStore(storeId: $storeId, onlyAvailable: $onlyAvailable) {
      _id
      name
      username
      phone
      available
      isActive
      vehicleType
      ratingAverage
      ratingCount
    }
  }
`;

// Rider feedback, automatically scoped to the caller (super admin sees every
// vendor, a vendor sees only its own riders, a store only its own deliveries).
export const GET_RIDER_REVIEWS_PAGINATED = gql`
  query RiderReviewsPaginated(
    $page: Int
    $limit: Int
    $search: String
    $riderId: String
    $storeId: String
    $vendorId: String
    $minRating: Float
    $maxRating: Float
  ) {
    riderReviewsPaginated(
      page: $page
      limit: $limit
      search: $search
      riderId: $riderId
      storeId: $storeId
      vendorId: $vendorId
      minRating: $minRating
      maxRating: $maxRating
    ) {
      data {
        _id
        rating
        description
        comments
        createdAt
        rider {
          _id
          name
          username
          ratingAverage
          ratingCount
        }
        restaurant {
          _id
          name
        }
        order {
          _id
          orderId
          deliveredAt
        }
      }
      totalCount
      currentPage
      totalPages
    }
  }
`;

export const GET_RIDER_RATING_SUMMARY = gql`
  query RiderRatingSummary($riderId: String!, $storeId: String) {
    riderRatingSummary(riderId: $riderId, storeId: $storeId) {
      riderId
      total
      average
      breakdown {
        stars
        count
      }
    }
  }
`;

import { gql } from '@apollo/client';

export const CREATE_RIDER = gql`
  mutation CreateRider($riderInput: RiderInput!) {
    createRider(riderInput: $riderInput) {
      _id
      name
      username
      phone
      available
      isActive
      vehicleType
      zone {
        _id
      }
      assignedStores {
        _id
        name
      }
    }
  }
`;

export const EDIT_RIDER = gql`
  mutation EditRider($riderInput: RiderInput!) {
    editRider(riderInput: $riderInput) {
      _id
      name
      username
      phone
      isActive
      vehicleType
      zone {
        _id
      }
      assignedStores {
        _id
        name
      }
    }
  }
`;

export const DELETE_RIDER = gql`
  mutation DeleteRider($id: String!) {
    deleteRider(id: $id) {
      _id
    }
  }
`;

export const TOGGLE_RIDER = gql`
  mutation ToggleRider($id: String!) {
    toggleAvailablity(id: $id) {
      _id
      name
      username
      phone
      available
      vehicleType
      zone {
        title
      }
    }
  }
`;

// Activate / deactivate a rider without deleting them — their history and
// ratings are preserved, they simply stop receiving delivery opportunities.
export const TOGGLE_RIDER_ACTIVE = gql`
  mutation ToggleRiderActive($id: String!, $isActive: Boolean) {
    toggleRiderActive(id: $id, isActive: $isActive) {
      _id
      name
      isActive
      available
    }
  }
`;

// Manual assignment from the Vendor / Store dashboard. The server only accepts
// riders assigned to the store that received the order.
export const ASSIGN_ORDER_TO_RIDER = gql`
  mutation AssignOrderToRider($orderId: String!, $riderId: String!) {
    assignOrderToRider(orderId: $orderId, riderId: $riderId) {
      _id
      orderId
      orderStatus
      assignedAt
      rider {
        _id
        name
        username
        phone
      }
    }
  }
`;

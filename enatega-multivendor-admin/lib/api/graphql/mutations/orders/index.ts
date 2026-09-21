import { gql } from '@apollo/client';

// Store-scoped order status update. The server only allows a restaurant
// caller to touch orders that belong to its own store (see
// ensureOrderManagementAccess on the API), which is what keeps this safe to
// expose on the Store dashboard alongside the super-admin dispatch mutation.
export const UPDATE_ORDER_STATUS = gql`
  mutation UpdateOrderStatus($id: String!, $status: String!, $reason: String) {
    updateOrderStatus(id: $id, status: $status, reason: $reason) {
      _id
      orderStatus
    }
  }
`;

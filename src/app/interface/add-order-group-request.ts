export interface AddOrderGroupRequest {
    accountNumber: string,
    userId: string,
    orderId: string[],
    strategy: string
}
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationType = exports.SipStatus = exports.SipFrequency = exports.MutualFundCategory = exports.PaymentStatus = exports.OrderStatus = exports.OrderType = exports.OrderSide = exports.TransactionType = exports.UserRole = exports.KycStatus = void 0;
var KycStatus;
(function (KycStatus) {
    KycStatus["REGISTERED"] = "REGISTERED";
    KycStatus["VERIFICATION_PENDING"] = "VERIFICATION_PENDING";
    KycStatus["VERIFIED"] = "VERIFIED";
    KycStatus["ACTIVE"] = "ACTIVE";
})(KycStatus || (exports.KycStatus = KycStatus = {}));
var UserRole;
(function (UserRole) {
    UserRole["USER"] = "USER";
    UserRole["ADMIN"] = "ADMIN";
})(UserRole || (exports.UserRole = UserRole = {}));
var TransactionType;
(function (TransactionType) {
    TransactionType["MONTHLY_CREDIT"] = "MONTHLY_CREDIT";
    TransactionType["FUNDS_ADDED"] = "FUNDS_ADDED";
    TransactionType["ORDER_HOLD"] = "ORDER_HOLD";
    TransactionType["ORDER_RELEASE"] = "ORDER_RELEASE";
    TransactionType["TRADE_DEBIT"] = "TRADE_DEBIT";
    TransactionType["TRADE_CREDIT"] = "TRADE_CREDIT";
    TransactionType["SIP_DEDUCTION"] = "SIP_DEDUCTION";
    TransactionType["MUTUAL_FUND_INVEST"] = "MUTUAL_FUND_INVEST";
    TransactionType["MUTUAL_FUND_REDEEM"] = "MUTUAL_FUND_REDEEM";
    TransactionType["ADMIN_ADJUSTMENT"] = "ADMIN_ADJUSTMENT";
})(TransactionType || (exports.TransactionType = TransactionType = {}));
var OrderSide;
(function (OrderSide) {
    OrderSide["BUY"] = "BUY";
    OrderSide["SELL"] = "SELL";
})(OrderSide || (exports.OrderSide = OrderSide = {}));
var OrderType;
(function (OrderType) {
    OrderType["MARKET"] = "MARKET";
    OrderType["LIMIT"] = "LIMIT";
    OrderType["STOP_LOSS"] = "STOP_LOSS";
})(OrderType || (exports.OrderType = OrderType = {}));
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["PLACED"] = "PLACED";
    OrderStatus["OPEN"] = "OPEN";
    OrderStatus["PARTIALLY_FILLED"] = "PARTIALLY_FILLED";
    OrderStatus["FILLED"] = "FILLED";
    OrderStatus["CANCELLED"] = "CANCELLED";
    OrderStatus["REJECTED"] = "REJECTED";
})(OrderStatus || (exports.OrderStatus = OrderStatus = {}));
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["PENDING"] = "PENDING";
    PaymentStatus["SUCCESS"] = "SUCCESS";
    PaymentStatus["FAILED"] = "FAILED";
    PaymentStatus["REJECTED"] = "REJECTED";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
var MutualFundCategory;
(function (MutualFundCategory) {
    MutualFundCategory["EQUITY"] = "EQUITY";
    MutualFundCategory["DEBT"] = "DEBT";
    MutualFundCategory["HYBRID"] = "HYBRID";
    MutualFundCategory["INDEX"] = "INDEX";
})(MutualFundCategory || (exports.MutualFundCategory = MutualFundCategory = {}));
var SipFrequency;
(function (SipFrequency) {
    SipFrequency["DAILY"] = "DAILY";
    SipFrequency["WEEKLY"] = "WEEKLY";
    SipFrequency["MONTHLY"] = "MONTHLY";
})(SipFrequency || (exports.SipFrequency = SipFrequency = {}));
var SipStatus;
(function (SipStatus) {
    SipStatus["ACTIVE"] = "ACTIVE";
    SipStatus["PAUSED"] = "PAUSED";
    SipStatus["CANCELLED"] = "CANCELLED";
})(SipStatus || (exports.SipStatus = SipStatus = {}));
var NotificationType;
(function (NotificationType) {
    NotificationType["ORDER_MATCH"] = "ORDER_MATCH";
    NotificationType["SIP_EXECUTION"] = "SIP_EXECUTION";
    NotificationType["PAYMENT_CREDIT"] = "PAYMENT_CREDIT";
    NotificationType["KYC_UPDATE"] = "KYC_UPDATE";
    NotificationType["SYSTEM_ALERT"] = "SYSTEM_ALERT";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
//# sourceMappingURL=enums.js.map
// Policy Builder: derive permissions from roles/flags/context in one place

export class PolicyBuilder {
    constructor() {
        this._roles = [];
        this._flags = {};
        this._user = null;
    }

    withUser(user) {
        this._user = user || null;
        const roles = Array.isArray(user?.roles)
            ? user.roles
            : user?.role
                ? [user.role]
                : [];
        this._roles = roles;
        return this;
    }

    withRoles(roles) {
        if (Array.isArray(roles)) this._roles = roles;
        return this;
    }

    withFlags(flags) {
        this._flags = flags || {};
        return this;
    }

    build() {
        const roles = Array.isArray(this._roles) ? this._roles : [];
        const has = (r) => roles.includes(r);
        const isAdmin = has("admin");

        const canManageUsers = isAdmin;
        const canDeleteUsers = isAdmin;
        const canChangeRoles = isAdmin;
        const canChangeStatus = isAdmin;

        const canManageBooks = isAdmin || has("book_manager");
        const canManageOrders = isAdmin || has("order_manager");
        const canAccessPrinting = isAdmin || has("printing_manager");
        const canAccessDelivery = isAdmin || has("delivery_manager");
        const canAccessFinance = isAdmin || has("finance_manager");
        const canAccessSupport = isAdmin || has("customer_support");
        const canAccessMarketing = isAdmin || has("marketing_manager");

        const canAccessAdminLayout =
            canManageUsers ||
            canManageBooks ||
            canManageOrders ||
            canAccessPrinting ||
            canAccessDelivery ||
            canAccessFinance ||
            canAccessSupport ||
            canAccessMarketing;

        return {
            roles,
            userId: this._user?._id || null,
            isAdmin,
            canManageUsers,
            canDeleteUsers,
            canChangeRoles,
            canChangeStatus,
            canManageBooks,
            canManageOrders,
            canAccessPrinting,
            canAccessDelivery,
            canAccessFinance,
            canAccessSupport,
            canAccessMarketing,
            canAccessAdminLayout,
        };
    }
}

export const resolvePolicy = (input = {}) =>
    new PolicyBuilder()
        .withUser(input.user)
        .withRoles(input.roles)
        .withFlags(input.flags)
        .build();


